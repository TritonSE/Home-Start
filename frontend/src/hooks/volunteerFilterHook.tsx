"use client";

import { useEffect, useMemo, useState } from "react";

import type { Volunteer, VolunteerTag } from "@/types/volunteer";

import { fetchProjectProgramMaps, fetchTags } from "@/app/api/tag";
import { fetchVolunteerAssignments, fetchVolunteers } from "@/app/api/volunteer";

type volunteerFilterHookProps = {
  itemsPerPage: number;
};

type PopulatedAssignment = {
  volunteerId: string;
  assignmentTagId: VolunteerTag;
  projectTagId: VolunteerTag;
  shiftTagIds: VolunteerTag[];
};

type ProjectProgramMap = {
  projectTagId: VolunteerTag;
  programTagId: VolunteerTag;
};

export default function volunteerFilterHook({ itemsPerPage }: volunteerFilterHookProps) {
  // Data state
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [tags, setTags] = useState<VolunteerTag[]>([]);
  const statusTags = ["new", "returning"];
  const projectTags = tags.filter((tag) => tag.type === "project").map((tag) => tag.name);
  const programTags = tags.filter((tag) => tag.type === "program").map((tag) => tag.name);
  const assignmentTags = tags.filter((tag) => tag.type === "assignment").map((tag) => tag.name);

  // Filter states
  const [search, setSearch] = useState("");

  const [selectedProject, setSelectedProject] = useState<Set<string>>(new Set());
  const [selectedProgram, setSelectedProgram] = useState<Set<string>>(new Set());
  const [selectedAssignment, setSelectedAssignment] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const loadVolunteers = async () => {
    try {
      const [volunteerData, tagData, assignmentData, projectProgramMapData] = await Promise.all([
        fetchVolunteers(),
        fetchTags(),
        fetchVolunteerAssignments(),
        fetchProjectProgramMaps(),
      ]);
      const programByProjectId = new Map<string, VolunteerTag>();
      for (const map of projectProgramMapData as ProjectProgramMap[]) {
        programByProjectId.set(map.projectTagId._id, map.programTagId);
      }

      const volunteersWithTags = volunteerData.map((volunteer) => {
        const volunteerAssignments = (assignmentData as PopulatedAssignment[]).filter(
          (assignment) => assignment.volunteerId === volunteer._id,
        );
        const seenTagIds = new Set<string>();
        const volunteerTags: VolunteerTag[] = [];

        const pushTag = (tag: VolunteerTag | undefined) => {
          if (!tag || seenTagIds.has(tag._id)) {
            return;
          }

          seenTagIds.add(tag._id);
          volunteerTags.push(tag);
        };

        for (const assignment of volunteerAssignments) {
          pushTag(assignment.assignmentTagId);
          pushTag(assignment.projectTagId);
          pushTag(programByProjectId.get(assignment.projectTagId._id));

          for (const shiftTag of assignment.shiftTagIds ?? []) {
            pushTag(shiftTag);
          }
        }

        return { ...volunteer, tags: volunteerTags };
      });

      setVolunteers(volunteersWithTags);
      setTags(tagData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSelectedProjectChange = (
    value: Set<string> | ((prev: Set<string>) => Set<string>),
  ) => {
    setSelectedProject(value);
    setCurrentPage(1);
  };

  const handleSelectedProgramChange = (
    value: Set<string> | ((prev: Set<string>) => Set<string>),
  ) => {
    setSelectedProgram(value);
    setCurrentPage(1);
  };

  const handleSelectedAssignmentChange = (
    value: Set<string> | ((prev: Set<string>) => Set<string>),
  ) => {
    setSelectedAssignment(value);
    setCurrentPage(1);
  };

  const handleSelectedStatusChange = (
    value: Set<string> | ((prev: Set<string>) => Set<string>),
  ) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    void loadVolunteers();
  }, []);

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((volunteer) => {
      const volunteerTags = volunteer.tags ?? [];

      // Assignment filter
      if (selectedAssignment.size > 0) {
        const hasMatchingAssignment = volunteerTags.some(
          (tag) => selectedAssignment.has(tag.name) && tag.type === "assignment",
        );
        if (!hasMatchingAssignment) return false;
      }

      // Status filter
      if (selectedStatus && selectedStatus.size > 0 && !selectedStatus.has(volunteer.status))
        return false;

      // Program filter
      if (selectedProgram.size > 0) {
        const hasMatchingProgram = volunteerTags.some(
          (tag) => selectedProgram.has(tag.name) && tag.type === "program",
        );
        if (!hasMatchingProgram) return false;
      }

      // Search filter (includes first/last/full name, phone, email)
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const firstName = (volunteer.firstName ?? "").toLowerCase();
        const lastName = (volunteer.lastName ?? "").toLowerCase();
        const fullName = `${firstName} ${lastName}`;
        const reverseFullName = `${lastName} ${firstName}`;
        const phoneNumber = (volunteer.phoneNumber ?? "").toLowerCase();
        const email = (volunteer.email ?? "").toLowerCase();

        const matchesSearch =
          firstName.includes(query) ||
          lastName.includes(query) ||
          fullName.includes(query) ||
          reverseFullName.includes(query) ||
          phoneNumber.includes(query) ||
          email.includes(query);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [volunteers, selectedAssignment, selectedProgram, selectedStatus, search]);

  // Calculate pagination slice
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedVolunteers = filteredVolunteers.slice(startIndex, endIndex);

  return {
    search,
    handleSearchChange,
    filteredVolunteers,
    displayedVolunteers,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    projectTags,
    programTags,
    assignmentTags,
    statusTags,
    selectedProject,
    handleSelectedProjectChange,
    selectedProgram,
    handleSelectedProgramChange,
    selectedAssignment,
    handleSelectedAssignmentChange,
    selectedStatus,
    handleSelectedStatusChange,
  };
}
