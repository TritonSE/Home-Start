import { useState } from "react";

import ExportButton from "./ExportButton";
import ImportButton from "./ImportButton";
import ImportVolunteerModal from "./ImportVolunteerModal";
import styles from "./TitleBar.module.css";

type TitleBarProps = {
  onImportComplete: () => void;
};

export default function TitleBar({ onImportComplete }: TitleBarProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.titleBar}>
      <label className={styles.volunteers}> Volunteers </label>
      <div className={styles.importExportButtons}>
        <ExportButton />
        <ImportButton onClick={() => setOpen(true)} />
        {open && (
          <ImportVolunteerModal onClose={() => setOpen(false)} onComplete={onImportComplete} />
        )}
      </div>
    </div>
  );
}
