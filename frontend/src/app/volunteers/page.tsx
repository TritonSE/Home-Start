"use client";

import VolunteerTable from "@/components/VolunteerTable";
import VolunteerProfileModal from "@/components/VolunteerProfileModal";
import TitleBar from "@/components/TitleBar";
import SearchBar from "@/components/SearchBar";
import PageBar from "@/components/PageBar";
import styles from "../page.module.css";
import { Volunteer } from "@/types/volunteer";
import { useState } from "react";

export default function Page() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const itemsPerPage = 6;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTotalItemsChange = (total: number) => {
    setTotalItems(total);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <TitleBar />
        <SearchBar />
        <VolunteerTable
          itemsPerPage={itemsPerPage}
          pageNumber={currentPage}
          onTotalItemsChange={handleTotalItemsChange}
          onVolunteerSelect={(volunteer) => {
            setSelectedVolunteer(volunteer);
            setIsSheetOpen(true);
          }}
        />
        <PageBar
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </main>
      <VolunteerProfileModal
        volunteer={selectedVolunteer}
        isOpen={isSheetOpen}
        onClose={handleSheetClose}
      />
    </div>
  );
}
