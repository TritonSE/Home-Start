import { Volunteer } from "@/types/volunteer";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchVolunteers(): Promise<Volunteer[]> {
  try {
    console.log(`${API_URL}/api/volunteer`);

    let response: Response;
    try {
      response = await fetch(`${API_URL}/api/volunteer`);
    } catch (fetchError) {
      console.error("Fetch network error:", fetchError);
      throw new Error(`Network error during fetch: ${fetchError}`);
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch volunteers: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Log the raw data to see what's being returned
    console.log("Raw data from API:", data);

    // Validate that data is an array
    if (!Array.isArray(data)) {
      throw new Error(`Expected array but got ${typeof data}`);
    }

    // Validate each volunteer has required fields
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

    const typedData: Volunteer[] = data;
    return typedData;
  } catch (error) {
    console.error("Error fetching volunteers: ", error);
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
  }[];
};

export type VolunteerCsvParseResponse =
  | { ok: true; data: VolunteerCsvParseResult }
  | { ok: false; error: string };

export async function parseVolunteersCsv(csv: File): Promise<VolunteerCsvParseResponse> {
  try {
    const formData = new FormData();
    formData.append("csv", csv);

    const response = await fetch(`${API_URL}/api/volunteer/parse-csv`, {
      method: "POST",
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
            }) => ({
              firstName: item.firstName,
              lastName: item.lastName,
              email: item.email,
              phoneNumber: item.phoneNumber,
            }),
          )
        : [],
    };
    return { ok: true, data: result };
  } catch (error) {
    console.error("Error parsing volunteers CSV: ", error);
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
  isReturning: boolean;
  tags?: string[];
};

export type UploadVolunteerBatchResponse = { ok: true } | { ok: false; error: string };

export async function uploadVolunteerBatch(
  data: VolunteerCreationBody[],
): Promise<UploadVolunteerBatchResponse> {
  try {
    const response = await fetch(`${API_URL}/api/volunteer/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    console.error("Error uploading volunteer batch: ", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error uploading volunteers",
    };
  }
}
