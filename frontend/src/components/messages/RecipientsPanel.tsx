"use client";

import { useEffect, useMemo, useState } from "react";

import Pagination from "./pagination";
import RecipientRow from "./RecipientRow";
import styles from "./RecipientsPanel.module.css";

import { useTextingFlowStore } from "@/app/messages/new/_store/textingFlowStore";
import SearchBarPanel from "@/components/SearchBarPanel";
import volunteerFilterHook from "@/hooks/volunteerFilterHook";

type RecipientsPanelProps = {
  mode: "panel" | "page";
};

const NUMBER_OF_VOLUNTEERS_PER_PAGE = 15;

export default function RecipientsPanel({ mode }: RecipientsPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
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
  } = volunteerFilterHook({ itemsPerPage: NUMBER_OF_VOLUNTEERS_PER_PAGE });

  const selectedRecipientIds = useTextingFlowStore((s) => s.selectedRecipientIds);
  const selectedSet = useMemo(() => new Set(selectedRecipientIds), [selectedRecipientIds]);
  const toggleRecipient = useTextingFlowStore((s) => s.toggleRecipient);
  const toggleSelectAll = useTextingFlowStore((s) => s.toggleSelectAll);

  // Determine if all filtered volunteers are selected
  const allFilteredSelected =
    filteredVolunteers.length > 0 && filteredVolunteers.every((v) => selectedSet.has(v._id));

  const numSelectedRecipientIds = useTextingFlowStore((s) => s.getNumSelectedRecipientIds());

  return (
    <div className={mode === "panel" ? styles.panel : styles.pageBody}>
      <SearchBarPanel
        search={search}
        setSearch={handleSearchChange}
        projectTags={projectTags}
        programTags={programTags}
        assignmentTags={assignmentTags}
        statusTags={statusTags}
        selectedProject={selectedProject}
        setSelectedProject={handleSelectedProjectChange}
        selectedProgram={selectedProgram}
        setSelectedProgram={handleSelectedProgramChange}
        selectedAssignment={selectedAssignment}
        setSelectedAssignment={handleSelectedAssignmentChange}
        selectedStatus={selectedStatus}
        setSelectedStatus={handleSelectedStatusChange}
        sortType="Newest"
        onSortOptionChange={() => {}}
      />

      <div className={styles.recipientsHeader}>
        <div className={styles.recipientsTitle}>
          Recipients{mounted ? ` (${numSelectedRecipientIds})` : ""}
        </div>

        {mounted && (
          <button
            type="button"
            className={styles.selectAllLink}
            onClick={() => toggleSelectAll(filteredVolunteers)}
          >
            {allFilteredSelected ? "Deselect All" : "Select All"}
          </button>
        )}
      </div>

      <div className={styles.list}>
        {displayedVolunteers.map((r) => (
          <RecipientRow
            key={r._id + r.firstName}
            name={`${r.firstName} ${r.lastName}`}
            tags={r.tags}
            selected={mounted ? selectedSet.has(r._id) : false}
            onToggle={() => toggleRecipient(r._id)}
            checkboxPosition="left"
            disableSelectedStyle
          />
        ))}
      </div>
      <Pagination
        totalItems={filteredVolunteers.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        setPageIndex={setCurrentPage}
      ></Pagination>
    </div>
  );
}
