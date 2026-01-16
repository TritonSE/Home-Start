import VolunteerTable from "@/components/VolunteerTable";
import styles from "./page.module.css";

export default function Page() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <VolunteerTable />
      </main>
    </div>
  );
}
