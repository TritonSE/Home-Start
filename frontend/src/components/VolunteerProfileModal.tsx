"use client";
import { Volunteer } from "../types/volunteer";
import styles from "./VolunteerProfileModal.module.css";
import { useEffect, useState } from "react";

interface VolunteerProfileModalProps {
  volunteer: Volunteer | null;
  isOpen: boolean;
  onClose: () => void;
  onVolunteerUpdated?: (volunteer: Volunteer) => void;
}

const VOLUNTEER_TYPE_TAGS = ["Intern", "Outside Volunteer"];
const RETURNING_STATUS_LABELS = new Set(["returner", "returning", "expert"]);

const getTagColorClass = (tag: string, styles: Record<string, string>) => {
  if (tag === "Outside Volunteer") return styles.tagOrange;
  if (tag.includes("More")) return styles.tagGreen;
  return styles.tagTeal;
};

const getVolunteerTagNames = (volunteer: Volunteer) => volunteer.tags.map((tag) => tag.name);

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
  const [typeTags, setTypeTags] = useState<string[]>([]);
  const [eventTags, setEventTags] = useState<string[]>([]);
  const [typeInput, setTypeInput] = useState("");
  const [eventInput, setEventInput] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!volunteer) return;
    setFirstName(volunteer.firstName);
    setLastName(volunteer.lastName);
    setEmail(volunteer.email);
    setPhoneNumber(volunteer.phoneNumber);

    const volunteerTagNames = getVolunteerTagNames(volunteer);
    const fallbackTypeTags = volunteerTagNames.filter((tag) => VOLUNTEER_TYPE_TAGS.includes(tag));
    setStatus(deriveStatus(volunteer));
    setTypeTags(volunteer.volunteerTypeTags ?? fallbackTypeTags);
    setEventTags(volunteer.events ?? []);
    setAdditionalNotes(volunteer.additionalNotes ?? "");
    setTypeInput("");
    setEventInput("");
    setSaveError("");
  }, [volunteer]);

  const handleAddTypeTag = () => {
    const value = typeInput.trim();
    if (!value || typeTags.includes(value)) return;
    setTypeTags((prev) => [...prev, value]);
    setTypeInput("");
  };

  const handleAddEventTag = () => {
    const value = eventInput.trim();
    if (!value || eventTags.includes(value)) return;
    setEventTags((prev) => [...prev, value]);
    setEventInput("");
  };

  const handleRemoveTypeTag = (tag: string) => {
    setTypeTags((prev) => prev.filter((value) => value !== tag));
  };

  const handleRemoveEventTag = (tag: string) => {
    setEventTags((prev) => prev.filter((value) => value !== tag));
  };

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
          volunteerTypeTags: typeTags,
          events: eventTags,
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
              <img src="/ic_close.svg" alt="" />
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

              <div className={styles.tagsSection}>
                <div className={styles.sectionHeaderWithHint}>
                  <span className={styles.sectionTitle}>Volunteer Type</span>
                  <span className={styles.sectionHint}>Tap x to Remove</span>
                </div>
                <div className={styles.tagsRow}>
                  {typeTags.map((tag) => (
                    <span
                      key={`type-${tag}`}
                      className={`${styles.tag} ${getTagColorClass(tag, styles)}`}
                    >
                      {tag}
                      <button
                        type="button"
                        className={styles.tagRemove}
                        onClick={() => handleRemoveTypeTag(tag)}
                        aria-label={`Remove ${tag}`}
                      >
                        <img src="/redx.svg" alt="" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className={styles.searchAddRow}>
                  <div className={styles.searchAddField}>
                    <input
                      className={styles.searchAddInput}
                      placeholder="Add Text"
                      value={typeInput}
                      onChange={(event) => setTypeInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleAddTypeTag();
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.addButton}
                    onClick={handleAddTypeTag}
                    aria-label="Add volunteer type tag"
                  >
                    <img src="/plus.svg" alt="" />
                  </button>
                </div>
              </div>

              <div className={styles.tagsSection}>
                <div className={styles.sectionHeaderWithHint}>
                  <span className={styles.sectionTitle}>Event</span>
                  <span className={styles.sectionHint}>Tap x to Remove</span>
                </div>
                <div className={styles.tagsRow}>
                  {eventTags.map((tag) => (
                    <span
                      key={`event-${tag}`}
                      className={`${styles.tag} ${getTagColorClass(tag, styles)}`}
                    >
                      {tag}
                      <button
                        type="button"
                        className={styles.tagRemove}
                        onClick={() => handleRemoveEventTag(tag)}
                        aria-label={`Remove ${tag}`}
                      >
                        <img src="/redx.svg" alt="" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className={styles.searchAddRow}>
                  <div className={styles.searchAddField}>
                    <input
                      className={styles.searchAddInput}
                      placeholder="Add Event"
                      value={eventInput}
                      onChange={(event) => setEventInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleAddEventTag();
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.addButton}
                    onClick={handleAddEventTag}
                    aria-label="Add event tag"
                  >
                    <img src="/plus.svg" alt="" />
                  </button>
                </div>
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
                onClick={handleSave}
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

function ViewContent({ volunteer }: { volunteer: Volunteer }) {
  const volunteerTagNames = getVolunteerTagNames(volunteer);
  const fallbackTypeTags = volunteerTagNames.filter((tag) => VOLUNTEER_TYPE_TAGS.includes(tag));
  const status = deriveStatus(volunteer);
  const volunteerTypeTags = volunteer.volunteerTypeTags ?? fallbackTypeTags;
  const events = volunteer.events ?? [];

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

      <div className={styles.tagsSection}>
        <span className={styles.sectionTitle}>Volunteer Type</span>
        <div className={styles.tagsRow}>
          {volunteerTypeTags.map((tag, index) => (
            <span
              key={`${volunteer._id}-type-${tag}-${index}`}
              className={`${styles.tag} ${getTagColorClass(tag, styles)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.tagsSection}>
        <span className={styles.sectionTitle}>Event</span>
        <div className={styles.tagsRow}>
          {events.map((tag, index) => (
            <span
              key={`${volunteer._id}-event-${tag}-${index}`}
              className={`${styles.tag} ${getTagColorClass(tag, styles)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.infoField}>
        <span className={styles.fieldLabel}>Additional Notes</span>
        <span className={styles.fieldValue}>{volunteer.additionalNotes ?? ""}</span>
      </div>
    </>
  );
}
