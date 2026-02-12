"use client";

import VolunteerTable from "@/components/VolunteerTable";
import TitleBar from "@/components/TitleBar";
import SearchBar from "@/components/SearchBar";
import PageBar from "@/components/PageBar";
import styles from "../page.module.css";
import { useState } from "react";

export default function Page() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<Set<string>>(new Set());
  const [selectedVolunteerType, setSelectedVolunteerType] = useState<Set<string>>(new Set());
  const itemsPerPage = 6;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTotalItemsChange = (total: number) => {
    setTotalItems(total);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <TitleBar />
        <SearchBar
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedVolunteerType={selectedVolunteerType}
          setSelectedVolunteerType={setSelectedVolunteerType}
        />
        <VolunteerTable
          itemsPerPage={itemsPerPage}
          pageNumber={currentPage}
          onTotalItemsChange={handleTotalItemsChange}
          selectedEvent={selectedEvent}
          selectedStatus={selectedStatus}
          selectedVolunteerType={selectedVolunteerType}
        />
        <PageBar
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
}
