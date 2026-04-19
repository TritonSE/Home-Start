"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useTextingFlowStore } from "../_store/textingFlowStore";
import SuccessToast from "../../../components/messages/SuccessToast";

import styles from "./page.module.css";

import { fetchVolunteers } from "@/app/api/volunteer";
import RecipientsPanel from "@/app/components/messages/RecipientsPanel";
import backIconAsset from "@/assets/back.svg";
import groupsIconAsset from "@/assets/icVolunteers.svg";
import { getGraphToken, signInWithOutlook } from "@/auth/msal";
import Sidebar from "@/components/Sidebar";
import { auth } from "@/firebase/firebase";

const DESKTOP_MQ = "(min-width: 1024px)";
const FIRST_NAME_TOKEN = "{{First Name}}";
const backIcon = backIconAsset as string;
const groupsIcon = groupsIconAsset as string;

export default function ReviewAndSendPage() {
  const router = useRouter();

  const mode = useTextingFlowStore((s) => s.mode);
  const subject = useTextingFlowStore((s) => s.subject);
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
    router.replace("/communication");
  }, [router]);

  const previewText = useMemo(() => {
    return (message || "").replaceAll(FIRST_NAME_TOKEN, "[First name]");
  }, [message]);

  const personalized = useMemo(() => {
    return (message || "").includes(FIRST_NAME_TOKEN);
  }, [message]);

  const canSend = recipientsCount > 0 && (message || "").trim().length > 0;

  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!canSend || sending) return;

    setSending(true);
    setSendError(null);

    try {
      if (mode === "email") {
        let graphToken: string;
        try {
          graphToken = await getGraphToken();
        } catch {
          await signInWithOutlook();
          return;
        }

        const firebaseToken = await auth.currentUser?.getIdToken();
        if (!firebaseToken) {
          setSendError("You must be logged in to send emails.");
          return;
        }

        const allVolunteers = await fetchVolunteers();
        const recipients = allVolunteers.filter((v) => selectedRecipientIds.includes(v._id));
        if (recipients.length === 0) {
          setSendError("Could not find recipient data. Please re-select your recipients.");
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${firebaseToken}`,
          },
          body: JSON.stringify({
            graphToken,
            recipients,
            subject,
            message,
          }),
        });

        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          setSendError(err.error ?? "Failed to send emails. Please try again.");
          return;
        }
      }

      setShowSuccess(true);
    } finally {
      setSending(false);
    }
  };

  const successMessage = useMemo(() => {
    return `Your message has successfully\nbeen sent to ${recipientsCount} volunteers.`;
  }, [recipientsCount]);

  const onToastDone = useCallback(() => {
    setShowSuccess(false);
    resetDraft();
    router.replace("/communication");
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
            disabled
          >
            Text
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "email"}
            className={`${styles.tab} ${mode === "email" ? styles.tabActive : ""}`}
            disabled
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
            <Image src={groupsIcon} alt="" className={styles.groupsIcon} width={20} height={20} />
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

        {mode === "email" ? (
          <div className={styles.subjectCard}>
            <div className={styles.subjectText}>{subject || "No subject"}</div>
          </div>
        ) : null}

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
    <Sidebar>
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
              <button
                type="button"
                className={styles.backBtn}
                aria-label="Back"
                onClick={handleBack}
              >
                <Image src={backIcon} alt="" className={styles.backIcon} width={12} height={12} />
              </button>

              <h1 className={styles.headerTitle}>Review and Send</h1>

              <div className={styles.headerRight} />
            </header>

            <main className={styles.content}>
              <ReviewContent />
              <div className={styles.bottomSpacer} />
            </main>

            <div className={styles.bottomCta}>
              {sendError && <p className={styles.sendError}>{sendError}</p>}
              <button
                type="button"
                className={styles.sendBtn}
                disabled={!canSend || sending}
                onClick={() => {
                  void handleSend();
                }}
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
                    onClick={() => {
                      void handleSend();
                    }}
                  >
                    {sending ? "Sending..." : "Review and Send"}
                  </button>
                </div>
              </section>
            </div>
          </main>
        )}
      </div>
    </Sidebar>
  );
}
