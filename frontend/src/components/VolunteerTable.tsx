"use client";
import { Volunteer } from "../types/volunteer";
import styles from "./VolunteerTable.module.css";
import { fetchVolunteers } from "@/app/api/volunteer";
import { useState, useEffect } from "react";

interface VolunteerTableProps {
  itemsPerPage: number;
  pageNumber: number;
  onTotalItemsChange: (total: number) => void;
  selectedEvent: Set<string>;
  selectedStatus: Set<string>;
  selectedVolunteerType: Set<string>;
}

export default function VolunteerTable({
  itemsPerPage,
  pageNumber,
  onTotalItemsChange,
  selectedEvent,
  selectedStatus,
  selectedVolunteerType,
}: VolunteerTableProps) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  useEffect(() => {
    async function loadVolunteers() {
      try {
        console.log("Attempting to fetch volunteers");
        const data = await fetchVolunteers();
        setVolunteers(data);
        console.log("Volunteers fetched successfully");
      } catch (error) {
        console.error("Error fetching volunteers:", error);
      }
    }

    loadVolunteers();
  }, []);

  // Combine all selected filters
  const allSelectedTags = new Set([...selectedEvent, ...selectedStatus, ...selectedVolunteerType]);

  // Filter volunteers based on selected tags
  const filteredVolunteers = volunteers.filter((volunteer) => {
    if (allSelectedTags.size === 0) return true; // Show all if no filters selected
    return volunteer.tags.some((tag) => allSelectedTags.has(tag));
  });

  // Update total items whenever filters or volunteers change
  useEffect(() => {
    onTotalItemsChange(filteredVolunteers.length);
  }, [filteredVolunteers, onTotalItemsChange]);

  // Calculate which volunteers to display based on current page
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedVolunteers = filteredVolunteers.slice(startIndex, endIndex);

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.volunteerTable}>
        <colgroup>
          <col style={{ width: "197px" }} />
          <col style={{ width: "251px" }} />
          <col style={{ width: "251px" }} />
          <col style={{ width: "302px" }} />
        </colgroup>
        <thead>
          <tr>
            <th>
              <div className={styles.headerContent}>
                <span>Volunteer</span>
                <span>
                  <img src="/sort-arrow.svg" alt="" className={styles.sortIcon} />
                </span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Phone Number</span>
                <span>
                  <img src="/sort-arrow.svg" alt="" className={styles.sortIcon} />
                </span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Email</span>
                <span>
                  <img src="/sort-arrow.svg" alt="" className={styles.sortIcon} />
                </span>
              </div>
            </th>
            <th>
              <div className={styles.headerContent}>
                <span>Tags</span>
                <span>
                  <img src="/sort-arrow.svg" alt="" className={styles.sortIcon} />
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {displayedVolunteers.map((volunteer) => (
            <tr key={volunteer._id}>
              <td>
                {volunteer.firstName}, {volunteer.lastName}
              </td>
              <td>{volunteer.phoneNumber}</td>
              <td>{volunteer.email}</td>
              <td>
                <div className={styles.tagsContainer}>
                  {volunteer.tags.map((tag, index) => {
                    let colorClass = styles.greenPillTag;

                    if (tag == "Intern") {
                      colorClass = styles.bluePillTag;
                    }

                    if (tag == "Outside Volunteer") {
                      colorClass = styles.orangePillTag;
                    }
                    return (
                      <span
                        key={`col1-${volunteer._id}-${tag}-${index}`}
                        className={`${styles.pillTag} ${colorClass}`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
