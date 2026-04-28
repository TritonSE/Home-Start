"use client";

import Image from "next/image";
import { useState } from "react";

import styles from "../page.module.css";

import PageBar from "@/components/PageBar";
import SearchBar from "@/components/SearchBar";
import Sidebar from "@/components/Sidebar";
import TitleBar from "@/components/TitleBar";
import VolunteerTable from "@/components/VolunteerTable";
import volunteerFilterHook from "@/hooks/volunteerFilterHook";

const ITEMS_PER_VOLUNTEER_MATRIX_PAGE: number = 6;

export default function Page() {
  const [showImportSuccess, setShowImportSuccess] = useState(false);

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
    loadVolunteers,
    displayedVolunteers,
    currentPage,
    itemsPerPage,
    setCurrentPage,
  } = volunteerFilterHook({ itemsPerPage: ITEMS_PER_VOLUNTEER_MATRIX_PAGE });

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
