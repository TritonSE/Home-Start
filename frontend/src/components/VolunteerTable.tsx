import styles from "./VolunteerTable.module.css";
export default function VolunteerTable() {
  return (
    <table className={styles.volunteerTable}>
      <thead>
        <tr>
          <th>
            <div className={styles.headerContent}>
              Volunteer
              <img src="/sort-arrow.svg" alt="" className={styles.sortIcon} />
            </div>
          </th>
          <th>
            <div className={styles.headerContent}>
              Phone Number
              <img src="/sort-arrow.svg" alt="" className={styles.sortIcon} />
            </div>
          </th>
          <th>
            <div className={styles.headerContent}>
              Email
              <img src="/sort-arrow.svg" alt="" className={styles.sortIcon} />
            </div>
          </th>
          <th>
            <div className={styles.headerContent}>
              Tags
              <img src="/sort-arrow.svg" alt="" className={styles.sortIcon} />
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>First Name, Last Initial</td>
          <td>XXX-XXX-XXXX</td>
          <td>email@email.com</td>
          <td>Intern, Outside Volunteer, 2+ More, Intern</td>
        </tr>
        <tr>
          <td>First Name, Last Initial</td>
          <td>XXX-XXX-XXXX</td>
          <td>email@email.com</td>
          <td>Intern, Outside Volunteer, 2+ More, Intern</td>
        </tr>
        <tr>
          <td>First Name, Last Initial</td>
          <td>XXX-XXX-XXXX</td>
          <td>email@email.com</td>
          <td>Intern, Outside Volunteer, 2+ More, Intern</td>
        </tr>
        <tr>
          <td>First Name, Last Initial</td>
          <td>XXX-XXX-XXXX</td>
          <td>email@email.com</td>
          <td>Intern, Outside Volunteer, 2+ More, Intern</td>
        </tr>
        <tr>
          <td>First Name, Last Initial</td>
          <td>XXX-XXX-XXXX</td>
          <td>email@email.com</td>
          <td>Intern, Outside Volunteer, 2+ More, Intern</td>
        </tr>
        <tr>
          <td>First Name, Last Initial</td>
          <td>XXX-XXX-XXXX</td>
          <td>email@email.com</td>
          <td>Intern, Outside Volunteer, 2+ More, Intern</td>
        </tr>
      </tbody>
    </table>
  );
}
