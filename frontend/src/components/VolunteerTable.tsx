"use client";
import { Volunteer } from "../types/volunteer";
import styles from "./VolunteerTable.module.css";
import { useState, useEffect } from "react";

interface VolunteerTableProps {
  volunteers: Volunteer[];
}

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
          <col style={{ width: "44px" }} />
          <col style={{ width: "197px" }} />
          <col style={{ width: "251px" }} />
          <col style={{ width: "251px" }} />
          <col style={{ width: "302px" }} />
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
                <span>Tags</span>
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
                  {volunteer.tags.map((tag, index) => {
                    let colorClass = styles.greenPillTag;

                    if (tag.name === "Intern") {
                      colorClass = styles.bluePillTag;
                    }

                    if (tag.name === "Outside Volunteer") {
                      colorClass = styles.orangePillTag;
                    }
                    return (
                      <span
                        key={`col1-${volunteer._id}-${tag._id}-${index}`}
                        className={`${styles.pillTag} ${colorClass}`}
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
