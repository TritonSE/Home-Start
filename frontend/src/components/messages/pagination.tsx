import Image from "next/image";
import { useState } from "react";

import styles from "./pagination.module.css";

import doubleLeftArrow from "@/assets/double_left_arrow.svg";
import doubleRightArrow from "@/assets/double_right_arrow.svg";
import leftArrow from "@/assets/ic_caretleft_alt.svg";
import rightArrow from "@/assets/ic_caretright.svg";

type PaginationProps = {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  setPageIndex: (pageIndex: number) => void;
};

export default function Pagination({
  totalItems,
  currentPage,
  itemsPerPage,
  setPageIndex,
}: PaginationProps) {
  const numOfPages = Math.ceil(totalItems / itemsPerPage);
  const hasPages = numOfPages > 0;
  const displayedCurrentPage = hasPages ? currentPage : 0;
  const isFirstPage = !hasPages || currentPage === 1;
  const isLastPage = !hasPages || currentPage === numOfPages;
  const [text, setText] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!hasPages) return;

    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      const pageIndex = Math.max(1, Math.min(Number(target.value), numOfPages));
      if (Number.isNaN(pageIndex)) {
        setText("");
        return;
      }
      setPageIndex(pageIndex);
      setText("");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pagination}>
        <div className={styles.leftPagination}>
          <button
            className={`${styles.leftDoubleArrow} ${isFirstPage ? styles.disabled : ""}`}
            disabled={isFirstPage}
            onClick={() => setPageIndex(1)}
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
            onClick={() => setPageIndex(Math.max(currentPage - 1, 0))}
          >
            <Image src={leftArrow as string} alt="" aria-hidden className={styles.leftArrowImage} />
          </button>
        </div>
        <div className={styles.middlePagination}>
          <input
            className={`${styles.number} ${styles.border}`}
            type="text"
            value={text}
            onKeyDown={handleKeyDown}
            onChange={(browserText) => setText(browserText.target.value)}
            placeholder={String(displayedCurrentPage)}
            disabled={!hasPages}
          />
          <div className={styles.tripleDots}>...</div>
          <div className={styles.number}>{numOfPages}</div>
        </div>
        <div className={styles.rightPagination}>
          <button
            className={`${styles.rightArrow} ${isLastPage ? styles.disabled : ""}`}
            disabled={isLastPage}
            onClick={() => setPageIndex(Math.min(currentPage + 1, numOfPages))}
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
            onClick={() => setPageIndex(numOfPages)}
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
