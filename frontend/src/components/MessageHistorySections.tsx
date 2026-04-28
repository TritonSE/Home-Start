"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import styles from "./MessageHistorySections.module.css";

import messageAsset from "@/assets/ic_message.svg";
import mailAsset from "@/assets/mail.svg";

const messageIcon = messageAsset as string;
const mailIcon = mailAsset as string;

type MessageType = "text" | "email";

type Message = {
  id: number;
  subject: string;
  preview: string;
  date: string;
  type: MessageType;
};

export const SCHEDULED_MESSAGES: Message[] = [
  {
    id: 1,
    subject: "Volunteer Training Reminder",
    preview: "Don't forget your upcoming training session this Friday at 9am.",
    date: "02/22/26",
    type: "text",
  },
  {
    id: 2,
    subject: "Monthly Newsletter",
    preview: "Here's a roundup of this month's highlights and upcoming events.",
    date: "02/21/26",
    type: "email",
  },
  {
    id: 3,
    subject: "Shift Confirmation",
    preview: "Your shift on Saturday has been confirmed. Please arrive 10 minutes early.",
    date: "02/20/26",
    type: "text",
  },
  {
    id: 4,
    subject: "Event Invitation",
    preview: "You're invited to our annual volunteer appreciation dinner on March 5th.",
    date: "02/03/26",
    type: "email",
  },
  {
    id: 5,
    subject: "Holiday Schedule Update",
    preview: "Please review the updated holiday schedule for the upcoming season.",
    date: "10/23/25",
    type: "text",
  },
];

export const SENT_MESSAGES: Message[] = [
  {
    id: 1,
    subject: "Welcome New Volunteers",
    preview: "We're thrilled to have you join our team! Here's what to expect.",
    date: "02/22/26",
    type: "email",
  },
  {
    id: 2,
    subject: "Weekly Check-In",
    preview: "Just checking in on this week's tasks and any questions you may have.",
    date: "02/21/26",
    type: "text",
  },
  {
    id: 3,
    subject: "Program Announcement",
    preview: "Exciting news — we're launching a new community outreach program next month.",
    date: "02/20/26",
    type: "email",
  },
  {
    id: 4,
    subject: "Urgent: Schedule Change",
    preview: "Due to unforeseen circumstances, Saturday's shift has been rescheduled.",
    date: "02/03/26",
    type: "text",
  },
  {
    id: 5,
    subject: "Year-End Summary",
    preview: "Thank you for an incredible year. Here's a look back at our impact.",
    date: "10/23/25",
    type: "email",
  },
];

function MessageRow({ message }: { message: Message }) {
  const iconSrc = message.type === "text" ? messageIcon : mailIcon;
  return (
    <div className={styles.messageRow}>
      <div className={styles.messageIconWrapper}>
        <Image src={iconSrc} alt="" width={24} height={24} />
      </div>
      <div className={styles.messageInfo}>
        <div className={styles.messageSubjectCol}>
          <span className={styles.messageSubject}>{message.subject}</span>
        </div>
        <div className={styles.messagePreviewCol}>
          <span className={styles.messagePreview}>{message.preview}</span>
        </div>
        <span className={styles.messageDate}>{message.date}</span>
      </div>
    </div>
  );
}

type MessageSectionProps = {
  title: string;
  subtitle: string;
  messages: Message[];
};

export function MessageSection({ title, subtitle, messages }: MessageSectionProps) {
  return (
    <div className={styles.messageSection}>
      <div className={styles.messageSectionHeader}>
        <p className={styles.sectionTitle}>{title}</p>
        <p className={styles.sectionSubtitle}>{subtitle}</p>
      </div>
      <div className={styles.messageList}>
        {messages.map((msg) => (
          <MessageRow key={msg.id} message={msg} />
        ))}
      </div>
      <div className={styles.viewHistoryRow}>
        <Link href="#" className={styles.viewHistoryLink}>
          View Entire History
        </Link>
      </div>
    </div>
  );
}

export function MessageHistory() {
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
          <MessageRow key={msg.id} message={msg} />
        ))}
      </div>
      <div className={styles.viewHistoryRow}>
        <Link href="#" className={styles.viewHistoryLink}>
          View Entire History
        </Link>
      </div>
    </div>
  );
}
