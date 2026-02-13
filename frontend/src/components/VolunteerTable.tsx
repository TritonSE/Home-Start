"use client";
import { Volunteer } from "../types/volunteer";
import styles from "./VolunteerTable.module.css";

interface VolunteerTableProps {
  volunteers: Volunteer[];
}

export default function VolunteerTable({ volunteers }: VolunteerTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.volunteerTable}>
        <colgroup>
          <col style={{ width: "197px" }} />
          <col style={{ width: "251px" }} />
          <col style={{ width: "251px" }} />
          <col style={{ width: "302px" }} />
        </colgroup>
        <thead>
          <tr>
            <th>
              <div className={styles.headerContent}>
                <span>Volunteer</span>
                <span>
                  <img src="/sort-arrow.svg" alt="" className={styles.sortIcon} />
                </span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Phone Number</span>
                <span>
                  <img src="/sort-arrow.svg" alt="" className={styles.sortIcon} />
                </span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Email</span>
                <span>
                  <img src="/sort-arrow.svg" alt="" className={styles.sortIcon} />
                </span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Tags</span>
                <span>
                  <img src="/sort-arrow.svg" alt="" className={styles.sortIcon} />
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map((volunteer) => (
            <tr key={volunteer._id}>
              <td>
                {volunteer.firstName}, {volunteer.lastName}
              </td>
              <td>{volunteer.phoneNumber}</td>
              <td>{volunteer.email}</td>
              <td>
                <div className={styles.tagsContainer}>
                  {volunteer.tags.map((tag, index) => {
                    let colorClass = styles.greenPillTag;

                    if (tag === "Intern") {
                      colorClass = styles.bluePillTag;
                    }

                    if (tag === "Outside Volunteer") {
                      colorClass = styles.orangePillTag;
                    }
                    return (
                      <span
                        key={`col1-${volunteer._id}-${tag}-${index}`}
                        className={`${styles.pillTag} ${colorClass}`}
                      >
                        {tag}
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
