import { useState } from "react";
import styles from "./ImportVolunteerModal.module.css";

type ImportVolunteerModalProps = {
  onClose: () => void;
};

type Status = "idle" | "error" | "success";

export default function ImportVolunteerModal({ onClose }: ImportVolunteerModalProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (!file.name.endsWith(".csv")) {
      setStatus("error");
      return;
    }

    setStatus("success");
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Import Volunteer Matrix</h2>
          <button className={styles.close} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.step}>
          <div className={styles.stepItem}>
            <div className={styles.stepCircleActive}>1</div>
            <div className={styles.stepLabelActive}>Upload</div>
          </div>
          <span>→</span>
          <div className={styles.stepItem}>
            <div className={styles.stepCircleInactive}>2</div>
            <div className={styles.stepLabelInactive}>Review</div>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.sectionTitle}>Upload CSV File</div>

          {status === "idle" && (
            <>
              <label className={styles.uploadBox}>
                <input type="file" accept=".csv" hidden onChange={handleFileChange} />
                <div className={styles.uploadContent}>
                  <img src="/upload.svg" className={styles.uploadIcon} />
                  <div className={styles.uploadText}>
                    Drag and drop your CSV file here, or click to browse
                  </div>
                  <div className={styles.uploadSubtext}>Supported format: CSV Only</div>
                </div>
              </label>

              <div className={styles.warning}>
                <img src="/ic_warning.svg" className={styles.warningIcon} />
                <div>Make sure the CSV is in this order: Name, Phone Number, Email, etc.</div>
              </div>
            </>
          )}

          {status === "error" && (
            <div className={`${styles.uploadBox} ${styles.uploadBoxError}`}>
              <div className={styles.uploadContent}>
                <img src="/ic_error.svg" className={styles.errorIcon} />
                <div className={styles.errorText}>Unsupported file uploaded</div>
                <div className={styles.uploadSubtext}>
                  Make sure the headers for the CSV are correct!
                </div>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className={`${styles.uploadBox} ${styles.uploadBoxSuccess}`}>
              <div className={styles.uploadContent}>
                <img src="/ic_success.svg" className={styles.successIcon} />
                <div className={styles.successText}>{fileName} successfully uploaded</div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancel} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.continue} disabled={status !== "success"}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
