"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

import { COLOR_OPTIONS } from "./colorOptions";
import styles from "./CreateRoleModal.module.css";

import type { Volunteer, VolunteerTag } from "@/types/volunteer";

import { createTag, fetchTags, searchTags } from "@/app/api/tag";
import { createVolunteerAssignment } from "@/app/api/volunteer";
import icCloseLargeAsset from "@/assets/ic_close_large.svg";
import rightArrowAsset from "@/assets/rightarrow.svg";

const icCloseLarge = icCloseLargeAsset as string;
const rightArrow = rightArrowAsset as string;

type CheckIconProps = {
  color: string;
};

function CheckIcon({ color }: CheckIconProps) {
  return (
    //manual check icon for color masking
    <svg className={styles.checkIcon} viewBox="0 0 11 10" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.66491 0.254634C9.89127 -0.0379366 10.3041 -0.0853717 10.5871 0.148685C10.87 0.382742 10.9159 0.809658 10.6895 1.10223L3.79281 8.91205C3.54853 9.22778 3.09308 9.25387 2.81657 8.96796L0.192212 6.25431C-0.0640045 5.98937 -0.0640045 5.55983 0.192212 5.29489C0.448428 5.02996 0.863836 5.02996 1.12005 5.29489L3.22609 7.47259L9.66491 0.254634Z"
        fill={color}
      />
    </svg>
  );
}

type Props = {
  onClose: () => void;
  volunteer?: Volunteer | null;
  onCreated?: () => void;
};

export default function CreateRoleModal({ onClose, volunteer, onCreated }: Props) {
  const [step, setStep] = useState(1);
  const [assignmentName, setAssignmentName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [assignmentColorIndex, setAssignmentColorIndex] = useState(0);
  const [projectColorIndex, setProjectColorIndex] = useState(0);
  const [, setTags] = useState<VolunteerTag[]>([]);

  const isFirstPage = step === 1;
  const inputValue = isFirstPage ? assignmentName : projectName;
  const setInputValue = isFirstPage ? setAssignmentName : setProjectName;
  const selectedColorIndex = isFirstPage ? assignmentColorIndex : projectColorIndex;
  const setSelectedColorIndex = isFirstPage ? setAssignmentColorIndex : setProjectColorIndex;
  const assignmentNameTrimmed = assignmentName.trim();
  const projectNameTrimmed = projectName.trim();
  const isAssignmentNameEmpty = assignmentNameTrimmed.length === 0;
  const isProjectNameEmpty = projectNameTrimmed.length === 0;
  const hasSameAssignmentAndProjectName =
    assignmentNameTrimmed.length > 0 &&
    projectNameTrimmed.length > 0 &&
    assignmentNameTrimmed.toLowerCase() === projectNameTrimmed.toLowerCase();

  const handleClose = () => {
    setStep(1);
    setAssignmentName("");
    setProjectName("");
    setAssignmentColorIndex(0);
    setProjectColorIndex(0);
    onClose();
  };

  const resolveTag = async (
    type: "assignment" | "project",
    name: string,
    colorIndex: number,
  ): Promise<VolunteerTag | undefined> => {
    const query = name.trim();
    if (!query) return undefined;

    const exactMatches = await searchTags(query, type).catch(() => [] as VolunteerTag[]);
    const existing = exactMatches.find(
      (tag) => tag.name.trim().toLowerCase() === query.toLowerCase(),
    );
    if (existing) {
      setTags((prev) => {
        const next = prev.filter((tag) => tag._id !== existing._id);
        return [...next, existing];
      });
      return existing;
    }

    const selectedColor = COLOR_OPTIONS[colorIndex]?.backgroundColor ?? "#FFFFFF";
    const newTag = await createTag({ name: query, color: selectedColor, type });
    setTags((prev) => [...prev.filter((tag) => tag._id !== newTag._id), newTag]);
    return newTag;
  };

  const getAssignmentTag = async (colorIndex: number): Promise<VolunteerTag | undefined> => {
    const query = assignmentNameTrimmed;
    if (!query) return undefined;

    try {
      return await resolveTag("assignment", query, colorIndex);
    } catch (err) {
      const latest = await fetchTags().catch(() => [] as VolunteerTag[]);
      if (latest.length > 0) {
        setTags(latest);
        const existingAfterRefresh = latest.find(
          (t) => t.type === "assignment" && t.name.trim().toLowerCase() === query.toLowerCase(),
        );
        if (existingAfterRefresh) return existingAfterRefresh;
      }
      console.error("Failed to create assignment tag:", err);
      return undefined;
    }
  };

  const getProjectTag = async (colorIndex: number): Promise<VolunteerTag | undefined> => {
    const query = projectNameTrimmed;
    if (!query) return undefined;

    try {
      return await resolveTag("project", query, colorIndex);
    } catch (err) {
      const latest = await fetchTags().catch(() => [] as VolunteerTag[]);
      if (latest.length > 0) {
        setTags(latest);
        const existingAfterRefresh = latest.find(
          (t) => t.type === "project" && t.name.trim().toLowerCase() === query.toLowerCase(),
        );
        if (existingAfterRefresh) return existingAfterRefresh;
      }
      console.error("Failed to create project tag:", err);
      return undefined;
    }
  };

  const handleSubmit = () => {
    void (async () => {
      if (!volunteer) {
        console.warn("No volunteer provided for CreateRoleModal.handleSubmit");
        return;
      }

      if (hasSameAssignmentAndProjectName) {
        console.error("Assignment name and project name cannot be the same");
        return;
      }

      try {
        // Resolve sequentially to avoid race conditions creating tags with conflicting names.
        const assignmentTag = await getAssignmentTag(assignmentColorIndex);
        if (!assignmentTag) {
          console.error("Missing assignment tag after creation");
          return;
        }

        const programTag = await getProjectTag(projectColorIndex);

        if (!programTag) {
          console.error("Missing project tag after creation");
          return;
        }

        await createVolunteerAssignment({
          volunteerId: volunteer._id,
          assignmentTagId: assignmentTag._id,
          projectTagId: programTag._id,
          shiftTagIds: [],
        });

        onCreated?.();
        setStep(1);
        onClose();
      } catch (err) {
        console.error("Failed to create volunteer assignment:", err);
      }
    })();
  };

  const fetchAllTags = async () => {
    try {
      const all = await fetchTags();
      setTags(all);
    } catch (err) {
      console.error("Failed to fetch tags in CreateRoleModal:", err);
    }
  };

  useEffect(() => {
    void fetchAllTags();
  }, []);

  return (
    <>
      <div className={styles.overlay} onClick={handleClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <p className={styles.title}>{"Create Role"}</p>
          <button className={styles.close} onClick={handleClose} aria-label="Close">
            <Image src={icCloseLarge} alt="" width={24} height={24} />
          </button>
        </div>

        <div className={styles.stepIndicator}>
          <div className={styles.stepItem}>
            <span
              className={`${styles.stepCircle} ${isFirstPage ? styles.stepCircleActive : styles.stepCircleInactive}`}
            >
              1
            </span>
            <span
              className={`${styles.stepLabel} ${isFirstPage ? styles.stepLabelActive : styles.stepLabelInactive}`}
            >
              Add Assignment
            </span>
          </div>

          <Image
            src={rightArrow}
            alt=""
            aria-hidden
            width={24}
            height={24}
            className={styles.stepArrow}
          />

          <div className={styles.stepItem}>
            <span
              className={`${styles.stepCircle} ${!isFirstPage ? styles.stepCircleActive : styles.stepCircleInactive}`}
            >
              2
            </span>
            <span
              className={`${styles.stepLabel} ${!isFirstPage ? styles.stepLabelActive : styles.stepLabelInactive}`}
            >
              Add Project
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        <label className={styles.inputLabel}>
          {isFirstPage ? "Assignment name" : "Project name"}
        </label>

        <div className={styles.inputField}>
          <form className={styles.textField} onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isFirstPage ? "Create or add assignment..." : "Create or add project..."}
            />
          </form>
        </div>

        <div className={styles.colorSelector}>
          {COLOR_OPTIONS.map((option, index) => {
            const isSelected = selectedColorIndex === index;
            return (
              <button
                key={option.name}
                type="button"
                className={styles.colorButton}
                style={{
                  backgroundColor: option.backgroundColor,
                  color: option.textColor,
                }}
                onClick={() => setSelectedColorIndex(index)}
                aria-label={`Select ${option.name} color`}
              >
                {isSelected ? (
                  <CheckIcon color={option.textColor} />
                ) : (
                  <span className={styles.colorButtonLabel}>A</span>
                )}
              </button>
            );
          })}
        </div>

        <div className={styles.divider} />

        <div className={styles.actions}>
          {isFirstPage ? (
            <>
              <button className={styles.secondary} onClick={handleClose} type="button">
                Cancel
              </button>

              <button
                className={styles.primary}
                onClick={() => setStep(2)}
                type="button"
                disabled={isAssignmentNameEmpty}
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button className={styles.secondary} onClick={() => setStep(1)} type="button">
                Back
              </button>

              <button
                className={styles.primary}
                type="button"
                onClick={handleSubmit}
                disabled={isProjectNameEmpty || hasSameAssignmentAndProjectName}
              >
                Create Role
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
