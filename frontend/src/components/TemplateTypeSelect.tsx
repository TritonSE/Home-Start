import styles from "./TemplateTypeSelect.module.css";

import { TemplateType } from "@/app/api/template";

type TemplateTypeSelectProps = {
  type: TemplateType;
  selectText: () => void;
  selectEmail: () => void;
};

export function TemplateTypeSelect({ type, selectText, selectEmail }: TemplateTypeSelectProps) {
  return (
    <div className={styles.tabs}>
      <div
        className={`${styles.tab} ${type === TemplateType.TEXT ? styles.selected : styles.notSelected}`}
        onClick={selectText}
      >
        Text
      </div>
      <div
        className={`${styles.tab} ${type === TemplateType.EMAIL ? styles.selected : styles.notSelected}`}
        onClick={selectEmail}
      >
        Email
      </div>
    </div>
  );
}
