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
