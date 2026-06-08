import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./TemplateActionPopup.module.css";

import icCloseAsset from "@/assets/ic_close.svg";

const icClose = icCloseAsset as string;

type TemplateActionPopupProps = {
  templateTitle?: string;
  open: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export default function TemplateActionPopup({
  templateTitle,
  open,
  onEdit,
  onDelete,
  onClose,
}: TemplateActionPopupProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmDelete(false);
    }
  }, [open]);

  if (!open || !templateTitle) {
    return null;
  }

  return (
    <div className={confirmDelete ? styles.overlayDelete : styles.overlay} onClick={onClose}>
      {!confirmDelete && (
        <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
          <div className={styles.sheetHandle} aria-hidden />
          <div className={styles.content}>
            <div className={styles.popupHeader}>
              <span className={styles.text}>{templateTitle}</span>
              <Image src={icClose} alt="" width={24} height={24} onClick={onClose} />
            </div>

            <button className={styles.editBtn} onClick={onEdit}>
              Edit
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => {
                setConfirmDelete(true);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className={styles.deletePopup} onClick={(e) => e.stopPropagation()}>
          <p className={styles.message}>
            Are you sure you want to delete the <br />
            <span>“{templateTitle}”</span> template?
          </p>

          <div className={styles.buttonsDeletePop}>
            <button
              className={styles.cancelDeleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(false);
                onClose();
              }}
            >
              Cancel
            </button>
            <button
              className={styles.deleteDeleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(false);
                onDelete();
              }}
            >
              Yes, delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
