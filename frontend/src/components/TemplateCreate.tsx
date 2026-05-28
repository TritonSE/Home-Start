import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./TemplateCreate.module.css";

import { TemplateType } from "@/app/api/template";
import bluePlusAsset from "@/assets/blue_plus.svg";
import infoAsset from "@/assets/mdi_information.svg";

const bluePlus = bluePlusAsset as string;
const infoIcon = infoAsset as string;

type TemplateCreateProps = {
  onSave: (title: string, message: string, type: TemplateType, subject: string) => void;
  title: string;
  message: string;
  type: TemplateType;
  subject?: string;
};

const MAX_TITLE_LEN = 50;
const MAX_SUBJECT_LEN = 50;
const MAX_MESSAGE_LEN = 1000;
const FIRST_NAME_TOKEN = "{{First Name}}";

function tokenTextToHtml(text: string, pillClass: string) {
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const withPill = escaped.replaceAll(
    FIRST_NAME_TOKEN,
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

export function TemplateCreate({ onSave, title, message, subject, type }: TemplateCreateProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isComposingRef = useRef(false);
  const lastSyncedMessageRef = useRef(message);
  const initializedRef = useRef(false);

  const [currTitle, setCurrTitle] = useState<string>(title);
  const [currMessage, setCurrMessage] = useState<string>(message);
  const [currSubject, setCurrSubject] = useState<string>(subject ?? "");

  useEffect(() => {
    setCurrTitle(title);
  }, [title]);
  useEffect(() => {
    setCurrMessage(message);
  }, [message]);
  useEffect(() => {
    if (type === TemplateType.EMAIL) {
      setCurrSubject(subject ?? "");
    } else {
      setCurrSubject("");
    }
  }, [subject, type]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    if (!initializedRef.current) {
      el.innerHTML = tokenTextToHtml(currMessage, styles.pill);
      initializedRef.current = true;
      lastSyncedMessageRef.current = currMessage;
      return;
    }

    if (isComposingRef.current) return;
    if (lastSyncedMessageRef.current === currMessage) return;

    el.innerHTML = tokenTextToHtml(currMessage, styles.pill);
    lastSyncedMessageRef.current = currMessage;
  }, [currMessage]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // const finalMessage = currMessage.replaceAll(FIRST_NAME_TOKEN, "[First name]");
    onSave(currTitle, currMessage, type, currSubject);
  };

  const readPlainTextFromEditor = useCallback(() => {
    const el = editorRef.current;
    if (!el) return "";
    const clone = el.cloneNode(true) as HTMLElement;

    clone.querySelectorAll(`.${styles.pill}`).forEach((node) => {
      node.replaceWith(document.createTextNode(FIRST_NAME_TOKEN));
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
      setCurrMessage(next);
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
    setCurrMessage(next);
  };

  return (
    <div className={styles.content}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <input
            className={styles.titleTextBox}
            placeholder="Enter template title"
            value={currTitle}
            onChange={(e) => {
              setCurrTitle(e.target.value);
            }}
            maxLength={MAX_TITLE_LEN}
            required
          />
          <p className={styles.characterLimit}>
            {currTitle.length}/{MAX_TITLE_LEN} Characters
          </p>
          {type === TemplateType.EMAIL && (
            <>
              <input
                className={styles.titleTextBox}
                placeholder="Enter email Line"
                value={currSubject}
                onChange={(e) => {
                  setCurrSubject(e.target.value);
                }}
                maxLength={MAX_SUBJECT_LEN}
                required
              />
              <p className={styles.characterLimit}>
                {currSubject.length}/{MAX_SUBJECT_LEN} Characters
              </p>
            </>
          )}
        </div>

        <div className={styles.inputGroup}>
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
              setCurrMessage(next);
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
              setCurrMessage(next);
            }}
          />
          <p className={styles.characterLimit}>
            {currMessage.length}/{MAX_MESSAGE_LEN} Characters
          </p>
        </div>
        <div className={styles.insertSectionNew}>
          <button type="button" className={styles.insertBtnNew} onClick={insertFirstName}>
            <Image src={bluePlus} alt="" width={20} height={20} />
            Insert First Name
          </button>

          <div className={styles.helper}>
            <Image src={infoIcon} alt="" className={styles.helperIcon} width={20} height={20} />
            <span className={styles.bottomText}>
              Tap the button to insert a volunteer{"'"}s name wherever you want it to appear.
            </span>
          </div>
        </div>
        <div className={styles.saveFixed}>
          <button type="submit" className={styles.saveBtn}>
            <span className={styles.saveBtnText}>Save</span>
          </button>
        </div>
      </form>
    </div>
  );
}
