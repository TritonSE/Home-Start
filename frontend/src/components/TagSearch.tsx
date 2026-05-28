"use client";

import Image from "next/image";

import styles from "./TagSearch.module.css";

import type { VolunteerTag } from "../types/volunteer"; // Adjust path as needed

import icSearchAsset from "@/assets/union.svg";

export type TagSearchProps = {
  placeholder: string;
  query: string;
  onQueryChange: (val: string) => void;
  results: VolunteerTag[];
  onAdd: (tag: VolunteerTag) => void;
  onCreate?: (name: string) => void;
};

export default function TagSearch({
  placeholder,
  query,
  onQueryChange,
  results,
  onAdd,
  onCreate,
}: TagSearchProps) {
  const trimmed = query.trim();
  const hasExactMatch = results.some((r) => r.name.toLowerCase() === trimmed.toLowerCase());
  const showCreate = !!onCreate && trimmed.length > 0 && !hasExactMatch;
  const showDropdown = trimmed.length > 0 && (showCreate || results.length > 0);

  return (
    <div className={styles.tagSearchContainer}>
      <div className={styles.tagSearchBox}>
        <div className={styles.tagSearchInner}>
          <Image
            className={styles.tagSearchIcon}
            src={icSearchAsset as string}
            alt="Search"
            width={16}
            height={16}
          />
          <input
            className={styles.tagSearchInput}
            placeholder={placeholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
      </div>

      {showDropdown && (
        <div className={styles.tagSearchDropdown}>
          {showCreate && (
            <button
              key="create-option"
              className={`${styles.tagSearchDropdownItem} ${styles.tagSearchCreateItem}`}
              onClick={() => {
                onCreate(trimmed);
                onQueryChange("");
              }}
              type="button"
            >
              <svg
                className={styles.tagSearchPlusIcon}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M7.58333 1.75V13.4167M1.75 7.58333H13.4167"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={styles.dropdownItemText}>Create &ldquo;{trimmed}&rdquo;</span>
            </button>
          )}
          {results.map((tag) => (
            <button
              key={`search-result-${tag._id}`}
              className={styles.tagSearchDropdownItem}
              onClick={() => {
                onAdd(tag);
                onQueryChange("");
              }}
              type="button"
            >
              <svg
                className={styles.tagSearchPlusIcon}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M7.58333 1.75V13.4167M1.75 7.58333H13.4167"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={styles.dropdownItemText}>{tag.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
