import styles from "./CSVButton.module.css";

type ImportButtonProps = {
  onClick: () => void;
};

export default function ImportButton({ onClick }: ImportButtonProps) {
  return (
    <button type="button" className={styles.importButton} onClick={onClick}>
      <span className={styles.ic_container}>
        <img src="/upload.svg" alt="Upload logo" className={styles.uploadIcon} />
      </span>
      <div className={styles.importText}>Upload CSV</div>
    </button>
  );
}
