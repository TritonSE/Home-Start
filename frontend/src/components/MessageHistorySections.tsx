"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { MessageHistoryModal } from "./MessageHistoryModal";
import styles from "./MessageHistorySections.module.css";

import messageAsset from "@/assets/ic_message.svg";
import mailAsset from "@/assets/mail.svg";

const messageIcon = messageAsset as string;
const mailIcon = mailAsset as string;

type MessageType = "text" | "email";

const formatMessageDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });
};

export type Message = {
  id: number;
  subject: string;
  date: Date;
  type: MessageType;
  message: string;
  recipients: string[];
  status: string;
};
export const SCHEDULED_MESSAGES: Message[] = [
  {
    id: 1,
    subject: "Volunteer Training Reminder",
    date: new Date("02/22/26"),
    type: "text",
    message: "message",
    recipients: [
      "email@gmail.com",
      "email2@gmail.com",
      "email@gmail.com",
      "email2@gmail.com",
      "email@gmail.com",
      "email2@gmail.com",
      "email@gmail.com",
      "email2@gmail.com",
      "email@gmail.com",
      "email2@gmail.com",
      "email@gmail.com",
      "email2@gmail.com",
      "email@gmail.com",
      "email2@gmail.com",
      "longerlongemail@gmail.com",
    ],
    status: "pending",
  },
  {
    id: 2,
    subject: "Monthly Newsletter",
    date: new Date("02/21/26"),
    type: "email",
    message: "message",
    recipients: [],
    status: "pending",
  },
  {
    id: 3,
    subject: "Shift Confirmation",
    date: new Date("02/20/26"),
    type: "text",
    message: "message",
    recipients: [],
    status: "pending",
  },
  {
    id: 4,
    subject: "Event Invitation",
    date: new Date("02/03/26"),
    type: "email",
    message: "message",
    recipients: [],
    status: "pending",
  },
  {
    id: 5,
    subject: "Holiday Schedule Update",
    date: new Date("10/23/25"),
    type: "text",
    message: "message",
    recipients: [],
    status: "pending",
  },
];

export const SENT_MESSAGES: Message[] = [
  {
    id: 1,
    subject: "Welcome New Volunteers",
    date: new Date("02/22/26"),
    type: "email",
    message: "message",
    recipients: [],
    status: "sent",
  },
  {
    id: 2,
    subject: "Weekly Check-In",
    date: new Date("02/21/26"),
    type: "text",
    message: "message",
    recipients: [],
    status: "sent",
  },
  {
    id: 3,
    subject: "Program Announcement",
    date: new Date("02/20/26"),
    type: "email",
    message: "message",
    recipients: [],
    status: "sent",
  },
  {
    id: 4,
    subject: "Urgent: Schedule Change",
    date: new Date("02/03/26"),
    type: "text",
    message: "message",
    recipients: [],
    status: "sent",
  },
  {
    id: 5,
    subject: "Year-End Summary",
    date: new Date("10/23/25"),
    type: "email",
    message: "message",
    recipients: [],
    status: "sent",
  },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "numeric",
  day: "numeric",
  year: "2-digit",
});

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
          <span className={styles.messagemessage}>{message.message}</span>
        </div>
        <span className={styles.messageDate}>{formatMessageDate(message.date)}</span>
      </div>
    </div>
  );
}

export function MessageHistory() {
  const [selectedMessage, setSelectedMessage] = useState<Message | undefined>(undefined);

  const [activeTab, setActiveTab] = useState<"sent" | "scheduled">("scheduled");
  const messages = activeTab === "sent" ? SENT_MESSAGES : SCHEDULED_MESSAGES;

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
        {messages.map((msg) => (
          <MessageRow
            key={msg.id}
            onClick={() => {
              setSelectedMessage(msg);
            }}
            message={msg}
          />
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
