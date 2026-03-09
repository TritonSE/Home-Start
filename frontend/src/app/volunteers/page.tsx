"use client";

import { Volunteer, VolunteerTag } from "@/types/volunteer";
import { fetchVolunteers } from "@/app/api/volunteer";
import { fetchTags } from "@/app/api/tag";
import VolunteerTable from "@/components/VolunteerTable";
import TitleBar from "@/components/TitleBar";
import SearchBar from "@/components/SearchBar";
import PageBar from "@/components/PageBar";
import styles from "../page.module.css";
import Sidebar from "../components/sidebar";
import { useState, useEffect } from "react";

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
  const [totalItems, setTotalItems] = useState(0);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const itemsPerPage = 6;

  // Fetch volunteers and tags once on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [volunteerData, tagData] = await Promise.all([fetchVolunteers(), fetchTags()]);
        setVolunteers(volunteerData);
        setTags(tagData);
        console.log("raw tag data", tagData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    loadData();
  }, []);

  // Filter tags by type
  const eventTags = tags.filter((tag) => tag.type === "Event").map((tag) => tag.name);
  const volunteerTypeTags = tags
    .filter((tag) => tag.type === "Volunteer Type")
    .map((tag) => tag.name);
  // Extract unique tags from volunteers
  const uniqueTags = Array.from(
    new Set(volunteers.flatMap((volunteer) => volunteer.tags.map((tag) => tag.name))),
  );

  // Combine all selected tag filters
  const allSelectedTags = new Set([...selectedEvent, ...selectedVolunteerType]);

  // Apply ALL filters here (search + tags)
  const filteredVolunteers = volunteers.filter((volunteer) => {
    // Tag filter
    if (allSelectedTags.size > 0) {
      const hasMatchingTag = volunteer.tags?.some((tag) => allSelectedTags.has(tag.name));
      if (!hasMatchingTag) return false;
    }

    // Status filter
    if (selectedStatus && volunteer.status !== selectedStatus) return false;

    // Search filter
    if (search.trim()) {
      const matchesSearch = volunteer.firstName.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
    }

    return true;
  });

  // Calculate pagination slice
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedVolunteers = filteredVolunteers.slice(startIndex, endIndex);

  const handleImportComplete = () => {
    setShowImportSuccess(true);
  };

  return (
    <Sidebar>
      <div className={styles.page}>
        <main className={styles.main}>
          {showImportSuccess && (
            <div className={styles.importSuccessBanner}>
              <div className={styles.importSuccessContent}>
                <img src="/success.svg" className={styles.importSuccessIcon} />
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
            setSearch={setSearch}
            eventTags={eventTags}
            volunteerTypeTags={volunteerTypeTags}
            selectedEvent={selectedEvent}
            setSelectedEvent={setSelectedEvent}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedVolunteerType={selectedVolunteerType}
            setSelectedVolunteerType={setSelectedVolunteerType}
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
