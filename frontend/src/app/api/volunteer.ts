import { Volunteer } from "@/types/volunteer";

export async function fetchVolunteers(): Promise<Volunteer[]> {
  try {
    const response = await fetch("http://localhost:4000/api/volunteer");
    if (!response.ok) {
      throw new Error("Failed to fetch volunteers");
    }

    const data: Volunteer[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching: ", error);
    throw error;
  }
}
