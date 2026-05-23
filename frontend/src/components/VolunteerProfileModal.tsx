"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import Modal from "./Modal";
import RoleTable from "./RoleTable";
import RoleTableEdit from "./RoleTableEdit";
import SuccessNotification from "./SuccessNotification";
import TagSearch from "./TagSearch";
import styles from "./VolunteerProfileModal.module.css";

import type { Volunteer, VolunteerAssignment, VolunteerTag, VolunteerWithTags } from "../types/volunteer";

import { createTag, searchTags } from "@/app/api/tag";
import { fetchVolunteerAssignmentsByVolunteerId } from "@/app/api/volunteer";
import icCloseAsset from "@/assets/ic_close.svg";
import { auth } from "@/firebase/firebase";

type VolunteerProfileModalProps = {
  volunteer: VolunteerWithTags | null;
  isOpen: boolean;
  onClose: () => void;
  onVolunteerUpdated?: (volunteer: Volunteer) => void;
};

const RETURNING_STATUS_LABELS = new Set(["returner", "returning", "expert"]);

const deriveStatus = (volunteer: VolunteerWithTags): "new" | "returning" => {
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

const TAG_COLOR_PALETTE = [
  { backgroundColor: "#F6E6E9", color: "#A40026" },
  { backgroundColor: "#F9EFE6", color: "#C46200" },
  { backgroundColor: "#F9F5EF", color: "#886F42" },
  { backgroundColor: "#E6F2EC", color: "#007F3F" },
  { backgroundColor: "#E6F2F3", color: "#007A8A" },
  { backgroundColor: "#E9ECF1", color: "#1D3A6B" },
  { backgroundColor: "#EFEBF3", color: "#452861" },
] as const;

const getTagPaletteStyle = (tag: VolunteerTag) => {
  let hash = 0;

  for (const character of tag._id || tag.name) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return TAG_COLOR_PALETTE[hash % TAG_COLOR_PALETTE.length];
};

const getTextColorForBackground = (backgroundColor: string): string => {
  const found = TAG_COLOR_PALETTE.find(
    (pair) => pair.backgroundColor.toLowerCase() === backgroundColor.toLowerCase(),
  );
  return found?.color ?? "#000000";
};

function ConsentSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div ref={ref} className={styles.customSelect}>
      <button
        type="button"
        className={`${styles.customSelectTrigger} ${open ? styles.customSelectTriggerOpen : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{selectedLabel}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path
            d="M1 1L6 6L11 1"
            stroke="#141414"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className={styles.customSelectDropdown}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.customSelectOption} ${option.value === value ? styles.customSelectOptionSelected : ""}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ViewContent({
  volunteer,
  removedGroupIds,
  volunteerAssignments,
}: {
  volunteer: VolunteerWithTags;
  removedGroupIds: Set<string>;
  volunteerAssignments: VolunteerAssignment[];
}) {
  const status = deriveStatus(volunteer);

  const toVolunteerTags = (tags: (string | VolunteerTag)[] | undefined) =>
    (Array.isArray(tags) ? tags : [])
      .filter((tag): tag is VolunteerTag => typeof tag === "object" && tag !== null)
      .filter(Boolean);

  const renderTags = (tags: (string | VolunteerTag)[] | undefined, prefix: string) => {
    const resolvedTags = toVolunteerTags(tags);

    if (resolvedTags.length === 0) {
      return <span className={styles.fieldLabel}>No {prefix}</span>;
    }

    return resolvedTags.map((tag) => {
      const backgroundColor =
        tag.color.startsWith("#") || tag.color.startsWith("rgb") ? tag.color : `#${tag.color}`;
      const textColor = getTextColorForBackground(backgroundColor);
      const isRemoved = prefix === "groups" && removedGroupIds.has(tag._id);
      if (isRemoved) return null;

      return (
        <span
          key={`${prefix.slice(0, -1)}-tag-${tag._id}`}
          className={styles.pillTag}
          style={{
            backgroundColor,
            color: textColor,
          }}
        >
          {tag.name}
        </span>
      );
    });
  };

  return (
    <>
      <div className={styles.lastEditedWrapper}>
        <span className={styles.lastEdited}>
          Last Edited on{" "}
          <strong>
            {volunteer.effectiveDate
              ? new Date(volunteer.effectiveDate).toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "2-digit",
                })
              : "N/A"}
          </strong>
        </span>
        <span className={styles.lastEdited}>
          Created on{" "}
          <strong>
            {volunteer.dateCreated
              ? new Date(volunteer.dateCreated as string | Date).toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "2-digit",
                })
              : "N/A"}
          </strong>
        </span>
      </div>
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
        <div className={styles.infoField}>
          <span className={styles.fieldLabel}>Address 1</span>
          <span className={styles.fieldValue}>{volunteer.address?.line1 ?? ""}</span>
        </div>
        {volunteer.address?.line2 ? (
          <div className={styles.infoField}>
            <span className={styles.fieldLabel}>Address 2</span>
            <span className={styles.fieldValue}>{volunteer.address.line2}</span>
          </div>
        ) : null}
        <div className={styles.infoField}>
          <span className={styles.fieldLabel}>City</span>
          <span className={styles.fieldValue}>{volunteer.address?.city ?? ""}</span>
        </div>
        <div className={styles.infoField}>
          <span className={styles.fieldLabel}>State</span>
          <span className={styles.fieldValue}>{volunteer.address?.state ?? ""}</span>
        </div>
        <div className={styles.infoField}>
          <span className={styles.fieldLabel}>Zip</span>
          <span className={styles.fieldValue}>{volunteer.address?.zip ?? ""}</span>
        </div>
        <div className={styles.infoField}>
          <span className={styles.fieldLabel}>Birthday</span>
          <span className={styles.fieldValue}>
            {volunteer.birthday ? new Date(volunteer.birthday).toLocaleDateString() : ""}
          </span>
        </div>
        <div className={styles.infoField}>
          <span className={styles.fieldLabel}>Pref Pronouns</span>
          <span className={styles.fieldValue}>{volunteer.preferredPronouns ?? ""}</span>
        </div>
        <div className={styles.infoField}>
          <span className={styles.fieldLabel}>Total Volunteer Hours</span>
          <span className={styles.fieldValue}>{volunteer.hours ?? ""}</span>
        </div>
        <div className={styles.infoField}>
          <span className={styles.fieldLabel}>Volunteer Status</span>
          <span className={styles.fieldValue}>
            <span className={status === "new" ? styles.pillTagNew : styles.pillTagReturning}>
              {formatStatus(status)}
            </span>
          </span>
        </div>
        <div className={styles.sectionHeaders}>
          <div>
            <div className={styles.sectionHeader}>Consent Status</div>
            <div className={styles.consentRowView}>
              <div className={styles.consentColView}>
                <span className={styles.fieldLabel}>Media</span>
                <button
                  className={`${styles.consentButton} ${volunteer.mediaConsent === "yes" ? styles.consentYes : styles.consentNo}`}
                  disabled
                >
                  {volunteer.mediaConsent === "yes" ? "Yes" : "No"}
                </button>
              </div>
              <div className={styles.consentColView}>
                <span className={styles.fieldLabel}>Face</span>
                <button
                  className={`${styles.consentButton} ${volunteer.faceConsent === "yes" ? styles.consentYes : styles.consentNo}`}
                  disabled
                >
                  {volunteer.faceConsent === "yes" ? "Yes" : "No"}
                </button>
              </div>
              <div className={styles.consentColView}>
                <span className={styles.fieldLabel}>Name</span>
                <button className={`${styles.consentButton} ${styles.consentFirst}`} disabled>
                  {volunteer.nameConsent === "full"
                    ? "Full Name"
                    : volunteer.nameConsent === "first"
                      ? "First"
                      : "No Name"}
                </button>
              </div>
            </div>
          </div>
          <div>
            <div className={styles.sectionHeader}>Groups</div>
            <div className={styles.tagsWrapper}>{renderTags(volunteer.groupTagIds, "groups")}</div>
          </div>
          <div>
            <div className={styles.sectionHeader}>Programs</div>
            <div className={styles.tagsWrapper}>
              {renderTags(volunteer.programTagIds, "programs")}
            </div>
          </div>
          <div>
            <div className={styles.sectionHeader}>Roles</div>
            <div className={styles.tagsWrapper}>
              <RoleTable volunteerAssignments={volunteerAssignments} />
            </div>
          </div>
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
  const [volunteerAssignments, setVolunteerAssignments] = useState<VolunteerAssignment[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState<"new" | "returning">("new");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [birthday, setBirthday] = useState("");
  const [preferredPronouns, setPreferredPronouns] = useState("");
  const [hours, setHours] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [mediaConsent, setMediaConsent] = useState<"yes" | "no">("no");
  const [faceConsent, setFaceConsent] = useState<"yes" | "no">("no");
  const [nameConsent, setNameConsent] = useState<"no" | "first" | "full">("no");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveKey, setSaveKey] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [pendingExitAction, setPendingExitAction] = useState<"close" | "switchToView" | null>(null);
  const [removedGroupIds, setRemovedGroupIds] = useState<Set<string>>(new Set());
  const [removedProgramIds, setRemovedProgramIds] = useState<Set<string>>(new Set());
  const [addedGroupTags, setAddedGroupTags] = useState<VolunteerTag[]>([]);
  const [addedProgramTags, setAddedProgramTags] = useState<VolunteerTag[]>([]);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [programSearchQuery, setProgramSearchQuery] = useState("");
  const [mockGroupResults, setMockGroupResults] = useState<VolunteerTag[]>([]);
  const [mockProgramResults, setMockProgramResults] = useState<VolunteerTag[]>([]);
  const resolvedGroupTags = (
    Array.isArray(volunteer?.groupTagIds) ? volunteer.groupTagIds : []
  ).filter((tag): tag is VolunteerTag => typeof tag === "object" && tag !== null);
  const resolvedProgramTags = (
    Array.isArray(volunteer?.programTagIds) ? volunteer.programTagIds : []
  ).filter((tag): tag is VolunteerTag => typeof tag === "object" && tag !== null);

  // Effect to handle Group searching
  useEffect(() => {
    const fetchGroupTags = async () => {
      if (groupSearchQuery.trim().length === 0) {
        setMockGroupResults([]);
        return;
      }

      try {
        // Fetch matching tags specifically of type 'group'
        const results = await searchTags(groupSearchQuery, "group");
        setMockGroupResults(results);
      } catch (error) {
        console.error("Failed to search groups", error);
      }
    };

    // Debounce the fetch slightly so it doesn't spam your database on every keystroke
    const timeoutId = setTimeout(() => {
      void fetchGroupTags();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [groupSearchQuery]);

  // Effect to handle Program searching
  useEffect(() => {
    const fetchProgramTags = async () => {
      if (programSearchQuery.trim().length === 0) {
        setMockProgramResults([]);
        return;
      }

      try {
        // Fetch matching tags specifically of type 'program'
        const results = await searchTags(programSearchQuery, "program");
        setMockProgramResults(results);
      } catch (error) {
        console.error("Failed to search programs", error);
      }
    };

    const timeoutId = setTimeout(() => {
      void fetchProgramTags();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [programSearchQuery]);

  const resetForm = (v: typeof volunteer) => {
    if (!v) return;
    setRemovedGroupIds(new Set());
    setRemovedProgramIds(new Set());
    setAddedGroupTags([]);
    setAddedProgramTags([]);
    setGroupSearchQuery("");
    setProgramSearchQuery("");
    setFirstName(v.firstName);
    setLastName(v.lastName);
    setEmail(v.email);
    setPhoneNumber(v.phoneNumber);
    setAddressLine1(v.address?.line1 ?? "");
    setAddressLine2(v.address?.line2 ?? "");
    setCity(v.address?.city ?? "");
    setState(v.address?.state ?? "");
    setZip(v.address?.zip ?? "");
    setBirthday(v.birthday ? new Date(v.birthday).toISOString().split("T")[0] : "");
    setPreferredPronouns(v.preferredPronouns ?? "");
    setHours(v.hours != null ? String(v.hours) : "");
    setStatus(deriveStatus(v));
    setAdditionalNotes(v.additionalNotes ?? "");
    setMediaConsent(v.mediaConsent ?? "no");
    setFaceConsent(v.faceConsent ?? "no");
    setNameConsent(v.nameConsent ?? "no");
    setSaveError("");
  };

  useEffect(() => {
    if (!volunteer || !isOpen) return;
    setActiveTab("view");
    resetForm(volunteer);

    // Fetch volunteer assignments
    const fetchAssignments = async () => {
      try {
        const assignments = await fetchVolunteerAssignmentsByVolunteerId(volunteer._id);
        setVolunteerAssignments(assignments);
      } catch (error) {
        console.error("Failed to fetch volunteer assignments:", error);
        setVolunteerAssignments([]);
      }
    };

    void fetchAssignments();
  }, [volunteer, isOpen]);

  useEffect(() => {
    setShowSuccess(false);
  }, [volunteer?._id]);

  useEffect(() => {
    if (!isOpen) setShowSuccess(false);
  }, [isOpen]);

  // Validate hours input before save
  const validateHours = (value: string): number | undefined => {
    const trimmed = value.trim();
    if (trimmed === "") return undefined;
    const parsed = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  };

  const handleSave = async () => {
    if (!volunteer) return;
    setIsSaving(true);
    setSaveError("");
    try {
      const parsedHours = validateHours(hours);
      if (parsedHours !== undefined && Number.isNaN(parsedHours)) {
        setSaveError("Total hours must be a number.");
        setIsSaving(false);
        return;
      }
      const token = await auth.currentUser?.getIdToken(true);
      if (!token) {
        throw new Error("Not authenticated");
      }

      // Build groupTagIds array, filtering out removed tags and adding new ones
      const groupTagIds: string[] = [];
      if (Array.isArray(volunteer.groupTagIds)) {
        volunteer.groupTagIds.forEach((tag) => {
          const tagId = typeof tag === "string" ? tag : tag._id;
          if (!removedGroupIds.has(tagId)) {
            groupTagIds.push(tagId);
          }
        });
      }
      // Add newly selected tags
      addedGroupTags.forEach((tag) => {
        if (!groupTagIds.includes(tag._id)) {
          groupTagIds.push(tag._id);
        }
      });

      const programTagIds: string[] = [];
      if (Array.isArray(volunteer.programTagIds)) {
        volunteer.programTagIds.forEach((tag) => {
          const tagId = typeof tag === "string" ? tag : tag._id;
          if (!removedProgramIds.has(tagId)) {
            programTagIds.push(tagId);
          }
        });
      }
      addedProgramTags.forEach((tag) => {
        if (!programTagIds.includes(tag._id)) {
          programTagIds.push(tag._id);
        }
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const response = await fetch(`${apiUrl}/api/volunteer/${volunteer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber,
          address: {
            line1: addressLine1,
            line2: addressLine2,
            city,
            state,
            zip,
          },
          birthday,
          preferredPronouns,
          hours: parsedHours === undefined ? undefined : parsedHours,
          status,
          additionalNotes,
          mediaConsent,
          faceConsent,
          nameConsent,
          groupTagIds,
          programTagIds,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Failed to update volunteer");
      }

      const updated = (await response.json()) as Volunteer;
      onVolunteerUpdated?.(updated);
      setSaveKey((k) => k + 1);
      setShowSuccess(true);
      setActiveTab("view");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to update volunteer");
    } finally {
      setIsSaving(false);
    }
  };

  const checkIsDirty = (): boolean => {
    if (!volunteer) return false;
    return (
      firstName !== volunteer.firstName ||
      lastName !== volunteer.lastName ||
      email !== volunteer.email ||
      phoneNumber !== volunteer.phoneNumber ||
      addressLine1 !== (volunteer.address?.line1 ?? "") ||
      addressLine2 !== (volunteer.address?.line2 ?? "") ||
      city !== (volunteer.address?.city ?? "") ||
      state !== (volunteer.address?.state ?? "") ||
      zip !== (volunteer.address?.zip ?? "") ||
      birthday !==
        (volunteer.birthday ? new Date(volunteer.birthday).toISOString().split("T")[0] : "") ||
      preferredPronouns !== (volunteer.preferredPronouns ?? "") ||
      hours !== (volunteer.hours != null ? String(volunteer.hours) : "") ||
      status !== deriveStatus(volunteer) ||
      additionalNotes !== (volunteer.additionalNotes ?? "") ||
      mediaConsent !== (volunteer.mediaConsent ?? "no") ||
      faceConsent !== (volunteer.faceConsent ?? "no") ||
      nameConsent !== (volunteer.nameConsent ?? "no") ||
      removedGroupIds.size > 0 ||
      removedProgramIds.size > 0 ||
      addedGroupTags.length > 0 ||
      addedProgramTags.length > 0
    );
  };

  const handleCreateGroupTag = async (name: string): Promise<void> => {
    let newTag: VolunteerTag;
    try {
      newTag = await createTag(name, "group");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.toLowerCase().includes("already exists")) {
        const existing = await searchTags(name);
        const match = existing.find((t) => t.name.toLowerCase() === name.toLowerCase());
        if (!match) throw new Error(`Tag "${name}" already exists but could not be found.`);
        newTag = match;
      } else {
        throw err;
      }
    }
    setAddedGroupTags((prev) =>
      prev.some((t) => t._id === newTag._id) ? prev : [...prev, newTag],
    );
  };

  const handleCreateProgramTag = async (name: string): Promise<void> => {
    let newTag: VolunteerTag;
    try {
      newTag = await createTag(name, "program");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.toLowerCase().includes("already exists")) {
        const existing = await searchTags(name);
        const match = existing.find((t) => t.name.toLowerCase() === name.toLowerCase());
        if (!match) throw new Error(`Tag "${name}" already exists but could not be found.`);
        newTag = match;
      } else {
        throw err;
      }
    }
    setAddedProgramTags((prev) =>
      prev.some((t) => t._id === newTag._id) ? prev : [...prev, newTag],
    );
  };

  const requestExit = (action: "close" | "switchToView") => {
    if (activeTab === "edit" && checkIsDirty()) {
      setPendingExitAction(action);
      setShowCancelConfirm(true);
    } else if (action === "close") {
      onClose();
    } else {
      setActiveTab("view");
    }
  };

  if (!isOpen || !volunteer) return null;

  return (
    <>
      <div className={styles.backdrop} aria-hidden="true" onClick={() => requestExit("close")} />
      <div className={styles.modal}>
        <div className={styles.heading}>
          <div className={styles.topper} />
          <div className={styles.headerRow}>
            <h5 className={styles.modalHeader}>View Volunteer</h5>
            <button
              className={styles.closeButton}
              onClick={() => requestExit("close")}
              aria-label="Close"
            >
              <Image src={icCloseAsset as string} alt="" width={22} height={22} />
            </button>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === "view" ? styles.tabActive : styles.tabInactive}`}
            onClick={() => requestExit("switchToView")}
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
            <ViewContent
              volunteer={volunteer}
              removedGroupIds={removedGroupIds}
              volunteerAssignments={volunteerAssignments}
            />
          ) : (
            <div className={styles.editSection}>
              <div className={styles.lastEditedWrapper}>
                <span className={styles.lastEdited}>
                  Last Edited on{" "}
                  <strong>
                    {volunteer.effectiveDate
                      ? new Date(volunteer.effectiveDate).toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "2-digit",
                        })
                      : "N/A"}
                  </strong>
                </span>
                <span className={styles.lastEdited}>
                  Created on{" "}
                  <strong>
                    {volunteer.dateCreated
                      ? new Date(volunteer.dateCreated as string | Date).toLocaleDateString(
                          "en-US",
                          { month: "2-digit", day: "2-digit", year: "2-digit" },
                        )
                      : "N/A"}
                  </strong>
                </span>
              </div>
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
                <label className={styles.editLabel} htmlFor="edit-address-line1">
                  Address 1
                </label>
                <input
                  id="edit-address-line1"
                  className={styles.editInput}
                  value={addressLine1}
                  onChange={(event) => setAddressLine1(event.target.value)}
                />
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel} htmlFor="edit-address-line2">
                  Address 2
                </label>
                <input
                  id="edit-address-line2"
                  className={styles.editInput}
                  value={addressLine2}
                  onChange={(event) => setAddressLine2(event.target.value)}
                />
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel} htmlFor="edit-city">
                  City
                </label>
                <input
                  id="edit-city"
                  className={styles.editInput}
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                />
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel} htmlFor="edit-state">
                  State
                </label>
                <input
                  id="edit-state"
                  className={styles.editInput}
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                />
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel} htmlFor="edit-zip">
                  Zip
                </label>
                <input
                  id="edit-zip"
                  className={styles.editInput}
                  value={zip}
                  onChange={(event) => setZip(event.target.value)}
                />
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel} htmlFor="edit-birthday">
                  Birthday
                </label>
                <input
                  id="edit-birthday"
                  className={styles.editInput}
                  type="date"
                  value={birthday}
                  onChange={(event) => setBirthday(event.target.value)}
                />
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel} htmlFor="edit-pronouns">
                  Pref Pronouns
                </label>
                <input
                  id="edit-pronouns"
                  className={styles.editInput}
                  value={preferredPronouns}
                  onChange={(event) => setPreferredPronouns(event.target.value)}
                />
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel} htmlFor="edit-hours">
                  Total Volunteer Hours
                </label>
                <input
                  id="edit-hours"
                  className={styles.editInput}
                  value={hours}
                  onChange={(event) => setHours(event.target.value)}
                />
              </div>

              <div className={styles.sectionHeaders}>
                <div>
                  <div className={styles.sectionHeader}>Volunteer Status</div>
                  <div className={styles.statusToggleRow}>
                    <button
                      type="button"
                      className={`${styles.statusToggleButton} ${status === "new" ? styles.statusSelected : ""}`}
                      onClick={() => setStatus("new")}
                    >
                      New
                    </button>
                    <button
                      type="button"
                      className={`${styles.statusToggleButton} ${status === "returning" ? styles.statusSelected : ""}`}
                      onClick={() => setStatus("returning")}
                    >
                      Returner
                    </button>
                  </div>
                </div>
                <div>
                  <div className={styles.sectionHeader}>Consent Status</div>
                  <div className={styles.consentDropdownsRow}>
                    <div className={styles.consentDropdownItem}>
                      <label className={styles.editLabel}>Media</label>
                      <ConsentSelect
                        value={mediaConsent}
                        onChange={(v) => setMediaConsent(v as "yes" | "no")}
                        options={[
                          { value: "yes", label: "Yes" },
                          { value: "no", label: "No" },
                        ]}
                      />
                    </div>
                    <div className={styles.consentDropdownItem}>
                      <label className={styles.editLabel}>Face</label>
                      <ConsentSelect
                        value={faceConsent}
                        onChange={(v) => setFaceConsent(v as "yes" | "no")}
                        options={[
                          { value: "yes", label: "Yes" },
                          { value: "no", label: "No" },
                        ]}
                      />
                    </div>
                    <div className={styles.consentDropdownItem}>
                      <label className={styles.editLabel}>Name</label>
                      <ConsentSelect
                        value={nameConsent}
                        onChange={(v) => setNameConsent(v as "no" | "first" | "full")}
                        options={[
                          { value: "first", label: "First" },
                          { value: "full", label: "Full Name" },
                          { value: "no", label: "No Name" },
                        ]}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className={styles.sectionHeaderRow}>
                    <div className={styles.sectionHeader}>Groups</div>
                    <span className={styles.tapRemoveHint}>Tap x to Remove</span>
                  </div>
                  <div className={styles.tagsWrapper}>
                    {resolvedGroupTags.length > 0 || addedGroupTags.length > 0 ? (
                      <>
                        {resolvedGroupTags.map((tagObj) => {
                          const isRemoved = removedGroupIds.has(tagObj._id);
                          if (isRemoved) return null;
                          const tagStyle = getTagPaletteStyle(tagObj);
                          return (
                            <div
                              key={`group-tag-edit-${tagObj._id}`}
                              className={styles.pillTagWithClose}
                              style={{
                                backgroundColor: tagStyle.backgroundColor,
                                color: tagStyle.color,
                              }}
                            >
                              {tagObj.name}
                              <button
                                className={styles.tagCloseButton}
                                onClick={() => {
                                  const newRemoved = new Set(removedGroupIds);
                                  newRemoved.add(tagObj._id);
                                  setRemovedGroupIds(newRemoved);
                                }}
                                aria-label="Remove group"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12 4L4 12M4 4L12 12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                        {addedGroupTags.map((tagObj) => {
                          const tagStyle = getTagPaletteStyle(tagObj);
                          return (
                            <div
                              key={`added-group-tag-${tagObj._id}`}
                              className={styles.pillTagWithClose}
                              style={{
                                backgroundColor: tagStyle.backgroundColor,
                                color: tagStyle.color,
                              }}
                            >
                              {tagObj.name}
                              <button
                                className={styles.tagCloseButton}
                                onClick={() => {
                                  setAddedGroupTags((prev) =>
                                    prev.filter((t) => t._id !== tagObj._id),
                                  );
                                }}
                                aria-label="Remove group"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12 4L4 12M4 4L12 12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <span className={styles.fieldLabel}>No groups</span>
                    )}
                  </div>
                  <div className={styles.tagSearchSection}>
                    <TagSearch
                      placeholder="Insert group name"
                      query={groupSearchQuery}
                      onQueryChange={setGroupSearchQuery}
                      results={mockGroupResults}
                      onAdd={(tag) => {
                        setAddedGroupTags((prev) => {
                          const alreadyAdded = prev.some((t) => t._id === tag._id);
                          if (alreadyAdded) return prev;
                          return [...prev, tag];
                        });
                        setGroupSearchQuery("");
                      }}
                      onCreate={(name) => {
                        void handleCreateGroupTag(name).catch((err: unknown) => {
                          console.error("Failed to create group tag:", err);
                        });
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className={styles.sectionHeaderRow}>
                    <div className={styles.sectionHeader}>Programs</div>
                    <span className={styles.tapRemoveHint}>Tap x to Remove</span>
                  </div>
                  <div className={styles.tagsWrapper}>
                    {resolvedProgramTags.length > 0 || addedProgramTags.length > 0 ? (
                      <>
                        {resolvedProgramTags.map((tagObj) => {
                          const isRemoved = removedProgramIds.has(tagObj._id);
                          if (isRemoved) return null;
                          const tagStyle = getTagPaletteStyle(tagObj);
                          return (
                            <div
                              key={`program-tag-edit-${tagObj._id}`}
                              className={styles.pillTagWithClose}
                              style={{
                                backgroundColor: tagStyle.backgroundColor,
                                color: tagStyle.color,
                              }}
                            >
                              {tagObj.name}
                              <button
                                className={styles.tagCloseButton}
                                onClick={() => {
                                  const newRemoved = new Set(removedProgramIds);
                                  newRemoved.add(tagObj._id);
                                  setRemovedProgramIds(newRemoved);
                                }}
                                aria-label="Remove program"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12 4L4 12M4 4L12 12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                        {addedProgramTags.map((tagObj) => {
                          const tagStyle = getTagPaletteStyle(tagObj);
                          return (
                            <div
                              key={`added-program-tag-${tagObj._id}`}
                              className={styles.pillTagWithClose}
                              style={{
                                backgroundColor: tagStyle.backgroundColor,
                                color: tagStyle.color,
                              }}
                            >
                              {tagObj.name}
                              <button
                                className={styles.tagCloseButton}
                                onClick={() => {
                                  setAddedProgramTags((prev) =>
                                    prev.filter((t) => t._id !== tagObj._id),
                                  );
                                }}
                                aria-label="Remove program"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12 4L4 12M4 4L12 12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <span className={styles.fieldLabel}>No programs</span>
                    )}
                  </div>
                  <div className={styles.tagSearchSection}>
                    <TagSearch
                      placeholder="Insert program name"
                      query={programSearchQuery}
                      onQueryChange={setProgramSearchQuery}
                      results={mockProgramResults}
                      onAdd={(tag) => {
                        setAddedProgramTags((prev) => {
                          const alreadyAdded = prev.some((t) => t._id === tag._id);
                          if (alreadyAdded) return prev;
                          return [...prev, tag];
                        });
                        setProgramSearchQuery("");
                      }}
                      onCreate={(name) => {
                        void handleCreateProgramTag(name).catch((err: unknown) => {
                          console.error("Failed to create program tag:", err);
                        });
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className={styles.sectionHeaderRow}>
                    <div className={styles.sectionHeader}>Roles</div>
                    <span className={styles.tapRemoveHint}>Tap x to Remove</span>
                  </div>
                  <div className={styles.tagsWrapper}>
                    <RoleTableEdit volunteerAssignments={volunteerAssignments} />
                  </div>
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

            </div>
          )}
        </div>
        {activeTab === "edit" ? (
          <div className={styles.stickyFooter}>
            {saveError ? <span className={styles.saveError}>{saveError}</span> : null}
            <div className={styles.actionRow}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => requestExit("close")}
                disabled={isSaving}
              >
                Cancel
              </button>
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
          </div>
        ) : null}
      </div>
      {showSuccess ? (
        <SuccessNotification key={saveKey} message="Successfully Created Role" />
      ) : null}
      {showCancelConfirm ? (
        <Modal
          onClose={() => setShowCancelConfirm(false)}
          width="310px"
          radius="12px"
          title="Unsaved Changes"
          titleFontSize="18px"
          titleLineHeight={24}
          padding="20px"
        >
          <p className={styles.confirmBody}>
            All changes will be discarded if you leave. Are you sure?
          </p>
          <div className={styles.confirmActions}>
            <button className={styles.confirmSecondary} onClick={() => setShowCancelConfirm(false)}>
              Cancel
            </button>
            <button
              className={styles.confirmPrimary}
              onClick={() => {
                setShowCancelConfirm(false);
                resetForm(volunteer);
                if (pendingExitAction === "close") {
                  onClose();
                } else {
                  setActiveTab("view");
                }
                setPendingExitAction(null);
              }}
            >
              Discard Changes
            </button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
