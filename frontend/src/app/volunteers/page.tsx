"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { Volunteer, VolunteerTag } from "@/types/volunteer";

import { fetchProjectProgramMaps, fetchTags } from "@/app/api/tag";
import { fetchVolunteerAssignments, fetchVolunteers } from "@/app/api/volunteer";
import styles from "@/app/page.module.css";
import CreateRoleModal from "@/components/CreateRoleModal";
import CreateShiftModal from "@/components/CreateShiftModal";
import EditTagModal from "@/components/EditTagModal";
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
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [tags, setTags] = useState<VolunteerTag[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [showCreateShiftModal, setShowCreateShiftModal] = useState(false);
  const [showEditTagModal, setShowEditTagModal] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Set<string>>(new Set());
  const [selectedProgram, setSelectedProgram] = useState<Set<string>>(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [sortOption, setSortOption] = useState<
    "Newest" | "Oldest" | "First Name A-Z" | "First Name Z-A" | "Last Name A-Z" | "Last Name Z-A"
  >("Newest");
  const itemsPerPage = 100;

  const loadVolunteers = async () => {
    try {
      const [volunteerData, tagData, assignmentData, projectProgramMapData] = await Promise.all([
        fetchVolunteers(),
        fetchTags(),
        fetchVolunteerAssignments(),
        fetchProjectProgramMaps(),
      ]);

      const tagById = new Map<string, VolunteerTag>();
      for (const t of tagData) tagById.set(t._id, t);

      const programByProjectId = new Map<string, VolunteerTag>();
      for (const map of projectProgramMapData) {
        const projectId =
          typeof map.projectTagId === "string" ? map.projectTagId : map.projectTagId._id;
        const programTag =
          typeof map.programTagId === "string" ? tagById.get(map.programTagId) : map.programTagId;
        if (projectId && programTag) programByProjectId.set(projectId, programTag);
      }

      const resolveTag = (t?: string | VolunteerTag | null) => {
        if (!t) return undefined;
        return typeof t === "string" ? tagById.get(t) : t;
      };

      const volunteersWithTags = volunteerData.map((volunteer) => {
        const volunteerAssignments = assignmentData.filter(
          (assignment) => assignment.volunteerId === volunteer._id,
        );
        const seenTagIds = new Set<string>();
        const volunteerTags: VolunteerTag[] = [];

        const pushTag = (tag: VolunteerTag | undefined) => {
          if (!tag || seenTagIds.has(tag._id)) return;
          seenTagIds.add(tag._id);
          volunteerTags.push(tag);
        };

        for (const assignment of volunteerAssignments) {
          pushTag(resolveTag(assignment.assignmentTagId));
          pushTag(resolveTag(assignment.projectTagId));

          const projTag = resolveTag(assignment.projectTagId);
          pushTag(projTag ? programByProjectId.get(projTag._id) : undefined);

          for (const shiftTag of assignment.shiftTagIds ?? []) pushTag(resolveTag(shiftTag));
        }

        return { ...volunteer, tags: volunteerTags };
      });

      setVolunteers(volunteersWithTags);
      setTags(tagData);
      setAssignments(assignmentData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSortOptionChange = (
    option:
      | "Newest"
      | "Oldest"
      | "First Name A-Z"
      | "First Name Z-A"
      | "Last Name A-Z"
      | "Last Name Z-A",
  ) => {
    setSortOption(option);
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

  const projectTags = [
    ...new Set(
      volunteers
        .flatMap((v) => v.tags ?? [])
        .filter((t) => t.type === "project")
        .map((t) => t.name),
    ),
  ];
  const assignmentTags = tags.filter((t) => t.type === "assignment").map((t) => t.name);
  const programTags = tags.filter((t) => t.type === "program").map((t) => t.name);

  // Apply ALL filters here (search + tags)
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((volunteer) => {
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

      if (selectedStatus && volunteer.status !== selectedStatus) return false;

      // Search filter (includes first/last/full name, phone, email)
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const firstName = (volunteer.firstName ?? "").toLowerCase();
        const lastName = (volunteer.lastName ?? "").toLowerCase();
        const fullName = `${firstName} ${lastName}`;
        const reverseFullName = `${lastName} ${firstName}`;
        const phoneNumber = (volunteer.phoneNumber ?? "").toLowerCase();
        const email = (volunteer.email ?? "").toLowerCase();

        const matches =
          firstName.includes(query) ||
          lastName.includes(query) ||
          fullName.includes(query) ||
          reverseFullName.includes(query) ||
          email.includes(query) ||
          phoneNumber?.includes(query);
        if (!matches) return false;
      }

      return true;
    });
  }, [volunteers, selectedProject, selectedAssignment, selectedProgram, selectedStatus, search]);

  const sortedFilteredVolunteers = useMemo(() => {
    const sorted = [...filteredVolunteers];
    const toTime = (d?: string | Date | null) => {
      if (!d) return 0;
      try {
        return new Date(d).getTime();
      } catch (_e) {
        return 0;
      }
    };

    switch (sortOption) {
      case "Newest":
        return sorted.sort((a, b) => toTime(b.startDate) - toTime(a.startDate));
      case "Oldest":
        return sorted.sort((a, b) => toTime(a.startDate) - toTime(b.startDate));
      case "First Name A-Z":
        return sorted.sort((a, b) => a.firstName.localeCompare(b.firstName));
      case "First Name Z-A":
        return sorted.sort((a, b) => b.firstName.localeCompare(a.firstName));
      case "Last Name A-Z":
        return sorted.sort((a, b) => a.lastName.localeCompare(b.lastName));
      case "Last Name Z-A":
        return sorted.sort((a, b) => b.lastName.localeCompare(a.lastName));
      default:
        return sorted;
    }
  }, [filteredVolunteers, sortOption]);

  // Calculate pagination slice
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedVolunteers = sortedFilteredVolunteers.slice(startIndex, endIndex);

  const handleImportComplete = () => {
    void loadVolunteers();
    setShowImportSuccess(true);
  };

  const renderCreateTagModal = () => {
    if (!showCreateTagModal) return null;

    // For testing, the renderCreateTagModal will pass the first volunteer on the currently displayed page.
    const volunteerToPass = displayedVolunteers.length > 0 ? displayedVolunteers[0] : undefined;
    return (
      <CreateRoleModal onClose={() => setShowCreateTagModal(false)} volunteer={volunteerToPass} />
    );
  };

  const renderCreateShiftModal = () => {
    if (!showCreateShiftModal) return null;
    // For testing: find assignment with id 69f98cb6e9e25f2173e429ff
    const testAssignment = assignments.find((a) => a._id === "69fd099efc2344329a5745c0") || null;
    return (
      <CreateShiftModal
        onClose={() => setShowCreateShiftModal(false)}
        assignment={testAssignment}
      />
    );
  };

  const renderEditTagModal = () => {
    if (!showEditTagModal) return null;

    // For testing: find tag with id 69fd0ae113eaf3c469fb4341
    const testTag = tags.find((tag) => tag._id === "69fd0ae113eaf3c469fb4341");
    if (!testTag) return null;

    return <EditTagModal onClose={() => setShowEditTagModal(false)} tag={testTag} />;
  };

  return (
    <Sidebar>
      <div className={styles.page}>
        <main className={styles.main}>
          {renderCreateTagModal()}
          {renderCreateShiftModal()}
          {renderEditTagModal()}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowCreateTagModal(true)}
              disabled={filteredVolunteers.length === 0}
            >
              Create VolunteerAssignment Modal
            </button>

            <button type="button" onClick={() => setShowCreateShiftModal(true)}>
              Create Shift Tag Modal
            </button>

            <button type="button" onClick={() => setShowEditTagModal(true)}>
              Edit Tag Modal
            </button>
          </div>

          <p>
            Above testing button creates the VolunteerAssignment modal for the first volunteer in
            the list.
          </p>

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
              ></button>
            </div>
          )}

          <TitleBar onImportComplete={handleImportComplete} />

          <SearchBar
            search={search}
            setSearch={handleSearchChange}
            projectTags={projectTags}
            assignmentTags={assignmentTags}
            programTags={programTags}
            sortType={sortOption}
            selectedProject={selectedProject}
            setSelectedProject={handleSelectedProjectChange}
            selectedStatus={selectedStatus}
            setSelectedStatus={handleSelectedStatusChange}
            selectedAssignment={selectedAssignment}
            setSelectedAssignment={handleSelectedAssignmentChange}
            selectedProgram={selectedProgram}
            setSelectedProgram={handleSelectedProgramChange}
            onSortOptionChange={handleSortOptionChange}
          />

          <div className={styles.tableSection}>
            <VolunteerTable
              volunteers={displayedVolunteers}
              selectableVolunteers={filteredVolunteers}
              onSelectedCountChange={setSelectedCount}
            />
            <div className={styles.tableSummaryRow}>
              <span className={styles.tableSummaryLeft}>
                {selectedCount > 0 ? `${selectedCount} selected` : ""}
              </span>
              <span className={styles.tableSummaryRight}>
                Total volunteers: {filteredVolunteers.length}
              </span>
            </div>
          </div>

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
