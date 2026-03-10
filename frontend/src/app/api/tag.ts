import { auth } from "@/firebase/firebase";
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

export async function fetchTags(): Promise<
  { id: string; name: string; color: string; type: string }[]
> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/tag`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Unexpected response format: expected an array of tags");
    }
    return data.map((tag) => ({
      id: String(tag._id ?? ""),
      name: String(tag.name ?? ""),
      color: String(tag.color ?? ""),
      type: String(tag.type ?? ""),
    }));
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error instanceof Error
      ? error
      : new Error("An unknown error occurred while fetching tags");
  }
}
