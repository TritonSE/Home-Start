import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { MessageHistoryModal } from "./MessageHistoryModal";
import styles from "./MessageHistorySections.module.css";

import documentAsset from "@/assets/ion_document.svg";

const documentIcon = documentAsset as string;

type MessageType = "text" | "email";

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

function MessageRow({ message }: { message: Message }) {
  return (
    <div className={styles.messageRow}>
      <div className={styles.messageRowLeft}>
        <Image src={documentIcon} alt="" width={20} height={20} />
        <span className={styles.messageSubject}>{message.subject}</span>
      </div>
      <span className={styles.messageDate}>{dateFormatter.format(message.date)}</span>
    </div>
  );
}

type MessageSectionProps = {
  title: string;
  subtitle: string;
  messages: Message[];
};

export function MessageSection({ title, subtitle, messages }: MessageSectionProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | undefined>(undefined);

  return (
    <div className={styles.messageSection}>
      <div className={styles.messageSectionHeader}>
        <p className={styles.sectionTitle}>{title}</p>
        <p className={styles.sectionSubtitle}>{subtitle}</p>
      </div>
      <div className={styles.messageList}>
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            onClick={() => {
              setSelectedMessage(msg);
            }}
          >
            <MessageRow message={msg} />
            {idx < messages.length - 1 && <div className={styles.messageDivider} />}
          </div>
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
