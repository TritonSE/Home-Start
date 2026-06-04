import Image from "next/image";
import { useState } from "react";

import styles from "./MessageHistoryModal.module.css";
import Modal from "./Modal";

import type { Message } from "@/app/api/messages";

import icCaretdownAsset from "@/assets/ic_caretdown.svg";
import icCopyAsset from "@/assets/ic_copy.svg";
import icVolunteersWhiteAsset from "@/assets/ic_volunteers_white.svg";

const icVolunteersWhite = icVolunteersWhiteAsset as string;
const icCaretdown = icCaretdownAsset as string;
const icCopy = icCopyAsset as string;

type MessageHistoryModalProps = {
  message: Message;
  onClose: () => void;
  onActionButton: () => void;
};

// can move these to /apis for text/email history when added
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "numeric",
  day: "numeric",
  year: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function MessageHistoryModal({
  message,
  onClose,
  onActionButton,
}: MessageHistoryModalProps) {
  const [recipientDropDown, setRecipientDropDown] = useState<boolean>(false);

  const getFormattedTimestamp = () => {
    if (!message.timestamp) return "Unknown";
    const date = new Date(message.timestamp);
    if (Number.isNaN(date.getTime())) return "Invalid date";
    return `${dateFormatter.format(date)} @ ${timeFormatter.format(date)}`;
  };

  return (
    <Modal
      onClose={onClose}
      onClick={() => {
        setRecipientDropDown(false);
      }}
      width="1050px"
      radius="12px"
      title={message.type === "email" ? "Email Message" : "Text Message"}
      subtitle={
        message.status === "pending"
          ? `Scheduled to Send on ${getFormattedTimestamp()}`
          : `Sent on ${getFormattedTimestamp()}`
      }
      titleFontSize="32px"
      titleLineHeight={40}
      padding="28px"
    >
      <div className={styles.content}>
        <div className={styles.recipientsBar}>
          <Image
            src={icVolunteersWhite}
            alt="Volunteers"
            width={34}
            height={34}
            className={styles.iconBackground}
          />
          <span className={styles.recipientsBarText}>
            {message.recipients.length} Volunteer{message.recipients.length === 1 ? "" : "s"}
          </span>
          <div
            className={styles.caretWrap}
            onClick={(e) => {
              e.stopPropagation();
              setRecipientDropDown(!recipientDropDown);
            }}
          >
            <Image src={icCaretdown} alt={"Caret down"} width={12} height={7} />
            {recipientDropDown && (
              <div
                className={styles.dropdown}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <span className={styles.toLabel}>to:</span>
                <span className={styles.emails}>
                  {message.recipients.map((recipient, i) => (
                    <div key={i}>
                      {recipient.email || recipient.phoneNumber || "Unknown Recipient"}
                    </div>
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>
        {message.type === "email" && <div className={styles.text}>{message.subject}</div>}
        <div className={`${styles.text} ${styles.body}`}>{message.body}</div>
      </div>
      <div className={styles.buttons}>
        <button className={styles.secondary} onClick={onClose}>
          Cancel
        </button>
        <button className={styles.primary} onClick={onActionButton}>
          <Image src={icCopy} alt="Copy" width={20} height={20} />
          <span>Use as Template</span>
        </button>
      </div>
    </Modal>
  );
}
