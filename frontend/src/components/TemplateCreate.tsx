import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import styles from "./TemplateCreate.module.css";

import { getTemplate } from "@/app/api/template";
import bluePlusAsset from "@/assets/bluePlus.svg";
import mdiInformationAsset from "@/assets/mdi_information.svg";

const bluePlus = bluePlusAsset as string;
const mdiInformation = mdiInformationAsset as string;

type TemplateCreateProps = {
  onSave: (title: string, message: string, type: string) => void;
  templateId?: string;
};

export function TemplateCreate({ onSave, templateId }: TemplateCreateProps) {
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!templateId) return;

    getTemplate(templateId)
      .then((result) => {
        if (result.success) {
          const template = result.data;
          setTitle(template.title);
          setMessage(template.message);
        } else {
          console.error(result.error);
        }
      })
      .catch((reason) => console.error(reason));
  }, [templateId]);

  const insertText = (text: string) => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newValue = message.substring(0, start) + text + message.substring(end);

    setMessage(newValue);

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
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
          <p className={styles.characterLimit}>{title.length}/50 Characters</p>
        </div>
        <div className={styles.inputGroup}>
          <p className={styles.label}>Message</p>
          <textarea
            className={styles.messageTextBox}
            ref={inputRef}
            placeholder="Compose your message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          />
          <p className={styles.characterLimit}>{message.length}/1000 Characters</p>
        </div>
        <div className={styles.insertSectionNew}>
          <button
            type="button"
            className={styles.insertBtnNew}
            onClick={() => {
              insertText("[First Name]");
            }}
          >
            <Image src={bluePlus} alt="" width={20} height={20} />
            Insert First Name
          </button>

          <div className={styles.helper}>
            <Image
              src={mdiInformation}
              alt=""
              className={styles.helperIcon}
              width={20}
              height={20}
            />
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
              onSave(title, message, "text");
            }}
          >
            <span className={styles.saveBtnText}>Save</span>
          </button>
        </div>
      </form>
    </div>
  );
}
