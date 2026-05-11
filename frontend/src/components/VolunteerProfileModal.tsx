"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./VolunteerProfileModal.module.css";

import type { Volunteer } from "../types/volunteer";

import icCloseAsset from "@/assets/ic_close.svg";

type VolunteerProfileModalProps = {
  volunteer: Volunteer | null;
  isOpen: boolean;
  onClose: () => void;
  onVolunteerUpdated?: (volunteer: Volunteer) => void;
};

const RETURNING_STATUS_LABELS = new Set(["returner", "returning", "expert"]);

const deriveStatus = (volunteer: Volunteer): "new" | "returning" => {
  if (volunteer.status === "new" || volunteer.status === "returning") {
    return volunteer.status;
  }

  const statusCandidates = volunteer.tags.map((tag) => tag.name.toLowerCase());
  return statusCandidates.some((candidate) => RETURNING_STATUS_LABELS.has(candidate))
    ? "returning"
    : "new";
};

const formatStatus = (status: "new" | "returning") =>
  status === "returning" ? "Returning" : "New";

function ViewContent({ volunteer }: { volunteer: Volunteer }) {
  const status = deriveStatus(volunteer);

  return (
    <>
      <div className={styles.infoSection}>
        <div className={styles.infoField}>
          <span className={styles.fieldLabel}>First Name</span>
          <span className={styles.fieldValue}>{volunteer.firstName}</span>
        </div>
        <div className={styles.infoField}>
          <span className={styles.fieldLabel}>Last Name</span>
          <span className={styles.fieldValue}>{volunteer.lastName}</span>
        </div>
        <div className={styles.infoField}>
          <span className={styles.fieldLabel}>Email</span>
          <span className={styles.fieldValue}>{volunteer.email}</span>
        </div>
        <div className={styles.infoField}>
          <span className={styles.fieldLabel}>Phone</span>
          <span className={styles.fieldValue}>{volunteer.phoneNumber}</span>
        </div>
      </div>

      <div className={styles.tagsSection}>
        <span className={styles.sectionTitle}>Status</span>
        <div className={styles.tagsRow}>
          <span className={`${styles.tag} ${styles.tagTeal}`}>{formatStatus(status)}</span>
        </div>
      </div>

      <div className={styles.infoField}>
        <span className={styles.fieldLabel}>Additional Notes</span>
        <span className={styles.fieldValue}>{volunteer.additionalNotes ?? ""}</span>
      </div>
    </>
  );
}

export default function VolunteerProfileModal({
  volunteer,
  isOpen,
  onClose,
  onVolunteerUpdated,
}: VolunteerProfileModalProps) {
  const [activeTab, setActiveTab] = useState("view");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState<"new" | "returning">("new");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!volunteer) return;
    setFirstName(volunteer.firstName);
    setLastName(volunteer.lastName);
    setEmail(volunteer.email);
    setPhoneNumber(volunteer.phoneNumber);

    setStatus(deriveStatus(volunteer));
    setAdditionalNotes(volunteer.additionalNotes ?? "");
    setSaveError("");
  }, [volunteer]);

  const handleSave = async () => {
    if (!volunteer) return;
    setIsSaving(true);
    setSaveError("");
    try {
      const response = await fetch(`/api/volunteer/${volunteer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber,
          status,
          additionalNotes,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Failed to update volunteer");
      }

      const updated = (await response.json()) as Volunteer;
      onVolunteerUpdated?.(updated);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to update volunteer");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !volunteer) return null;

  return (
    <>
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.modal}>
        <div className={styles.heading}>
          <div className={styles.topper} />
          <div className={styles.headerRow}>
            <h5 className={styles.modalHeader}>View Volunteer</h5>
            <button className={styles.closeButton} onClick={onClose} aria-label="Close">
              <Image src={icCloseAsset as string} alt="" width={24} height={24} />
            </button>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === "view" ? styles.tabActive : styles.tabInactive}`}
            onClick={() => setActiveTab("view")}
          >
            View
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "edit" ? styles.tabActive : styles.tabInactive}`}
            onClick={() => setActiveTab("edit")}
          >
            Edit
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === "view" ? (
            <ViewContent volunteer={volunteer} />
          ) : (
            <div className={styles.editSection}>
              <div className={styles.editField}>
                <label className={styles.editLabel} htmlFor="edit-first-name">
                  First Name
                </label>
                <input
                  id="edit-first-name"
                  className={styles.editInput}
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </div>
              <div className={styles.editField}>
                <label className={styles.editLabel} htmlFor="edit-last-name">
                  Last Name
                </label>
                <input
                  id="edit-last-name"
                  className={styles.editInput}
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>
              <div className={styles.editField}>
                <label className={styles.editLabel} htmlFor="edit-email">
                  Email
                </label>
                <input
                  id="edit-email"
                  className={styles.editInput}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className={styles.editField}>
                <label className={styles.editLabel} htmlFor="edit-phone">
                  Phone
                </label>
                <input
                  id="edit-phone"
                  className={styles.editInput}
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                />
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel} htmlFor="edit-status">
                  Status
                </label>
                <input
                  id="edit-status"
                  className={styles.editInput}
                  value={formatStatus(status)}
                  disabled
                />
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel} htmlFor="edit-notes">
                  Additional Notes
                </label>
                <input
                  id="edit-notes"
                  className={styles.editInput}
                  value={additionalNotes}
                  onChange={(event) => setAdditionalNotes(event.target.value)}
                />
              </div>

              {saveError ? <span className={styles.saveError}>{saveError}</span> : null}
              <button
                type="button"
                className={styles.saveButton}
                onClick={() => {
                  void handleSave();
                }}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
