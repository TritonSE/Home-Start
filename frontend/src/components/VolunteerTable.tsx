"use client";
import { useEffect, useState } from "react";

import styles from "./VolunteerTable.module.css";

import type { Volunteer } from "../types/volunteer";

type VolunteerTableProps = {
  volunteers: Volunteer[];
  selectableVolunteers?: Volunteer[];
  onSelectedCountChange?: (count: number) => void;
};

export default function VolunteerTable({
  volunteers,
  selectableVolunteers,
  onSelectedCountChange,
}: VolunteerTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectionScope = selectableVolunteers ?? volunteers;

  useEffect(() => {
    const selectableIds = new Set(selectionScope.map((volunteer) => volunteer._id));
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => selectableIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [selectionScope]);

  useEffect(() => {
    onSelectedCountChange?.(selectedIds.size);
  }, [selectedIds, onSelectedCountChange]);

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
          <col style={{ width: "130px" }} />
          <col style={{ width: "304px" }} />
          <col style={{ width: "304px" }} />
          <col style={{ width: "240px" }} />
          <col style={{ width: "240px" }} />
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
                <span>Volunteer Type</span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Event</span>
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
                  {volunteer.tags
                    ?.filter((tag) => tag.type === "Volunteer Type")
                    .map((tag, index) => {
                      const colorClass = styles.pillTag;
                      const bgColor = tag?.color
                        ? tag.color.startsWith("#")
                          ? tag.color
                          : `#${tag.color}`
                        : undefined;
                      return (
                        <span
                          key={`col2-${volunteer._id}-${tag.name}-${index}`}
                          className={`${styles.pillTag} ${colorClass}`}
                          style={{ backgroundColor: bgColor }}
                        >
                          {tag.name}
                        </span>
                      );
                    })}
                </div>
              </td>

              <td>
                <div className={styles.tagsContainer}>
                  {volunteer.tags
                    ?.filter((tag) => tag.type === "Event")
                    .map((tag, index) => {
                      const colorClass = styles.pillTag;
                      const bgColor = tag?.color
                        ? tag.color.startsWith("#")
                          ? tag.color
                          : `#${tag.color}`
                        : undefined;
                      return (
                        <span
                          key={`col2-${volunteer._id}-${tag.name}-${index}`}
                          className={`${styles.pillTag} ${colorClass}`}
                          style={{ backgroundColor: bgColor }}
                        >
                          {tag.name}
                        </span>
                      );
                    })}
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
