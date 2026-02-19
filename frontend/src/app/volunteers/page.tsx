"use client";

import { Volunteer } from "@/types/volunteer";
import { Tag } from "@/types/tag";
import { fetchVolunteers } from "@/app/api/volunteer";
import { fetchTags } from "@/app/api/tag";
import VolunteerTable from "@/components/VolunteerTable";
import TitleBar from "@/components/TitleBar";
import SearchBar from "@/components/SearchBar";
import PageBar from "@/components/PageBar";
import styles from "../page.module.css";
import { useState, useEffect } from "react";

export default function Page() {
  // Data state
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<Set<string>>(new Set());
  const [selectedVolunteerType, setSelectedVolunteerType] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch volunteers and tags once on mount
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
    loadData();
  }, []);

  // Filter tags by type
  const eventTags = tags.filter((tag) => tag.type === "event").map((tag) => tag.name);
  const volunteerTypeTags = tags
    .filter((tag) => tag.type === "volunteer type")
    .map((tag) => tag.name);

  // Combine all selected tag filters
  const allSelectedTags = new Set([...selectedEvent, ...selectedStatus, ...selectedVolunteerType]);

  // Apply ALL filters here (search + tags)
  const filteredVolunteers = volunteers.filter((volunteer) => {
    // Tag filter
    if (allSelectedTags.size > 0) {
      const hasMatchingTag = volunteer.tags?.some((tag) => allSelectedTags.has(tag.name));
      if (!hasMatchingTag) return false;
    }

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

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <TitleBar />
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
  );
}
