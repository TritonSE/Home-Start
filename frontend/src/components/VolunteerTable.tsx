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
          <col style={{ width: "170px" }} />
          <col style={{ width: "140px" }} />
          <col style={{ width: "220px" }} />
          <col style={{ width: "140px" }} />
          <col style={{ width: "200px" }} />
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
                <span>Volunteer Type</span>
                <span>
                  <img src="/sort-arrow.svg" alt="" className={styles.sortIcon} />
                </span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Event</span>
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
                  {volunteer.tags
                    ?.filter((tag) => tag.type === "volunteer type")
                    .map((tag, index) => {
                      const colorClass = styles.pillTag;
                      return (
                        <span
                          key={`col1-${volunteer._id}-${tag}-${index}`}
                          className={`${styles.pillTag} ${colorClass}`}
                          style={{ backgroundColor: tag.color }}
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
                    ?.filter((tag) => tag.type === "event")
                    .map((tag, index) => {
                      const colorClass = styles.pillTag;
                      return (
                        <span
                          key={`col2-${volunteer._id}-${tag}-${index}`}
                          className={`${styles.pillTag} ${colorClass}`}
                          style={{ backgroundColor: tag.color }}
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
