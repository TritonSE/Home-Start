import styles from "./CSVButton.module.css";

export default function ExportButton() {
  return (
    <button className={styles.exportButton}>
      <span className={styles.ic_container}>
        <img src="/upload_blue.svg" alt="Upload logo" className={styles.uploadIcon} />
      </span>
      <div className={styles.exportText}>Export CSV</div>
    </button>
  );
}
