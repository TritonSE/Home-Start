import { Volunteer, VolunteerTag } from "@/types/volunteer";
import { auth } from "@/firebase/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    if (!API_URL) {
      throw new Error("API_URL is not configured");
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error("User is not authenticated");
    }

    const token = await user.getIdToken();
    let response: Response;
    try {
      response = await fetch(`${API_URL}/api/volunteer`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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

    const typedData: Volunteer[] = data.map(normalizeVolunteer);
    return typedData;
  } catch (error) {
    console.error("Error fetching volunteers: ", error);
    throw error;
  }
}
