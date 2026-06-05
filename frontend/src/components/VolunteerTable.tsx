"use client";
import { useEffect, useState } from "react";

import styles from "./VolunteerTable.module.css";

import type { VolunteerTag, VolunteerWithTags } from "@/types/volunteer";

import { COLOR_OPTIONS } from "@/components/colorOptions";

const getStoredTagStyle = (tag: VolunteerTag) => {
  const backgroundColor =
    tag.color.startsWith("#") || tag.color.startsWith("rgb") ? tag.color : `#${tag.color}`;
  const matchingColor = COLOR_OPTIONS.find(
    (option) => option.backgroundColor.toLowerCase() === backgroundColor.toLowerCase(),
  );

  return {
    backgroundColor,
    color: matchingColor?.textColor ?? "#000000",
  };
};

const getVisibleTags = (tags: VolunteerTag[], type: string, maxVisible: number) => {
  const filteredTags = tags.filter((tag) => tag.type === type);

  return {
    visibleTags: filteredTags.slice(0, maxVisible),
    hiddenCount: Math.max(filteredTags.length - maxVisible, 0),
  };
};

type VolunteerTableProps = {
  volunteers: VolunteerWithTags[];
  selectableVolunteers?: VolunteerWithTags[];
  controlledSelectedIds?: Set<string>;
  onControlledToggleOne?: (id: string) => void;
  onControlledToggleAll?: (scope: VolunteerWithTags[]) => void;
  onVolunteerSelect?: (volunteer: VolunteerWithTags) => void;
};

export default function VolunteerTable({
  volunteers,
  selectableVolunteers,
  controlledSelectedIds,
  onControlledToggleOne,
  onControlledToggleAll,
  onVolunteerSelect,
}: VolunteerTableProps) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
  const isControlled = controlledSelectedIds !== undefined;
  const selectedIds = isControlled ? controlledSelectedIds : internalSelectedIds;

  const selectionScope = selectableVolunteers ?? volunteers;

  const allSelected =
    selectionScope.length > 0 &&
    selectionScope.every((volunteer) => selectedIds.has(volunteer._id));
  const someSelected = selectionScope.some((volunteer) => selectedIds.has(volunteer._id));

  function toggleAll() {
    if (isControlled) {
      onControlledToggleAll?.(selectionScope);
      return;
    }
    if (allSelected) {
      setInternalSelectedIds(new Set());
    } else {
      setInternalSelectedIds(new Set(selectionScope.map((volunteer) => volunteer._id)));
    }
  }

  useEffect(() => {
    if (!isControlled) {
      setInternalSelectedIds(new Set());
    }
  }, [selectionScope, isControlled]);

  function toggleOne(id: string) {
    if (isControlled) {
      onControlledToggleOne?.(id);
      return;
    }
    setInternalSelectedIds((prev) => {
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
          {[
            <col key="checkbox" style={{ width: "40px" }} />,
            <col key="lastName" style={{ width: "140px" }} />,
            <col key="firstName" style={{ width: "140px" }} />,
            <col key="phoneNumber" style={{ width: "200px" }} />,
            <col key="email" style={{ width: "320px" }} />,
            <col key="status" style={{ width: "120px" }} />,
            <col key="program" style={{ width: "340px" }} />,
            <col key="assignment" style={{ width: "380px" }} />,
            <col key="project" style={{ width: "300px" }} />,
          ]}
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
            <th className={styles.nameColumn}>
              <div className={styles.headerContent}>
                <span>Last Name</span>
              </div>
            </th>
            <th className={styles.nameColumn}>
              <span className={styles.stickyDivider} aria-hidden="true" />
              <div className={styles.headerContent}>
                <span>First Name</span>
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
            <th>
              <div className={styles.headerContent}>
                <span>Status</span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Program</span>
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
          </tr>
        </thead>
        <tbody>
          {volunteers.map((volunteer) => (
            <tr
              key={volunteer._id}
              className={selectedIds.has(volunteer._id) ? styles.selectedRow : ""}
              onClick={() => onVolunteerSelect?.(volunteer)}
              style={{ cursor: onVolunteerSelect ? "pointer" : "default" }}
            >
              <td className={styles.checkboxCell} onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selectedIds.has(volunteer._id)}
                  onChange={() => toggleOne(volunteer._id)}
                  onClick={(event) => event.stopPropagation()}
                  aria-label={`Select ${volunteer.firstName} ${volunteer.lastName}`}
                />
              </td>
              <td className={styles.nameColumn}>{volunteer.lastName}</td>
              <td className={styles.nameColumn}>
                <span className={styles.stickyDivider} aria-hidden="true" />
                {volunteer.firstName}
              </td>
              <td>{volunteer.phoneNumber}</td>
              <td>{volunteer.email}</td>
              <td>
                <div className={styles.tagsContainer}>
                  <span
                    className={
                      volunteer.status === "new" ? styles.pillTagNew : styles.pillTagReturning
                    }
                  >
                    {(volunteer.status ?? "new").charAt(0).toUpperCase() +
                      (volunteer.status ?? "new").slice(1)}
                  </span>
                </div>
              </td>

              <td>
                <div className={styles.tagsContainerNoWrap}>
                  {(() => {
                    const { visibleTags, hiddenCount } = getVisibleTags(
                      volunteer.tags ?? [],
                      "program",
                      1,
                    );

                    return (
                      <>
                        {visibleTags.map((tag, index) => {
                          const tagStyle = getStoredTagStyle(tag);
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

              <td>
                <div className={styles.tagsContainerNoWrap}>
                  {(() => {
                    const { visibleTags, hiddenCount } = getVisibleTags(
                      volunteer.tags ?? [],
                      "assignment",
                      2,
                    );

                    return (
                      <>
                        {visibleTags.map((tag, index) => {
                          const tagStyle = getStoredTagStyle(tag);
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
                      volunteer.projectTagIds ?? [],
                      "project",
                      1,
                    );

                    return (
                      <>
                        {visibleTags.map((tag, index) => {
                          const tagStyle = getStoredTagStyle(tag);
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
