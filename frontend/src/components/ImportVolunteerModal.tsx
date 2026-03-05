import { useState } from "react";
import styles from "./ImportVolunteerModal.module.css";
import { parseVolunteersCsv, uploadVolunteerBatch } from "@/app/api/volunteer";

type ImportVolunteerModalProps = {
  onClose: () => void;
  onComplete: () => void;
};

type Status = "idle" | "error" | "success";
type Step = "upload" | "review";

type ParsedVolunteerChange = {
  status: "New" | "Updated";
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  tags?: string[];
};

type ParsedCSVResult = {
  newCount: number;
  updatedCount: number;
  changes: ParsedVolunteerChange[];
};

export default function ImportVolunteerModal({ onClose, onComplete }: ImportVolunteerModalProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("upload");
  const [csvParsedInfo, setCSVParsedInfo] = useState<ParsedCSVResult | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    parseVolunteersCsv(file).then((result) => {
      if (!result.ok) {
        setStatus("error");
        return;
      }

      const data = {
        newCount: result.data.wouldCreateCount,
        updatedCount: result.data.wouldUpdateCount,
        changes: [
          ...result.data.volunteerInfo.map((volunteer) => ({
            status: result.data.wouldCreate.includes(volunteer.email) ? "New" : "Updated",
            firstName: volunteer.firstName,
            lastName: volunteer.lastName,
            email: volunteer.email,
            phoneNumber: volunteer.phoneNumber,
            tags: volunteer.tags,
          })),
        ] as ParsedVolunteerChange[],
      } as ParsedCSVResult;

      setCSVParsedInfo(data);
    });

    setStatus("success");
  }

  async function handleContinue() {
    if (step === "upload" && status === "success") {
      setStep("review");
      return;
    }

    if (!csvParsedInfo) return;
    await uploadVolunteerBatch(
      csvParsedInfo.changes.map((change) => ({
        firstName: change.firstName,
        lastName: change.lastName,
        email: change.email,
        phoneNumber: change.phoneNumber,
        tags: change.tags,
      })),
    );

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
            </>
          )}

          {isReview && (
            <>
              <div className={styles.summaryRow}>
                <div className={`${styles.summaryCard} ${styles.summaryCardNew}`}>
                  <div className={styles.summaryHeader}>
                    <img src="/ic_success.svg" className={styles.summaryIcon} />
                    <span>New Volunteers</span>
                  </div>
                  <div className={styles.summaryCount}>{csvParsedInfo?.newCount || 0}</div>
                </div>
                <div className={`${styles.summaryCard} ${styles.summaryCardUpdated}`}>
                  <div className={styles.summaryHeader}>
                    <img src="/ic_new.svg" className={styles.summaryIcon} />
                    <span>Updated Volunteers</span>
                  </div>
                  <div className={styles.summaryCount}>{csvParsedInfo?.updatedCount || 0}</div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.sectionTitle}>Detailed Changes</div>
                <div className={styles.detailCard}>
                  <div className={styles.detailList}>
                    {csvParsedInfo?.changes?.map((change, index) => (
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
                          <span className={styles.detailName}>
                            {change.firstName} {change.lastName}
                          </span>
                        </div>
                        <div className={styles.detailMeta}>Email: {change.email}</div>
                        <div className={styles.detailMeta}>Phone: {change.phoneNumber}</div>
                        {index < (csvParsedInfo?.changes.length || 0) - 1 && (
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
