import { auth } from "@/firebase/firebase";
import { Volunteer, VolunteerTag } from "@/types/volunteer";
import env from "@/util/validateEnv";

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
  };
};

const getTokenFromCookie = (): string | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(/(?:^|; )firebaseAuthToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const getAuthToken = async (): Promise<string | null> => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    return currentUser.getIdToken();
  }

  return getTokenFromCookie();
};

export async function fetchVolunteers(): Promise<Volunteer[]> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    let response: Response;
    try {
      response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/volunteer`, {
        headers: {
          Authorization: `Bearer ${token}`,
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

    if (!Array.isArray(data)) {
      throw new Error(`Expected array but got ${typeof data}`);
    }

    const typedData: Volunteer[] = data.map(normalizeVolunteer);
    return typedData;
  } catch (error) {
    console.error("Error fetching volunteers: ", error);
    throw error;
  }
}
