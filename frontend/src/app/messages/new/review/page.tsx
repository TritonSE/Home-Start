"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useTextingFlowStore } from "../_store/textingFlowStore";
import SuccessToast from "../../../components/messages/SuccessToast";

export default function ReviewAndSendPage() {
  const router = useRouter();

  const message = useTextingFlowStore((s) => s.message);
  const selectedRecipientIds = useTextingFlowStore((s) => s.selectedRecipientIds);
  const resetDraft = useTextingFlowStore((s) => s.resetDraft);

  const recipientsCount = selectedRecipientIds.length;

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
      // TODO
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

  return (
    <div className={styles.page}>
      <SuccessToast open={showSuccess} message={successMessage} durationMs={2600} onDone={onToastDone} />

      <header className={styles.header}>
        <button type="button" className={styles.backBtn} aria-label="Back" onClick={handleBack}>
          <img src="/Back.svg" alt="" className={styles.backIcon} />
        </button>

        <h1 className={styles.headerTitle}>Review and Send</h1>

        <div className={styles.headerRight} />
      </header>

      <main className={styles.content}>
        {/* Recipients */}
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

        {/* Message Preview */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Message Preview</h2>
            <button type="button" className={styles.editLink} onClick={() => router.push("/messages/new")}>
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
              </div>
            </div>
          ) : null}
        </section>

        <div className={styles.bottomSpacer} />
      </main>

      <div className={styles.bottomCta}>
        <button type="button" className={styles.sendBtn} disabled={!canSend || sending} onClick={handleSend}>
          {sending ? "Sending..." : "Send Text"}
        </button>
      </div>
    </div>
  );
}