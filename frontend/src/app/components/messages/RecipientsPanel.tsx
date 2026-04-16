"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import RecipientRow from "./RecipientRow";
import styles from "./RecipientsPanel.module.css";

import { getEventTags } from "@/app/api/tag";
import { getSelectedVolunteers, getVolunteerRows } from "@/app/api/volunteer";
import { useTextingFlowStore } from "@/app/messages/new/_store/textingFlowStore";
import unionIcon from "@/assets/Union.svg";

type Mode = "page" | "panel";
type FilterMenu = "event" | "status" | "volunteerType" | null;

type VolunteerRow = {
  id: string;
  firstName: string;
  lastName: string;
  tags: string[];
};

type Recipient = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

const mockRecipients: VolunteerRow[] = Array.from({ length: 3 }).map((_, i) => ({
  id: `r${i + 1}`,
  firstName: `Recipient`,
  lastName: `#${i + 1}`,
  tags: ["Intern"],
}));

const EVENTS = [
  "Holiday Toy Drive",
  "Celebration Event 3",
  "Holiday Toy Drive 2024",
  "Small Celebration",
];

const STATUSES = ["new", "returning"];
const VOLUNTEER_TYPES = ["Intern", "Lead", "Mentor", "Parent"];

export default function RecipientsPanel({ mode }: { mode: Mode }) {
  const router = useRouter();

  const selectedRecipientIds = useTextingFlowStore((s) => s.selectedRecipientIds);
  const toggleRecipient = useTextingFlowStore((s) => s.toggleRecipient);
  const setRecipientIds = useTextingFlowStore((s) => s.setRecipientIds);
  const setRecipients = useTextingFlowStore((s) => s.setRecipients);
  const getRecipients = useTextingFlowStore((s) => s.getRecipients);
  const clearRecipients = useTextingFlowStore((s) => s.clearRecipients);

  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false); // mobile bottom sheet
  const [events, setEvents] = useState<string[]>([]);
  const [openMenu, setOpenMenu] = useState<FilterMenu>(null); // desktop dropdown
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedVolunteerTypes, setSelectedVolunteerTypes] = useState<string[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);

  const [volunteerRows, setVolunteerRows] = useState<VolunteerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled: boolean = false;
    async function loadVolunteerRows() {
      try {
        setLoading(true);
        setError(null);

        getVolunteerRows().then((data) => {
          if (!cancelled) setVolunteerRows(data);
        });
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function loadEvents() {
      try {
        getEventTags().then((data) => {
          if (!cancelled) setEvents(data);
        });
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Unknown error");
        }
      }
    }

    loadEvents();
    loadVolunteerRows();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  const selectedSet = useMemo(() => new Set(selectedRecipientIds), [selectedRecipientIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return volunteerRows;
    return volunteerRows.filter((r) => r.firstName.toLowerCase().includes(q));
  }, [query, volunteerRows]);

  const filteredIds = useMemo(() => filtered.map((r) => r.id), [filtered]);

  const recipientsCount = selectedRecipientIds.length;
  const selectEnabled = recipientsCount > 0;

  const handleSelect = useCallback(() => {
    if (mode === "page") router.push("/messages/new");
  }, [mode, router]);

  const allFilteredSelected = useMemo(() => {
    if (filteredIds.length === 0) return false;
    for (const id of filteredIds) {
      if (!selectedSet.has(id)) return false;
    }
    return true;
  }, [filteredIds, selectedSet]);

  const toggleSelectAll = useCallback(() => {
    const current = new Set(selectedRecipientIds);

    if (!allFilteredSelected) {
      for (const id of filteredIds) current.add(id);
      setRecipientIds(Array.from(current));
      return;
    }

    for (const id of filteredIds) current.delete(id);
    setRecipientIds(Array.from(current));
  }, [allFilteredSelected, filteredIds, selectedRecipientIds, setRecipients]);

  const toggleFilterChip = (kind: "event" | "status" | "volunteerType", value: string) => {
    if (kind === "event") {
      setSelectedEvents((prev) =>
        prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
      );
      return;
    }

    if (kind === "status") {
      setSelectedStatuses((prev) =>
        prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
      );
      return;
    }

    setSelectedVolunteerTypes((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
    );
  };

  const clearAllFilters = () => {
    setSelectedEvents([]);
    setSelectedStatuses([]);
    setSelectedVolunteerTypes([]);
    setOpenMenu(null);
  };

  const applyFilters = async () => {
    try {
      const data: Recipient[] = await getSelectedVolunteers({
        events: selectedEvents,
        statuses: selectedStatuses,
      });
      clearRecipients();
      setRecipients(data);
      setFiltersOpen(false);
      for (const r of data) {
        toggleRecipient(r._id);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Unknown error applying filters");
      }
    }
  };

  const labelFor = (items: string[], fallback: string) => {
    if (items.length === 0) return fallback;
    if (items.length === 1) return items[0];
    return `${fallback} (${items.length})`;
  };

  const toggleDesktopMenu = (menu: FilterMenu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  return (
    <div className={mode === "panel" ? styles.panel : styles.pageBody}>
      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <Image src={unionIcon} alt="" aria-hidden className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search Volunteer"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {!isDesktop ? (
          <button
            type="button"
            className={styles.filterBtn}
            aria-label="Open filters"
            onClick={() => setFiltersOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 7h10m6 0h-2M10 7a2 2 0 1 1-4 0a2 2 0 0 1 4 0ZM4 17h2m14 0H10m4 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0ZM4 12h14m2 0h-2M18 12a2 2 0 1 1-4 0a2 2 0 0 1 4 0Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {isDesktop ? (
        <div className={styles.desktopFilters}>
          <div className={styles.desktopFilterGroup}>
            <button
              type="button"
              className={styles.desktopFilterChip}
              onClick={() => toggleDesktopMenu("event")}
            >
              <span>{labelFor(selectedEvents, "Event")}</span>
              <span className={styles.desktopFilterChevron}>⌄</span>
            </button>

            {openMenu === "event" ? (
              <div className={styles.desktopFilterMenu}>
                {EVENTS.map((item) => {
                  const on = selectedEvents.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      className={`${styles.desktopFilterMenuButton} ${on ? styles.desktopFilterMenuButtonActive : ""}`}
                      onClick={() => toggleFilterChip("event", item)}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className={styles.desktopFilterGroup}>
            <button
              type="button"
              className={styles.desktopFilterChip}
              onClick={() => toggleDesktopMenu("status")}
            >
              <span>{labelFor(selectedStatuses, "Status")}</span>
              <span className={styles.desktopFilterChevron}>⌄</span>
            </button>

            {openMenu === "status" ? (
              <div className={styles.desktopFilterMenu}>
                {STATUSES.map((item) => {
                  const on = selectedStatuses.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      className={`${styles.desktopFilterMenuButton} ${on ? styles.desktopFilterMenuButtonActive : ""}`}
                      onClick={() => toggleFilterChip("status", item)}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className={styles.desktopFilterGroup}>
            <button
              type="button"
              className={styles.desktopFilterChip}
              onClick={() => toggleDesktopMenu("volunteerType")}
            >
              <span>{labelFor(selectedVolunteerTypes, "Volunteer Type")}</span>
              <span className={styles.desktopFilterChevron}>⌄</span>
            </button>

            {openMenu === "volunteerType" ? (
              <div className={styles.desktopFilterMenu}>
                {VOLUNTEER_TYPES.map((item) => {
                  const on = selectedVolunteerTypes.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      className={`${styles.desktopFilterMenuButton} ${on ? styles.desktopFilterMenuButtonActive : ""}`}
                      onClick={() => toggleFilterChip("volunteerType", item)}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={styles.recipientsHeader}>
        <div className={styles.recipientsTitle}>Recipients ({recipientsCount})</div>

        <button type="button" className={styles.selectAllLink} onClick={toggleSelectAll}>
          {allFilteredSelected ? "Deselect All" : "Select All"}
        </button>
      </div>

      <div className={styles.list}>
        {filtered.map((r) => (
          <RecipientRow
            key={r.id}
            name={`${r.firstName} ${r.lastName}`}
            tags={r.tags}
            selected={selectedSet.has(r.id)}
            onToggle={() => toggleRecipient(r.id)}
            checkboxPosition="left"
            disableSelectedStyle
          />
        ))}
      </div>

      {mode === "page" ? (
        <div className={styles.bottomCta}>
          <button
            type="button"
            className={selectEnabled ? styles.cta : styles.ctaDisabled}
            disabled={!selectEnabled}
            onClick={handleSelect}
          >
            Select Recipients
          </button>
        </div>
      ) : null}

      {filtersOpen && !isDesktop ? (
        <div className={styles.sheetOverlay} role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            className={styles.overlayDismiss}
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />

          <div className={styles.sheet}>
            <div className={styles.sheetHandle} aria-hidden />
            <div className={styles.sheetHeader}>
              <div className={styles.sheetTitle}>Filters</div>
              <button
                type="button"
                className={styles.sheetClose}
                onClick={() => setFiltersOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className={styles.sheetSection}>
              <div className={styles.sheetSectionTitle}>Events</div>
              <div className={styles.sheetChips}>
                {events.map((e) => {
                  const on = selectedEvents.includes(e);
                  return (
                    <button
                      key={e}
                      type="button"
                      className={`${styles.sheetChip} ${on ? styles.sheetChipOn : ""}`}
                      onClick={() => toggleFilterChip("event", e)}
                    >
                      {e}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.sheetSection}>
              <div className={styles.sheetSectionTitle}>Status</div>
              <div className={styles.sheetChips}>
                {STATUSES.map((s) => {
                  const on = selectedStatuses.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      className={`${styles.sheetChip} ${on ? styles.sheetChipOn : ""}`}
                      onClick={() => toggleFilterChip("status", s)}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.sheetActions}>
              <button
                type="button"
                className={styles.clearBtn}
                disabled={
                  selectedEvents.length === 0 &&
                  selectedStatuses.length === 0 &&
                  selectedVolunteerTypes.length === 0
                }
                onClick={clearAllFilters}
              >
                Clear All
              </button>

              <button type="button" className={styles.applyBtn} onClick={applyFilters}>
                Apply Filters
              </button>
            </div>

            <div className={styles.sheetBottomPad} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
