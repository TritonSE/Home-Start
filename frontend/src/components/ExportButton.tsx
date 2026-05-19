import Image from "next/image";

import styles from "./CSVButton.module.css";

import { exportVolunteersCsv } from "@/app/api/volunteer";
import uploadBlueAsset from "@/assets/upload_blue.svg";

const uploadBlue = uploadBlueAsset as string;

export default function ExportButton() {
  return (
    <button
      className={styles.exportButton}
      onClick={() => {
        void exportVolunteersCsv();
      }}
    >
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
  );
}
