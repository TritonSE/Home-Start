"use client";
import styles from "./page.module.css";
import Card from "../../components/card";
import icMessage from "../../../public/ic_message.png";
import mail from "../../../public/mail.png";
import importExport from "../../../public/ion_document.png";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <p className={styles.headersH2}>Dashboard</p>
      </div>

      <div className={styles.dashboardSecond}>
        <div className={styles.quickActions}>
          <p className={styles.headersH4}>Quick Actions</p>
          <p className={styles.bodyMd}>Select an action to get started</p>
        </div>

        <div className={styles.cards}>
          <Card
            icon={icMessage}
            majorText="Send Text"
            minorText="Reach volunteers instantly via SMS"
            onClick={() => router.push("some-route")}
          />
          <Card
            icon={mail}
            majorText="Send Email"
            minorText="Send detailed announcements"
            onClick={() => router.push("some-route")}
          />
          <Card
            icon={importExport}
            majorText="Import/Export Data"
            minorText="Manage volunteer information"
            onClick={() => router.push("some-router")}
          />
        </div>
      </div>
    </div>
  );
}
