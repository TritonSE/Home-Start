"use client";
import Image from "next/image";
import { useState } from "react";

import styles from "./CreateShiftModal.module.css";
import { COLOR_OPTIONS } from "./colorOptions";

import icCloseLargeAsset from "@/assets/ic_close_large.svg";

const icCloseLarge = icCloseLargeAsset as string;

type Props = {
  onClose: () => void;
  onAdd?: (name: string, color: string) => Promise<void> | void;
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

export default function CreateShiftModal({ onClose, onAdd }: Props) {
  const [tagName, setTagName] = useState("");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const isTagNameEmpty = tagName.trim().length === 0;

  const handleAdd = async () => {
    const name = tagName.trim();
    if (!name) return;
    const color = COLOR_OPTIONS[selectedColorIndex]?.backgroundColor ?? "#FFFFFF";
    try {
      if (onAdd) await onAdd(name, color);
    } catch (err) {
      console.error("CreateShiftModal onAdd failed:", err);
    }
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <p className={styles.title}>Create/Add Shift</p>
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
              onChange={(e) => setTagName(e.target.value)}
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
                {isSelected ? <CheckIcon color={option.textColor} /> : <span className={styles.colorButtonLabel}>A</span>}
              </button>
            );
          })}
        </div>

        <div className={styles.divider} />

        <div className={styles.actions}>
          <button className={styles.secondary} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={styles.primary} onClick={handleAdd} type="button" disabled={isTagNameEmpty}>
            Add Tag
          </button>
        </div>
      </div>
    </>
  );
}
