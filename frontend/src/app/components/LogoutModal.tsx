"use client";
import Image from "next/image";

import icCloseLargeAsset from "../../assets/icCloseLarge.svg";

import styles from "./LogoutModal.module.css";

type Props = {
  onClose: () => void;
  onConfirm: () => void;
};

const icCloseLarge = icCloseLargeAsset as string;

export default function LogoutModal({ onClose, onConfirm }: Props) {
  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <p className={styles.title}>Are you sure you want to log out?</p>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <Image src={icCloseLarge} alt="" />
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
