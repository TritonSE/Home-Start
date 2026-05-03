"use client";
import { useEffect, useState } from "react";

import styles from "./VolunteerTable.module.css";

import type { Volunteer, VolunteerTag } from "@/types/volunteer";

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

const getVisibleTags = (tags: VolunteerTag[], type: string, maxVisible: number) => {
  const filteredTags = tags.filter((tag) => tag.type === type);

  return {
    visibleTags: filteredTags.slice(0, maxVisible),
    hiddenCount: Math.max(filteredTags.length - maxVisible, 0),
  };
};

type VolunteerTableProps = {
  volunteers: Volunteer[];
  selectableVolunteers?: Volunteer[];
  onSelectedCountChange?: (count: number) => void;
};

const renderVolunteerTags = (tags: VolunteerTag[], type: string) => {
  return tags.filter((tag) => tag.type === type);
};

export default function VolunteerTable({
  volunteers,
  selectableVolunteers,
  onSelectedCountChange,
}: VolunteerTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectionScope = selectableVolunteers ?? volunteers;

  useEffect(() => {
    onSelectedCountChange?.(selectedIds.size);
  }, [selectedIds, onSelectedCountChange]);

  useEffect(() => {
    deselectAll();
  }, [selectionScope]);

  const allSelected =
    selectionScope.length > 0 &&
    selectionScope.every((volunteer) => selectedIds.has(volunteer._id));
  const someSelected = selectionScope.some((volunteer) => selectedIds.has(volunteer._id));

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectionScope.map((volunteer) => volunteer._id)));
    }
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.volunteerTable}>
        <colgroup>
          <col style={{ width: "40px" }} />
          <col style={{ width: "160px" }} />
          <col style={{ width: "160px" }} />
          <col style={{ width: "180px" }} />
          <col style={{ width: "230px" }} />
          <col style={{ width: "280px" }} />
          <col style={{ width: "400px" }} />
          <col style={{ width: "310px" }} />
          <col style={{ width: "310px" }} />
        </colgroup>
        <thead>
          <tr>
            <th className={styles.checkboxCell}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={toggleAll}
                aria-label="Select all volunteers"
              />
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Last Name</span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>First Name</span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Status</span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Assignment</span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Project</span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Program</span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Phone Number</span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Email</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map((volunteer) => (
            <tr
              key={volunteer._id}
              className={selectedIds.has(volunteer._id) ? styles.selectedRow : ""}
            >
              <td className={styles.checkboxCell}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selectedIds.has(volunteer._id)}
                  onChange={() => toggleOne(volunteer._id)}
                  aria-label={`Select ${volunteer.firstName} ${volunteer.lastName}`}
                />
              </td>
              <td>{volunteer.lastName}</td>
              <td>{volunteer.firstName}</td>

              <td>
                <div className={styles.tagsContainer}>
                  <span
                    className={
                      volunteer.status === "new" ? styles.pillTagNew : styles.pillTagReturning
                    }
                  >
                    {volunteer.status.charAt(0).toUpperCase() + volunteer.status.slice(1)}
                  </span>
                </div>
              </td>

              <td>
                <div className={styles.tagsContainer}>
                  {renderVolunteerTags(volunteer.tags ?? [], "assignment")
                    .filter((tag) => tag.type === "assignment")
                    .map((tag, index) => {
                      const tagStyle = getTagPaletteStyle(tag);
                      return (
                        <span
                          key={`col2-${volunteer._id}-${tag.name}-${index}`}
                          className={styles.pillTag}
                          style={{
                            backgroundColor: tagStyle.backgroundColor,
                            color: tagStyle.color,
                          }}
                        >
                          {tag.name}
                        </span>
                      );
                    })}
                </div>
              </td>

              <td>
                <div className={styles.tagsContainerNoWrap}>
                  {(() => {
                    const { visibleTags, hiddenCount } = getVisibleTags(
                      volunteer.tags ?? [],
                      "project",
                      1,
                    );

                    return (
                      <>
                        {visibleTags.map((tag, index) => {
                          const tagStyle = getTagPaletteStyle(tag);
                          return (
                            <span
                              key={`col2-${volunteer._id}-${tag.name}-${index}`}
                              className={styles.pillTag}
                              style={{
                                backgroundColor: tagStyle.backgroundColor,
                                color: tagStyle.color,
                              }}
                            >
                              {tag.name}
                            </span>
                          );
                        })}
                        {hiddenCount > 0 && (
                          <span className={styles.tagOverflowPill}>{hiddenCount}+</span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </td>

              <td>
                <div className={styles.tagsContainerNoWrap}>
                  {(() => {
                    const { visibleTags, hiddenCount } = getVisibleTags(
                      volunteer.tags ?? [],
                      "program",
                      2,
                    );

                    return (
                      <>
                        {visibleTags.map((tag, index) => {
                          const tagStyle = getTagPaletteStyle(tag);
                          return (
                            <span
                              key={`col4-${volunteer._id}-${tag.name}-${index}`}
                              className={styles.pillTag}
                              style={{
                                backgroundColor: tagStyle.backgroundColor,
                                color: tagStyle.color,
                              }}
                            >
                              {tag.name}
                            </span>
                          );
                        })}
                        {hiddenCount > 0 && (
                          <span className={styles.tagOverflowPill}>{hiddenCount}+</span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </td>

              <td>{volunteer.phoneNumber}</td>
              <td>{volunteer.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
