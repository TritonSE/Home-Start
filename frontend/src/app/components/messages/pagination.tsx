import Image from "next/image";
import { useMemo } from "react";

import styles from "./pagination.module.css";
import RecipientRow from "./RecipientRow";

import { useTextingFlowStore } from "@/app/messages/new/_store/textingFlowStore";
import doubleLeftArrow from "@/assets/doubleLeftArrow.svg";
import doubleRightArrow from "@/assets/doubleRightArrow.svg";
import leftArrow from "@/assets/icCaretleft.svg";
import rightArrow from "@/assets/icCaretright.svg";

const NUMBER_OF_VOLUNTEERS_PER_PAGE = 15;

type VolunteerRow = {
  id: string;
  firstName: string;
  lastName: string;
  tags: string[];
};

type PaginationProps = {
  volunteers: VolunteerRow[];
};

export default function Pagination({ volunteers }: PaginationProps) {
  const toggleRecipient = useTextingFlowStore((s) => s.toggleRecipient);
  const selectedRecipientIds = useTextingFlowStore((s) => s.selectedRecipientIds);
  const setPageIndex = useTextingFlowStore((s) => s.setPageIndex);
  const pageIndex = useTextingFlowStore((s) => s.pageIndex);

  const volunteerPages = useMemo(() => {
    const pages: VolunteerRow[][] = [];
    for (let i = 0; i < volunteers.length; i += NUMBER_OF_VOLUNTEERS_PER_PAGE) {
      pages.push(volunteers.slice(i, i + NUMBER_OF_VOLUNTEERS_PER_PAGE));
    }
    return pages;
  }, [volunteers]);

  const maxIndex = Math.max(0, volunteerPages.length - 1);
  const safeIndex = Math.min(pageIndex, maxIndex);
  const currentPage = volunteerPages[safeIndex] ?? [];
  const isFirstPage = safeIndex === 0;
  const isLastPage = safeIndex === maxIndex;
  const displayedCurrentPage = volunteerPages.length === 0 ? 0 : safeIndex + 1;

  const selectedSet = useMemo(() => new Set(selectedRecipientIds), [selectedRecipientIds]);
  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {currentPage.map((r) => (
          <RecipientRow
            key={r.id}
            name={`${r.firstName} ${r.lastName}`}
            tags={r.tags}
            selected={selectedSet.has(r.id)}
            onToggle={() => toggleRecipient(r.id)}
            checkboxPosition="left"
            disableSelectedStyle
          />
        ))}
      </div>
      <div className={styles.pagination}>
        <div className={styles.leftPagination}>
          <button
            className={`${styles.leftDoubleArrow} ${isFirstPage ? styles.disabled : ""}`}
            disabled={isFirstPage}
            onClick={() => setPageIndex(0)}
          >
            <Image
              src={doubleLeftArrow as string}
              alt=""
              aria-hidden
              className={styles.leftDoubleArrowImage}
            />
          </button>
          <button
            className={`${styles.leftArrow} ${isFirstPage ? styles.disabled : ""}`}
            disabled={isFirstPage}
            onClick={() => setPageIndex(Math.max(safeIndex - 1, 0))}
          >
            <Image src={leftArrow as string} alt="" aria-hidden className={styles.leftArrowImage} />
          </button>
        </div>
        <div className={styles.middlePagination}>
          <div className={styles.leftNumber}>{displayedCurrentPage}</div>
          <div className={styles.tripleDots}>...</div>
          <div className={styles.rightNumber}>{volunteerPages.length}</div>
        </div>
        <div className={styles.rightPagination}>
          <button
            className={`${styles.rightArrow} ${isLastPage ? styles.disabled : ""}`}
            disabled={isLastPage}
            onClick={() => setPageIndex(Math.min(safeIndex + 1, maxIndex))}
          >
            <Image
              src={rightArrow as string}
              alt=""
              aria-hidden
              className={styles.rightArrowImage}
            />
          </button>
          <button
            className={`${styles.rightDoubleArrow} ${isLastPage ? `${styles.disabled}` : ""}`}
            disabled={isLastPage}
            onClick={() => setPageIndex(maxIndex)}
          >
            <Image
              src={doubleRightArrow as string}
              alt=""
              aria-hidden
              className={styles.doubleRightArrowImage}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
