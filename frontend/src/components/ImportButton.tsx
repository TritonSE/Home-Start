import styles from "./CSVButton.module.css";
import Image from "next/image";

type ImportButtonProps = {
  onClick: () => void;
};

export default function ImportButton({ onClick }: ImportButtonProps) {
  return (
    <button type="button" className={styles.importButton} onClick={onClick}>
      <span className={styles.ic_container}>
        <Image
          src="/upload.svg"
          alt="Upload logo"
          className={styles.uploadIcon}
          width={24}
          height={24}
        />
      </span>
      <div className={styles.importText}>Upload CSV</div>
    </button>
  );
}
