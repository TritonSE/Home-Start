"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./SortSelectorButton.module.css";

type SortOption =
  | "Newest"
  | "Oldest"
  | "First Name A-Z"
  | "First Name Z-A"
  | "Last Name A-Z"
  | "Last Name Z-A";

type SortSelectorButtonProps = {
  sortType: SortOption;
  onSortOptionChange: (option: SortOption) => void;
};

const SORT_OPTIONS: SortOption[] = [
  "Newest",
  "Oldest",
  "First Name A-Z",
  "First Name Z-A",
  "Last Name A-Z",
  "Last Name Z-A",
];

export default function SortSelectionButton({
  sortType,
  onSortOptionChange,
}: SortSelectorButtonProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (event.target instanceof Node && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(option: SortOption) {
    onSortOptionChange(option);
    setOpen(false);
  }

  return (
    <div className={styles.pillWrapper} ref={wrapperRef}>
      <button
        type="button"
        className={`${styles.pillTag} ${open ? styles.pillTagActive : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={styles.pillTagText}>Sort By</span>
      </button>

      {open && (
        <div className={styles.dropdown} role="menu" aria-label="Sort volunteers">
          <div className={styles.dropdownItemContainer}>
            {SORT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.dropdownItem} ${sortType === option ? styles.dropdownItemSelected : ""}`}
                onClick={() => handleSelect(option)}
                role="menuitemradio"
                aria-checked={sortType === option}
              >
                <span className={styles.filterLabel}>{option}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
