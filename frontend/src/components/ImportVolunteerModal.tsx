import Image from "next/image";
import { useState } from "react";

import styles from "./ImportVolunteerModal.module.css";
import Modal from "./Modal";

import { parseVolunteersCsv, uploadVolunteerBatch } from "@/app/api/volunteer";
import icErrorAsset from "@/assets/icError.svg";
import icNewAsset from "@/assets/icNew.svg";
import icSuccessAsset from "@/assets/icSuccess.svg";
import icWarningAsset from "@/assets/icWarning.svg";
import uploadIconAsset from "@/assets/upload.svg";

const icError = icErrorAsset as string;
const icNew = icNewAsset as string;
const icSuccess = icSuccessAsset as string;
const icWarning = icWarningAsset as string;
const uploadIcon = uploadIconAsset as string;

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
  assignmentName?: string;
  projectName?: string;
  shiftNames?: string[];
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
  const [isDragging, setIsDragging] = useState(false);

  const [csvParsedInfo, setCSVParsedInfo] = useState<ParsedCSVResult | null>(null);

  async function processUploadedFile(file: File): Promise<void> {
    setFileName(file.name);
    setStatus("idle");

    try {
      const result = await parseVolunteersCsv(file);
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
            assignmentName: volunteer.assignmentName,
            projectName: volunteer.projectName,
            shiftNames: volunteer.shiftNames,
            tags: volunteer.tags,
          })),
        ] as ParsedVolunteerChange[],
      } as ParsedCSVResult;

      setCSVParsedInfo(data);
      setStatus("success");
    } catch (_error) {
      setStatus("error");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    void processUploadedFile(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    void processUploadedFile(file);
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
        assignmentName: change.assignmentName,
        projectName: change.projectName,
        shiftNames: change.shiftNames,
        tags: change.tags,
      })),
    );

    onComplete();
    onClose();
  }

  const isContinueDisabled = step === "upload" && status !== "success";
  const isReview = step === "review";

  return (
    <Modal
      onClose={onClose}
      width="1050px"
      radius="12px"
      title="Import Volunteer Matrix"
      titleFontSize="32px"
      titleLineHeight={40}
      padding="28px"
    >
      <div className={styles.step}>
        <div className={styles.stepItem}>
          <div className={isReview ? styles.stepCircleInactive : styles.stepCircleActive}>1</div>
          <div className={isReview ? styles.stepLabelInactive : styles.stepLabelActive}>Upload</div>
        </div>
        <span>→</span>
        <div className={styles.stepItem}>
          <div className={isReview ? styles.stepCircleActive : styles.stepCircleInactive}>2</div>
          <div className={isReview ? styles.stepLabelActive : styles.stepLabelInactive}>Review</div>
        </div>
      </div>

      <div className={styles.body}>
        {!isReview && (
          <>
            <div className={styles.sectionTitle}>Upload CSV File</div>

            {status === "idle" && (
              <>
                <label
                  className={`${styles.uploadBox} ${isDragging ? styles.uploadBoxDragging : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input type="file" accept=".csv" hidden onChange={handleFileChange} />
                  <div className={styles.uploadContent}>
                    <Image
                      src={uploadIcon}
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
                    src={icWarning}
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
                    src={icError}
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
                    src={icSuccess}
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
                    src={icSuccess}
                    alt="Success icon"
                    className={styles.summaryIcon}
                    width={24}
                    height={24}
                  />
                  <span>New Volunteers</span>
                </div>
                <div className={styles.summaryCount}>{csvParsedInfo?.newCount || 0}</div>
              </div>
              <div className={`${styles.summaryCard} ${styles.summaryCardUpdated}`}>
                <div className={styles.summaryHeader}>
                  <Image
                    src={icNew}
                    alt="New icon"
                    className={styles.summaryIcon}
                    width={24}
                    height={24}
                  />
                  <span>Updated Volunteers</span>
                </div>
                <div className={styles.summaryCount}>{csvParsedInfo?.updatedCount || 0}</div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.sectionTitle} style={{ marginLeft: "16px" }}>
                Detailed Changes
              </div>
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
                      {change.assignmentName && (
                        <div className={styles.detailMeta}>Assignment: {change.assignmentName}</div>
                      )}
                      {change.projectName && (
                        <div className={styles.detailMeta}>Project: {change.projectName}</div>
                      )}
                      {change.shiftNames && change.shiftNames.length > 0 && (
                        <div className={styles.detailMeta}>
                          Shifts: {change.shiftNames.join(", ")}
                        </div>
                      )}
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
          onClick={() => {
            void handleContinue();
          }}
        >
          Continue
        </button>
      </div>
    </Modal>
  );
}
