import { onAuthStateChanged } from "firebase/auth";

import type { Volunteer, VolunteerTag } from "@/types/volunteer";

import { auth } from "@/firebase/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    tags?: string[];
  }[];
};

const toVolunteerTag = (tag: unknown): VolunteerTag | null => {
  if (!tag || typeof tag !== "object") {
    return null;
  }

  const source = tag as Partial<VolunteerTag>;

  if (typeof source._id !== "string" || typeof source.name !== "string") {
    return null;
  }

  return {
    _id: source._id,
    name: source.name,
    color: typeof source.color === "string" ? source.color : "",
    type: typeof source.type === "string" ? source.type : "",
    __v: typeof source.__v === "number" ? source.__v : undefined,
  };
};

const normalizeVolunteerStatus = (status: unknown): Volunteer["status"] => {
  return status === "returning" ? "returning" : "new";
};

const normalizeVolunteer = (volunteer: unknown): Volunteer => {
  const source = (volunteer ?? {}) as Partial<Volunteer> & {
    tags?: unknown;
  };

  const tags = Array.isArray(source.tags)
    ? source.tags.map(toVolunteerTag).filter((tag): tag is VolunteerTag => Boolean(tag))
    : [];

  return {
    _id: String(source._id ?? ""),
    firstName: String(source.firstName ?? ""),
    lastName: String(source.lastName ?? ""),
    email: String(source.email ?? ""),
    phoneNumber: String(source.phoneNumber ?? ""),
    tags,
    status: normalizeVolunteerStatus(source.status),
  };
};

export async function fetchVolunteers(): Promise<Volunteer[]> {
  const headers = await getAuthHeaders();

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/volunteer`, {
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

  data.forEach((volunteer, index) => {
    const normalized = normalizeVolunteer(volunteer);
    if (
      !normalized._id ||
      !normalized.firstName ||
      !normalized.lastName ||
      !normalized.email ||
      !normalized.phoneNumber
    ) {
      console.warn(`Volunteer at index ${index} has missing fields:`, volunteer);
    }
  });

  const typedData: Volunteer[] = data.map(normalizeVolunteer);
  return typedData;
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

    const response = await fetch(`${API_URL}/api/volunteer/parse-csv`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `Failed to parse volunteers CSV: ${response.status} ${response.statusText}`,
      };
    }

    const data: unknown = await response.json();
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
          if (!item || typeof item !== "object") {
            return false;
          }
          const row = item as Partial<VolunteerParseCsvDTO["volunteerInfo"][number]>;
          return (
            typeof row.firstName === "string" &&
            typeof row.lastName === "string" &&
            typeof row.email === "string" &&
            typeof row.phoneNumber === "string"
          );
        })
        .map(
          (item: {
            firstName: string;
            lastName: string;
            email: string;
            phoneNumber: string;
            tags?: string[];
          }) => ({
            firstName: item.firstName,
            lastName: item.lastName,
            email: item.email,
            phoneNumber: item.phoneNumber,
            tags: Array.isArray(item.tags)
              ? item.tags.filter((tag): tag is string => typeof tag === "string")
              : undefined,
          }),
        ),
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
};

export type UploadVolunteerBatchResponse = { ok: true } | { ok: false; error: string };

export async function uploadVolunteerBatch(
  data: VolunteerCreationBody[],
): Promise<UploadVolunteerBatchResponse> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/volunteer/batch`, {
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
