import VolunteerTable from "@/components/VolunteerTable";
import SearchBar from "@/components/SearchBar";
import styles from "./page.module.css";

export default function Page() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <SearchBar />
        <VolunteerTable />
      </main>
    </div>
  );
}
