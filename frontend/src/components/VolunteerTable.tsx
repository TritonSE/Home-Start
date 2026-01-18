import styles from "./VolunteerTable.module.css";
import type { Volunteer } from "@/types/volunteer";

export const mockVolunteers: Volunteer[] = [
  {
    id: "1",
    firstName: "First Name",
    lastInital: "Last Initial",
    phoneNumber: "XXX-XXX-XXXX",
    email: "email@email.com",
    tags: ["Intern", "Outside Volunteer", "2+ More"],
  },
  {
    id: "2",
    firstName: "First Name",
    lastInital: "Last Initial",
    phoneNumber: "XXX-XXX-XXXX",
    email: "email@email.com",
    tags: ["Intern", "Outside Volunteer", "2+ More"],
  },
  {
    id: "3",
    firstName: "First Name",
    lastInital: "Last Initial",
    phoneNumber: "XXX-XXX-XXXX",
    email: "email@email.com",
    tags: ["Intern", "Outside Volunteer", "2+ More"],
  },
  {
    id: "4",
    firstName: "First Name",
    lastInital: "Last Initial",
    phoneNumber: "XXX-XXX-XXXX",
    email: "email@email.com",
    tags: ["Intern", "Outside Volunteer", "2+ More"],
  },
  {
    id: "5",
    firstName: "First Name",
    lastInital: "Last Initial",
    phoneNumber: "XXX-XXX-XXXX",
    email: "email@email.com",
    tags: ["Intern", "Outside Volunteer", "2+ More"],
  },
  {
    id: "6",
    firstName: "First Name",
    lastInital: "Last Initial",
    phoneNumber: "XXX-XXX-XXXX",
    email: "email@email.com",
    tags: ["Intern", "Outside Volunteer", "2+ More"],
  },
];

export default function VolunteerTable() {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.volunteerTable}>
        <colgroup>
          <col style={{ width: "197px" }} />
          <col style={{ width: "251px" }} />
          <col style={{ width: "251px" }} />
          <col style={{ width: "302px" }} />
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
          {mockVolunteers.map((volunteer) => (
            <tr key={volunteer.id}>
              <td>
                {volunteer.firstName}, {volunteer.lastInital}
              </td>
              <td>{volunteer.phoneNumber}</td>
              <td>{volunteer.email}</td>
              <td>
                <div className={styles.tagsContainer}>
                  {volunteer.tags.map((tag) => {
                    let colorClass = styles.greenPillTag;

                    if (tag == "Intern") {
                      colorClass = styles.bluePillTag;
                    }

                    if (tag == "Outside Volunteer") {
                      colorClass = styles.orangePillTag;
                    }
                    return (
                      <span key={`col1-{tag}`} className={`${styles.pillTag} ${colorClass}`}>
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </td>
              <td>
                <div className={styles.tagsContainer}>
                  {volunteer.tags.map((tag) => {
                    let colorClass = styles.greenPillTag;

                    if (tag == "Intern") {
                      colorClass = styles.bluePillTag;
                    }

                    if (tag == "Outside Volunteer") {
                      colorClass = styles.orangePillTag;
                    }
                    return (
                      <span key={`col2-{tag}`} className={`${styles.pillTag} ${colorClass}`}>
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
