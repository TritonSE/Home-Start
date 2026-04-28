"use client";

import { useEffect, useState } from "react";

import type { Volunteer, VolunteerTag } from "@/types/volunteer";

import { fetchTags } from "@/app/api/tag";
import { fetchVolunteers } from "@/app/api/volunteer";
import { useTextingFlowStore } from "@/app/messages/new/_store/textingFlowStore";

type volunteerFilterHookProps = {
  itemsPerPage: number;
};

export default function volunteerFilterHook({ itemsPerPage }: volunteerFilterHookProps) {
  // Data state
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [tags, setTags] = useState<VolunteerTag[]>([]);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedVolunteerType, setSelectedVolunteerType] = useState<Set<string>>(new Set());
  const setRecipients = useTextingFlowStore((s) => s.setRecipients);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const loadVolunteers = async () => {
    try {
      const data = await fetchVolunteers();
      setVolunteers(data);
      const existingRecipientIds = useTextingFlowStore.getState().recipientIds;
      if (!existingRecipientIds || existingRecipientIds.length === 0) {
        setRecipients(data);
      }
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
        const existingRecipientIds = useTextingFlowStore.getState().recipientIds;
        if (!existingRecipientIds || existingRecipientIds.length === 0) {
          setRecipients(volunteerData);
        }
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

  return {
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
    loadVolunteers,
    displayedVolunteers,
    currentPage,
    itemsPerPage,
    setCurrentPage,
  };
}
