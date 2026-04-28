"use client";
import { signOut } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type MouseEvent, useState } from "react";

import styles from "./page.module.css";

import { useTextingFlowStore } from "@/app/messages/new/_store/textingFlowStore";
import icCaretRightAsset from "@/assets/chevronBackward.svg";
import icMessageAsset from "@/assets/icMessage.svg";
import importExportAsset from "@/assets/ion_document.svg";
import mailAsset from "@/assets/mail.svg";
import { initMsal, signInWithOutlook } from "@/auth/msal";
import LogoutButton from "@/components/LogoutButton";
import LogoutModal from "@/components/LogoutModal";
import Sidebar from "@/components/Sidebar";
import { auth } from "@/firebase/firebase";

const icCaretRight = icCaretRightAsset as string;
const icMessage = icMessageAsset as string;
const importExport = importExportAsset as string;
const mail = mailAsset as string;

export default function Dashboard() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const setMode = useTextingFlowStore((s) => s.setMode);

  const sendEmails = async () => {
    setMode("email");
    if (await initMsal()) {
      void router.push("/communication");
      return;
    }

    await signInWithOutlook();
  };

  const handleSendEmailCardClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    void sendEmails();
  };

  const CARDS = [
    {
      href: "/communication",
      onClick: () => setMode("text"),
      majorText: "Send Text",
      minorText: "Reach volunteers instantly via SMS",
      icon: icMessage,
    },
    {
      href: "/communication",
      onClick: handleSendEmailCardClick,
      majorText: "Send Email",
      minorText: "Send detailed announcements",
      icon: mail,
    },
    {
      href: "some-route3",
      onClick: () => {},
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
                  key={card.majorText}
                  href={card.href}
                  onClick={card.onClick}
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
