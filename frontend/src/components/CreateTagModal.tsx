"use client";
import Image from "next/image";
import { useState } from "react";

import styles from "./CreateTagModal.module.css";

import icCloseLargeAsset from "@/assets/ic_close_large.svg";

const icCloseLarge = icCloseLargeAsset as string;

type TagType = "assignment" | "project" | "shift" | "program";

type CheckIconProps = {
  color: string;
};

function CheckIcon({ color }: CheckIconProps) {
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

type ColorOption = {
  name: string;
  backgroundColor: string;
  textColor: string;
};

const COLOR_OPTIONS: ColorOption[] = [
  { name: "Red", backgroundColor: "#F6E6E9", textColor: "#A40026" },
  { name: "Orange", backgroundColor: "#F9EFE6", textColor: "#C46200" },
  { name: "Yellow", backgroundColor: "#F9F5EF", textColor: "#886F42" },
  { name: "Green", backgroundColor: "#E6F2EC", textColor: "#007F3F" },
  { name: "Blue", backgroundColor: "#E6F2F3", textColor: "#007A8A" },
  { name: "Indigo", backgroundColor: "#E9ECF1", textColor: "#1D3A6B" },
  { name: "Purple", backgroundColor: "#EFEBF3", textColor: "#452861" },
];

type Props = {
  type: TagType;
  onClose: () => void;
};

export default function CreateTagModal({ type, onClose }: Props) {
  const [tagName, setTagName] = useState("");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <p className={styles.title}>Create Tag</p>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <Image src={icCloseLarge} alt="" width={24} height={24} />
          </button>
        </div>

        <div className={styles.inputField}>
          <form className={styles.textField} onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Enter tag name..."
            />
          </form>
        </div>

        <div className={styles.colorSelector}>
          {COLOR_OPTIONS.map((option, index) => {
            const isSelected = selectedColorIndex === index;
            return (
              <button
                key={option.name}
                type="button"
                className={styles.colorButton}
                style={{
                  backgroundColor: option.backgroundColor,
                  color: option.textColor,
                }}
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

        <div className={styles.actions}>
          <button className={styles.secondary} onClick={onClose}>
            Cancel
          </button>

          <button className={styles.primary}>
            Create
          </button>
        </div>
      </div>
    </>
  );
}
