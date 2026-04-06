import styles from "./CSVButton.module.css";
import Image from "next/image";
import uploadBlue from "@/assets/upload_blue.svg";

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
