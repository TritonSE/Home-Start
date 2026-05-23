"use client";
import Image from "next/image";
import { useState } from "react";

import ExportCsvModal from "./ExportCsvModal";
import styles from "./CSVButton.module.css";

import uploadBlueAsset from "@/assets/upload_blue.svg";

const uploadBlue = uploadBlueAsset as string;

export default function ExportButton() {
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
      {isOpen && <ExportCsvModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
