import VolunteerTable from "@/components/VolunteerTable";
import SearchBar from "@/components/SearchBar";
import ActionBar from "@/components/ActionBar";
import styles from "./page.module.css";

export default function Page() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <SearchBar />
        <VolunteerTable />
        <ActionBar />
      </main>
    </div>
  );
}
