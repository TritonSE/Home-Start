import { useState } from "react";
import styles from "./ImportVolunteerModal.module.css";
import Image from "next/image";

type ImportVolunteerModalProps = {
  onClose: () => void;
  onComplete: () => void;
};

type Status = "idle" | "error" | "success";
type Step = "upload" | "review";

type PlaceholderChange = {
  status: "New" | "Updated";
  name: string;
  email: string;
  phone: string;
};

export default function ImportVolunteerModal({ onClose, onComplete }: ImportVolunteerModalProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("upload");

  // Placeholder data until CSV processing is implemented.
  const placeholderReview = {
    newCount: 24,
    updatedCount: 10,
    changes: [
      {
        status: "New",
        name: "William, Seymore",
        email: "wseymore@gmail.com",
        phone: "720-672-8098",
      },
      {
        status: "New",
        name: "Kaya, Toast",
        email: "kayatoast@gmail.com",
        phone: "830-298-9085",
      },
      {
        status: "Updated",
        name: "Mariana, Lee",
        email: "mariana.lee@gmail.com",
        phone: "415-555-2452",
      },
    ] as PlaceholderChange[],
  };

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

  function handleContinue() {
    if (step === "upload" && status === "success") {
      setStep("review");
      return;
    }

    onComplete();
    onClose();
  }

  const isContinueDisabled = step === "upload" && status !== "success";
  const isReview = step === "review";

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
            <div className={isReview ? styles.stepCircleInactive : styles.stepCircleActive}>1</div>
            <div className={isReview ? styles.stepLabelInactive : styles.stepLabelActive}>
              Upload
            </div>
          </div>
          <span>→</span>
          <div className={styles.stepItem}>
            <div className={isReview ? styles.stepCircleActive : styles.stepCircleInactive}>2</div>
            <div className={isReview ? styles.stepLabelActive : styles.stepLabelInactive}>
              Review
            </div>
          </div>
        </div>

        <div className={styles.body}>
          {!isReview && (
            <>
              <div className={styles.sectionTitle}>Upload CSV File</div>

              {status === "idle" && (
                <>
                  <label className={styles.uploadBox}>
                    <input type="file" accept=".csv" hidden onChange={handleFileChange} />
                    <div className={styles.uploadContent}>
                      <Image
                        src="/upload.svg"
                        alt="Upload icon"
                        className={styles.uploadIcon}
                        width={24}
                        height={24}
                      />
                      <div className={styles.uploadText}>
                        Drag and drop your CSV file here, or click to browse
                      </div>
                      <div className={styles.uploadSubtext}>Supported format: CSV Only</div>
                    </div>
                  </label>

                  <div className={styles.warning}>
                    <Image
                      src="/ic_warning.svg"
                      alt="Warning icon"
                      className={styles.warningIcon}
                      width={24}
                      height={24}
                    />
                    <div>Make sure the CSV is in this order: Name, Phone Number, Email, etc.</div>
                  </div>
                </>
              )}

              {status === "error" && (
                <div className={`${styles.uploadBox} ${styles.uploadBoxError}`}>
                  <div className={styles.uploadContent}>
                    <Image
                      src="/ic_error.svg"
                      alt="Error icon"
                      className={styles.errorIcon}
                      width={24}
                      height={24}
                    />
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
                    <Image
                      src="/ic_success.svg"
                      alt="Success icon"
                      className={styles.successIcon}
                      width={24}
                      height={24}
                    />
                    <div className={styles.successText}>{fileName} successfully uploaded</div>
                  </div>
                </div>
              )}
            </>
          )}

          {isReview && (
            <>
              <div className={styles.summaryRow}>
                <div className={`${styles.summaryCard} ${styles.summaryCardNew}`}>
                  <div className={styles.summaryHeader}>
                    <Image
                      src="/ic_success.svg"
                      alt="Success icon"
                      className={styles.summaryIcon}
                      width={24}
                      height={24}
                    />
                    <span>New Volunteers</span>
                  </div>
                  <div className={styles.summaryCount}>{placeholderReview.newCount}</div>
                </div>
                <div className={`${styles.summaryCard} ${styles.summaryCardUpdated}`}>
                  <div className={styles.summaryHeader}>
                    <Image
                      src="/ic_new.svg"
                      alt="New icon"
                      className={styles.summaryIcon}
                      width={24}
                      height={24}
                    />
                    <span>Updated Volunteers</span>
                  </div>
                  <div className={styles.summaryCount}>{placeholderReview.updatedCount}</div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.sectionTitle}>Detailed Changes</div>
                <div className={styles.detailCard}>
                  <div className={styles.detailList}>
                    {placeholderReview.changes.map((change, index) => (
                      <div key={`${change.email}-${index}`} className={styles.detailItem}>
                        <div className={styles.detailHeader}>
                          <span
                            className={`${styles.detailBadge} ${
                              change.status === "New"
                                ? styles.detailBadgeNew
                                : styles.detailBadgeUpdated
                            }`}
                          >
                            {change.status}
                          </span>
                          <span className={styles.detailName}>{change.name}</span>
                        </div>
                        <div className={styles.detailMeta}>Email: {change.email}</div>
                        <div className={styles.detailMeta}>Phone: {change.phone}</div>
                        {index < placeholderReview.changes.length - 1 && (
                          <div className={styles.detailDivider} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancel} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.continue}
            disabled={isContinueDisabled}
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
