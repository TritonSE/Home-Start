"use client";
import { Volunteer } from "../types/volunteer";
import styles from "./VolunteerProfileModal.module.css";
import { useState } from "react";

interface VolunteerProfileModalProps {
  volunteer: Volunteer | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VolunteerProfileModal({
  volunteer,
  isOpen,
  onClose,
}: VolunteerProfileModalProps) {
  const [activeTab, setActiveTab] = useState("view");

  if (!isOpen || !volunteer) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.heading}>
        <div className={styles.topper} />
        <div className={styles.headerRow}>
          <h5 className={styles.modalHeader}>View Volunteer</h5>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <img src="/ic_close.svg" alt="" />
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === "view" ? styles.tabActive : styles.tabInactive}`}
          onClick={() => setActiveTab("view")}
        >
          View
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "edit" ? styles.tabActive : styles.tabInactive}`}
          onClick={() => setActiveTab("edit")}
        >
          Edit
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "view" ? (
          <ViewContent volunteer={volunteer} />
        ) : (
          <EditContent volunteer={volunteer} />
        )}
      </div>
    </div>
  );
}

function ViewContent({ volunteer }: { volunteer: Volunteer }) {
  return (
    <>
      <div className={styles.infoSection}>
        <div className={styles.infoField}>
          <span className={styles.fieldLabel}>First Name</span>
          <span className={styles.fieldValue}>{volunteer.firstName}</span>
        </div>
        <div className={styles.infoField}>
          <span className={styles.fieldLabel}>Last Name</span>
          <span className={styles.fieldValue}>{volunteer.lastName}</span>
        </div>
        <div className={styles.infoField}>
          <span className={styles.fieldLabel}>Email</span>
          <span className={styles.fieldValue}>{volunteer.email}</span>
        </div>
        <div className={styles.infoField}>
          <span className={styles.fieldLabel}>Phone</span>
          <span className={styles.fieldValue}>{volunteer.phoneNumber}</span>
        </div>
      </div>

      <div className={styles.tagsSection}>
        <span className={styles.sectionTitle}>Tags</span>
        <div className={styles.tagsRow}>
          {volunteer.tags.map((tag, index) => {
            let colorClass = styles.tagTeal;
            // Might want to automatically cycle through colors for more tags
            if (tag == "Outside Volunteer") {
              colorClass = styles.tagOrange;
            }
            if (tag.includes("More")) {
              colorClass = styles.tagGreen;
            }
            return (
              <span
                key={`${volunteer._id}-${tag}-${index}`}
                className={`${styles.tag} ${colorClass}`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
}

function EditContent({ volunteer }: { volunteer: Volunteer }) {
  return <div>temp</div>;
}
