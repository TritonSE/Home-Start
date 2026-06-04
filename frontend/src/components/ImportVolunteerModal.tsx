import Image from "next/image";
import { useState } from "react";

import { getAutoTagColor } from "@/components/colorOptions";
import styles from "./ImportVolunteerModal.module.css";
import Pagination from "./messages/pagination";
import Modal from "./Modal";

import type { VolunteerCsvParseResult } from "@/app/api/volunteer";

import { parseVolunteersCsv, uploadVolunteerBatch } from "@/app/api/volunteer";
import icErrorAsset from "@/assets/ic_error.svg";
import icNewAsset from "@/assets/ic_new.svg";
import icSuccessAsset from "@/assets/ic_success.svg";
import icWarningAsset from "@/assets/ic_warning.svg";
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

const ITEMS_PER_PAGE = 10;

type Status = "idle" | "error" | "success" | "processing";
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
};

type AssignmentGroup = {
  assignmentName: string | null;
  shiftNames: string[];
  volunteers: ParsedVolunteerChange[];
};

type ProjectGroup = {
  projectName: string | null;
  assignments: AssignmentGroup[];
};

type ParsedCSVResult = {
  newCount: number;
  updatedCount: number;
  changes: ParsedVolunteerChange[];
  uniqueVolunteers: ParsedVolunteerChange[];
  missingTags: { name: string; type: "assignment" | "project" | "shift" | "program" | "group" }[];
  projectGroups: ProjectGroup[];
};

export default function ImportVolunteerModal({ onClose, onComplete }: ImportVolunteerModalProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("upload");
  const [isDragging, setIsDragging] = useState(false);

  const [csvParsedInfo, setCSVParsedInfo] = useState<ParsedCSVResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingBatch, setPendingBatch] = useState<VolunteerCsvParseResult["volunteerInfo"]>([]);
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
  const [volunteersCollapsed, setVolunteersCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleProject(key: string) {
    setCollapsedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function processUploadedFile(file: File): Promise<void> {
    setFileName(file.name);
    setStatus("idle");

    try {
      setStatus("processing");
      const result = await parseVolunteersCsv(file);
      if (!result.ok) {
        setErrorMessage(result.error);
        setStatus("error");
        return;
      }

      const wouldCreateSet = new Set(result.data.wouldCreate);

      const changes: ParsedVolunteerChange[] = result.data.volunteerInfo.map((v) => ({
        status: wouldCreateSet.has(v.email) ? "New" : "Updated",
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        phoneNumber: v.phoneNumber,
        assignmentName: v.assignmentName,
        projectName: v.projectName,
        shiftNames: v.shiftNames,
      }));

      const projectMap = new Map<
        string,
        Map<string, { shiftNames: Set<string>; volunteers: ParsedVolunteerChange[] }>
      >();
      for (const change of changes) {
        const pk = change.projectName ?? "__none__";
        const ak = change.assignmentName ?? "__none__";
        if (!projectMap.has(pk)) projectMap.set(pk, new Map());
        const aMap = projectMap.get(pk)!;
        if (!aMap.has(ak)) aMap.set(ak, { shiftNames: new Set(), volunteers: [] });
        const entry = aMap.get(ak)!;
        entry.volunteers.push(change);
        for (const shift of change.shiftNames ?? []) entry.shiftNames.add(shift);
      }

      const projectGroups: ProjectGroup[] = [...projectMap.entries()]
        .map(([pk, aMap]) => ({
          projectName: pk === "__none__" ? null : pk,
          assignments: [...aMap.entries()].map(([ak, entry]) => ({
            assignmentName: ak === "__none__" ? null : ak,
            shiftNames: [...entry.shiftNames],
            volunteers: entry.volunteers,
          })),
        }))
        .sort((a, b) => {
          if (a.projectName === null) return 1;
          if (b.projectName === null) return -1;
          return a.projectName.localeCompare(b.projectName);
        });

      const uniqueVolunteers = [...new Map(changes.map((c) => [c.email, c])).values()];

      const data: ParsedCSVResult = {
        newCount: result.data.wouldCreateCount,
        updatedCount: result.data.wouldUpdateCount,
        changes,
        uniqueVolunteers,
        missingTags: result.data.missingTags,
        projectGroups,
      };

      setCollapsedProjects(new Set(projectGroups.map((g) => g.projectName ?? "__none__")));
      setCurrentPage(1);
      setVolunteersCollapsed(false);
      setPendingBatch(result.data.volunteerInfo);
      setCSVParsedInfo(data);
      setStatus("success");
    } catch (_error) {
      setErrorMessage(_error instanceof Error ? _error.message : "An unexpected error occurred");
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
    setIsSubmitting(true);
    try {
      await uploadVolunteerBatch(
        pendingBatch.map((v) => ({
          firstName: v.firstName,
          lastName: v.lastName,
          email: v.email,
          phoneNumber: v.phoneNumber,
          status: v.status as "returning" | "new" | undefined,
          address: v.address,
          birthday: v.birthday,
          preferredPronouns: v.preferredPronouns,
          startDate: v.startDate,
          endDate: v.endDate,
          effectiveDate: v.effectiveDate,
          mediaConsent: v.mediaConsent,
          faceConsent: v.faceConsent,
          nameConsent: v.nameConsent,
          assignmentName: v.assignmentName,
          projectName: v.projectName,
          shiftNames: v.shiftNames,
          programNames: v.programNames,
          groupNames: v.groupNames,
        })),
        csvParsedInfo.missingTags.map((t) => ({
          name: t.name,
          type: t.type,
          color: getAutoTagColor(t.name, t.type),
        })),
      );
      onComplete();
      onClose();
    } catch (_err) {
      setIsSubmitting(false);
    }
  }

  const isContinueDisabled = (step === "upload" && status !== "success") || isSubmitting;
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
      zIndex={2000}
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
            {status === "processing" && (
              <>
                <label className={`${styles.uploadBox}`}>
                  <div className={styles.uploadContent}>
                    <div className={styles.uploadText}>Processing ...</div>
                  </div>
                </label>
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
                  <div className={styles.errorText}>Upload failed</div>
                  <div className={styles.uploadSubtext}>{errorMessage}</div>
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

        {isReview && isSubmitting && (
          <div className={styles.uploadBox}>
            <div className={styles.uploadContent}>
              <div className={styles.uploadText}>Importing volunteers...</div>
            </div>
          </div>
        )}

        {isReview && !isSubmitting && (
          <>
            <div className={styles.summaryRow}>
              <div className={`${styles.summaryCard} ${styles.summaryCardNew}`}>
                <div className={styles.summaryHeader}>
                  <Image
                    src={icSuccess}
                    alt=""
                    className={styles.summaryIcon}
                    width={20}
                    height={20}
                  />
                  <span>New Volunteers</span>
                </div>
                <div className={styles.summaryCount}>{csvParsedInfo?.newCount ?? 0}</div>
              </div>
              <div className={`${styles.summaryCard} ${styles.summaryCardUpdated}`}>
                <div className={styles.summaryHeader}>
                  <Image src={icNew} alt="" className={styles.summaryIcon} width={20} height={20} />
                  <span>Updated Volunteers</span>
                </div>
                <div className={styles.summaryCount}>{csvParsedInfo?.updatedCount ?? 0}</div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <button
                className={styles.sectionToggle}
                onClick={() => {
                  setVolunteersCollapsed((c) => !c);
                }}
              >
                <span className={styles.sectionTitle}>All Volunteers</span>
                <div className={styles.projectMeta}>
                  <span className={styles.toggleHint}>
                    {volunteersCollapsed ? "Expand" : "Collapse"}
                  </span>
                  <svg
                    className={`${styles.chevron} ${volunteersCollapsed ? styles.chevronCollapsed : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>
              {!volunteersCollapsed && (
                <>
                  <div className={styles.detailCard}>
                    <div className={styles.detailList}>
                      {csvParsedInfo?.uniqueVolunteers
                        ?.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                        .map((change, i, arr) => (
                          <div key={change.email} className={styles.detailItem}>
                            <div className={styles.detailHeader}>
                              <span
                                className={`${styles.detailBadge} ${change.status === "New" ? styles.detailBadgeNew : styles.detailBadgeUpdated}`}
                              >
                                {change.status}
                              </span>
                              <span className={styles.detailName}>
                                {change.firstName} {change.lastName}
                              </span>
                            </div>
                            <div className={styles.detailMeta}>Email: {change.email}</div>
                            <div className={styles.detailMeta}>Phone: {change.phoneNumber}</div>
                            {i < arr.length - 1 && <div className={styles.detailDivider} />}
                          </div>
                        ))}
                    </div>
                  </div>
                  {csvParsedInfo && csvParsedInfo.uniqueVolunteers.length > ITEMS_PER_PAGE && (
                    <Pagination
                      totalItems={csvParsedInfo.uniqueVolunteers.length}
                      currentPage={currentPage}
                      itemsPerPage={ITEMS_PER_PAGE}
                      setPageIndex={setCurrentPage}
                    />
                  )}
                </>
              )}
            </div>

            {csvParsedInfo?.projectGroups.map((group) => {
              const projectKey = group.projectName ?? "__none__";
              const isCollapsed = collapsedProjects.has(projectKey);
              const allVolunteers = group.assignments.flatMap((a) => a.volunteers);
              const newCount = allVolunteers.filter((v) => v.status === "New").length;
              const updatedCount = allVolunteers.filter((v) => v.status === "Updated").length;

              return (
                <div key={projectKey} className={styles.detailSection}>
                  <button
                    className={styles.sectionToggle}
                    onClick={() => {
                      toggleProject(projectKey);
                    }}
                  >
                    <span className={styles.sectionTitle}>{group.projectName ?? "No Project"}</span>
                    <div className={styles.projectMeta}>
                      {newCount > 0 && <span className={styles.metaBadgeNew}>{newCount} new</span>}
                      {updatedCount > 0 && (
                        <span className={styles.metaBadgeUpdated}>{updatedCount} updated</span>
                      )}
                      <span className={styles.toggleHint}>
                        {isCollapsed ? "Expand" : "Collapse"}
                      </span>
                      <svg
                        className={`${styles.chevron} ${isCollapsed ? styles.chevronCollapsed : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>
                  {!isCollapsed && (
                    <div className={styles.detailCard}>
                      {group.assignments.map((assignment, ai) => (
                        <div
                          key={assignment.assignmentName ?? "__none__"}
                          className={styles.assignmentGroup}
                        >
                          {(assignment.assignmentName !== null ||
                            assignment.shiftNames.length > 0) && (
                            <div className={styles.assignmentMeta}>
                              {assignment.assignmentName && (
                                <span
                                  className={`${styles.detailBadge} ${styles.detailBadgeAssignment}`}
                                >
                                  {assignment.assignmentName}
                                </span>
                              )}
                              {assignment.shiftNames.length > 0 && (
                                <span className={styles.shiftsMeta}>
                                  Shifts: {assignment.shiftNames.join(", ")}
                                </span>
                              )}
                            </div>
                          )}
                          {assignment.volunteers.map((v) => (
                            <div key={v.email} className={styles.volunteerRow}>
                              <span
                                className={`${styles.detailBadge} ${v.status === "New" ? styles.detailBadgeNew : styles.detailBadgeUpdated}`}
                              >
                                {v.status}
                              </span>
                              <span className={styles.volunteerName}>
                                {v.firstName} {v.lastName}
                              </span>
                              <span className={styles.volunteerContact}>
                                {v.email} · {v.phoneNumber}
                              </span>
                            </div>
                          ))}
                          {ai < group.assignments.length - 1 && (
                            <div className={styles.detailDivider} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
