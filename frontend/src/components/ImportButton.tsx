import Image from "next/image";

import styles from "./CSVButton.module.css";

import importIconAsset from "@/assets/import.svg";

const importIcon = importIconAsset as string;

type ImportButtonProps = {
  onClick: () => void;
};

export default function ImportButton({ onClick }: ImportButtonProps) {
  return (
    <button type="button" className={styles.importButton} onClick={onClick}>
      <span className={styles.ic_container}>
        <Image
          src={importIcon}
          alt="Import logo"
          className={styles.importIcon}
          width={13.333}
          height={14.167}
        />
      </span>
      <div className={styles.importText}>Import CSV</div>
    </button>
  );
}
