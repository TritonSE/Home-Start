"use client";

import styles from "./SearchBar.module.css";
import { Volunteer } from "../types/volunteer";
import { fetchVolunteers } from "@/app/api/volunteer";
import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  selectedEvent: Set<string>;
  setSelectedEvent: (value: Set<string>) => void;
  selectedStatus: Set<string>;
  setSelectedStatus: (value: Set<string>) => void;
  selectedVolunteerType: Set<string>;
  setSelectedVolunteerType: (value: Set<string>) => void;
}

export default function SearchBar({
  selectedEvent,
  setSelectedEvent,
  selectedStatus,
  setSelectedStatus,
  selectedVolunteerType,
  setSelectedVolunteerType,
}: SearchBarProps) {
  const [search, setSearch] = useState<string | undefined>();
  const [tagSearch, setTagSearch] = useState<string | undefined>();
  const [open, setOpen] = useState<"event" | "status" | "volunteerType" | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Putting all tags under one category for now
  const [tags, setTags] = useState<string[]>([]);
  //const eventTags;
  //const statusTags;
  //const volunteerTypeTags;

  useEffect(() => {
    async function loadVolunteers() {
      try {
        console.log("Attempting to fetch volunteers");
        const data = await fetchVolunteers();
        setVolunteers(data);
        console.log("Volunteers fetched successfully");

        // Extract unique tags from volunteers
        const uniqueTags = new Set<string>();
        data.forEach((volunteer) => {
          volunteer.tags.forEach((tag) => {
            uniqueTags.add(tag);
          });
        });
        setTags(Array.from(uniqueTags));
      } catch (error) {
        console.error("Error fetching volunteers:", error);
      }
    }
    loadVolunteers();

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
      setSelectedStatus((prev) => {
        const updated = new Set(prev);
        if (updated.has(item)) {
          updated.delete(item);
        } else {
          updated.add(item);
        }
        return updated;
      });
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
    if (cat === "status") return selectedStatus;
    return selectedVolunteerType;
  }

  function renderDropdown(items: string[], cat: "event" | "status" | "volunteerType") {
    if (open !== cat) return null;
    const selected = getSelectedSet(cat);
    return (
      <div className={styles.dropdown} role="menu">
        <div className={styles.inputField}>
          <span className={styles.ic_search}>
            <img src="/Union.svg" alt="Union logo" className={styles.union} />
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

        <div className={styles.dropdownItemContainer}>
          {items
            .filter((item) => item.toLowerCase().includes(tagSearch?.toLowerCase() || ""))
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
                    <img src="/Checkbox.svg" alt="checked" className={styles.checkIcon} />
                  )}
                </button>
                <div className={styles.filterLabel}>{item}</div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchField}>
        <div className={styles.inputField}>
          <span className={styles.ic_search}>
            <img src="/Union.svg" alt="Union logo" className={styles.union} />
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
        {/* REMOVING OTHER 2 TAG FILTERS FOR NOW. ALL TAGS CAN BE FOUND UNDER VOLUNTEER TYPE.

        <div className={styles.pillWrapper}>
          <button
            className={styles.pillTagEvent}
            aria-expanded={open === "event"}
            onClick={() => toggle("event")}
          >
            <span className={styles.pillTagText}> Event </span>
          </button>
          {renderDropdown(tags, "event")}
        </div>

        <div className={styles.pillWrapper}>
          <button
            className={styles.pillTagStatus}
            aria-expanded={open === "status"}
            onClick={() => toggle("status")}
          >
            <span className={styles.pillTagText}>Status</span>
          </button>
          {renderDropdown(tags, "status")}
        </div>

      */}
        <div className={styles.pillWrapper}>
          <button
            className={styles.pillTagVolunteerType}
            aria-expanded={open === "volunteerType"}
            onClick={() => toggle("volunteerType")}
          >
            <span className={styles.pillTagText}>Volunteer Type</span>
          </button>
          {renderDropdown(tags, "volunteerType")}
        </div>

        <div className={styles.clearFiltersContainer}>
          <button
            className={styles.clearFilterButton}
            onClick={() => {
              setSelectedEvent(new Set());
              setSelectedStatus(new Set());
              setSelectedVolunteerType(new Set());
            }}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
