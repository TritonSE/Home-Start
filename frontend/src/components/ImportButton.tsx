import Image from "next/image";

import styles from "./CSVButton.module.css";

import uploadIconAsset from "@/assets/upload.svg";

const uploadIcon = uploadIconAsset as string;

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
