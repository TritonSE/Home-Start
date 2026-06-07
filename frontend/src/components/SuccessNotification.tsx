"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./SuccessNotification.module.css";

import notifIconAsset from "@/assets/notification_icons.svg";

const notifIcon = notifIconAsset as string;

export type SuccessNotificationProps = {
  message: string;
};

const SuccessNotification: React.FC<SuccessNotificationProps> = ({ message }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.notif}>
      <Image src={notifIcon} width={20} height={20} alt="" />
      <span className={styles.message}>{message}</span>
      <button className={styles.closeBtn} onClick={() => setVisible(false)} aria-label="Dismiss">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M13 1L1 13M1 1L13 13" stroke="#3BB966" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};

export default SuccessNotification;
