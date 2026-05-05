"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { MessageHistoryModal } from "./MessageHistoryModal";
import styles from "./MessageHistorySections.module.css";

import type { Message } from "@/app/api/messages";

import { getMessages } from "@/app/api/messages";
import messageAsset from "@/assets/ic_message.svg";
import mailAsset from "@/assets/mail.svg";

const messageIcon = messageAsset as string;
const mailIcon = mailAsset as string;

const formatMessageDate = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });
};

function MessageRow({ message, onClick }: { message: Message; onClick: () => void }) {
  const iconSrc = message.type === "text" ? messageIcon : mailIcon;
  return (
    <div className={styles.messageRow} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.messageIconWrapper}>
        <Image src={iconSrc} alt="" width={24} height={24} />
      </div>
      <div className={styles.messageInfo}>
        <div className={styles.messageSubjectCol}>
          <span className={styles.messageSubject}>{message.subject}</span>
        </div>
        <div className={styles.messagemessageCol}>
          <span className={styles.messagemessage}>{message.body}</span>
        </div>
        <span className={styles.messageDate}>{formatMessageDate(message.timestamp)}</span>
      </div>
    </div>
  );
}

export function MessageHistory() {
  const [selectedMessage, setSelectedMessage] = useState<Message | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"sent" | "scheduled">("scheduled");

  const [messages, setMessages] = useState<Message[]>([]);

  const fetchMessages = () => {
    getMessages()
      .then((result) => {
        if (result.success) {
          setMessages(result.data);
          console.info(result.data);
        } else {
          console.error(result.error);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className={styles.messageSection}>
      <div className={styles.messageSectionHeader}>
        <p className={styles.sectionTitle}>Message History</p>
        <p className={styles.sectionSubtitle}>See an overview of the messages to be sent</p>
      </div>
      <div className={styles.toggleContainer}>
        <button
          className={`${styles.toggleTab} ${activeTab === "sent" ? styles.toggleTabActive : ""}`}
          onClick={() => setActiveTab("sent")}
        >
          Sent
        </button>
        <button
          className={`${styles.toggleTab} ${activeTab === "scheduled" ? styles.toggleTabActive : ""}`}
          onClick={() => setActiveTab("scheduled")}
        >
          Scheduled
        </button>
      </div>
      <div className={styles.messageList}>
        {messages
          .slice(0, 5)
          .filter((m) => (activeTab === "sent" ? m.status === "sent" : m.status === "pending"))
          .map((msg) => (
            <MessageRow key={msg._id} message={msg} onClick={() => setSelectedMessage(msg)} />
          ))}
      </div>
      <div className={styles.viewHistoryRow}>
        <Link href="#" className={styles.viewHistoryLink}>
          View Entire History
        </Link>
      </div>
      {selectedMessage && (
        <MessageHistoryModal
          message={selectedMessage}
          onClose={() => {
            setSelectedMessage(undefined);
          }}
          onActionButton={() => {
            // go to edit message flow
            console.info("Go to edit message flow");
          }}
        />
      )}
    </div>
  );
}
