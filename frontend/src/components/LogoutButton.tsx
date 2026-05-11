"use client";
import styles from "./LogoutButton.module.css";

type LogoutButtonProps = {
  onLogout: () => void;
};

export default function LogoutButton({ onLogout }: LogoutButtonProps) {
  return (
    <button className={styles.button} onClick={onLogout} type="button" aria-label="Log Out">
      <span className={styles.text}>Log Out</span>
    </button>
  );
}
