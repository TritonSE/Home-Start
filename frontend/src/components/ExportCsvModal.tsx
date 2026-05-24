"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./ExportCsvModal.module.css";

import type { Volunteer } from "@/types/volunteer";

import { exportVolunteersCsv, fetchVolunteers } from "@/app/api/volunteer";
import icCloseAsset from "@/assets/ic_close.svg";

const icClose = icCloseAsset as string;

type ExportCsvModalProps = {
  volunteers: Volunteer[];
  onClose: () => void;
};

export default function ExportCsvModal({
  volunteers: selectedVolunteers,
  onClose,
}: ExportCsvModalProps) {
  const exportAll = selectedVolunteers.length === 0;

  const [allVolunteers, setAllVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(exportAll);

  useEffect(() => {
    if (!exportAll) return;
    fetchVolunteers()
      .then(setAllVolunteers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [exportAll]);

  const displayVolunteers = exportAll ? allVolunteers : selectedVolunteers;

  const handleExport = async () => {
    await exportVolunteersCsv(exportAll ? [] : selectedVolunteers.map((v) => v._id));
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.headings}>
          <div className={styles.titleRow}>
            <span className={styles.title}>Export Volunteer Matrix</span>
            <button className={styles.closeButton} onClick={onClose} aria-label="Close">
              <Image src={icClose} alt="Close" width={40} height={40} />
            </button>
          </div>
          <div className={styles.stepIndicator}>
            <div className={styles.stepCircle}>1</div>
            <span className={styles.stepLabel}>Review</span>
          </div>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.scrollContainer}>
            <div className={styles.tableHeader}>
              <span className={styles.tableHeaderText}>
                {loading
                  ? "Loading..."
                  : `Exporting ${displayVolunteers.length} Volunteer${displayVolunteers.length !== 1 ? "s" : ""}`}
              </span>
            </div>
            <div className={styles.scrollContent}>
              {displayVolunteers.map((v) => (
                <div key={v._id} className={styles.volunteerRow}>
                  <span className={styles.volunteerName}>
                    {v.lastName}, {v.firstName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.exportButton} onClick={() => void handleExport()}>
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
