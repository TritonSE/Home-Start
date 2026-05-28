"use client";

import Image from "next/image";

import styles from "./RoleTableEdit.module.css";

import type { VolunteerAssignment, VolunteerTag } from "../types/volunteer";

import icPlusAsset from "@/assets/ic_plus.svg";

type RoleTableProps = {
  volunteerAssignments: VolunteerAssignment[];
  onRemoveShiftTag?: (assignmentId: string, shiftTagId: string) => void;
  onAddShiftTag?: (assignment: VolunteerAssignment) => void;
  onCreateRole?: () => void;
  onEditTag?: (tag: VolunteerTag) => void;
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

const PillTag = ({
  tag,
  borderRadius = "100px",
  onRemove,
  onTagClick,
}: {
  tag: VolunteerTag;
  borderRadius?: string;
  onRemove?: () => void;
  onTagClick?: () => void;
}) => {
  const backgroundColor =
    tag.color.startsWith("#") || tag.color.startsWith("rgb") ? tag.color : `#${tag.color}`;

  const textColor = getTextColorForBackground(backgroundColor);

  if (onRemove) {
    return (
      <span
        className={styles.pillTagWithClose}
        style={{
          backgroundColor,
          color: textColor,
          borderRadius,
        }}
      >
        {onTagClick ? (
          <button type="button" className={styles.tagNameButton} onClick={onTagClick}>
            {tag.name}
          </button>
        ) : (
          tag.name
        )}
        <button
          type="button"
          className={styles.tagCloseButton}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${tag.name} shift`}
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
      </span>
    );
  }

  if (onTagClick) {
    return (
      <button
        type="button"
        className={`${styles.pillTag} ${styles.pillTagButton}`}
        style={{
          backgroundColor,
          color: textColor,
          borderRadius,
        }}
        onClick={onTagClick}
      >
        {tag.name}
      </button>
    );
  }

  return (
    <span
      className={styles.pillTag}
      style={{
        backgroundColor,
        color: textColor,
        borderRadius,
      }}
    >
      {tag.name}
    </span>
  );
};

const PlusIcon = () => <Image src={icPlusAsset as string} alt="" width={12} height={12} />;

export default function RoleTableEdit({
  volunteerAssignments,
  onRemoveShiftTag,
  onAddShiftTag,
  onCreateRole,
  onEditTag,
}: RoleTableProps) {
  return (
    <div className={styles.table}>
      <div className={styles.scrollContainer}>
        <table className={styles.tableInner}>
          <thead className={styles.header}>
            <tr>
              <th className={styles.headerCell}>Assignment</th>
              <th className={styles.headerCell}>Project</th>
              <th className={styles.headerCell}>Shift</th>
            </tr>
          </thead>
          <tbody className={styles.body}>
            {volunteerAssignments.length === 0 ? (
              <tr className={styles.row}>
                <td className={`${styles.cell} ${styles.emptyState}`} colSpan={3}>
                  No assignments
                </td>
              </tr>
            ) : (
              volunteerAssignments.map((assignment) => {
                const assignmentTag = resolveTag(assignment.assignmentTagId);
                const projectTag = resolveTag(assignment.projectTagId);
                const shiftTags = resolveTags(assignment.shiftTagIds);

                return (
                  <tr key={assignment._id} className={styles.row}>
                    <td className={styles.cell}>
                      <div className={styles.tagCell}>
                        {assignmentTag ? (
                          <PillTag
                            tag={assignmentTag}
                            borderRadius="8px"
                            onTagClick={() => onEditTag?.(assignmentTag)}
                          />
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.cell}>
                      <div className={styles.tagCell}>
                        {projectTag ? (
                          <PillTag
                            tag={projectTag}
                            borderRadius="8px"
                            onTagClick={() => onEditTag?.(projectTag)}
                          />
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.cell}>
                      <div
                        className={`${styles.shiftCell} ${shiftTags.length === 0 ? styles.shiftCellEmpty : ""}`}
                      >
                        {shiftTags.length > 0 ? (
                          shiftTags.map((tag, index) => {
                            const isLastShiftTag = index === shiftTags.length - 1;

                            return (
                              <div key={tag._id} className={styles.shiftTagRow}>
                                <PillTag
                                  tag={tag}
                                  onTagClick={() => onEditTag?.(tag)}
                                  onRemove={() => {
                                    onRemoveShiftTag?.(assignment._id, tag._id);
                                  }}
                                />
                                {isLastShiftTag ? (
                                  <button
                                    type="button"
                                    className={`${styles.shiftAddButton} ${styles.shiftAddButtonInline}`}
                                    onClick={() => {
                                      onAddShiftTag?.(assignment);
                                    }}
                                    aria-label="Add shift"
                                  >
                                    <PlusIcon />
                                  </button>
                                ) : null}
                              </div>
                            );
                          })
                        ) : (
                          <button
                            type="button"
                            className={styles.shiftAddButton}
                            onClick={() => {
                              onAddShiftTag?.(assignment);
                            }}
                            aria-label="Add shift"
                          >
                            <PlusIcon />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className={styles.createRoleFooter}>
        <button
          type="button"
          className={styles.createRoleButton}
          onClick={() => {
            onCreateRole?.();
          }}
        >
          <span className={styles.createRoleText}>Create Role</span>
          <PlusIcon />
        </button>
      </div>
    </div>
  );
}
