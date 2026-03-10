import styles from "./CSVButton.module.css";
import Image from "next/image";

export default function ExportButton() {
  return (
    <button className={styles.exportButton}>
      <span className={styles.ic_container}>
        <Image
          src="/upload_blue.svg"
          alt="Upload logo"
          className={styles.uploadIcon}
          width={24}
          height={24}
        />
      </span>
      <div className={styles.exportText}>Export CSV</div>
    </button>
  );
}
