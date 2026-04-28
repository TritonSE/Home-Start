"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { Volunteer, VolunteerTag } from "@/types/volunteer";

import { fetchProjectProgramMaps, fetchTags } from "@/app/api/tag";
import { fetchVolunteerAssignments, fetchVolunteers } from "@/app/api/volunteer";
import styles from "@/app/page.module.css";
import PageBar from "@/components/PageBar";
import SearchBar from "@/components/SearchBar";
import Sidebar from "@/components/Sidebar";
import TitleBar from "@/components/TitleBar";
import VolunteerTable from "@/components/VolunteerTable";

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

export default function Page() {
  // Data state
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [tags, setTags] = useState<VolunteerTag[]>([]);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Set<string>>(new Set());
  const [selectedProgram, setSelectedProgram] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const itemsPerPage = 6;

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

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSelectedProjectChange = (
    value: Set<string> | ((prev: Set<string>) => Set<string>),
  ) => {
    setSelectedProject(value);
    setCurrentPage(1);
  };

  const handleSelectedStatusChange = (value: string | null) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleSelectedAssignmentChange = (
    value: Set<string> | ((prev: Set<string>) => Set<string>),
  ) => {
    setSelectedAssignment(value);
    setCurrentPage(1);
  };

  const handleSelectedProgramChange = (
    value: Set<string> | ((prev: Set<string>) => Set<string>),
  ) => {
    setSelectedProgram(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    void loadVolunteers();
  }, []);

  // Project dropdown should only include projects currently assigned to volunteers.
  const projectTags = [
    ...new Set(
      volunteers
        .flatMap((volunteer) => volunteer.tags ?? [])
        .filter((tag) => tag.type === "project")
        .map((tag) => tag.name),
    ),
  ];
  const assignmentTags = tags.filter((tag) => tag.type === "assignment").map((tag) => tag.name);
  const programTags = tags.filter((tag) => tag.type === "program").map((tag) => tag.name);

  // Apply ALL filters here (search + tags)
  const filteredVolunteers = volunteers.filter((volunteer) => {
    const volunteerTags = volunteer.tags ?? [];

    // Project filter
    if (selectedProject.size > 0) {
      const hasMatchingProject = volunteerTags.some(
        (tag) => selectedProject.has(tag.name) && tag.type === "project",
      );
      if (!hasMatchingProject) return false;
    }

    // Assignment filter
    if (selectedAssignment.size > 0) {
      const hasMatchingAssignment = volunteerTags.some(
        (tag) => selectedAssignment.has(tag.name) && tag.type === "assignment",
      );
      if (!hasMatchingAssignment) return false;
    }

    // Program filter
    if (selectedProgram.size > 0) {
      const hasMatchingProgram = volunteerTags.some(
        (tag) => selectedProgram.has(tag.name) && tag.type === "program",
      );
      if (!hasMatchingProgram) return false;
    }

    // Status filter
    if (selectedStatus && volunteer.status !== selectedStatus) return false;

    // Search filter
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      const firstName = volunteer.firstName.toLowerCase();
      const lastName = volunteer.lastName.toLowerCase();
      const fullName = `${firstName} ${lastName}`;
      const reverseFullName = `${lastName} ${firstName}`;

      const matchesSearch =
        firstName.includes(query) ||
        lastName.includes(query) ||
        fullName.includes(query) ||
        reverseFullName.includes(query);
      if (!matchesSearch) return false;
    }

    return true;
  });

  // Calculate pagination slice
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedVolunteers = filteredVolunteers.slice(startIndex, endIndex);

  const handleImportComplete = () => {
    void loadVolunteers();
    setShowImportSuccess(true);
  };

  return (
    <Sidebar>
      <div className={styles.page}>
        <main className={styles.main}>
          {showImportSuccess && (
            <div className={styles.importSuccessBanner}>
              <div className={styles.importSuccessContent}>
                <Image
                  src={"/ic_success.svg"}
                  alt="Success"
                  className={styles.importSuccessIcon}
                  width={24}
                  height={24}
                />
                <span className={styles.importSuccessText}>CSV Successfully Uploaded</span>
              </div>
              <button
                type="button"
                className={styles.importSuccessClose}
                onClick={() => setShowImportSuccess(false)}
                aria-label="Dismiss success message"
              >
                ×
              </button>
            </div>
          )}
          <TitleBar onImportComplete={handleImportComplete} />
          <SearchBar
            search={search}
            setSearch={handleSearchChange}
            projectTags={projectTags}
            assignmentTags={assignmentTags}
            programTags={programTags}
            selectedProject={selectedProject}
            setSelectedProject={handleSelectedProjectChange}
            selectedStatus={selectedStatus}
            setSelectedStatus={handleSelectedStatusChange}
            selectedAssignment={selectedAssignment}
            setSelectedAssignment={handleSelectedAssignmentChange}
            selectedProgram={selectedProgram}
            setSelectedProgram={handleSelectedProgramChange}
          />
          <VolunteerTable volunteers={displayedVolunteers} />
          <PageBar
            totalItems={filteredVolunteers.length}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </main>
      </div>
    </Sidebar>
  );
}
