import { onAuthStateChanged } from "firebase/auth";

import { API_BASE_URL } from "./requests";

import type { VolunteerTag } from "@/types/volunteer";

import { auth } from "@/firebase/firebase";

type TagDTO = {
  _id: string;
  name: string;
  color: string;
  type: string;
};

type ProjectProgramMapDTO = {
  _id: string;
  projectTagId: TagDTO;
  programTagId: TagDTO;
};

function isTagDTO(value: unknown): value is TagDTO {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate._id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.color === "string" &&
    typeof candidate.type === "string"
  );
}

function isProjectProgramMapDTO(value: unknown): value is ProjectProgramMapDTO {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate._id === "string" &&
    isTagDTO(candidate.projectTagId) &&
    isTagDTO(candidate.programTagId)
  );
}

async function waitForAuth(): Promise<string> {
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

export async function fetchTags(): Promise<VolunteerTag[]> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/tag`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.status} ${response.statusText}`);
    }
    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new TypeError("Unexpected response format: expected an array of tags");
    }
    return data.map((tag, index) => {
      if (!isTagDTO(tag)) {
        throw new TypeError(`Unexpected tag format at index ${index}`);
      }

      return {
        _id: tag._id,
        name: tag.name,
        color: tag.color,
        type: tag.type,
      };
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error instanceof Error
      ? error
      : new Error("An unknown error occurred while fetching tags");
  }
}

export async function fetchProjectProgramMaps(): Promise<ProjectProgramMapDTO[]> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/tag/project-program-maps`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch project-program maps: ${response.status} ${response.statusText}`,
      );
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new TypeError("Unexpected response format: expected an array of project-program maps");
    }

    return data.filter(isProjectProgramMapDTO);
  } catch (error) {
    console.error("Error fetching project-program maps:", error);
    throw error instanceof Error
      ? error
      : new Error("An unknown error occurred while fetching project-program maps");
  }
}
