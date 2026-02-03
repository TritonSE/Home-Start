import styles from "./TitleBar.module.css";
import ImportButton from "./ImportButton";
import ExportButton from "./ExportButton";
import ImportVolunteerModal from "./ImportVolunteerModal";
import { useState } from "react";

export default function TitleBar() {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.titleBar}>
      <label className={styles.volunteers}> Volunteers </label>
      <div className={styles.importExportButtons}>
        <ExportButton />
        <ImportButton onClick={() => setOpen(true)} />
        {open && <ImportVolunteerModal onClose={() => setOpen(false)} />}
      </div>
    </div>
  );
}
