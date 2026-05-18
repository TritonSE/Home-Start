"use client";

import styles from "./DeleteTagConfirmationModal.module.css";
import Modal from "./Modal";

type Props = {
  tagName: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteTagConfirmationModal({ tagName, onClose, onConfirm }: Props) {
  return (
    <Modal
      onClose={onClose}
      width="370px"
      radius="5px"
      title={`Delete tag "${tagName}"?`}
      titleFontSize="16px"
      titleLineHeight={24}
      padding="16px"
      zIndex={1010}
    >
      <div className={styles.actions}>
        <button className={styles.secondary} onClick={onClose}>
          Cancel
        </button>

        <button className={styles.primary} onClick={onConfirm}>
          Delete Tag
        </button>
      </div>
    </Modal>
  );
}
