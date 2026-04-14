"use client"

import Image from "next/image";
import styles from "./MessageButton.module.css";

export default function MessageButton() {
    return (
        <button className={styles.messageButton} aria-label="Send Message">
            <Image
                src="/Message.svg"
                alt=""
                width={24}
                height={24}
                className={styles.messageIcon}
                aria-hidden="true"
            />
            <span className={styles.messageButtonText}>Send Message</span>
        </button>
    );
}