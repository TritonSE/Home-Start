"use client";
import Image from "next/image";
import { useState } from "react";

import styles from "./CSVButton.module.css";
import ExportCsvModal from "./ExportCsvModal";

import type { VolunteerWithTags } from "@/types/volunteer";

import uploadBlueAsset from "@/assets/upload_blue.svg";

const uploadBlue = uploadBlueAsset as string;

type ExportButtonProps = {
  selectedVolunteers: VolunteerWithTags[];
};

export default function ExportButton({ selectedVolunteers }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className={styles.exportButton} onClick={() => setIsOpen(true)}>
        <span className={styles.ic_container}>
          <Image
            src={uploadBlue}
            alt="Upload logo"
            className={styles.uploadIcon}
            width={13.333}
            height={14.167}
          />
        </span>
        <div className={styles.exportText}>Export CSV</div>
      </button>
      {isOpen && (
        <ExportCsvModal volunteers={selectedVolunteers} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
