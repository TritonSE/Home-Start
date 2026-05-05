"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import styles from "./SearchBar.module.css";
import SortSelectionButton from "./SortSelectorButton";

import checkboxIconAsset from "@/assets/Checkbox.svg";
import caretIconAsset from "@/assets/ic_caretdown.svg";
import unionIconAsset from "@/assets/Union.svg";

const checkboxIcon = checkboxIconAsset as string;
const caretIcon = caretIconAsset as string;
const unionIcon = unionIconAsset as string;

type SearchBarProps = {
  search: string;
  setSearch: (value: string) => void;
  projectTags: string[];
  assignmentTags: string[];
  programTags: string[];
  sortType:
    | "Newest"
    | "Oldest"
    | "First Name A-Z"
    | "First Name Z-A"
    | "Last Name A-Z"
    | "Last Name Z-A";
  onSortOptionChange: (
    option:
      | "Newest"
      | "Oldest"
      | "First Name A-Z"
      | "First Name Z-A"
      | "Last Name A-Z"
      | "Last Name Z-A",
  ) => void;

  selectedProject: Set<string>;
  setSelectedProject: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  selectedStatus: string | null;
  setSelectedStatus: (value: string | null) => void;
  selectedAssignment: Set<string>;
  setSelectedAssignment: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  selectedProgram: Set<string>;
  setSelectedProgram: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
};

export default function SearchBar({
  search,
  setSearch,
  projectTags,
  assignmentTags,
  programTags,
  selectedProject,
  setSelectedProject,
  selectedStatus,
  setSelectedStatus,
  selectedAssignment,
  setSelectedAssignment,
  selectedProgram,
  setSelectedProgram,
  sortType,
  onSortOptionChange,
}: SearchBarProps) {
  const [tagSearch, setTagSearch] = useState("");
  const [open, setOpen] = useState<"project" | "status" | "assignment" | "program" | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (e.target instanceof Node && !wrapperRef.current.contains(e.target)) {
        setOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle(cat: "project" | "status" | "assignment" | "program") {
    setOpen((prev) => (prev === cat ? null : cat));
  }

  function toggleTag(item: string, cat: "project" | "status" | "assignment" | "program") {
    if (cat === "project") {
      setSelectedProject((prev) => {
        const updated = new Set(prev);
        if (updated.has(item)) {
          updated.delete(item);
        } else {
          updated.add(item);
        }
        return updated;
      });
    } else if (cat === "status") {
      const newStatus = selectedStatus === item ? null : item;
      setSelectedStatus(newStatus);
    } else if (cat === "assignment") {
      setSelectedAssignment((prev) => {
        const updated = new Set(prev);
        if (updated.has(item)) {
          updated.delete(item);
        } else {
          updated.add(item);
        }
        return updated;
      });
    } else if (cat === "program") {
      setSelectedProgram((prev) => {
        const updated = new Set(prev);
        if (updated.has(item)) {
          updated.delete(item);
        } else {
          updated.add(item);
        }
        return updated;
      });
    }
  }

  function getSelectedSet(cat: "project" | "status" | "assignment" | "program") {
    if (cat === "project") return selectedProject;
    if (cat === "status") return new Set(selectedStatus ? [selectedStatus] : []);
    if (cat === "assignment") return selectedAssignment;
    return selectedProgram;
  }

  function formatOptionLabel(item: string, cat: "project" | "status" | "assignment" | "program") {
    if (cat !== "status") return item;
    return item.charAt(0).toUpperCase() + item.slice(1);
  }

  function clearCategory(cat: "project" | "status" | "assignment" | "program") {
    if (cat === "project") {
      setSelectedProject(new Set());
      return;
    }

    if (cat === "status") {
      setSelectedStatus(null);
      return;
    }

    if (cat === "assignment") {
      setSelectedAssignment(new Set());
      return;
    }

    setSelectedProgram(new Set());
  }

  function getClearButtonLabel(cat: "project" | "status" | "assignment" | "program") {
    if (cat === "status") return "Clear";
    return "Clear All";
  }

  function renderDropdown(
    items: string[],
    cat: "project" | "status" | "assignment" | "program",
    hasSearch: boolean = true,
  ) {
    if (open !== cat) return null;
    const selected = getSelectedSet(cat);
    const hasSelections = selected.size > 0;

    return (
      <div className={`${styles.dropdown} ${!hasSearch ? styles.dropdownSmall : ""}`} role="menu">
        {hasSearch && (
          <div className={styles.inputField}>
            <span className={styles.ic_search}>
              <Image
                src={unionIcon}
                alt="Union logo"
                className={styles.union}
                width={24}
                height={24}
              />
            </span>
            <form className={styles.textField} onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search"
              />
            </form>
          </div>
        )}

        <div className={styles.dropdownItemContainer}>
          {items
            .filter((item) => item.toLowerCase().includes(tagSearch.toLowerCase()))
            .map((item) => (
              <div
                key={item}
                className={`${styles.dropdownItem} ${selected.has(item) ? styles.dropdownItemSelected : ""}`}
                role="menuitem"
              >
                <button
                  className={`${styles.checkBox} ${selected.has(item) ? styles.checkBoxChecked : ""}`}
                  onClick={() => toggleTag(item, cat)}
                  type="button"
                >
                  {selected.has(item) && (
                    <Image
                      src={checkboxIcon}
                      alt="checked"
                      className={styles.checkIcon}
                      width={16}
                      height={16}
                    />
                  )}
                </button>
                <div className={styles.filterLabel}>{formatOptionLabel(item, cat)}</div>
              </div>
            ))}
        </div>

        <div className={styles.dropdownFooter}>
          <button
            type="button"
            className={styles.dropdownClearButton}
            onClick={() => clearCategory(cat)}
            disabled={!hasSelections}
          >
            {getClearButtonLabel(cat)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchField}>
        <div className={styles.inputField}>
          <span className={styles.ic_search}>
            <Image
              src={unionIcon}
              alt="Union logo"
              className={styles.union}
              width={24}
              height={24}
            />
          </span>
          <form className={styles.textField} onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Volunteer"
            />
          </form>
        </div>
      </div>

      <div className={styles.tagsContainer} ref={wrapperRef}>
        <div className={styles.pillWrapper}>
          <button
            className={`${styles.pillTagStatus} ${selectedStatus !== null ? styles.pillTagActive : ""}`}
            aria-expanded={open === "status"}
            onClick={() => toggle("status")}
          >
            <span className={styles.pillTagContent}>
              <span className={styles.pillTagText}>Status</span>
              <span className={styles.pillTagIconBox} aria-hidden="true">
                <Image
                  src={caretIcon}
                  alt="Caret down"
                  className={styles.pillTagIcon}
                  width={16}
                  height={16}
                />
              </span>
            </span>
          </button>
          {renderDropdown(["returning", "new"], "status", false)}
        </div>

        <div className={styles.pillWrapper}>
          <button
            className={`${styles.pillTagVolunteerType} ${selectedAssignment.size > 0 ? styles.pillTagActive : ""}`}
            aria-expanded={open === "assignment"}
            onClick={() => toggle("assignment")}
          >
            <span className={styles.pillTagContent}>
              <span className={styles.pillTagText}>Assignment</span>
              <span className={styles.pillTagIconBox} aria-hidden="true">
                <Image
                  src={caretIcon}
                  alt="Caret down"
                  className={styles.pillTagIcon}
                  width={16}
                  height={16}
                />
              </span>
            </span>
          </button>
          {renderDropdown(assignmentTags, "assignment")}
        </div>

        <div className={styles.pillWrapper}>
          <button
            className={`${styles.pillTagEvent} ${selectedProject.size > 0 ? styles.pillTagActive : ""}`}
            aria-expanded={open === "project"}
            onClick={() => toggle("project")}
          >
            <span className={styles.pillTagContent}>
              <span className={styles.pillTagText}>Project</span>
              <span className={styles.pillTagIconBox} aria-hidden="true">
                <Image
                  src={caretIcon}
                  alt="Caret down"
                  className={styles.pillTagIcon}
                  width={16}
                  height={16}
                />
              </span>
            </span>
          </button>
          {renderDropdown(projectTags, "project")}
        </div>

        <div className={styles.pillWrapper}>
          <button
            className={`${styles.pillTagEvent} ${selectedProgram.size > 0 ? styles.pillTagActive : ""}`}
            aria-expanded={open === "program"}
            onClick={() => toggle("program")}
          >
            <span className={styles.pillTagContent}>
              <span className={styles.pillTagText}>Program</span>
              <span className={styles.pillTagIconBox} aria-hidden="true">
                <Image
                  src={caretIcon}
                  alt="Caret down"
                  className={styles.pillTagIcon}
                  width={16}
                  height={16}
                />
              </span>
            </span>
          </button>
          {renderDropdown(programTags, "program")}
        </div>

        <div className={styles.clearFiltersContainer}>
          <button
            className={styles.clearFilterButton}
            onClick={() => {
              setSelectedProject(new Set());
              setSelectedStatus(null);
              setSelectedAssignment(new Set());
              setSelectedProgram(new Set());
            }}
          >
            Clear All
          </button>
        </div>

        <div className={styles.sortContainer}>
          <SortSelectionButton sortType={sortType} onSortOptionChange={onSortOptionChange} />
        </div>
      </div>
    </div>
  );
}
