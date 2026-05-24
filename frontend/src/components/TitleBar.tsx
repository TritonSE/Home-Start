import { useState } from "react";

import ExportButton from "./ExportButton";
import ImportButton from "./ImportButton";
import ImportVolunteerModal from "./ImportVolunteerModal";
import styles from "./TitleBar.module.css";

import type { VolunteerWithTags } from "@/types/volunteer";

type TitleBarProps = {
  onImportComplete: () => void;
  selectedVolunteers: VolunteerWithTags[];
};

export default function TitleBar({ onImportComplete, selectedVolunteers }: TitleBarProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.titleBar}>
      <label className={styles.volunteers}> Volunteers </label>
      <div className={styles.importExportButtons}>
        <ExportButton selectedVolunteers={selectedVolunteers} />
        <ImportButton onClick={() => setOpen(true)} />
        {open && (
          <ImportVolunteerModal onClose={() => setOpen(false)} onComplete={onImportComplete} />
        )}
      </div>
    </div>
  );
}
