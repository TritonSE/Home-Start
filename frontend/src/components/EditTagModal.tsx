"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

import { COLOR_OPTIONS } from "./colorOptions";
import styles from "./CreateShiftModal.module.css";
import DeleteTagConfirmationModal from "./DeleteTagConfirmationModal";

import type { VolunteerTag } from "@/types/volunteer";

import { deleteTag, updateTag } from "@/app/api/tag";
import icCloseLargeAsset from "@/assets/ic_close_large.svg";

const icCloseLarge = icCloseLargeAsset as string;

type Props = {
  onClose: () => void;
  tag: VolunteerTag;
  onChanged?: (action: "updated" | "deleted") => void;
};

function CheckIcon({ color }: { color: string }) {
  return (
    <svg className={styles.checkIcon} viewBox="0 0 11 10" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.66491 0.254634C9.89127 -0.0379366 10.3041 -0.0853717 10.5871 0.148685C10.87 0.382742 10.9159 0.809658 10.6895 1.10223L3.79281 8.91205C3.54853 9.22778 3.09308 9.25387 2.81657 8.96796L0.192212 6.25431C-0.0640045 5.98937 -0.0640045 5.55983 0.192212 5.29489C0.448428 5.02996 0.863836 5.02996 1.12005 5.29489L3.22609 7.47259L9.66491 0.254634Z"
        fill={color}
      />
    </svg>
  );
}

export default function EditTagModal({ onClose, tag, onChanged }: Props) {
  const [tagName, setTagName] = useState(tag.name);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isNameTakenError, setIsNameTakenError] = useState(false);
  const isTagNameEmpty = tagName.trim().length === 0;

  useEffect(() => {
    setTagName(tag.name);
    setIsNameTakenError(false);

    const matchingColorIndex = COLOR_OPTIONS.findIndex(
      (option) => option.backgroundColor.toLowerCase() === tag.color.toLowerCase(),
    );
    setSelectedColorIndex(matchingColorIndex >= 0 ? matchingColorIndex : 0);
  }, [tag]);

  const handleTagNameChange = (value: string) => {
    if (isNameTakenError) {
      setIsNameTakenError(false);
    }
    setTagName(value);
  };

  const handleSave = async () => {
    try {
      const newName = tagName.trim();
      const color = COLOR_OPTIONS[selectedColorIndex]?.backgroundColor ?? tag.color;
      await updateTag(tag._id, { name: newName, color });
      onChanged?.("updated");
      onClose();
    } catch (err) {
      console.error("Failed to update tag:", err);
      setTagName(tag.name);
      setIsNameTakenError(true);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTag(tag._id);
      onChanged?.("deleted");
      onClose();
      if (!onChanged) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to delete tag:", err);
      const msg = err instanceof Error ? err.message : "Failed to delete tag";
      console.error(msg);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <>
      {showDeleteConfirmation && (
        <DeleteTagConfirmationModal
          tagName={tag.name}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={() => {
            void handleConfirmDelete();
          }}
        />
      )}
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <p className={styles.title}>Edit tag</p>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <Image src={icCloseLarge} alt="" width={20} height={20} />
          </button>
        </div>

        <div className={styles.divider} />

        <div className={styles.inputField}>
          <div className={styles.textField}>
            <input
              type="text"
              value={tagName}
              onChange={(e) => handleTagNameChange(e.target.value)}
              placeholder="Input Tag Name"
            />
          </div>
        </div>

        <div className={styles.colorSelector}>
          {COLOR_OPTIONS.map((option, index) => {
            const isSelected = selectedColorIndex === index;
            return (
              <button
                key={option.name}
                type="button"
                className={styles.colorButton}
                style={{ backgroundColor: option.backgroundColor, color: option.textColor }}
                onClick={() => setSelectedColorIndex(index)}
                aria-label={`Select ${option.name} color`}
              >
                {isSelected ? (
                  <CheckIcon color={option.textColor} />
                ) : (
                  <span className={styles.colorButtonLabel}>A</span>
                )}
              </button>
            );
          })}
        </div>

        <div className={styles.divider} />

        <div className={styles.actions}>
          <button
            className={styles.secondary}
            onClick={handleDeleteClick}
            type="button"
            style={{ width: 85, borderColor: "#A40026", color: "#A40026" }}
          >
            Delete Tag
          </button>
          <button
            className={styles.primary}
            onClick={() => {
              void handleSave();
            }}
            type="button"
            disabled={isTagNameEmpty || isNameTakenError}
            style={{ width: 102 }}
          >
            {isNameTakenError ? "Name Taken" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}
