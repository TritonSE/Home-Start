"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./SuccessNotification.module.css";

export type SuccessNotificationProps = {
  message: string;
};

const SuccessNotification: React.FC<SuccessNotificationProps> = ({ message }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000); // Hide after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.notif}>
      <Image src="/check.svg" width={20} height={20} alt="check" />
      {message}
    </div>
  );
};

export default SuccessNotification;
