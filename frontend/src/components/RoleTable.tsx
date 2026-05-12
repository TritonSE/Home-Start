"use client";

import styles from "./RoleTable.module.css";

import type { VolunteerAssignment, VolunteerTag } from "../types/volunteer";

type RoleTableProps = {
  volunteerAssignments: VolunteerAssignment[];
};

const TAG_COLOR_PALETTE = [
  { backgroundColor: "#F6E6E9", color: "#A40026" },
  { backgroundColor: "#F9EFE6", color: "#C46200" },
  { backgroundColor: "#F9F5EF", color: "#886F42" },
  { backgroundColor: "#E6F2EC", color: "#007F3F" },
  { backgroundColor: "#E6F2F3", color: "#007A8A" },
  { backgroundColor: "#E9ECF1", color: "#1D3A6B" },
  { backgroundColor: "#EFEBF3", color: "#452861" },
] as const;

const getTextColorForBackground = (backgroundColor: string): string => {
  const found = TAG_COLOR_PALETTE.find(
    (pair) => pair.backgroundColor.toLowerCase() === backgroundColor.toLowerCase(),
  );
  return found?.color ?? "#000000";
};

const resolveTag = (tag: string | VolunteerTag | undefined): VolunteerTag | null => {
  if (!tag) return null;
  if (typeof tag === "object") return tag;
  return null;
};

const resolveTags = (tags: (string | VolunteerTag)[] | undefined): VolunteerTag[] => {
  if (!Array.isArray(tags)) return [];
  return tags.map(resolveTag).filter((tag): tag is VolunteerTag => tag !== null);
};

const PillTag = ({ tag }: { tag: VolunteerTag }) => {
  // Color property now stores the backgroundColor
  const backgroundColor =
    tag.color.startsWith("#") || tag.color.startsWith("rgb") ? tag.color : `#${tag.color}`;

  const textColor = getTextColorForBackground(backgroundColor);

  return (
    <span
      className={styles.pillTag}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {tag.name}
    </span>
  );
};

export default function RoleTable({ volunteerAssignments }: RoleTableProps) {
  return (
    <div className={styles.table}>
      <div className={styles.header}>
        <div className={styles.headerCell}>Assignment</div>
        <div className={styles.headerCell}>Project</div>
        <div className={styles.headerCell}>Shift</div>
      </div>
      <div className={styles.body}>
        {volunteerAssignments.length === 0 ? (
          <div className={styles.emptyState}>No assignments</div>
        ) : (
          volunteerAssignments.map((assignment) => {
            const assignmentTag = resolveTag(assignment.assignmentTagId);
            const projectTag = resolveTag(assignment.projectTagId);
            const shiftTags = resolveTags(assignment.shiftTagIds);

            return (
              <div key={assignment._id} className={styles.row}>
                <div className={`${styles.cell} ${styles.tagCell}`}>
                  {assignmentTag ? <PillTag tag={assignmentTag} /> : <span>—</span>}
                </div>
                <div className={`${styles.cell} ${styles.tagCell}`}>
                  {projectTag ? <PillTag tag={projectTag} /> : <span>—</span>}
                </div>
                <div className={`${styles.cell} ${styles.shiftCell}`}>
                  {shiftTags.length > 0 ? (
                    shiftTags.map((tag) => <PillTag key={tag._id} tag={tag} />)
                  ) : (
                    <span></span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
