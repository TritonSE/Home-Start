"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import styles from "./SearchBarPanel.module.css";

import bluePlusAltAsset from "@/assets/blue_plus_alt.svg";
import checkboxIconAsset from "@/assets/checkbox.svg";
import icCloseWhiteAsset from "@/assets/ic_close_white.svg";
import icCloseAsset from "@/assets/ic_close.svg";
import icFilterAsset from "@/assets/ic_filter.svg";
import plusIconAsset from "@/assets/plus.svg";
import unionIconAsset from "@/assets/union.svg";

const checkboxIcon = checkboxIconAsset as string;
const unionIcon = unionIconAsset as string;
const filterIcon = icFilterAsset as string;
const icClose = icCloseAsset as string;
const icCloseWhite = icCloseWhiteAsset as string;
const bluePlusAltIcon = bluePlusAltAsset as string;
const plusIcon = plusIconAsset as string;

type SearchBarProps = {
  search: string;
  setSearch: (value: string) => void;
  projectTags: string[];
  programTags: string[];
  assignmentTags: string[];
  statusTags: string[];
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

  selectedProject?: Set<string>;
  setSelectedProject?: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  selectedProgram?: Set<string>;
  setSelectedProgram?: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  selectedAssignment?: Set<string>;
  setSelectedAssignment?: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  selectedStatus?: Set<string>;
  setSelectedStatus?: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
};

const DESKTOP_MQ = 1024;

function TagFilter({
  toggleTag,
  selected,
  hasSearch,
  items,
  cat,
  filterType,
}: {
  toggleTag: (item: string, cat: "project" | "program" | "assignment" | "status") => void;
  selected: Set<string>;
  hasSearch: boolean;
  items: string[];
  cat: "project" | "program" | "assignment" | "status";
  filterType: string;
}) {
  const [tagSearch, setTagSearch] = useState("");

  function formatOptionLabel(
    item: string,
    category: "project" | "program" | "assignment" | "status",
  ) {
    if (category !== "status") return item;
    return item.charAt(0).toUpperCase() + item.slice(1);
  }

  return (
    <div
      className={
        cat === "status" ? `${styles.tagsContainer} ${styles.status}` : styles.tagsContainer
      }
    >
      <div className={styles.pillWrapper}>
        <div className={styles.dropdown} role="menu">
          {hasSearch ? (
            <div className={styles.searchContainer}>
              <span className={styles.pillTagText}>{filterType}</span>
              <div className={styles.sidePanelInputField}>
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
            </div>
          ) : (
            <span className={styles.pillTagText}>{filterType}</span>
          )}

          {tagSearch.length > 0 && cat !== "status" && (
            <div className={styles.dropdownItemContainer}>
              {items
                .filter((item) => item.toLowerCase().includes(tagSearch.toLowerCase()))
                .slice(0, 6)
                .map((item) => {
                  const isSelected: boolean = selected.has(item);
                  return (
                    <button
                      key={item}
                      className={`${styles.dropdownItem} ${isSelected ? styles.dropdownItemSelected : ""}`}
                      role="menuitem"
                      type="button"
                      onClick={() => toggleTag(item, cat)}
                    >
                      <Image
                        src={isSelected ? bluePlusAltIcon : plusIcon}
                        alt="Blue plus icon"
                        width={16}
                        height={16}
                      />
                      <div
                        className={
                          isSelected ? styles.filterLabelSelected : styles.filterLabelNotSelected
                        }
                      >
                        {formatOptionLabel(item, cat)}
                      </div>
                    </button>
                  );
                })}
            </div>
          )}

          {cat === "status" &&
            items
              .filter((item) => item.toLowerCase().includes(tagSearch.toLowerCase()))
              .map((item) => (
                <div
                  key={item}
                  className={`${styles.dropdownStatusItem} ${selected.has(item) ? styles.dropdownStatusItemSelected : ""}`}
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
                  <div className={styles.filterLabelStatus}>{formatOptionLabel(item, cat)}</div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

function SidePanel({
  showSidePanel,
  setShowSidePanel,
  toggleTag,
  getSelectedSet,
  getTags,
}: {
  showSidePanel: boolean;
  setShowSidePanel: (value: boolean) => void;
  toggleTag: (item: string, cat: "project" | "program" | "assignment" | "status") => void;
  getSelectedSet: (cat: "project" | "program" | "assignment" | "status") => Set<string>;
  getTags: (cat: "project" | "program" | "assignment" | "status") => string[];
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowSidePanel(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [coverPage, setCoverPage] = useState(false);

  const bottomSheetClass = coverPage
    ? `${styles.bottomSheet} ${styles.bottomSheetCover}`
    : styles.bottomSheet;

  return (
    <div className={styles.overlay}>
      <div
        className={window.innerWidth >= DESKTOP_MQ ? styles.sidePanel : bottomSheetClass}
        ref={panelRef}
      >
        {window.innerWidth < DESKTOP_MQ && (
          <button className={styles.topButtonContainer} onClick={() => setCoverPage(!coverPage)}>
            <div className={styles.line}></div>
          </button>
        )}
        <div className={styles.titleBox}>
          <p className={styles.title}>Select Filters</p>
          <button className={styles.closeButton} onClick={() => setShowSidePanel(!showSidePanel)}>
            <Image src={icClose} alt="Close button" width={24} height={24} />
          </button>
        </div>
        <TagFilter
          toggleTag={toggleTag}
          selected={getSelectedSet("status")}
          hasSearch={false}
          items={["returning", "new"]}
          cat="status"
          filterType="Status"
        />
        <TagFilter
          toggleTag={toggleTag}
          selected={getSelectedSet("project")}
          hasSearch={true}
          items={getTags("project")}
          cat="project"
          filterType="Projects"
        />
        <TagFilter
          toggleTag={toggleTag}
          selected={getSelectedSet("program")}
          hasSearch={true}
          items={getTags("program")}
          cat="program"
          filterType="Programs"
        />
        <TagFilter
          toggleTag={toggleTag}
          selected={getSelectedSet("assignment")}
          hasSearch={true}
          items={getTags("assignment")}
          cat="assignment"
          filterType="Assignments"
        />
      </div>
    </div>
  );
}

function FilterPill({
  label,
  selectedCount,
  cat,
  unselectTags,
}: {
  label: string;
  selectedCount: number;
  cat: "project" | "program" | "assignment" | "status";
  unselectTags: (cat: "project" | "program" | "assignment" | "status") => void;
}) {
  return (
    <div className={styles.selectedFiltersContainer}>
      <p className={styles.label}>{label}</p>
      <div className={styles.count}>{String(selectedCount)}</div>
      <button onClick={() => unselectTags(cat)} className={styles.removeBtn}>
        <Image src={icCloseWhite} alt="Close button" width={16} height={16} />
      </button>
    </div>
  );
}

export default function SearchBarPanel({
  search,
  setSearch,
  projectTags = [],
  programTags = [],
  assignmentTags = [],
  statusTags = [],
  selectedProject,
  setSelectedProject,
  selectedProgram,
  setSelectedProgram,
  selectedAssignment,
  setSelectedAssignment,
  selectedStatus,
  setSelectedStatus,
}: SearchBarProps) {
  const [showSidePanel, setShowSidePanel] = useState(false);

  function getTags(cat: "project" | "program" | "assignment" | "status") {
    if (cat === "project") return projectTags;
    if (cat === "program") return programTags;
    if (cat === "assignment") return assignmentTags;
    return statusTags;
  }

  function toggleTag(item: string, cat: "project" | "program" | "assignment" | "status") {
    if (cat === "project") {
      if (!setSelectedProject) return;
      setSelectedProject((prev) => {
        const updated = new Set(prev || new Set());
        if (updated.has(item)) {
          updated.delete(item);
        } else {
          updated.add(item);
        }
        return updated;
      });
    } else if (cat === "program") {
      if (!setSelectedProgram) return;
      setSelectedProgram((prev) => {
        const updated = new Set(prev || new Set());
        if (updated.has(item)) {
          updated.delete(item);
        } else {
          updated.add(item);
        }
        return updated;
      });
    } else if (cat === "assignment") {
      if (!setSelectedAssignment) return;
      setSelectedAssignment((prev) => {
        const updated = new Set(prev || new Set());
        if (updated.has(item)) {
          updated.delete(item);
        } else {
          updated.add(item);
        }
        return updated;
      });
    } else {
      if (!setSelectedStatus) return;
      setSelectedStatus((prev) => {
        const updated = new Set(prev || new Set());
        if (updated.has(item)) {
          updated.delete(item);
        } else {
          updated.add(item);
        }
        return updated;
      });
    }
  }

  function unselectTags(cat: "project" | "program" | "assignment" | "status") {
    if (cat === "project") {
      if (!setSelectedProject) return;
      setSelectedProject(new Set());
    } else if (cat === "program") {
      if (!setSelectedProgram) return;
      setSelectedProgram(new Set());
    } else if (cat === "assignment") {
      if (!setSelectedAssignment) return;
      setSelectedAssignment(new Set());
    } else {
      if (!setSelectedStatus) return;
      setSelectedStatus(new Set());
    }
  }

  function getSelectedSet(cat: "project" | "program" | "assignment" | "status") {
    if (cat === "project") return selectedProject || new Set();
    if (cat === "program") return selectedProgram || new Set();
    if (cat === "assignment") return selectedAssignment || new Set();
    return selectedStatus || new Set();
  }

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchFilter}>
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
              placeholder="Search"
            />
          </form>
        </div>
        <button className={styles.filterButton} onClick={() => setShowSidePanel((prev) => !prev)}>
          <Image
            src={filterIcon}
            alt="Filter icon"
            className={styles.filterIcon}
            width={20}
            height={20}
          />
        </button>
      </div>

      {showSidePanel && (
        <SidePanel
          showSidePanel={showSidePanel}
          setShowSidePanel={setShowSidePanel}
          toggleTag={toggleTag}
          getSelectedSet={getSelectedSet}
          getTags={getTags}
        />
      )}
      <div className={styles.filterPillsContainer}>
        {selectedProject && selectedProject.size > 0 && (
          <FilterPill
            label="Projects"
            selectedCount={selectedProject.size}
            cat="project"
            unselectTags={unselectTags}
          />
        )}
        {selectedStatus && selectedStatus.size > 0 && (
          <FilterPill
            label="Status"
            selectedCount={selectedStatus.size}
            cat="status"
            unselectTags={unselectTags}
          />
        )}
        {selectedProgram && selectedProgram.size > 0 && (
          <FilterPill
            label="Programs"
            selectedCount={selectedProgram.size}
            cat="program"
            unselectTags={unselectTags}
          />
        )}
        {selectedAssignment && selectedAssignment.size > 0 && (
          <FilterPill
            label="Assignments"
            selectedCount={selectedAssignment.size}
            cat="assignment"
            unselectTags={unselectTags}
          />
        )}
      </div>
    </div>
  );
}
