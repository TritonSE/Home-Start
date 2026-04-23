"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import styles from "./SearchBar.module.css";
import SortSelectionButton from "./SortSelectorButton";

import checkboxIconAsset from "@/assets/Checkbox.svg";
import unionIconAsset from "@/assets/Union.svg";

const checkboxIcon = checkboxIconAsset as string;
const unionIcon = unionIconAsset as string;

type SearchBarProps = {
  search: string;
  setSearch: (value: string) => void;
  eventTags: string[];
  volunteerTypeTags: string[];
  sortType: "Newest" | "Oldest" | "First Name A-Z" | "First Name Z-A" | "Last Name A-Z" | "Last Name Z-A";
  onSortOptionChange: (option: "Newest" | "Oldest" | "First Name A-Z" | "First Name Z-A" | "Last Name A-Z" | "Last Name Z-A") => void;

  selectedEvent: Set<string>;
  setSelectedEvent: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  selectedStatus: string | null;
  setSelectedStatus: (value: string | null) => void;
  selectedVolunteerType: Set<string>;
  setSelectedVolunteerType: (value: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
};

export default function SearchBar({
  search,
  setSearch,
  eventTags,
  volunteerTypeTags,
  sortType,
  onSortOptionChange,
  selectedEvent,
  setSelectedEvent,
  selectedStatus,
  setSelectedStatus,
  selectedVolunteerType,
  setSelectedVolunteerType,
}: SearchBarProps) {
  const [tagSearch, setTagSearch] = useState("");
  const [open, setOpen] = useState<"event" | "status" | "volunteerType" | null>(null);
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

  function toggle(cat: "event" | "status" | "volunteerType") {
    setOpen((prev) => (prev === cat ? null : cat));
  }

  function toggleTag(item: string, cat: "event" | "status" | "volunteerType") {
    if (cat === "event") {
      setSelectedEvent((prev) => {
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
    } else if (cat === "volunteerType") {
      setSelectedVolunteerType((prev) => {
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

  function getSelectedSet(cat: "event" | "status" | "volunteerType") {
    if (cat === "event") return selectedEvent;
    if (cat === "status") return new Set(selectedStatus ? [selectedStatus] : []);
    return selectedVolunteerType;
  }

  function formatOptionLabel(item: string, cat: "event" | "status" | "volunteerType") {
    if (cat !== "status") return item;
    return item.charAt(0).toUpperCase() + item.slice(1);
  }

  function clearCategory(cat: "event" | "status" | "volunteerType") {
    if (cat === "event") {
      setSelectedEvent(new Set());
      return;
    }

    if (cat === "status") {
      setSelectedStatus(null);
      return;
    }

    setSelectedVolunteerType(new Set());
  }

  function getClearButtonLabel(cat: "event" | "status" | "volunteerType") {
    if (cat === "status") return "Clear";
    return "Clear All";
  }

  function renderDropdown(
    items: string[],
    cat: "event" | "status" | "volunteerType",
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
            <span className={styles.pillTagText}>Status</span>
          </button>
          {renderDropdown(["returning", "new"], "status", false)}
        </div>

        <div className={styles.pillWrapper}>
          <button
            className={`${styles.pillTagVolunteerType} ${selectedVolunteerType.size > 0 ? styles.pillTagActive : ""}`}
            aria-expanded={open === "volunteerType"}
            onClick={() => toggle("volunteerType")}
          >
            <span className={styles.pillTagText}>Volunteer Type</span>
          </button>
          {renderDropdown(volunteerTypeTags, "volunteerType")}
        </div>

        <div className={styles.pillWrapper}>
          <button
            className={`${styles.pillTagEvent} ${selectedEvent.size > 0 ? styles.pillTagActive : ""}`}
            aria-expanded={open === "event"}
            onClick={() => toggle("event")}
          >
            <span className={styles.pillTagText}>Event</span>
          </button>
          {renderDropdown(eventTags, "event")}
        </div>

        <div className={styles.clearFiltersContainer}>
          <button
            className={styles.clearFilterButton}
            onClick={() => {
              setSelectedEvent(new Set());
              setSelectedStatus(null);
              setSelectedVolunteerType(new Set());
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
