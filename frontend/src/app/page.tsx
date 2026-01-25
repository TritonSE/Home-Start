import VolunteerTable from "@/components/VolunteerTable";
import TitleBar from "@/components/TitleBar";
import SearchBar from "@/components/SearchBar";
import UploadButton from "@/components/UploadButton";
import PageBar from "@/components/PageBar";
import styles from "./page.module.css";

export default function Page() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <TitleBar />
        <SearchBar />
        <VolunteerTable />
        <PageBar totalItems={100} />
      </main>
    </div>
  );
}
