"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useTextingFlowStore } from "../_store/textingFlowStore";
import SuccessToast from "../../../components/messages/SuccessToast";
import RecipientsPanel from "@/app/components/messages/RecipientsPanel";

const DESKTOP_MQ = "(min-width: 1024px)";

export default function ReviewAndSendPage() {
  const router = useRouter();

  const mode = useTextingFlowStore((s) => s.mode);
  const setMode = useTextingFlowStore((s) => s.setMode);
  const message = useTextingFlowStore((s) => s.message);
  const selectedRecipientIds = useTextingFlowStore((s) => s.selectedRecipientIds);
  const resetDraft = useTextingFlowStore((s) => s.resetDraft);

  const recipientsCount = selectedRecipientIds.length;

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(DESKTOP_MQ);
    const onChange = () => setIsDesktop(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace("/messages/new");
  }, [router]);

  const previewText = useMemo(() => {
    const firstName = "[First name]";
    return (message || "").replaceAll("{{first_name}}", firstName);
  }, [message]);

  const personalized = useMemo(() => {
    return (message || "").includes("{{first_name}}");
  }, [message]);

  const canSend = recipientsCount > 0 && (message || "").trim().length > 0;

  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSend = async () => {
    if (!canSend || sending) return;

    setSending(true);

    try {
      await new Promise((r) => setTimeout(r, 250));
      setShowSuccess(true);
    } finally {
      setSending(false);
    }
  };

  const successMessage = useMemo(() => {
    return `Success!\nYour message has successfully\nbeen sent to ${recipientsCount} volunteers.`;
  }, [recipientsCount]);

  const onToastDone = useCallback(() => {
    setShowSuccess(false);
    resetDraft();
    router.replace("/messages/new");
  }, [resetDraft, router]);

  const ReviewContent = () => (
    <>
      {isDesktop ? (
        <div className={styles.tabsWrap} role="tablist" aria-label="Message type">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "text"}
            className={`${styles.tab} ${mode === "text" ? styles.tabActive : ""}`}
            onClick={() => setMode("text")}
          >
            Text
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "email"}
            className={`${styles.tab} ${mode === "email" ? styles.tabActive : ""}`}
            onClick={() => setMode("email")}
          >
            Email
          </button>
        </div>
      ) : null}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recipients</h2>
          <button
            type="button"
            className={styles.editLink}
            onClick={() => router.push("/messages/new/recipients")}
          >
            Edit
          </button>
        </div>

        <div className={styles.recipientsCard}>
          <div className={styles.groupsIconWrap} aria-hidden>
            <img src="/groups.svg" alt="" className={styles.groupsIcon} />
          </div>
          <div className={styles.recipientsText}>{recipientsCount} Volunteers</div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Message Preview</h2>
          <button
            type="button"
            className={styles.editLink}
            onClick={() => router.push("/messages/new")}
          >
            Edit
          </button>
        </div>

        <div className={styles.previewCard}>
          <pre className={styles.previewText}>{previewText}</pre>
        </div>

        {personalized ? (
          <div className={styles.personalizedRow}>
            <span className={styles.check} aria-hidden>
              ✓
            </span>
            <div>
              <div className={styles.personalizedTitle}>Personalized greetings enabled</div>
              <div className={styles.personalizedSub}>Sample: John Doe</div>
            </div>
          </div>
        ) : null}
      </section>
    </>
  );

  return (
    <div className={styles.page}>
      <SuccessToast
        open={showSuccess}
        message={successMessage}
        durationMs={2600}
        onDone={onToastDone}
      />

      {!isDesktop ? (
        <>
          <header className={styles.header}>
            <button type="button" className={styles.backBtn} aria-label="Back" onClick={handleBack}>
              <img src="/Back.svg" alt="" className={styles.backIcon} />
            </button>

            <h1 className={styles.headerTitle}>Review and Send</h1>

            <div className={styles.headerRight} />
          </header>

          <main className={styles.content}>
            <ReviewContent />
            <div className={styles.bottomSpacer} />
          </main>

          <div className={styles.bottomCta}>
            <button
              type="button"
              className={styles.sendBtn}
              disabled={!canSend || sending}
              onClick={handleSend}
            >
              {sending ? "Sending..." : mode === "email" ? "Send Email" : "Send Text"}
            </button>
          </div>
        </>
      ) : (
        <main className={styles.desktopMain}>
          <div className={styles.desktopGrid}>
            <aside className={styles.leftPane}>
              <div className={styles.leftScroll}>
                <RecipientsPanel mode="panel" />
              </div>
            </aside>

            <section className={styles.rightPane}>
              <div className={styles.rightScroll}>
                <ReviewContent />
              </div>

              <div className={styles.desktopSend}>
                <button
                  type="button"
                  className={styles.sendBtn}
                  disabled={!canSend || sending}
                  onClick={handleSend}
                >
                  {sending ? "Sending..." : "Review and Send"}
                </button>
              </div>
            </section>
          </div>
        </main>
      )}
    </div>
  );
}
