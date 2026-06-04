"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

import { COLOR_OPTIONS } from "@/components/colorOptions";
import styles from "./CreateShiftModal.module.css";

import type { VolunteerAssignment, VolunteerTag } from "@/types/volunteer";

import { createTag, fetchTags } from "@/app/api/tag";
import { updateVolunteerAssignment } from "@/app/api/volunteer";
import icCloseLargeAsset from "@/assets/ic_close_large.svg";

const icCloseLarge = icCloseLargeAsset as string;

type Props = {
  onClose: () => void;
  assignment: VolunteerAssignment | null;
  onSaved?: (result: "linked-existing" | "created-and-linked") => void;
};

type ResolvedShiftTag = {
  tag: VolunteerTag;
  wasCreated: boolean;
};

function CheckIcon({ color }: { color: string }) {
  return (
    <svg className={styles.checkIcon} viewBox="0 0 11 10" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.66491 0.254634C9.89127 -0.0379366 10.3041 -0.0853717 10.5871 0.148685C10.87 0.382742 10.9159 0.809658 10.6895 1.10223L3.79281 8.91205C3.54853 9.22778 3.09308 9.25387 2.81657 8.96796L0.192212 6.25431C-0.0640045 5.98937 -0.0640045 5.55983 0.192212 5.29489C0.448428 5.02996 0.863836 5.02996 1.12005 5.29489L3.22609 7.47259L9.66491 0.254634Z"
        fill={color}
      />
    </svg>
  );
}

export default function CreateShiftModal({ onClose, assignment, onSaved }: Props) {
  const [tagName, setTagName] = useState("");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [shiftTags, setShiftTags] = useState<VolunteerTag[]>([]);
  const isTagNameEmpty = tagName.trim().length === 0;

  const fetchAllShiftTags = async () => {
    try {
      const allTags = await fetchTags();
      const filtered = allTags.filter((tag) => tag.type === "shift");
      setShiftTags(filtered);
    } catch (err) {
      console.error("Failed to fetch shift tags in CreateShiftModal:", err);
    }
  };

  useEffect(() => {
    void fetchAllShiftTags();
  }, []);

  async function getShiftTag(): Promise<ResolvedShiftTag | undefined> {
    const query = tagName.trim();
    if (!query) return undefined;

    // Search for existing shift tag matching the name (case-insensitive)
    const existing = shiftTags.find((t) => t.name.trim().toLowerCase() === query.toLowerCase());
    if (existing) {
      return { tag: existing, wasCreated: false };
    }

    // Create a new shift tag with the selected color
    try {
      const color = COLOR_OPTIONS[selectedColorIndex]?.backgroundColor ?? "#FFFFFF";
      const newTag = await createTag({ name: query, color, type: "shift" });
      setShiftTags((prev) => [...prev, newTag]);
      return { tag: newTag, wasCreated: true };
    } catch (err) {
      // On conflict, re-fetch and try to find the tag again
      const latest = await fetchTags().catch(() => [] as VolunteerTag[]);
      if (latest.length > 0) {
        const shifted = latest.filter((tag) => tag.type === "shift");
        setShiftTags(shifted);
        const existingAfterRefresh = shifted.find(
          (t) => t.name.trim().toLowerCase() === query.toLowerCase(),
        );
        if (existingAfterRefresh) {
          return { tag: existingAfterRefresh, wasCreated: false };
        }
      }
      console.error("Failed to create shift tag:", err);
      return undefined;
    }
  }

  const handleSubmit = async () => {
    if (!assignment) {
      console.warn("No assignment provided for CreateShiftModal.handleSubmit");
      return;
    }

    try {
      const resolvedShiftTag = await getShiftTag();
      if (!resolvedShiftTag) {
        console.error("Failed to get or create shift tag");
        return;
      }

      const tagId = resolvedShiftTag.tag._id;
      const currentShiftTagIds = assignment.shiftTagIds.map((tag) =>
        typeof tag === "string" ? tag : tag._id,
      );

      if (!currentShiftTagIds.includes(tagId)) {
        currentShiftTagIds.push(tagId);
      }

      await updateVolunteerAssignment(assignment._id, {
        shiftTagIds: currentShiftTagIds,
      });

      onSaved?.(resolvedShiftTag.wasCreated ? "created-and-linked" : "linked-existing");
      onClose();
    } catch (err) {
      console.error("Failed to add shift tag to assignment:", err);
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <p className={styles.title}>Create/Add Shift</p>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <Image src={icCloseLarge} alt="" width={20} height={20} />
          </button>
        </div>

        <div className={styles.divider} />

        <div className={styles.inputField}>
          <div className={styles.textField}>
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Input Tag Name"
            />
          </div>
        </div>

        <div className={styles.colorSelector}>
          {COLOR_OPTIONS.map((option, index) => {
            const isSelected = selectedColorIndex === index;
            return (
              <button
                key={option.name}
                type="button"
                className={styles.colorButton}
                style={{ backgroundColor: option.backgroundColor, color: option.textColor }}
                onClick={() => setSelectedColorIndex(index)}
                aria-label={`Select ${option.name} color`}
              >
                {isSelected ? (
                  <CheckIcon color={option.textColor} />
                ) : (
                  <span className={styles.colorButtonLabel}>A</span>
                )}
              </button>
            );
          })}
        </div>

        <div className={styles.divider} />

        <div className={styles.actions}>
          <button className={styles.secondary} onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className={styles.primary}
            onClick={() => {
              void handleSubmit();
            }}
            type="button"
            disabled={isTagNameEmpty}
          >
            Add Tag
          </button>
        </div>
      </div>
    </>
  );
}
