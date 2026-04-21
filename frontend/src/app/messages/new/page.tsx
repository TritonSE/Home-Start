"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTextingFlowStore } from "./_store/textingFlowStore";
import styles from "./page.module.css";

import type { MouseEvent } from "react";

import RecipientsPanel from "@/app/components/messages/RecipientsPanel";
import addPersonIconAsset from "@/assets/addPersonIcon.svg";
import blueChevronLeftAsset from "@/assets/blueChevronLeft.svg";
import bluePlusAsset from "@/assets/bluePlus.svg";
import icCaretLeftAsset from "@/assets/icCaretleft.svg";
import mdiInformationAsset from "@/assets/mdi_information.svg";
import { initMsal, signInWithOutlook } from "@/auth/msal";
import Sidebar from "@/components/Sidebar";

const addPersonIcon = addPersonIconAsset as string;
const blueChevronLeft = blueChevronLeftAsset as string;
const bluePlus = bluePlusAsset as string;
const icCaretLeft = icCaretLeftAsset as string;
const mdiInformation = mdiInformationAsset as string;

const TOKEN = "{{First Name}}";
const DESKTOP_MQ = "(min-width: 1024px)";

type ComposerProps = {
  mode: "text" | "email";
  setMode: (mode: "text" | "email") => void;
  subject: string;
  setSubject: (subject: string) => void;
  message: string;
  setMessage: (message: string) => void;
  recipientsCount: number;
  canReview: boolean;
  isDesktop: boolean;
  clickableTo: boolean;
  onGoRecipients: () => void;
  onGoReview: () => void;
};

function tokenTextToHtml(text: string, pillClass: string) {
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const withPill = escaped.replaceAll(
    TOKEN,
    `<span class="${pillClass}" contenteditable="false">First Name</span>`,
  );

  if (withPill.length === 0) {
    return "";
  }

  const lines = withPill.split("\n");
  const [firstLine, ...restLines] = lines;

  let html = firstLine.length > 0 ? firstLine : "<br/>";

  restLines.forEach((line) => {
    html += line.length === 0 ? "<div><br/></div>" : `<div>${line}</div>`;
  });

  return html;
}

function Composer({
  mode,
  setMode,
  subject,
  setSubject,
  message,
  setMessage,
  recipientsCount,
  canReview,
  isDesktop,
  clickableTo,
  onGoRecipients,
  onGoReview,
}: ComposerProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isComposingRef = useRef(false);
  const lastSyncedMessageRef = useRef(message);
  const initializedRef = useRef(false);

  const [, setDraftText] = useState(message);

  const sendEmails = async () => {
    setMode("email");
    if (await initMsal()) {
      return;
    }

    await signInWithOutlook();
  };

  const switchToEmailTab = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void sendEmails();
  };

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    if (!initializedRef.current) {
      el.innerHTML = tokenTextToHtml(message, styles.pill);
      initializedRef.current = true;
      lastSyncedMessageRef.current = message;
      return;
    }

    if (isComposingRef.current) return;
    if (lastSyncedMessageRef.current === message) return;

    el.innerHTML = tokenTextToHtml(message, styles.pill);
    lastSyncedMessageRef.current = message;
  }, [message]);

  const readPlainTextFromEditor = useCallback(() => {
    const el = editorRef.current;
    if (!el) return "";
    const clone = el.cloneNode(true) as HTMLElement;

    clone.querySelectorAll(`.${styles.pill}`).forEach((node) => {
      node.replaceWith(document.createTextNode(TOKEN));
    });

    const htmlWithBreaks = clone.innerHTML.replace(/<div>/gi, "\n").replace(/<\/?p>/gi, "\n");

    const textOnly = htmlWithBreaks.replace(/<[^>]+>/g, "");
    const decoder = document.createElement("textarea");
    decoder.innerHTML = textOnly;

    const res = decoder.value.replace(/\u00A0/g, " ").replace(/\r\n/g, "\n");
    return res;
  }, []);

  const insertFirstName = () => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    const pill = document.createElement("span");
    pill.className = styles.pill;
    pill.setAttribute("contenteditable", "false");
    pill.textContent = "First Name";

    const space = document.createTextNode(" ");

    const sel = window.getSelection();
    if (!sel) return;

    if (sel.rangeCount === 0) {
      editor.appendChild(pill);
      editor.appendChild(space);

      const next = readPlainTextFromEditor();
      lastSyncedMessageRef.current = next;
      setDraftText(next);
      setMessage(next);
      return;
    }

    const range = sel.getRangeAt(0);

    if (!editor.contains(range.commonAncestorContainer)) {
      const end = document.createRange();
      end.selectNodeContents(editor);
      end.collapse(false);
      sel.removeAllRanges();
      sel.addRange(end);
    }

    const r = sel.getRangeAt(0);
    r.deleteContents();
    r.insertNode(space);
    r.insertNode(pill);
    r.setStartAfter(space);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);

    const next = readPlainTextFromEditor();
    lastSyncedMessageRef.current = next;
    setDraftText(next);
    setMessage(next);
  };

  return (
    <>
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
          onClick={switchToEmailTab}
        >
          Email
        </button>
      </div>

      <section className={styles.toSectionNew}>
        <div className={styles.toRowNew}>
          <span className={styles.toLabelNew}>To:</span>

          {!isDesktop ? (recipientsCount > 0 ? (
            <div className={styles.toSelectedWrap}>
              <span className={styles.toSelectedPill}>{recipientsCount} Volunteers</span>
              <button
                type="button"
                className={styles.toIconButton}
                onClick={clickableTo ? onGoRecipients : undefined}
                aria-label="Edit recipients"
              >
                <Image src={addPersonIcon} alt="" className={styles.toIconImage} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.selectRecipientsBtn}
              onClick={clickableTo ? onGoRecipients : undefined}
              aria-disabled={!clickableTo}
            >
              Select Recipients
              <Image src={blueChevronLeft} alt="" />
            </button>
          )): null}
        </div>
      </section>

      {mode === "email" ? (
        <section className={styles.subjectSection}>
          <input
            className={styles.subjectInput}
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </section>
      ) : null}

      <div className={styles.messageBox}>
        <section className={styles.messageSectionNew}>
          <div
            ref={editorRef}
            className={styles.richEditor}
            contentEditable
            role="textbox"
            aria-multiline="true"
            data-placeholder="Compose your message..."
            onInput={() => {
              const next = readPlainTextFromEditor();
              isComposingRef.current = true;
              lastSyncedMessageRef.current = next;
              setDraftText(next);
              setMessage(next);
            }}
            onBlur={() => {
              isComposingRef.current = false;
            }}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
              const next = readPlainTextFromEditor();
              lastSyncedMessageRef.current = next;
              setDraftText(next);
              setMessage(next);
            }}
          />
        </section>
      </div>

      <section className={styles.insertSectionNew}>
        <button type="button" className={styles.insertBtnNew} onClick={insertFirstName}>
          <Image src={bluePlus} alt="" />
          Insert First Name
        </button>

        <div className={styles.helper}>
          <Image src={mdiInformation} alt="" className={styles.helperIcon} width={20} height={20} />
          <span className={styles.bottomText}>
            Tap the button to insert a volunteer&apos;s name wherever you want it to appear.
          </span>
        </div>
      </section>

      {!isDesktop ? (
        <div className={styles.reviewFixed}>
          <button
            type="button"
            className={canReview ? styles.reviewBtn : styles.reviewBtnDisabled}
            disabled={!canReview}
            onClick={onGoReview}
          >
            <span className={styles.reviewBtnText}>Review and Send</span>
          </button>
        </div>
      ) : null}
    </>
  );
}

export default function NewMessagePage() {
  const router = useRouter();

  const mode = useTextingFlowStore((s) => s.mode);
  const setMode = useTextingFlowStore((s) => s.setMode);

  const subject = useTextingFlowStore((s) => s.subject);
  const setSubject = useTextingFlowStore((s) => s.setSubject);

  const message = useTextingFlowStore((s) => s.message);
  const setMessage = useTextingFlowStore((s) => s.setMessage);

  const selectedRecipientIds = useTextingFlowStore((s) => s.selectedRecipientIds);
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

  const canReview = useMemo(() => {
    if (recipientsCount === 0) return false;
    const hasMessage = (message || "").trim().length > 0;
    if (!hasMessage) return false;
    if (mode === "email") return (subject || "").trim().length > 0;
    return true;
  }, [mode, recipientsCount, subject, message]);

  const goDashboard = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  const goRecipientsMobile = useCallback(() => {
    router.push("/messages/new/recipients");
  }, [router]);

  const goReview = useCallback(() => {
    router.push("/messages/new/review");
  }, [router]);

  const commonProps = {
    mode,
    setMode,
    subject: subject ?? "",
    setSubject,
    message: message ?? "",
    setMessage,
    recipientsCount,
    canReview,
    isDesktop,
    onGoRecipients: goRecipientsMobile,
    onGoReview: goReview,
  };

  return (
    <Sidebar>
      <div className={styles.page}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backBtn}
            aria-label="Back to dashboard"
            onClick={goDashboard}
          >
            <Image src={icCaretLeft} alt="" className={styles.backIcon} width={24} height={24} />
          </button>
          <h1 className={styles.headerTitle}>New Message</h1>
          <div className={styles.headerRight} />
        </header>

        {!isDesktop ? (
          <main className={styles.content}>
            <Composer {...commonProps} clickableTo />
          </main>
        ) : null}

        {isDesktop ? (
          <main className={styles.desktopMain}>
            <div className={styles.desktopGrid}>
              <aside className={styles.leftPane}>
                <div className={styles.leftScroll}>
                  <RecipientsPanel mode="panel" />
                </div>
              </aside>

              <section className={styles.rightPane}>
                <div className={styles.rightScroll}>
                  <Composer {...commonProps} clickableTo={false} />
                </div>

                <div className={styles.desktopReview}>
                  <button
                    type="button"
                    className={canReview ? styles.reviewBtn : styles.reviewBtnDisabled}
                    disabled={!canReview}
                    onClick={goReview}
                  >
                    <span className={styles.reviewBtnText}>Review and Send</span>
                  </button>
                </div>
              </section>
            </div>
          </main>
        ) : null}
      </div>
    </Sidebar>
  );
}
