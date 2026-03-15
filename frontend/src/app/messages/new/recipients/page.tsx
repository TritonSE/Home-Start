"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import RecipientsPanel from "../../../components/messages/RecipientsPanel";

export default function RecipientsPage() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace("/messages/new");
  }, [router]);

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
        <RecipientsPanel mode="page" />
      </main>
    </div>
  );
}
