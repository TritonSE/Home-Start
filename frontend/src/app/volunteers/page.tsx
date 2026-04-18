"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "../page.module.css";

import type { Volunteer, VolunteerTag } from "@/types/volunteer";

import { fetchTags } from "@/app/api/tag";
import { fetchVolunteers } from "@/app/api/volunteer";
import PageBar from "@/components/PageBar";
import SearchBar from "@/components/SearchBar";
import Sidebar from "@/components/Sidebar";
import TitleBar from "@/components/TitleBar";
import VolunteerTable from "@/components/VolunteerTable";

export default function Page() {
  // Data state
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [tags, setTags] = useState<VolunteerTag[]>([]);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedVolunteerType, setSelectedVolunteerType] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const itemsPerPage = 6;

  const loadVolunteers = async () => {
    try {
      const data = await fetchVolunteers();
      setVolunteers(data);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSelectedEventChange = (value: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    setSelectedEvent(value);
    setCurrentPage(1);
  };

  const handleSelectedStatusChange = (value: string | null) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleSelectedVolunteerTypeChange = (
    value: Set<string> | ((prev: Set<string>) => Set<string>),
  ) => {
    setSelectedVolunteerType(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [volunteerData, tagData] = await Promise.all([fetchVolunteers(), fetchTags()]);
        setVolunteers(volunteerData);
        setTags(tagData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    void loadData();
  }, []);

  // Filter tags by type
  const eventTags = tags.filter((tag) => tag.type === "Event").map((tag) => tag.name);
  const volunteerTypeTags = tags
    .filter((tag) => tag.type === "Volunteer Type")
    .map((tag) => tag.name);
  // Apply ALL filters here (search + tags)
  const filteredVolunteers = volunteers.filter((volunteer) => {
    //Event filter
    if (selectedEvent.size > 0) {
      const hasMatchingEvent = volunteer.tags?.some((tag) => selectedEvent.has(tag.name));
      if (!hasMatchingEvent) return false;
    }

    //Volunteer Type filter
    if (selectedVolunteerType.size > 0) {
      const hasMatchingVolunteerType = volunteer.tags?.some((tag) =>
        selectedVolunteerType.has(tag.name),
      );
      if (!hasMatchingVolunteerType) return false;
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
            eventTags={eventTags}
            volunteerTypeTags={volunteerTypeTags}
            selectedEvent={selectedEvent}
            setSelectedEvent={handleSelectedEventChange}
            selectedStatus={selectedStatus}
            setSelectedStatus={handleSelectedStatusChange}
            selectedVolunteerType={selectedVolunteerType}
            setSelectedVolunteerType={handleSelectedVolunteerTypeChange}
          />
          <VolunteerTable
            volunteers={displayedVolunteers}
            selectableVolunteers={filteredVolunteers}
            onSelectedCountChange={setSelectedCount}
          />
          <div className={styles.tableSummaryRow}>
            <span className={styles.tableSummaryLeft}>
              {selectedCount > 0 ? `${selectedCount} selected` : ""}
            </span>
            <span className={styles.tableSummaryRight}>Total volunteers: {volunteers.length}</span>
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
