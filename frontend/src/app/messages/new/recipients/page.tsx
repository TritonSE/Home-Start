"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import RecipientsPanel from "../../../components/messages/RecipientsPanel";
import Image from "next/image";
import backIcon from "@/assets/back.svg";
import Sidebar from "@/components/Sidebar";

export default function RecipientsPage() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace("/communication");
  }, [router]);

  return (
    <Sidebar>
      <div className={styles.page}>
        <header className={styles.header}>
          <button type="button" className={styles.backBtn} aria-label="Back" onClick={handleBack}>
            <Image src={backIcon} alt="" className={styles.backIcon} width={12} height={12} />
          </button>
  
          <h1 className={styles.title}>Select Recipients</h1>
          <div className={styles.headerRight} />
        </header>
  
        <main className={styles.content}>
          <RecipientsPanel mode="page" />
        </main>
      </div>
    </Sidebar>
  );
}
