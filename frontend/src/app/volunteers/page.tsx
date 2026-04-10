"use client";

import { Volunteer } from "@/types/volunteer";
import { fetchVolunteers } from "@/app/api/volunteer";
import VolunteerTable from "@/components/VolunteerTable";
import TitleBar from "@/components/TitleBar";
import SearchBar from "@/components/SearchBar";
import PageBar from "@/components/PageBar";
import styles from "../page.module.css";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Page() {
  // Data state
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<Set<string>>(new Set());
  const [selectedVolunteerType, setSelectedVolunteerType] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const itemsPerPage = 6;

  const loadVolunteers = async () => {
    try {
      const data = await fetchVolunteers();
      setVolunteers(data);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
    }
  };
  volunteers.sort((a, b) => b.created.getTime() - a.created.getTime());

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSelectedEventChange = (value: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    setSelectedEvent(value);
    setCurrentPage(1);
  };

  const handleSelectedStatusChange = (
    value: Set<string> | ((prev: Set<string>) => Set<string>),
  ) => {
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
    const loadInitialVolunteers = async () => {
      await loadVolunteers();
    };

    void loadInitialVolunteers();
  }, []);

  // Extract unique tags from volunteers
  const uniqueTags = Array.from(
    new Set(volunteers.flatMap((volunteer) => volunteer.tags.map((tag) => tag.name))),
  );

  // Combine all selected tag filters
  const allSelectedTags = new Set([...selectedEvent, ...selectedStatus, ...selectedVolunteerType]);

  // Apply ALL filters here (search + tags)
  const filteredVolunteers = volunteers.filter((volunteer) => {
    // Tag filter
    if (allSelectedTags.size > 0) {
      const hasMatchingTag = volunteer.tags.some((tag) => allSelectedTags.has(tag.name));
      if (!hasMatchingTag) return false;
    }

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
    loadVolunteers();
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
                  src="/success.svg"
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
            tags={uniqueTags}
            selectedEvent={selectedEvent}
            setSelectedEvent={handleSelectedEventChange}
            selectedStatus={selectedStatus}
            setSelectedStatus={handleSelectedStatusChange}
            selectedVolunteerType={selectedVolunteerType}
            setSelectedVolunteerType={handleSelectedVolunteerTypeChange}
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
