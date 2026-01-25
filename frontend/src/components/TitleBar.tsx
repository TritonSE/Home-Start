import styles from "./TitleBar.module.css";
import ImportButton from "./ImportButton";
import ExportButton from "./ExportButton";

export default function TitleBar() {
  return (
    <div className={styles.titleBar}>
      <label className={styles.volunteers}> Volunteers </label>
      <div className={styles.importExportButtons}>
        <ExportButton />
        <ImportButton />
      </div>
    </div>
  );
}
