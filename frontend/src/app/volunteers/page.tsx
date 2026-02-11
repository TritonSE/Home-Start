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
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const itemsPerPage = 6;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTotalItemsChange = (total: number) => {
    setTotalItems(total);
  };

  const handleImportComplete = () => {
    setShowImportSuccess(true);
  };

  return (
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
        <SearchBar />
        <VolunteerTable
          itemsPerPage={itemsPerPage}
          pageNumber={currentPage}
          onTotalItemsChange={handleTotalItemsChange}
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
