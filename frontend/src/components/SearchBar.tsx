"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { DateTimePickerFields } from "./DateTimePickerModal";
import Modal from "./Modal";
import styles from "./SearchBar.module.css";
import SortSelectionButton from "./SortSelectorButton";

import bluePlusAltAsset from "@/assets/blue_plus_alt.svg";
import checkboxIconAsset from "@/assets/checkbox.svg";
import caretDownIconAsset from "@/assets/ic_caretdown.svg";
import icCloseWhiteAsset from "@/assets/ic_close_white.svg";
import filterIconAsset from "@/assets/ic_filter.svg";
import plusIconAsset from "@/assets/plus.svg";
import unionIconAsset from "@/assets/union.svg";

const bluePlusAltIcon = bluePlusAltAsset as string;
const checkboxIcon = checkboxIconAsset as string;
const caretDownIcon = caretDownIconAsset as string;
const icCloseWhite = icCloseWhiteAsset as string;
const filterIcon = filterIconAsset as string;
const plusIcon = plusIconAsset as string;
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

  selectedProject?: Set<string>;
  setSelectedProject?: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  selectedStatus: string | null;
  setSelectedStatus: (value: string | null) => void;
  selectedAssignment?: Set<string>;
  setSelectedAssignment?: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  selectedProgram?: Set<string>;
  setSelectedProgram?: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  dateCreatedStart?: Date | null;
  dateCreatedEnd?: Date | null;
  setDateCreatedRange?: (start: Date | null, end: Date | null) => void;
};

const startOfDay = (date: Date | null) => {
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

const endOfDay = (date: Date | null) => {
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
};

export default function SearchBar({
  search,
  setSearch,
  projectTags = [],
  assignmentTags = [],
  programTags = [],
  selectedProject,
  setSelectedProject,
  selectedStatus,
  setSelectedStatus,
  selectedAssignment,
  setSelectedAssignment,
  selectedProgram,
  setSelectedProgram,
  dateCreatedStart,
  dateCreatedEnd,
  setDateCreatedRange,
  sortType,
  onSortOptionChange,
}: SearchBarProps) {
  const [tagSearch, setTagSearch] = useState("");
  const [mobileTagSearch, setMobileTagSearch] = useState({
    project: "",
    program: "",
    assignment: "",
  });
  const [open, setOpen] = useState<"project" | "status" | "assignment" | "program" | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [activeDatePane, setActiveDatePane] = useState<"start" | "end">("start");
  const [draftStartDate, setDraftStartDate] = useState<Date | null>(null);
  const [draftEndDate, setDraftEndDate] = useState<Date | null>(null);
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
    } else if (cat === "status") {
      const newStatus = selectedStatus === item ? null : item;
      setSelectedStatus(newStatus);
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
    }
  }

  function getSelectedSet(cat: "project" | "status" | "assignment" | "program") {
    if (cat === "project") return selectedProject || new Set();
    if (cat === "status") return new Set(selectedStatus ? [selectedStatus] : []);
    if (cat === "assignment") return selectedAssignment || new Set();
    return selectedProgram || new Set();
  }

  function formatOptionLabel(item: string, cat: "project" | "status" | "assignment" | "program") {
    if (cat !== "status") return item;
    return item.charAt(0).toUpperCase() + item.slice(1);
  }

  function clearCategory(cat: "project" | "status" | "assignment" | "program") {
    if (cat === "project") {
      if (setSelectedProject) setSelectedProject(new Set());
      return;
    }

    if (cat === "status") {
      setSelectedStatus(null);
      return;
    }

    if (cat === "assignment") {
      if (setSelectedAssignment) setSelectedAssignment(new Set());
      return;
    }

    if (setSelectedProgram) setSelectedProgram(new Set());
  }

  function getClearButtonLabel(cat: "project" | "status" | "assignment" | "program") {
    if (cat === "status") return "Clear";
    return "Clear All";
  }

  function clearAllFilters() {
    setSelectedProject?.(new Set());
    setSelectedStatus(null);
    setSelectedAssignment?.(new Set());
    setSelectedProgram?.(new Set());
    setDateCreatedRange?.(null, null);
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
              <button
                key={item}
                type="button"
                className={`${styles.dropdownItem} ${selected.has(item) ? styles.dropdownItemSelected : ""}`}
                role="menuitemcheckbox"
                aria-checked={selected.has(item)}
                onClick={() => toggleTag(item, cat)}
              >
                <span
                  className={`${styles.checkBox} ${selected.has(item) ? styles.checkBoxChecked : ""}`}
                  aria-hidden="true"
                >
                  {selected.has(item) && (
                    <Image
                      src={checkboxIcon}
                      alt=""
                      className={styles.checkIcon}
                      width={16}
                      height={16}
                    />
                  )}
                </span>
                <div className={styles.filterLabel}>{formatOptionLabel(item, cat)}</div>
              </button>
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

  function renderMobileStatusSection() {
    const selected = getSelectedSet("status");

    return (
      <section className={styles.mobileFilterSection}>
        <h3 className={styles.mobileFilterTitle}>Status</h3>
        <div className={styles.mobileStatusOptions}>
          {["returning", "new"].map((item) => {
            const isSelected = selected.has(item);
            return (
              <button
                key={`status-${item}`}
                type="button"
                className={`${styles.mobileStatusOption} ${
                  isSelected ? styles.mobileStatusOptionSelected : ""
                }`}
                onClick={() => toggleTag(item, "status")}
              >
                <span
                  className={`${styles.mobileCheckBox} ${
                    isSelected ? styles.mobileCheckBoxChecked : ""
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <Image
                      src={checkboxIcon}
                      alt=""
                      className={styles.checkIcon}
                      width={16}
                      height={16}
                    />
                  )}
                </span>
                <span className={styles.mobileStatusLabel}>
                  {formatOptionLabel(item, "status")}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  function renderMobileSearchFilterSection(
    label: string,
    items: string[],
    cat: "project" | "assignment" | "program",
  ) {
    if (items.length === 0) return null;

    const selected = getSelectedSet(cat);
    const query = mobileTagSearch[cat];
    const visibleItems = items
      .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 6);

    return (
      <section className={styles.mobileFilterSection}>
        <h3 className={styles.mobileFilterTitle}>{label}</h3>
        <div className={styles.mobileFilterSearchField}>
          <span className={styles.ic_search}>
            <Image src={unionIcon} alt="" className={styles.union} width={24} height={24} />
          </span>
          <form className={styles.textField} onSubmit={(event) => event.preventDefault()}>
            <input
              type="text"
              value={query}
              onChange={(event) =>
                setMobileTagSearch((current) => ({
                  ...current,
                  [cat]: event.target.value,
                }))
              }
              placeholder="Search"
            />
          </form>
        </div>
        {query.length > 0 && (
          <div className={styles.mobileOptionList}>
            {visibleItems.map((item) => {
              const isSelected = selected.has(item);
              return (
                <button
                  key={`${cat}-${item}`}
                  type="button"
                  className={`${styles.mobileOptionItem} ${
                    isSelected ? styles.mobileOptionItemSelected : ""
                  }`}
                  onClick={() => {
                    toggleTag(item, cat);
                    setMobileTagSearch((current) => ({
                      ...current,
                      [cat]: "",
                    }));
                  }}
                >
                  <Image
                    src={isSelected ? bluePlusAltIcon : plusIcon}
                    alt=""
                    width={16}
                    height={16}
                  />
                  <span
                    className={
                      isSelected ? styles.mobileOptionLabelSelected : styles.mobileOptionLabel
                    }
                  >
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  function renderMobileSelectedFilterPill(
    label: string,
    count: number,
    cat: "project" | "status" | "assignment" | "program",
  ) {
    if (count === 0) return null;

    return (
      <div className={styles.mobileSelectedFilterPill}>
        <span className={styles.mobileSelectedFilterLabel}>{label}</span>
        <span className={styles.mobileSelectedFilterCount}>{count}</span>
        <button
          type="button"
          className={styles.mobileSelectedFilterRemove}
          aria-label={`Clear ${label} filter`}
          onClick={() => clearCategory(cat)}
        >
          <Image src={icCloseWhite} alt="" width={16} height={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`${styles.searchBar} ${
        isMobileFilterOpen || isDateFilterOpen ? styles.searchBarMobileFilterOpen : ""
      }`}
    >
      <div className={styles.searchFilterRow}>
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
        <button
          type="button"
          className={styles.mobileFilterButton}
          aria-label="Open filters"
          onClick={() => {
            setOpen(null);
            setIsMobileFilterOpen(true);
          }}
        >
          <Image src={filterIcon} alt="" className={styles.filterIcon} width={20} height={20} />
        </button>
      </div>

      <div className={styles.mobileSelectedFilters}>
        {renderMobileSelectedFilterPill("Projects", selectedProject?.size ?? 0, "project")}
        {renderMobileSelectedFilterPill("Status", selectedStatus ? 1 : 0, "status")}
        {renderMobileSelectedFilterPill("Programs", selectedProgram?.size ?? 0, "program")}
        {renderMobileSelectedFilterPill("Assignments", selectedAssignment?.size ?? 0, "assignment")}
      </div>

      <div className={styles.tagsContainer} ref={wrapperRef}>
        <div className={styles.pillWrapper}>
          <button
            className={`${styles.pillTagStatus} ${open === "status" ? styles.pillTagActive : ""}`}
            aria-expanded={open === "status"}
            onClick={() => toggle("status")}
          >
            <span className={styles.pillTagContent}>
              <span className={styles.pillTagText}>Status</span>
              <span className={styles.pillTagIconBox} aria-hidden="true">
                <Image
                  src={caretDownIcon}
                  alt=""
                  className={`${styles.pillTagIconDown} ${open === "status" ? styles.pillTagIconOpen : ""}`}
                  width={12}
                  height={7}
                />
              </span>
            </span>
          </button>
          {renderDropdown(["returning", "new"], "status", false)}
        </div>

        {assignmentTags && assignmentTags.length > 0 && (
          <div className={styles.pillWrapper}>
            <button
              className={`${styles.pillTagVolunteerType} ${open === "assignment" ? styles.pillTagActive : ""}`}
              aria-expanded={open === "assignment"}
              onClick={() => toggle("assignment")}
            >
              <span className={styles.pillTagContent}>
                <span className={styles.pillTagText}>Assignment</span>
                <span className={styles.pillTagIconBox} aria-hidden="true">
                  <Image
                    src={caretDownIcon}
                    alt=""
                    className={`${styles.pillTagIconDown} ${open === "assignment" ? styles.pillTagIconOpen : ""}`}
                    width={12}
                    height={7}
                  />
                </span>
              </span>
            </button>
            {renderDropdown(assignmentTags, "assignment")}
          </div>
        )}

        {projectTags && projectTags.length > 0 && (
          <div className={styles.pillWrapper}>
            <button
              className={`${styles.pillTagEvent} ${open === "project" ? styles.pillTagActive : ""}`}
              aria-expanded={open === "project"}
              onClick={() => toggle("project")}
            >
              <span className={styles.pillTagContent}>
                <span className={styles.pillTagText}>Project</span>
                <span className={styles.pillTagIconBox} aria-hidden="true">
                  <Image
                    src={caretDownIcon}
                    alt=""
                    className={`${styles.pillTagIconDown} ${open === "project" ? styles.pillTagIconOpen : ""}`}
                    width={12}
                    height={7}
                  />
                </span>
              </span>
            </button>
            {renderDropdown(projectTags, "project")}
          </div>
        )}

        {programTags && programTags.length > 0 && (
          <div className={styles.pillWrapper}>
            <button
              className={`${styles.pillTagEvent} ${open === "program" ? styles.pillTagActive : ""}`}
              aria-expanded={open === "program"}
              onClick={() => toggle("program")}
            >
              <span className={styles.pillTagContent}>
                <span className={styles.pillTagText}>Program</span>
                <span className={styles.pillTagIconBox} aria-hidden="true">
                  <Image
                    src={caretDownIcon}
                    alt=""
                    className={`${styles.pillTagIconDown} ${open === "program" ? styles.pillTagIconOpen : ""}`}
                    width={12}
                    height={7}
                  />
                </span>
              </span>
            </button>
            {renderDropdown(programTags, "program")}
          </div>
        )}

        <div className={styles.clearFiltersContainer}>
          <button className={styles.clearFilterButton} onClick={clearAllFilters}>
            Clear All
          </button>
        </div>

        <div className={styles.sortContainer}>
          {setDateCreatedRange && (
            <div className={styles.pillWrapper}>
              <button
                type="button"
                className={`${styles.pillTagStatus} ${
                  isDateFilterOpen ? styles.pillTagActive : ""
                }`}
                aria-expanded={isDateFilterOpen}
                onClick={() => {
                  setOpen(null);
                  setDraftStartDate(dateCreatedStart ?? null);
                  setDraftEndDate(dateCreatedEnd ?? null);
                  setActiveDatePane("start");
                  setIsDateFilterOpen(true);
                }}
              >
                <span className={styles.pillTagContent}>
                  <span className={styles.pillTagText}>Date Filter</span>
                </span>
              </button>
            </div>
          )}
          <SortSelectionButton sortType={sortType} onSortOptionChange={onSortOptionChange} />
        </div>
      </div>

      {isMobileFilterOpen && (
        <div className={styles.mobileFilterOverlay}>
          <button
            type="button"
            className={styles.mobileFilterDismiss}
            aria-label="Close filters"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className={styles.mobileFilterSheet}>
            <div className={styles.mobileFilterHandle} aria-hidden="true" />
            <div className={styles.mobileFilterHeader}>
              <h2 className={styles.mobileFilterHeading}>Select Filters</h2>
              <button
                type="button"
                className={styles.mobileFilterClose}
                aria-label="Close filters"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.mobileFilterBody}>
              {renderMobileStatusSection()}
              {renderMobileSearchFilterSection("Projects", projectTags, "project")}
              {renderMobileSearchFilterSection("Programs", programTags, "program")}
              {renderMobileSearchFilterSection("Assignments", assignmentTags, "assignment")}
              {setDateCreatedRange && (
                <section className={styles.mobileFilterSection}>
                  <h3 className={styles.mobileFilterTitle}>Date Created</h3>
                  <button
                    type="button"
                    className={styles.mobileDateButton}
                    onClick={() => {
                      setIsMobileFilterOpen(false);
                      setDraftStartDate(dateCreatedStart ?? null);
                      setDraftEndDate(dateCreatedEnd ?? null);
                      setActiveDatePane("start");
                      setIsDateFilterOpen(true);
                    }}
                  >
                    Date Filter
                  </button>
                </section>
              )}
            </div>
            <div className={styles.mobileFilterActions}>
              <button type="button" className={styles.mobileClearButton} onClick={clearAllFilters}>
                Clear All
              </button>
              <button
                type="button"
                className={styles.mobileApplyButton}
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {setDateCreatedRange && isDateFilterOpen && (
        <Modal
          onClose={() => setIsDateFilterOpen(false)}
          width="min(780px, calc(100vw - 32px))"
          radius="8px"
          title="Select Date Range"
          titleLineHeight={24}
          titleFontSize="20px"
          padding="20px"
        >
          <div className={styles.datePaneSwitch} role="tablist" aria-label="Date range">
            <button
              type="button"
              className={`${styles.datePaneSwitchButton} ${
                activeDatePane === "start" ? styles.datePaneSwitchButtonActive : ""
              }`}
              onClick={() => setActiveDatePane("start")}
              role="tab"
              aria-selected={activeDatePane === "start"}
            >
              Start
            </button>
            <button
              type="button"
              className={`${styles.datePaneSwitchButton} ${
                activeDatePane === "end" ? styles.datePaneSwitchButtonActive : ""
              }`}
              onClick={() => setActiveDatePane("end")}
              role="tab"
              aria-selected={activeDatePane === "end"}
            >
              End
            </button>
          </div>
          <div className={styles.datePeriodModal}>
            <div
              className={`${styles.datePickerColumn} ${
                activeDatePane === "start" ? styles.datePickerColumnActive : ""
              }`}
            >
              <span className={styles.datePickerTitle}>Start</span>
              <DateTimePickerFields
                date={draftStartDate}
                onChange={setDraftStartDate}
                showTime={false}
              />
            </div>
            <div className={styles.datePickerDivider} aria-hidden="true" />
            <div
              className={`${styles.datePickerColumn} ${
                activeDatePane === "end" ? styles.datePickerColumnActive : ""
              }`}
            >
              <span className={styles.datePickerTitle}>End</span>
              <DateTimePickerFields
                date={draftEndDate}
                onChange={setDraftEndDate}
                showTime={false}
              />
            </div>
          </div>
          <div className={styles.datePeriodButtons}>
            <button
              type="button"
              className={styles.datePeriodClearButton}
              onClick={() => {
                setDraftStartDate(null);
                setDraftEndDate(null);
                setDateCreatedRange(null, null);
                setIsDateFilterOpen(false);
              }}
            >
              Clear Date Range
            </button>
            <button
              type="button"
              className={styles.datePeriodSecondaryButton}
              onClick={() => setIsDateFilterOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.datePeriodPrimaryButton}
              onClick={() => {
                setDateCreatedRange(startOfDay(draftStartDate), endOfDay(draftEndDate));
                setIsDateFilterOpen(false);
              }}
            >
              Apply Range
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
