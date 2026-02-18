"use client";
import styles from "./page.module.css";
import icMessage from "../../../public/ic_message.svg";
import mail from "../../../public/mail.svg";
import importExport from "../../../public/ion_document.svg";
import icCaretRight from "../../../public/chevron_backward.svg";
import icCloseLarge from "../../../public/ic_close_large.svg";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface LogoutConfirmBoxProps {
  open: boolean;
  onCancel: () => void;
  onLogOut: () => void;
}

function LogoutConfirmBox({ open, onCancel, onLogOut }: LogoutConfirmBoxProps) {
  if (!open) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <div className={styles.popupHeader}>
          <p>Are you sure you want to log out?</p>
          <Image src={icCloseLarge} alt="" />
        </div>
        <div className={styles.stackedButtons}>
          <button className={styles.cancel} onClick={onCancel}>
            <span className={styles.cancelText}>Cancel</span>
          </button>
          <button className={styles.innerLogOut} onClick={onLogOut}>
            <span className={styles.innerLogOutText}>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [showPopUp, setShowPopup] = useState<boolean>(false);
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

  const onCancel = () => {
    setShowPopup(false);
  };

  const onLogOut = () => {
    setShowPopup(false);
  };

  return (
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
      <button className={styles.logOut} onClick={() => setShowPopup(true)}>
        <span className={styles.logOutText}>Log Out</span>
      </button>
      <LogoutConfirmBox open={showPopUp} onCancel={onCancel} onLogOut={onLogOut} />
    </div>
  );
}
