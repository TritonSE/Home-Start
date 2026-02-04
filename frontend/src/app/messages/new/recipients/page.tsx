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

const mockRecipients: Recipient[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `r${i + 1}`,
  name: "Frederico M.",
  tags: ["Intern"],
}));

type ChipKey = "all" | "event" | "volunteerType" | "status";

export default function RecipientsPage() {
  const router = useRouter();

  const selectedRecipientIds = useTextingFlowStore((s) => s.selectedRecipientIds);
  const toggleRecipient = useTextingFlowStore((s) => s.toggleRecipient);

  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState<ChipKey>("all");

  const selectedSet = useMemo(() => new Set(selectedRecipientIds), [selectedRecipientIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockRecipients;
    return mockRecipients.filter((r) => r.name.toLowerCase().includes(q));
  }, [query]);

  const recipientsCount = selectedRecipientIds.length;
  const selectEnabled = recipientsCount > 0;

  // 直リンク/リロードでも戻れるようにフォールバック
  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace("/messages/new");
  }, [router]);

  const handleSelect = () => {
    // store に選択はもう入ってるから、戻るだけでOK
    router.push("/messages/new");
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} aria-label="Back" onClick={handleBack}>
          <img src="/Back.svg" alt="" className={styles.backIcon} />
        </button>

        <h1 className={styles.title}>New Message</h1>

        <div className={styles.headerRight} />
      </header>

      <main className={styles.content}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden>
            🔍
          </span>
          <input
            className={styles.searchInput}
            placeholder="Search by name or event..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.filters} role="tablist" aria-label="Recipient filters">
          <button
            type="button"
            className={`${styles.chip} ${activeChip === "all" ? styles.chipActive : styles.chipOutline}`}
            onClick={() => setActiveChip("all")}
          >
            All
          </button>

          <button
            type="button"
            className={`${styles.chip} ${activeChip === "event" ? styles.chipActive : styles.chipOutline}`}
            onClick={() => setActiveChip("event")}
          >
            Event
          </button>

          <button
            type="button"
            className={`${styles.chip} ${
              activeChip === "volunteerType" ? styles.chipActive : styles.chipOutline
            }`}
            onClick={() => setActiveChip("volunteerType")}
          >
            Volunteer Type
          </button>

          <button
            type="button"
            className={`${styles.chip} ${activeChip === "status" ? styles.chipActive : styles.chipOutline}`}
            onClick={() => setActiveChip("status")}
          >
            Status
          </button>
        </div>

        <div className={styles.recipientsHeader}>
          <div className={styles.recipientsTitle}>Recipients ({recipientsCount})</div>
        </div>

        <div className={styles.list}>
          {filtered.map((r) => (
            <RecipientRow
              key={r.id}
              name={r.name}
              tags={r.tags}
              selected={selectedSet.has(r.id)}
              onToggle={() => toggleRecipient(r.id)}
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
          Select as Recipients
        </button>
      </div>
    </div>
  );
}