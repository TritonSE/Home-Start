import { VolunteerTag } from "@/types/volunteer";

export async function fetchTags(): Promise<VolunteerTag[]> {
  const response = await fetch("http://localhost:4000/api/tag");
  if (!response.ok) {
    throw new Error("Failed to fetch tags");
  }
  return response.json();
}
