"use client";

import router from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

import Pagination from "./pagination";
import RecipientRow from "./RecipientRow";
import styles from "./RecipientsPanel.module.css";

import { useTextingFlowStore } from "@/app/messages/new/_store/textingFlowStore";
import SearchBar from "@/components/SearchBar";
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
    eventTags,
    volunteerTypeTags,
    selectedEvent,
    handleSelectedEventChange,
    selectedStatus,
    handleSelectedStatusChange,
    selectedVolunteerType,
    handleSelectedVolunteerTypeChange,
    filteredVolunteers,
    displayedVolunteers,
    currentPage,
    itemsPerPage,
    setCurrentPage,
  } = volunteerFilterHook({ itemsPerPage: NUMBER_OF_VOLUNTEERS_PER_PAGE });

  const selectedRecipientIds = useTextingFlowStore((s) => s.selectedRecipientIds);
  const selectedSet = useMemo(() => new Set(selectedRecipientIds), [selectedRecipientIds]);
  const toggleRecipient = useTextingFlowStore((s) => s.toggleRecipient);
  const toggleSelectAll = useTextingFlowStore((s) => s.toggleSelectAll);

  // Determine if all filtered volunteers are selected
  const allFilteredSelected =
    filteredVolunteers.length > 0 && filteredVolunteers.every((v) => selectedSet.has(v._id));
  console.log(selectedSet);
  console.log(selectedRecipientIds);

  const numSelectedRecipientIds = useTextingFlowStore((s) => s.getNumSelectedRecipientIds());
  const numRecipientsIds = useTextingFlowStore((s) => s.getNumRecipientIds());
  const allSelected = filteredVolunteers.every((v) => selectedRecipientIds.includes(v._id));

  const selectEnabled = numSelectedRecipientIds > 0;
  const handleSelect = useCallback(() => {
    if (mode === "page") void router.push("/messages/new");
  }, [mode, router]);

  return (
    <div className={mode === "panel" ? styles.panel : styles.pageBody}>
      <SearchBar
        search={search}
        setSearch={handleSearchChange}
        eventTags={eventTags}
        volunteerTypeTags={volunteerTypeTags}
        selectedEvent={selectedEvent}
        setSelectedEvent={handleSelectedEventChange}
        selectedStatus={selectedStatus}
        setSelectedStatus={handleSelectedStatusChange}
        selectedVolunteerType={selectedVolunteerType}
        setSelectedVolunteerType={handleSelectedVolunteerTypeChange}
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
