"use client";

import styles from "./RecipientRow.module.css";

import type { VolunteerTag } from "@/types/volunteer";

type Props = {
  name: string;
  tags: VolunteerTag[];
  selected: boolean;
  onToggle: () => void;
  checkboxPosition?: "left" | "right";
  disableSelectedStyle?: boolean;
};

export default function RecipientRow({
  name,
  selected,
  onToggle,
  checkboxPosition = "right",
  disableSelectedStyle = false,
}: Props) {
  return (
    <button
      type="button"
      className={`${styles.row} ${selected && !disableSelectedStyle ? styles.rowSelected : ""}`}
      onClick={onToggle}
    >
      {checkboxPosition === "left" ? (
        <span className={`${styles.checkbox} ${selected ? styles.checkboxOn : ""}`} aria-hidden>
          <span className={styles.checkMark} />
        </span>
      ) : null}

      <div className={styles.left}>
        <div className={styles.name}>{name}</div>
      </div>

      <div className={styles.right}>
        {checkboxPosition === "right" ? (
          <span className={`${styles.checkbox} ${selected ? styles.checkboxOn : ""}`} aria-hidden>
            <span className={styles.checkMark} />
          </span>
        ) : null}
      </div>
    </button>
  );
}
