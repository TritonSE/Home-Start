import Image from "next/image";
import Link from "next/link";

import styles from "./MessageHistorySections.module.css";

import messageAsset from "@/assets/ic_message.svg";
import documentAsset from "@/assets/ion_document.svg";
import mailAsset from "@/assets/mail.svg";

const messageIcon = messageAsset as string;
const mailIcon = mailAsset as string;
const documentIcon = documentAsset as string;

type MessageType = "text" | "email";

type Message = {
  id: number;
  subject: string;
  date: string;
  type: MessageType;
};

export const SCHEDULED_MESSAGES: Message[] = [
  { id: 1, subject: "Volunteer Training Reminder", date: "02/22/26", type: "text" },
  { id: 2, subject: "Monthly Newsletter", date: "02/21/26", type: "email" },
  { id: 3, subject: "Shift Confirmation", date: "02/20/26", type: "text" },
  { id: 4, subject: "Event Invitation", date: "02/03/26", type: "email" },
  { id: 5, subject: "Holiday Schedule Update", date: "10/23/25", type: "text" },
];

export const SENT_MESSAGES: Message[] = [
  { id: 1, subject: "Welcome New Volunteers", date: "02/22/26", type: "email" },
  { id: 2, subject: "Weekly Check-In", date: "02/21/26", type: "text" },
  { id: 3, subject: "Program Announcement", date: "02/20/26", type: "email" },
  { id: 4, subject: "Urgent: Schedule Change", date: "02/03/26", type: "text" },
  { id: 5, subject: "Year-End Summary", date: "10/23/25", type: "email" },
];

function MessageRow({ message }: { message: Message }) {
  let iconSrc;
  if (message.type === "text") {
    iconSrc = messageIcon;
  } else if (message.type === "email") {
    iconSrc = mailIcon;
  } else {
    iconSrc = documentIcon;
  }
  return (
    <div className={styles.messageRow}>
      <div className={styles.messageRowLeft}>
        <Image src={iconSrc} alt="" width={20} height={20} />
        <span className={styles.messageSubject}>{message.subject}</span>
      </div>
      <span className={styles.messageDate}>{message.date}</span>
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
        {messages.map((msg, idx) => (
          <div key={msg.id}>
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
    </div>
  );
}
