import { Volunteer } from "@/types/volunteer";

const toTagLabel = (tag: unknown): string | null => {
  if (typeof tag === "string") {
    return tag;
  }

  if (tag && typeof tag === "object" && "name" in tag) {
    const name = (tag as { name?: unknown }).name;
    return typeof name === "string" ? name : null;
  }

  return null;
};

const normalizeVolunteer = (volunteer: unknown): Volunteer => {
  const source = (volunteer ?? {}) as Partial<Volunteer> & {
    tags?: unknown;
  };

  const tags = Array.isArray(source.tags)
    ? source.tags.map(toTagLabel).filter((tag): tag is string => Boolean(tag))
    : [];

  return {
    _id: String(source._id ?? ""),
    firstName: String(source.firstName ?? ""),
    lastName: String(source.lastName ?? ""),
    email: String(source.email ?? ""),
    phoneNumber: String(source.phoneNumber ?? ""),
    tags,
  };
};

export async function fetchVolunteers(): Promise<Volunteer[]> {
  try {
    let response: Response;
    try {
      response = await fetch("/api/volunteer", {
        credentials: "include",
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
