import styles from "./CSVButton.module.css";
import Image from "next/image";
import uploadIcon from "@/assets/upload.svg";

type ImportButtonProps = {
  onClick: () => void;
};

export default function ImportButton({ onClick }: ImportButtonProps) {
  return (
    <button type="button" className={styles.importButton} onClick={onClick}>
      <span className={styles.ic_container}>
        <Image
          src={uploadIcon}
          alt="Upload logo"
          className={styles.uploadIcon}
          width={13.333}
          height={14.167}
        />
      </span>
      <div className={styles.importText}>Import CSV</div>
    </button>
  );
}
