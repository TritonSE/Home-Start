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

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
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

  const handleSelectedStatusChange = (value: string | null) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [volunteerData, tagData] = await Promise.all([fetchVolunteers(), fetchTags()]);
        setVolunteers(volunteerData);
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

  const filteredVolunteers = volunteers.filter((volunteer) => {
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
    selectedStatus,
    handleSelectedStatusChange,
    filteredVolunteers,
    loadVolunteers,
    displayedVolunteers,
    currentPage,
    itemsPerPage,
    setCurrentPage,
  };
}
