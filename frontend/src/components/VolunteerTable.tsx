"use client";
import { useState } from "react";

import styles from "./VolunteerTable.module.css";

import type { Volunteer } from "../types/volunteer";

type VolunteerTableProps = {
  volunteers: Volunteer[];
};

export default function VolunteerTable({ volunteers }: VolunteerTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = volunteers.length > 0 && volunteers.every((v) => selectedIds.has(v._id));
  const someSelected = volunteers.some((v) => selectedIds.has(v._id));

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(volunteers.map((v) => v._id)));
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
          <col style={{ width: "60px" }} />
          <col style={{ width: "150px" }} />
          <col style={{ width: "160px" }} />
          <col style={{ width: "230px" }} />
          <col style={{ width: "180px" }} />
          <col style={{ width: "230px" }} />
          <col style={{ width: "350px" }} />
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
                <span>Volunteer</span>
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
                <span>Volunteer Type</span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Event</span>
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
              <td>
                {volunteer.firstName}, {volunteer.lastName}
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
