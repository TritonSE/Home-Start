import Image from "next/image";
import { useState } from "react";

import styles from "./MessageHistoryModal.module.css";
import Modal from "./Modal";

import type { Message } from "./MessageHistorySections";

import icCaretdownAsset from "@/assets/ic_caretdown.svg";
import icVolunteersWhiteAsset from "@/assets/ic_volunteers_white.svg";

const icVolunteersWhite = icVolunteersWhiteAsset as string;
const icCaretdown = icCaretdownAsset as string;

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

  return (
    <Modal
      onClose={onClose}
      onClick={() => {
        setRecipientDropDown(false);
      }}
      width="1050px"
      radius="12px"
      title="Text Message"
      subtitle={
        message.status === "pending"
          ? `Scheduled to Send on ${dateFormatter.format(message.date)} @ ${timeFormatter.format(message.date)}`
          : `Sent on ${dateFormatter.format(message.date)} @ ${timeFormatter.format(message.date)}`
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
                    <div key={i}>{recipient}</div>
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>
        {message.type === "email" && <div className={styles.text}>{message.subject}</div>}
        <div className={`${styles.text} ${styles.body}`}>{message.message}</div>
      </div>
      <div className={styles.buttons}>
        <button className={styles.secondary} onClick={onClose}>
          Cancel
        </button>

        <button
          className={`${styles.primary} ${message.status === "pending" ? styles.editMessage : styles.useMessage}`}
          onClick={onActionButton}
        >
          {message.status === "pending" ? "Edit Message" : "Use Message as Template"}
        </button>
      </div>
    </Modal>
  );
}
