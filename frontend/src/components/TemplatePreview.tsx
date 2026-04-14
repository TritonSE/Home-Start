import { Template } from "@/app/api/template";
import styles from "./TemplatePreview.module.css";

type TemplatePreviewType = {
  template: Template;
};

export function TemplatePreview({ template }: TemplatePreviewType) {
  return (
    <div className={styles.content}>
      <div className={styles.text}>
        <div className={styles.title}>{template.title}</div>
        <textarea className={styles.message} readOnly={true} value={template.message} />
      </div>
      <div className={styles.useFixed}>
        <button
          type="button"
          className={styles.useBtn}
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <span className={styles.useBtnText}>Use Template</span>
        </button>
      </div>
    </div>
  );
}
