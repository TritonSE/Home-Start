import { auth } from "@/firebase/firebase";
import { Volunteer, VolunteerTag } from "@/types/volunteer";
import { onAuthStateChanged } from "firebase/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function waitForAuth(): Promise<string> {
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
    status: String(source.status ?? ""),
  };
};

export async function fetchVolunteers(): Promise<Volunteer[]> {
  try {
    const headers = await getAuthHeaders();

    let response: Response;
    try {
      response = await fetch(`${API_URL}/api/volunteer`, {
        headers,
      });
    } catch (fetchError) {
      console.error("Fetch network error:", fetchError);
      throw new Error(`Network error during fetch: ${fetchError}`);
    }

    if (!response.ok) {
      let backendMessage = "";
      try {
        const errorBody = await response.json();
        backendMessage = typeof errorBody?.error === "string" ? errorBody.error : "";
      } catch {
        backendMessage = "";
      }

      throw new Error(
        `Failed to fetch volunteers: ${response.status} ${response.statusText}${backendMessage ? ` - ${backendMessage}` : ""}`,
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error(`Expected array but got ${typeof data}`);
    }

    data.forEach((volunteer, index) => {
      if (
        !volunteer._id ||
        !volunteer.firstName ||
        !volunteer.lastName ||
        !volunteer.email ||
        !volunteer.phoneNumber
      ) {
        console.warn(`Volunteer at index ${index} has missing fields:`, volunteer);
      }
    });

    const typedData: Volunteer[] = data.map(normalizeVolunteer);
    return typedData;
  } catch (error) {
    throw error;
  }
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

    const data = await response.json();
    const result: VolunteerCsvParseResult = {
      wouldCreateCount: data.wouldCreateCount,
      wouldUpdateCount: data.wouldUpdateCount,
      wouldCreate: data.wouldCreate,
      wouldUpdate: data.wouldUpdate,
      totalCount: data.total,
      volunteerInfo: Array.isArray(data.volunteerInfo)
        ? data.volunteerInfo.map(
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
              tags: item.tags,
            }),
          )
        : [],
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
