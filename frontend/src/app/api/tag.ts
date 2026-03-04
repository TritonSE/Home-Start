export async function fetchTags(): Promise<
  { id: string; name: string; color: string; type: string }[]
> {
  try {
    const response = await fetch("/api/tag", {
      credentials: "include",
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
