import { VolunteerTag } from "@/types/volunteer";
import { auth } from "@/firebase/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchTags(): Promise<VolunteerTag[]> {
  if (!API_URL) {
    throw new Error("API_URL is not configured");
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error("User is not authenticated");
  }

  const token = await user.getIdToken();
  const response = await fetch(`${API_URL}/api/tag`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch tags");
  }
  return response.json();
}
