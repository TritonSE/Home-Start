import { Volunteer, VolunteerTag } from "@/types/volunteer";

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
    status: source.status === "returning" ? "returning" : "new",
    volunteerTypeTags: Array.isArray(source.volunteerTypeTags)
      ? source.volunteerTypeTags.filter((tag): tag is string => typeof tag === "string")
      : [],
    events: Array.isArray(source.events)
      ? source.events.filter((tag): tag is string => typeof tag === "string")
      : [],
    additionalNotes: typeof source.additionalNotes === "string" ? source.additionalNotes : "",
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
