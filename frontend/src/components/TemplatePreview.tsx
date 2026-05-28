import { useEffect, useRef } from "react";

import styles from "./TemplatePreview.module.css";

import { type Template, TemplateType } from "@/app/api/template";
import { useTextingFlowStore } from "@/app/messages/new/_store/textingFlowStore";

type TemplatePreviewType = {
  template: Template;
  onUse: () => void;
};

const TOKEN = "{{First Name}}";

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

export function TemplatePreview({ template, onUse }: TemplatePreviewType) {
  const messageRef = useRef<HTMLDivElement | null>(null);
  const setMode = useTextingFlowStore((s) => s.setMode);
  const setSubject = useTextingFlowStore((s) => s.setSubject);
  const setMessage = useTextingFlowStore((s) => s.setMessage);

  useEffect(() => {
    const el = messageRef.current;
    if (!el) return;

    el.innerHTML = tokenTextToHtml(template.message, styles.pill);
  }, [template.message]);

  return (
    <div className={styles.content}>
      <div className={styles.text}>
        <div className={styles.title}>{template.title}</div>
        {template?.subject && <div className={styles.subject}>Subject: {template.subject}</div>}
        <div ref={messageRef} className={styles.message} />
      </div>
      <div className={styles.useFixed}>
        <button
          type="button"
          className={styles.useBtn}
          onClick={(e) => {
            e.preventDefault();
            setMode(template.type);
            setMessage(template.message);
            if (template.subject && template.type === TemplateType.EMAIL) {
              setSubject(template.subject);
            }
            onUse();
          }}
        >
          <span className={styles.useBtnText}>Use Template</span>
        </button>
      </div>
    </div>
  );
}
