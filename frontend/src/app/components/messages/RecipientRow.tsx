"use client";

import styles from "./RecipientRow.module.css";

export default function RecipientRow({
  name,
  tags,
  selected,
  onToggle,
}: {
  name: string;
  tags: string[];
  selected: boolean;
  onToggle: () => void;
}) {
  const primary = tags[0];

  return (
    <button
      type="button"
      className={`${styles.row} ${selected ? styles.rowSelected : ""}`}
      onClick={onToggle}
    >
      <div className={styles.left}>
        <div className={styles.name}>{name}</div>
      </div>

      <div className={styles.right}>
        {primary && <span className={styles.tag}>{primary}</span>}
        <img
          className={styles.checkbox}
          src={selected ? "/Checkbox positioner.svg" : "/UnCheckbox positioner.svg"}
          alt=""
        />
      </div>
    </button>
  );
}