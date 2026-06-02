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

type VolunteerAddressInfo = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
};

type VolunteerParseCsvDTO = {
  wouldCreateCount: number;
  wouldUpdateCount: number;
  wouldCreate: string[];
  wouldUpdate: string[];
  total: number;
  missingTags?: { name: string; type: string }[];
  volunteerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    status?: string;
    address?: VolunteerAddressInfo;
    birthday?: string;
    preferredPronouns?: string;
    startDate?: string;
    endDate?: string;
    effectiveDate?: string;
    mediaConsent?: string;
    faceConsent?: string;
    nameConsent?: string;
    assignmentName?: string;
    projectName?: string;
    shiftNames?: string[];
    programNames?: string[];
    groupNames?: string[];
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
    status: normalizeVolunteerStatus(source.status),
    dateCreated: source.dateCreated ?? undefined,
    effectiveDate: source.effectiveDate ?? undefined,
    hours: typeof source.hours === "number" ? source.hours : undefined,
    wageRate: typeof source.wageRate === "number" ? source.wageRate : undefined,
    groupTagIds: Array.isArray(source.groupTagIds) ? source.groupTagIds : undefined,
    programTagIds: Array.isArray(source.programTagIds) ? source.programTagIds : undefined,
    address: source.address ?? undefined,
    birthday: source.birthday ?? undefined,
    preferredPronouns: source.preferredPronouns ?? undefined,
    additionalNotes: source.additionalNotes ?? undefined,
    mediaConsent: source.mediaConsent ?? undefined,
    faceConsent: source.faceConsent ?? undefined,
    nameConsent: source.nameConsent ?? undefined,
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

export async function fetchVolunteerAssignmentsByVolunteerId(
  volunteerId: string,
): Promise<VolunteerAssignment[]> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${API_BASE_URL}/api/volunteerAssignment/${volunteerId}`, {
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch volunteer assignments");
  }

  return (await res.json()) as VolunteerAssignment[];
}

export async function createVolunteerAssignment(body: {
  volunteerId: string;
  assignmentTagId: string;
  projectTagId: string;
  shiftTagIds?: string[];
}): Promise<VolunteerAssignment> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/volunteerAssignment`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create volunteer assignment: ${response.status} ${response.statusText}`,
      );
    }

    const data: unknown = await response.json();
    return data as VolunteerAssignment;
  } catch (error) {
    console.error("Error creating volunteer assignment:", error);
    throw error instanceof Error ? error : new Error("Unknown error creating volunteer assignment");
  }
}

export async function updateVolunteerAssignment(
  id: string,
  body: {
    shiftTagIds?: string[];
    removeShiftTagIds?: string[];
  },
): Promise<VolunteerAssignment> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/volunteerAssignment/${id}`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update volunteer assignment: ${response.status} ${response.statusText}`,
      );
    }

    const data: unknown = await response.json();
    return data as VolunteerAssignment;
  } catch (error) {
    console.error("Error updating volunteer assignment:", error);
    throw error instanceof Error ? error : new Error("Unknown error updating volunteer assignment");
  }
}

export type VolunteerCsvParseResult = {
  wouldCreateCount: number;
  wouldUpdateCount: number;
  wouldCreate: string[];
  wouldUpdate: string[];
  totalCount: number;
  missingTags: { name: string; type: "assignment" | "project" | "shift" | "program" | "group" }[];

  volunteerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    status?: string;
    address?: VolunteerAddressInfo;
    birthday?: string;
    preferredPronouns?: string;
    startDate?: string;
    endDate?: string;
    effectiveDate?: string;
    mediaConsent?: string;
    faceConsent?: string;
    nameConsent?: string;
    assignmentName?: string;
    projectName?: string;
    shiftNames?: string[];
    programNames?: string[];
    groupNames?: string[];
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
    const rawMissingTags = Array.isArray(parsed.missingTags) ? parsed.missingTags : [];
    const VALID_TAG_TYPES = ["assignment", "project", "shift", "program", "group"] as const;
    type ValidTagType = (typeof VALID_TAG_TYPES)[number];
    const missingTags = rawMissingTags
      .filter((t): t is { name: string; type: string } => {
        if (!t || typeof t !== "object") return false;
        const tag = t as { name?: unknown; type?: unknown };
        return typeof tag.name === "string" && typeof tag.type === "string";
      })
      .map((t) => ({
        name: t.name,
        type: (VALID_TAG_TYPES.includes(t.type as ValidTagType)
          ? t.type
          : "assignment") as ValidTagType,
      }));
    const result: VolunteerCsvParseResult = {
      wouldCreateCount: parsed.wouldCreateCount,
      wouldUpdateCount: parsed.wouldUpdateCount,
      wouldCreate: parsed.wouldCreate.filter((value): value is string => typeof value === "string"),
      wouldUpdate: parsed.wouldUpdate.filter((value): value is string => typeof value === "string"),
      totalCount: parsed.total,
      missingTags,
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
          status: typeof item.status === "string" ? item.status : undefined,
          address: item.address ?? undefined,
          birthday: typeof item.birthday === "string" ? item.birthday : undefined,
          preferredPronouns:
            typeof item.preferredPronouns === "string" ? item.preferredPronouns : undefined,
          startDate: typeof item.startDate === "string" ? item.startDate : undefined,
          endDate: typeof item.endDate === "string" ? item.endDate : undefined,
          effectiveDate: typeof item.effectiveDate === "string" ? item.effectiveDate : undefined,
          mediaConsent: typeof item.mediaConsent === "string" ? item.mediaConsent : undefined,
          faceConsent: typeof item.faceConsent === "string" ? item.faceConsent : undefined,
          nameConsent: typeof item.nameConsent === "string" ? item.nameConsent : undefined,
          assignmentName: typeof item.assignmentName === "string" ? item.assignmentName : undefined,
          projectName: typeof item.projectName === "string" ? item.projectName : undefined,
          shiftNames: Array.isArray(item.shiftNames)
            ? item.shiftNames.filter((v): v is string => typeof v === "string")
            : undefined,
          programNames: Array.isArray(item.programNames)
            ? item.programNames.filter((value): value is string => typeof value === "string")
            : undefined,
          groupNames: Array.isArray(item.groupNames)
            ? item.groupNames.filter((value): value is string => typeof value === "string")
            : undefined,
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
  status?: "returning" | "new";
  address?: VolunteerAddressInfo;
  birthday?: string;
  preferredPronouns?: string;
  startDate?: string;
  endDate?: string;
  effectiveDate?: string;
  mediaConsent?: string;
  faceConsent?: string;
  nameConsent?: string;
  assignmentName?: string;
  projectName?: string;
  shiftNames?: string[];
};

export type UploadVolunteerBatchResponse = { ok: true } | { ok: false; error: string };

const BATCH_CHUNK_SIZE = 200;

export async function uploadVolunteerBatch(
  data: VolunteerCreationBody[],
  tagsToCreate: { name: string; type: string; color: string }[] = [],
): Promise<UploadVolunteerBatchResponse> {
  try {
    const headers = await getAuthHeaders();

    const chunks: VolunteerCreationBody[][] = [];
    for (let i = 0; i < data.length; i += BATCH_CHUNK_SIZE) {
      chunks.push(data.slice(i, i + BATCH_CHUNK_SIZE));
    }

    const responses = await Promise.all(
      chunks.map(async (chunk, index) =>
        fetch(`${API_BASE_URL}/api/volunteer/batch`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ volunteers: chunk, ...(index === 0 ? { tagsToCreate } : {}) }),
        }),
      ),
    );

    const failed = responses.find((r) => !r.ok);
    if (failed) {
      let detail = "";
      try {
        const body: unknown = await failed.json();
        detail = JSON.stringify(body);
      } catch {
        // ignore
      }
      console.error("Batch upload error body:", detail);
      return {
        ok: false,
        error: `Failed to upload volunteer batch: ${failed.status} ${failed.statusText}${detail ? ` - ${detail}` : ""}`,
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

export async function exportVolunteersCsv(ids?: string[]): Promise<void> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/api/volunteer/export-csv`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ ids: ids ?? [] }),
  });

  if (!response.ok) {
    throw new Error(`Failed to export volunteers: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "volunteers.csv";
  a.click();
  URL.revokeObjectURL(url);
}
