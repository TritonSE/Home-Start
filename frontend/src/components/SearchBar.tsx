"use client";

import styles from "./SearchBar.module.css";
import { useEffect, useRef, useState } from "react";

export default function SearchBar() {
  const [search, setSearch] = useState<string | undefined>();
  const [tagSearch, setTagSearch] = useState<string | undefined>();
  const [open, setOpen] = useState<"event" | "status" | "volunteerType" | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<Set<string>>(new Set());
  const [selectedVolunteerType, setSelectedVolunteerType] = useState<Set<string>>(new Set());
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Dummy tags for now
  const eventTags = ["Spring Cleanup", "Food Drive", "Community Center", "School Reading Program"];
  const statusTags = ["Active", "Inactive", "On Leave"];
  const volunteerTypeTags = ["Regular", "Occasional", "Coordinator"];

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
                  {selected.has(item) && <img src="/Checkbox.svg" alt="checked" className={styles.checkIcon} />}
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
        <div className={styles.pillWrapper}>
          <button
            className={styles.pillTagEvent}
            aria-expanded={open === "event"}
            onClick={() => toggle("event")}
          >
            <span className={styles.pillTagText}> Event </span>
          </button>
          {renderDropdown(eventTags, "event")}
        </div>

        <div className={styles.pillWrapper}>
          <button
            className={styles.pillTagStatus}
            aria-expanded={open === "status"}
            onClick={() => toggle("status")}
          >
            <span className={styles.pillTagText}>Status</span>
          </button>
          {renderDropdown(statusTags, "status")}
        </div>

        <div className={styles.pillWrapper}>
          <button
            className={styles.pillTagVolunteerType}
            aria-expanded={open === "volunteerType"}
            onClick={() => toggle("volunteerType")}
          >
            <span className={styles.pillTagText}>Volunteer Type</span>
          </button>
          {renderDropdown(volunteerTypeTags, "volunteerType")}
        </div>

      </div> 
    </div>
  );
}
