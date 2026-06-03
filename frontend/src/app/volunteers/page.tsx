"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { Volunteer, VolunteerTag } from "@/types/volunteer";

import { fetchProjectProgramMaps, fetchTags } from "@/app/api/tag";
import { fetchVolunteerAssignments, fetchVolunteers } from "@/app/api/volunteer";
import { useTextingFlowStore } from "@/app/messages/new/_store/textingFlowStore";
import styles from "@/app/page.module.css";
import sendMessageButtonAsset from "@/assets/send_message_button.svg";
import sendMessageHoverButtonAsset from "@/assets/send_message_hover_button.svg";
import Pagination from "@/components/messages/pagination";
import SearchBar from "@/components/SearchBar";
import Sidebar from "@/components/Sidebar";
import TitleBar from "@/components/TitleBar";
import VolunteerProfileModal from "@/components/VolunteerProfileModal";
import VolunteerTable from "@/components/VolunteerTable";

const sendMessageButton = sendMessageButtonAsset as string;
const sendMessageHoverButton = sendMessageHoverButtonAsset as string;

export default function Page() {
  const router = useRouter();
  const setMode = useTextingFlowStore((s) => s.setMode);
  const setRecipientsPool = useTextingFlowStore((s) => s.setRecipientsPool);
  const toggleRecipient = useTextingFlowStore((s) => s.toggleRecipient);
  const toggleSelectAll = useTextingFlowStore((s) => s.toggleSelectAll);
  const clearSelectedRecipients = useTextingFlowStore((s) => s.clearSelectedRecipients);
  const storeSelectedIds = useTextingFlowStore((s) => s.selectedRecipientIds);

  // Derive a Set from the store ids for efficient lookup in the table
  const controlledSelectedIds = useMemo(() => new Set(storeSelectedIds), [storeSelectedIds]);

  // Data state
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [tags, setTags] = useState<VolunteerTag[]>([]);

  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Set<string>>(new Set());
  const [selectedProgram, setSelectedProgram] = useState<Set<string>>(new Set());

  // Clear selection whenever any filter changes to avoid invisibly selected volunteers
  useEffect(() => {
    clearSelectedRecipients();
  }, [
    search,
    selectedProject,
    selectedStatus,
    selectedAssignment,
    selectedProgram,
    clearSelectedRecipients,
  ]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [sendMessageHovered, setSendMessageHovered] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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

        // Add assignment and project tags
        for (const assignment of volunteerAssignments) {
          pushTag(resolveTag(assignment.assignmentTagId));
          pushTag(resolveTag(assignment.projectTagId));

          const projTag = resolveTag(assignment.projectTagId);
          pushTag(projTag ? programByProjectId.get(projTag._id) : undefined);

          for (const shiftTag of assignment.shiftTagIds ?? []) pushTag(resolveTag(shiftTag));
        }

        // Add group tags from groupIds
        if (Array.isArray(volunteer.groupIds) && volunteer.groupIds.length > 0) {
          for (const groupId of volunteer.groupIds) {
            const groupTag = tagData.find((tag) => tag._id === groupId);
            pushTag(groupTag);
          }
        }

        // Add directly saved group/program tags so filters use the latest edits.
        if (Array.isArray(volunteer.groupTagIds) && volunteer.groupTagIds.length > 0) {
          for (const groupTag of volunteer.groupTagIds) {
            if (typeof groupTag === "string") {
              pushTag(tagData.find((tag) => tag._id === groupTag));
            } else {
              pushTag(groupTag);
            }
          }
        }

        if (Array.isArray(volunteer.programTagIds) && volunteer.programTagIds.length > 0) {
          for (const programTag of volunteer.programTagIds) {
            if (typeof programTag === "string") {
              pushTag(tagData.find((tag) => tag._id === programTag));
            } else {
              pushTag(programTag);
            }
          }
        }

        return { ...volunteer, tags: volunteerTags };
      });

      setVolunteers(volunteersWithTags);
      setTags(tagData);
      // Keep the store's recipient pool in sync without wiping the current selection
      setRecipientsPool(volunteersWithTags);
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
        return sorted.sort((a, b) => toTime(b.dateCreated) - toTime(a.dateCreated));
      case "Oldest":
        return sorted.sort((a, b) => toTime(a.dateCreated) - toTime(b.dateCreated));
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

  const handleSendMessage = useCallback(() => {
    setMode("text");
    void router.push("/communication");
  }, [setMode, router]);
  const handleSheetClose = () => {
    setIsSheetOpen(false);
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
              controlledSelectedIds={controlledSelectedIds}
              onControlledToggleOne={toggleRecipient}
              onControlledToggleAll={(scope) => toggleSelectAll(scope)}
              onVolunteerSelect={(v) => {
                setSelectedVolunteer(v);
                setIsSheetOpen(true);
              }}
            />
            <div className={styles.tableSummaryRow}>
              <span className={styles.tableSummaryLeft}>
                {storeSelectedIds.length > 0 ? `${storeSelectedIds.length} selected` : ""}
              </span>
              <span className={styles.tableSummaryRight}>
                Total volunteers: {filteredVolunteers.length}
              </span>
            </div>
          </div>
          <Pagination
            totalItems={filteredVolunteers.length}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setPageIndex={setCurrentPage}
          ></Pagination>

          <button
            type="button"
            className={styles.sendMessageBtn}
            onClick={handleSendMessage}
            onMouseEnter={() => setSendMessageHovered(true)}
            onMouseLeave={() => setSendMessageHovered(false)}
            aria-label={`Send message${storeSelectedIds.length > 0 ? ` to ${storeSelectedIds.length} selected volunteer${storeSelectedIds.length === 1 ? "" : "s"}` : ""}`}
          >
            <Image
              src={sendMessageHovered ? sendMessageHoverButton : sendMessageButton}
              alt="Send Message"
              width={sendMessageHovered ? 185 : 56}
              height={56}
            />
          </button>
        </main>
        <VolunteerProfileModal
          volunteer={selectedVolunteer}
          isOpen={isSheetOpen}
          onClose={handleSheetClose}
          onVolunteerUpdated={(updatedVolunteer) => {
            setSelectedVolunteer(updatedVolunteer);
            void loadVolunteers();
          }}
        />
      </div>
    </Sidebar>
  );
}
