"use client";
import Image from "next/image";

import styles from "./LogoutModal.module.css";

type Props = {
  onClose: () => void;
  onConfirm: () => void;
};

export default function LogoutModal({ onClose, onConfirm }: Props) {
  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <p className={styles.title}>Are you sure you want to log out?</p>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <Image src="/ic_close_large.svg" alt="" width={24} height={24} />
          </button>
        </div>

        <div className={styles.actions}>
          <button className={styles.secondary} onClick={onClose}>
            Cancel
          </button>

          <button className={styles.primary} onClick={onConfirm}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
