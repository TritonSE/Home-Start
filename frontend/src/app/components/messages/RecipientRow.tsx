"use client";

import styles from "./RecipientRow.module.css";

type Props = {
  name: string;
  tags: string[];
  selected: boolean;
  onToggle: () => void;
  checkboxPosition?: "left" | "right";
  disableSelectedStyle?: boolean;
};

export default function RecipientRow({
  name,
  tags,
  selected,
  onToggle,
  checkboxPosition = "right",
  disableSelectedStyle = false,
}: Props) {
  const primary = tags[0];

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
        {primary ? <span className={styles.tag}>{primary}</span> : null}

        {checkboxPosition === "right" ? (
          <span className={`${styles.checkbox} ${selected ? styles.checkboxOn : ""}`} aria-hidden>
            <span className={styles.checkMark} />
          </span>
        ) : null}
      </div>
    </button>
  );
}