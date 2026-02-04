"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useTextingFlowStore } from "./_store/textingFlowStore";

const TOKEN = "{{first_name}}";

export default function NewMessagePage() {
  const router = useRouter();

  const message = useTextingFlowStore((s) => s.message);
  const setMessage = useTextingFlowStore((s) => s.setMessage);
  const selectedRecipientIds = useTextingFlowStore((s) => s.selectedRecipientIds);

  const recipientsCount = selectedRecipientIds.length;

  const canReview = useMemo(() => {
    return recipientsCount > 0 && message.trim().length > 0;
  }, [recipientsCount, message]);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const renderHtml = useMemo(() => {

    const escaped = (message || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
    const withPills = escaped.replaceAll(
      TOKEN,
      `<span class="${styles.pill}" contenteditable="false">First Name</span>`
    );
    return withPills.replaceAll("\n", "<br/>");
  }, [message]);

  const readPlainTextFromEditor = useCallback(() => {
    const el = editorRef.current;
    if (!el) return "";
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(`.${styles.pill}`).forEach((node) => {
      node.replaceWith(document.createTextNode(TOKEN));
    });
    return (clone.innerText || "").replace(/\u00A0/g, " ");
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML === renderHtml) return;

    el.innerHTML = renderHtml;
  }, [renderHtml]);

  const insertFirstName = useCallback(() => {
    const trimmed = message.trim();
    if (trimmed.length === 0) {
      setMessage(`${TOKEN} `);
      return;
    }

    const needsSpace = !message.endsWith(" ");
    setMessage(`${message}${needsSpace ? " " : ""}${TOKEN} `);
    requestAnimationFrame(() => {
      editorRef.current?.focus();
    });
  }, [message, setMessage]);

  const toLabel = recipientsCount === 0 ? "" : `${recipientsCount} Volunteers`;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft} aria-hidden />
        <h1 className={styles.headerTitle}>New Message</h1>
        <div className={styles.headerRight} aria-hidden />
      </header>

      <main className={styles.content}>
        {/* To row */}
        <section className={`${styles.section} ${styles.toSection}`}>
          <div className={styles.toRow}>
            <div className={styles.toBox}>
              <span className={styles.toLabel}>To:</span>
              {toLabel ? <span className={styles.toPill}>{toLabel}</span> : null}
            </div>

            <button
              type="button"
              className={styles.iconButton}
              aria-label="Edit recipients"
              onClick={() => router.push("/messages/new/recipients")}
            >
              <img src="/edit.svg" alt="" className={styles.icon} />
            </button>
          </div>
        </section>

        {/* Message */}
        <section className={`${styles.section} ${styles.messageSection}`}>
          <div className={styles.messageLabel}>Message</div>

          {/* ✅ textareaの代わり */}
          <div
            ref={editorRef}
            className={styles.richEditor}
            contentEditable
            role="textbox"
            aria-multiline="true"
            data-placeholder="Compose your message..."
            onInput={() => setMessage(readPlainTextFromEditor())}
          />
        </section>

        {/* Insert First Name */}
        <section className={`${styles.section} ${styles.insertSection}`}>
          <button type="button" className={styles.insertBtn} onClick={insertFirstName}>
            <img src="/insertFirstName.svg" alt="" className={styles.insertIcon} />
            Insert First Name
          </button>

          <div className={styles.helper}>
            <img src="/mdi_information.svg" alt="" className={styles.helperIcon} />
            <span>Tap the button to insert a volunteer’s name wherever you want it to appear.</span>
          </div>
        </section>

        <div className={styles.bottomSpacer} />
      </main>

      {/* Fixed Review Button */}
      <div className={styles.reviewFixed}>
        <button
          type="button"
          className={canReview ? styles.reviewBtn : styles.reviewBtnDisabled}
          disabled={!canReview}
          onClick={() => router.push("/messages/new/review")}
        >
          Review and Send
        </button>
      </div>
    </div>
  );
}