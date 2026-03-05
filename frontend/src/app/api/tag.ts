import { VolunteerTag } from "@/types/volunteer";

export async function fetchTags(): Promise<VolunteerTag[]> {
  const response = await fetch("/api/tag", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch tags");
  }
  return response.json();
}
