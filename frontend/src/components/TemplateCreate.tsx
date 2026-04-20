import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import styles from "./TemplateCreate.module.css";

import { TemplateType } from "@/app/api/template";
import bluePlusAsset from "@/assets/blue_plus.svg";
import mdiInfoAsset from "@/assets/mdi_information.svg";

const bluePlus = bluePlusAsset as string;
const mdiInfo = mdiInfoAsset as string;

type TemplateCreateProps = {
  onSave: (title: string, message: string, type: TemplateType, subject: string) => void;
  title: string;
  message: string;
  type: TemplateType;
  subject?: string;
};

export function TemplateCreate({ onSave, title, message, subject, type }: TemplateCreateProps) {
  const [currTitle, setCurrTitle] = useState<string>(title);
  const [currMessage, setCurrMessage] = useState<string>(message);
  const [currSubject, setCurrSubject] = useState<string>(subject ?? "");
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const insertText = (text: string) => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newValue = currMessage.substring(0, start) + text + currMessage.substring(end);

    setCurrMessage(newValue);

    // restore cursor
    setTimeout(() => {
      const newPos = start + text.length;
      textarea.selectionStart = newPos;
      textarea.selectionEnd = newPos;
    }, 0);
  };

  return (
    <div className={styles.content}>
      <form className={styles.form}>
        <div className={styles.inputGroup}>
          <p className={styles.label}>Enter Title of Template</p>
          <input
            className={styles.titleTextBox}
            placeholder="Template title"
            value={currTitle}
            onChange={(e) => {
              setCurrTitle(e.target.value);
            }}
          />
          <p className={styles.characterLimit}>{currTitle.length}/50 Characters</p>
          {type === TemplateType.EMAIL && (
            <>
              <input
                className={styles.titleTextBox}
                placeholder="Subject Line"
                value={currSubject}
                onChange={(e) => {
                  setCurrSubject(e.target.value);
                }}
              />
              <p className={styles.characterLimit}>{currTitle.length}/50 Characters</p>
            </>
          )}
        </div>

        <div className={styles.inputGroup}>
          <p className={styles.label}>Message</p>
          <textarea
            className={styles.messageTextBox}
            ref={inputRef}
            placeholder="Compose your message..."
            value={currMessage}
            onChange={(e) => {
              setCurrMessage(e.target.value);
            }}
          />
          <p className={styles.characterLimit}>{currMessage.length}/1000 Characters</p>
        </div>
        <div className={styles.insertSectionNew}>
          <button
            type="button"
            className={styles.insertBtnNew}
            onClick={() => {
              insertText("[First Name]");
            }}
          >
            <Image src={bluePlus} alt="" width={16} height={16} />
            Insert First Name
          </button>

          <div className={styles.helper}>
            <Image src={mdiInfo} alt="" className={styles.helperIcon} width={16} height={16} />
            <span className={styles.bottomText}>
              Tap the button to insert a volunteer{"'"}s name wherever you want it to appear.
            </span>
          </div>
        </div>
        <div className={styles.saveFixed}>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={(e) => {
              e.preventDefault();
              onSave(currTitle, currMessage, type, currSubject);
            }}
          >
            <span className={styles.saveBtnText}>Save</span>
          </button>
        </div>
      </form>
    </div>
  );
}
