"use client";
import { signOut } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import styles from "./page.module.css";

import chevronBackwardAsset from "@/assets/chevron_backward.svg";
import icMessageAsset from "@/assets/ic_message.svg";
import importExportAsset from "@/assets/ion_document.svg";
import mailAsset from "@/assets/mail.svg";
import LogoutButton from "@/components/LogoutButton";
import LogoutModal from "@/components/LogoutModal";
// Temp for hardcoded data
import { MessageHistory } from "@/components/MessageHistorySections";
import Sidebar from "@/components/Sidebar";
import { auth } from "@/firebase/firebase";

const chevronBackward = chevronBackwardAsset as string;
const icMessage = icMessageAsset as string;
const importExport = importExportAsset as string;
const mail = mailAsset as string;

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
      href: "/volunteers",
      majorText: "Import/Export data",
      minorText: "Manage volunteer information",
      icon: importExport,
    },
  ] as const;

  const handleLogout = async () => {
    await signOut(auth);
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
                      <Image src={card.icon} alt="" width={24} height={24} />
                    </div>
                    <div className={styles.arrowFrame}>
                      <Image src={chevronBackward} alt="" width={24} height={24} />
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
        <MessageHistory />
        <LogoutButton onLogout={() => setShowLogoutModal(true)} />
        {showLogoutModal && (
          <LogoutModal
            onClose={() => setShowLogoutModal(false)}
            onConfirm={() => {
              setShowLogoutModal(false);
              void handleLogout();
            }}
          />
        )}
      </div>
    </Sidebar>
  );
}
