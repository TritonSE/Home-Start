"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import RecipientRow from "../../../components/messages/RecipientRow";
import { useTextingFlowStore } from "../_store/textingFlowStore";

type Recipient = {
  id: string;
  name: string;
  tags: string[];
};

const mockRecipients: Recipient[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `r${i + 1}`,
  name: "Frederico M.",
  tags: ["Intern"],
}));

const EVENTS = [
  "Holiday Toy Drive",
  "Celebration Event 3",
  "Holiday Toy Drive 2024",
  "Small Celebration",
  "Holiday Toy Drive 2024",
];

const STATUSES = ["New", "Returner"];

export default function RecipientsPage() {
  const router = useRouter();

  const selectedRecipientIds = useTextingFlowStore((s) => s.selectedRecipientIds);
  const toggleRecipient = useTextingFlowStore((s) => s.toggleRecipient);
  const setRecipients = useTextingFlowStore((s) => s.setRecipients);

  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const selectedSet = useMemo(() => new Set(selectedRecipientIds), [selectedRecipientIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockRecipients;
    return mockRecipients.filter((r) => r.name.toLowerCase().includes(q));
  }, [query]);

  const filteredIds = useMemo(() => filtered.map((r) => r.id), [filtered]);

  const recipientsCount = selectedRecipientIds.length;
  const selectEnabled = recipientsCount > 0;

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace("/messages/new");
  }, [router]);

  const handleSelect = () => {
    router.push("/messages/new");
  };

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
      setRecipients(Array.from(current));
      return;
    }
    for (const id of filteredIds) current.delete(id);
    setRecipients(Array.from(current));
  }, [allFilteredSelected, filteredIds, selectedRecipientIds, setRecipients]);

  const toggleFilterChip = (kind: "event" | "status", value: string) => {
    if (kind === "event") {
      setSelectedEvents((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
      return;
    }
    setSelectedStatuses((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  };

  const clearAllFilters = () => {
    setSelectedEvents([]);
    setSelectedStatuses([]);
  };

  const applyFilters = () => {
    setFiltersOpen(false);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} aria-label="Back" onClick={handleBack}>
          <img src="/Back.svg" alt="" className={styles.backIcon} />
        </button>

        <h1 className={styles.title}>Select Recipients</h1>

        <div className={styles.headerRight} />
      </header>

      <main className={styles.content}>
        <div className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden>
              🔍
            </span>
            <input
              className={styles.searchInput}
              placeholder="Search Volunteer"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className={styles.filterBtn}
            aria-label="Open filters"
            onClick={() => setFiltersOpen(true)}
          >
            {/* sliders icon (inline) */}
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
        </div>

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
              name={r.name}
              tags={r.tags}
              selected={selectedSet.has(r.id)}
              onToggle={() => toggleRecipient(r.id)}
              checkboxPosition="left"
              disableSelectedStyle
            />
          ))}
        </div>
      </main>

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

      {/* Filters bottom sheet */}
      {filtersOpen ? (
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
              <button type="button" className={styles.sheetClose} onClick={() => setFiltersOpen(false)} aria-label="Close">
                ×
              </button>
            </div>

            <div className={styles.sheetSection}>
              <div className={styles.sheetSectionTitle}>Events</div>
              <div className={styles.sheetChips}>
                {EVENTS.map((e) => {
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
                disabled={selectedEvents.length === 0 && selectedStatuses.length === 0}
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