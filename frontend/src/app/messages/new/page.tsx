"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useTextingFlowStore } from "./_store/textingFlowStore";
import icCaretLeft from "../../../../public/ic_caretleft.svg";
import blueChevronLeft from "../../../../public/blue_chevron_left.svg";
import bluePlus from "../../../../public/blue_plus.svg";
import Image from "next/image";
import Sidebar from "../../components/sidebar";

const TOKEN = "{{First Name}}";

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

  const [draftText, setDraftText] = useState(message ?? "");

  const editorRef = useRef<HTMLDivElement | null>(null);

  function tokenTextToHtml(text: string) {
    const escaped = text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

    const withPill = escaped.replaceAll(
      TOKEN,
      `<span class="${styles.pill}" contenteditable="false">First Name</span>`,
    );

    return withPill.replaceAll("\n", "<br/>");
  }

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    if ((el.innerHTML ?? "").trim() !== "") return;

    el.innerHTML = tokenTextToHtml(message ?? "");
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

  const canReview = useMemo(() => {
    if (recipientsCount === 0) return false;

    const hasMessage = (draftText || "").trim().length > 0;
    if (!hasMessage) return false;

    if (mode === "email") {
      return (subject || "").trim().length > 0;
    }
    return true;
  }, [mode, recipientsCount, subject, draftText]);

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
  };

  return (
    <Sidebar>
      <div className={styles.page}>
        <header className={styles.header}>
          <Image src={icCaretLeft} alt="" />
          <h1 className={styles.headerTitle}>New Message</h1>
          <div></div>
        </header>

        <main className={styles.content}>
          {/* Tabs */}
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

          {/* To row (new design) */}
          <section className={styles.toSectionNew}>
            <div className={styles.toRowNew}>
              <span className={styles.toLabelNew}>To:</span>

              <button
                type="button"
                className={styles.selectRecipientsBtn}
                onClick={() => {
                  setMessage(readPlainTextFromEditor());
                  router.push("/messages/new/recipients");
                }}
              >
                {recipientsCount > 0 ? `${recipientsCount} selected` : "Select Recipients"}
                <Image src={blueChevronLeft} alt="" />
              </button>
            </div>
          </section>

          {/* Subject (Email only) */}
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

          {/* Message */}
          <div className={styles.messageBox}>
            <section className={styles.messageSectionNew}>
              <div
                ref={editorRef}
                className={styles.richEditor}
                contentEditable
                role="textbox"
                aria-multiline="true"
                data-placeholder="Compose your message..."
                onInput={() => setDraftText(editorRef.current?.innerText ?? "")}
              />
            </section>
          </div>

          {/* Insert First Name */}
          <section className={styles.insertSectionNew}>
            <button type="button" className={styles.insertBtnNew} onClick={insertFirstName}>
              <Image src={bluePlus} alt="" />
              Insert First Name
            </button>

            <div className={styles.helper}>
              <img src="/mdi_information.svg" alt="" className={styles.helperIcon} />
              <span className={styles.bottomText}>
                Tap the button to insert a volunteer’s name wherever you want it to appear.
              </span>
            </div>
          </section>
          <div className={styles.reviewFixed}>
            <button
              type="button"
              className={canReview ? styles.reviewBtn : styles.reviewBtnDisabled}
              disabled={!canReview}
              onClick={() => {
                setMessage(readPlainTextFromEditor());
                router.push("/messages/new/review");
              }}
            >
              <span className={styles.reviewBtnText}>Review and Send</span>
            </button>
          </div>
        </main>
      </div>
    </Sidebar>
  );
}
