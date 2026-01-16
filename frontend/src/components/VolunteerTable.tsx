import styles from "./VolunteerTable.module.css";
export default function VolunteerTable() {
  return (
    <table className={styles.volunteerTable}>
      <thead>
        <tr>
          <th>Volunteer</th>
          <th>Phone Number</th>
          <th>Email</th>
          <th>Tags</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Koji Nakazawa</td>
          <td>555-555-5555</td>
          <td>koji@example.com</td>
          <td>Tag 1, Tag 2</td>
        </tr>
        <tr>
          <td>John Doe</td>
          <td>888-888-8888</td>
          <td>john.doe@example.com</td>
          <td>Tag 3, Tag 4</td>
        </tr>
      </tbody>
    </table>
  );
}
