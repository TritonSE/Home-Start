"use client";
import styles from "./LogoutButton.module.css";

type LogoutButtonProps = {
  onLogout: () => void;
};

export default function LogoutButton({ onLogout }: LogoutButtonProps) {
  return (
    <button className={styles.button} onClick={onLogout} type="button" aria-label="Log out">
      <span className={styles.text}>Logout</span>
    </button>
  );
}
