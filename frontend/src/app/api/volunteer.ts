import { onAuthStateChanged } from "firebase/auth";

import { API_BASE_URL } from "./requests";

import type { Volunteer, VolunteerAssignment } from "@/types/volunteer";

import { auth } from "@/firebase/firebase";

async function waitForAuth(): Promise<string> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        user.getIdToken().then(resolve).catch(reject);
      } else {
        reject(new Error("Not authenticated"));
      }
    });
  });
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await waitForAuth();
  return { Authorization: `Bearer ${token}` };
}

type APIErrorBody = {
  error?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

type VolunteerParseCsvDTO = {
  wouldCreateCount: number;
  wouldUpdateCount: number;
  wouldCreate: string[];
  wouldUpdate: string[];
  total: number;
  volunteerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    assignmentName?: string;
    projectName?: string;
    shiftNames?: string[];
    tags?: string[];
  }[];
};

const normalizeVolunteerStatus = (status: unknown): Volunteer["status"] => {
  return status === "returning" ? "returning" : "new";
};

const normalizeVolunteer = (volunteer: unknown): Volunteer => {
  const source = (volunteer ?? {}) as Partial<Volunteer>;

  return {
    _id: String(source._id ?? ""),
    firstName: String(source.firstName ?? ""),
    lastName: String(source.lastName ?? ""),
    email: String(source.email ?? ""),
    phoneNumber: String(source.phoneNumber ?? ""),
    tags: [],
    status: normalizeVolunteerStatus(source.status),
    startDate: source.startDate ?? undefined,
    endDate: source.endDate ?? undefined,
    effectiveDate: source.effectiveDate ?? undefined,
    hours: typeof source.hours === "number" ? source.hours : undefined,
    wageRate: typeof source.wageRate === "number" ? source.wageRate : undefined,
  };
};

export async function fetchVolunteers(): Promise<Volunteer[]> {
  const headers = await getAuthHeaders();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/volunteer`, {
      headers,
    });
  } catch (fetchError) {
    console.error("Fetch network error:", fetchError);
    const fetchErrorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
    throw new Error(`Network error during fetch: ${fetchErrorMessage}`);
  }

  if (!response.ok) {
    let backendMessage = "";
    try {
      const errorBody: unknown = await response.json();
      if (errorBody && typeof errorBody === "object") {
        const body = errorBody as APIErrorBody;
        backendMessage = typeof body.error === "string" ? body.error : "";
      }
    } catch {
      backendMessage = "";
    }

    throw new Error(
      `Failed to fetch volunteers: ${response.status} ${response.statusText}${backendMessage ? ` - ${backendMessage}` : ""}`,
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new TypeError(`Expected array but got ${typeof data}`);
  }

  const typedData: Volunteer[] = data.map(normalizeVolunteer);
  return typedData;
}

export async function fetchVolunteerAssignments(): Promise<VolunteerAssignment[]> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${API_BASE_URL}/api/volunteerAssignment`, {
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch volunteer assignments");
  }

  return (await res.json()) as VolunteerAssignment[];
}

export type VolunteerCsvParseResult = {
  wouldCreateCount: number;
  wouldUpdateCount: number;
  wouldCreate: string[];
  wouldUpdate: string[];
  totalCount: number;

  volunteerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    assignmentName?: string;
    projectName?: string;
    shiftNames?: string[];
    tags?: string[];
  }[];
};

export type VolunteerCsvParseResponse =
  | { ok: true; data: VolunteerCsvParseResult }
  | { ok: false; error: string };

export async function parseVolunteersCsv(csv: File): Promise<VolunteerCsvParseResponse> {
  try {
    const headers = await getAuthHeaders();
    const formData = new FormData();
    formData.append("csv", csv);

    const response = await fetch(`${API_BASE_URL}/api/volunteer/parse-csv`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      let backendMessage = "";
      try {
        const errorBody: unknown = await response.json();
        if (errorBody && typeof errorBody === "object") {
          const body = errorBody as APIErrorBody;
          backendMessage = typeof body.error === "string" ? body.error : "";
        }
      } catch {
        backendMessage = "";
      }

      return {
        ok: false,
        error: `Failed to parse volunteers CSV: ${response.status} ${response.statusText}${backendMessage ? ` - ${backendMessage}` : ""}`,
      };
    }

    const data = (await response.json()) as unknown;
    if (!data || typeof data !== "object") {
      return { ok: false, error: "Unexpected parse-csv response format" };
    }

    const parsed = data as Partial<VolunteerParseCsvDTO>;
    if (
      typeof parsed.wouldCreateCount !== "number" ||
      typeof parsed.wouldUpdateCount !== "number" ||
      !Array.isArray(parsed.wouldCreate) ||
      !Array.isArray(parsed.wouldUpdate) ||
      typeof parsed.total !== "number"
    ) {
      return { ok: false, error: "Unexpected parse-csv response format" };
    }

    const volunteerInfo = Array.isArray(parsed.volunteerInfo) ? parsed.volunteerInfo : [];
    const result: VolunteerCsvParseResult = {
      wouldCreateCount: parsed.wouldCreateCount,
      wouldUpdateCount: parsed.wouldUpdateCount,
      wouldCreate: parsed.wouldCreate.filter((value): value is string => typeof value === "string"),
      wouldUpdate: parsed.wouldUpdate.filter((value): value is string => typeof value === "string"),
      totalCount: parsed.total,
      volunteerInfo: volunteerInfo
        .filter((item): item is VolunteerParseCsvDTO["volunteerInfo"][number] => {
          if (!item || typeof item !== "object") return false;
          const row = item as Partial<VolunteerParseCsvDTO["volunteerInfo"][number]>;
          return (
            typeof row.firstName === "string" &&
            typeof row.lastName === "string" &&
            typeof row.email === "string" &&
            typeof row.phoneNumber === "string"
          );
        })
        .map((item) => ({
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email,
          phoneNumber: item.phoneNumber,
          assignmentName: typeof item.assignmentName === "string" ? item.assignmentName : undefined,
          projectName: typeof item.projectName === "string" ? item.projectName : undefined,
          shiftNames: Array.isArray(item.shiftNames) ? item.shiftNames.filter((v): v is string => typeof v === "string") : undefined,
          tags: Array.isArray(item.tags) ? item.tags.filter((t): t is string => typeof t === "string") : undefined,
        })),
    };
    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error parsing CSV",
    };
  }
}

type VolunteerCreationBody = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  tags?: string[];
  assignmentName?: string;
  projectName?: string;
  shiftNames?: string[];
};

export type UploadVolunteerBatchResponse = { ok: true } | { ok: false; error: string };

export async function uploadVolunteerBatch(
  data: VolunteerCreationBody[],
): Promise<UploadVolunteerBatchResponse> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/volunteer/batch`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ volunteers: data }),
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `Failed to upload volunteer batch: ${response.status} ${response.statusText}`,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error uploading volunteers",
    };
  }
}

export async function getVolunteerRows(): Promise<
  { id: string; firstName: string; lastName: string }[]
> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/volunteer/getVolunteerRows`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch volunteer rows: ${response.status} ${response.statusText}`);
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      throw new TypeError(`Expected array but got ${typeof data}`);
    }

    return data.map((item) => {
      const row = isRecord(item) ? item : {};

      return {
        id: String(row.id ?? ""),
        firstName: String(row.firstName ?? ""),
        lastName: String(row.lastName ?? ""),
      };
    });
  } catch (error) {
    console.error("Error fetching volunteer rows: ", error);
    throw error;
  }
}

type Recipient = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export async function getSelectedVolunteers({
  events,
  statuses,
}: {
  events: string[];
  statuses: string[];
}): Promise<Recipient[]> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/volunteer/getSelectedVolunteers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ events, statuses }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch selected volunteers: ${response.status} ${response.statusText}`,
      );
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      throw new TypeError(`Expected array but got ${typeof data}`);
    }

    const recipients: Recipient[] = data.map((item) => {
      const row = isRecord(item) ? item : {};
      return {
        _id: String(row._id ?? ""),
        firstName: String(row.firstName ?? ""),
        lastName: String(row.lastName ?? ""),
        email: String(row.email ?? ""),
        phoneNumber: String(row.phoneNumber ?? ""),
      };
    });

    return recipients;
  } catch (error) {
    console.error("Error fetching selected volunteers: ", error);
    throw error;
  }
}
