import styles from "./CSVButton.module.css";

export default function ImportButton() {
  return (
    <button className={styles.importButton}>
      <span className={styles.ic_container}>
        <img src="/upload.svg" alt="Upload logo" className={styles.uploadIcon} />
      </span>
      <div className={styles.importText}>Import CSV</div>
    </button>
  );
}
