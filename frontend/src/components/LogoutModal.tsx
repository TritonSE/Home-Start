"use client";

import styles from "./LogoutModal.module.css";
import Modal from "./Modal";

type Props = {
  onClose: () => void;
  onConfirm: () => void;
};

export default function LogoutModal({ onClose, onConfirm }: Props) {
  return (
    <Modal
      onClose={onClose}
      width="370px"
      radius="5px"
      title="Are you sure you want to log out?"
      titleFontSize="16px"
      titleLineHeight={24}
      padding="16px"
    >
      <div className={styles.actions}>
        <button className={styles.secondary} onClick={onClose}>
          Cancel
        </button>

        <button className={styles.primary} onClick={onConfirm}>
          Logout
        </button>
      </div>
    </Modal>
  );
}
