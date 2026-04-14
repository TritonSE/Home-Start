import Image from "next/image";

import styles from "./CSVButton.module.css";

import uploadBlueAsset from "@/assets/upload_blue.svg";

const uploadBlue = uploadBlueAsset as string;

export default function ExportButton() {
  return (
    <button className={styles.exportButton}>
      <div className={styles.exportText}>Export CSV</div>
      <span className={styles.ic_container}>
        <Image
          src={uploadBlue}
          alt="Upload logo"
          className={styles.uploadIcon}
          width={13.333}
          height={14.167}
        />
      </span>
    </button>
  );
}
