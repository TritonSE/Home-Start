import styles from "./CSVButton.module.css";
import Image from "next/image";

export default function ImportButton() {
  return (
    <button className={styles.importButton}>
      <span className={styles.ic_container}>
        <Image src="/upload.svg" alt="Upload logo" className={styles.uploadIcon} />
      </span>
      <div className={styles.importText}>Import CSV</div>
    </button>
  );
}
