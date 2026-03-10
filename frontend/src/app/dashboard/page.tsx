"use client";
import styles from "./page.module.css";
import icMessage from "../../../public/ic_message.svg";
import mail from "../../../public/mail.svg";
import importExport from "../../../public/ion_document.svg";
import icCaretRight from "../../../public/chevron_backward.svg";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "../components/LogoutButton";
import { useState } from "react";
import LogoutModal from "../components/LogoutModal";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import Sidebar from "../components/sidebar";

export default function Dashboard() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const CARDS = [
    {
      href: "some-route",
      majorText: "Send Text",
      minorText: "Reach volunteers instantly via SMS",
      icon: icMessage,
    },
    {
      href: "some-route2",
      majorText: "Send Email",
      minorText: "Send detailed announcements",
      icon: mail,
    },
    {
      href: "some-route3",
      majorText: "Import/Export data",
      minorText: "Manage volunteer information",
      icon: importExport,
    },
  ] as const;

  const handleLogout = async () => {
    await signOut(auth);

    // delete the login cookie created in LoginForm
    document.cookie = "firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = "/login";
  };

  return (
    <Sidebar>
      <div className={styles.dashboard}>
        <div className={styles.dashboardHeader}>
          <p className={styles.headersH2}>Dashboard</p>
        </div>

        <div className={styles.dashboardSecond}>
          <div className={styles.quickActions}>
            <p className={styles.headersH4}>Quick Actions</p>
            <p className={styles.bodyMdLong}>Select an action to get started</p>
            <p className={styles.bodyMdShort}>Select to start</p>
          </div>

          <div className={styles.cards}>
            {CARDS.map((card) => {
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className={styles.card}
                  aria-current={undefined}
                >
                  <div className={styles.frame1}>
                    <div className={styles.iconFrame}>
                      <Image src={card.icon} alt="" />
                    </div>
                    <div className={styles.arrowFrame}>
                      <Image src={icCaretRight} alt="" />
                    </div>
                  </div>
                  <div className={styles.frame2}>
                    <p className={styles.headersH5}>{card.majorText}</p>
                  </div>
                  <div className={styles.frame3}>
                    <p className={styles.bodyMd}>{card.minorText}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        <LogoutButton onLogout={() => setShowLogoutModal(true)} />
        {showLogoutModal && (
          <LogoutModal
            onClose={() => setShowLogoutModal(false)}
            onConfirm={async () => {
              setShowLogoutModal(false);
              await handleLogout();
            }}
          />
        )}
      </div>
    </Sidebar>
  );
}
