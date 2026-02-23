"use client";

import styles from "./PageBar.module.css";
import Image from "next/image";

interface PageBarProps {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function PageBar({
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
}: PageBarProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  //Returns an array of 5 page numbers, including the 1st page, 3 pages around the current page, and the last page
  const getPageNumbers = () => {
    const pages = [1];
    if (totalPages <= 5) {
      for (let i = 2; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage > 3 && currentPage < totalPages - 2) {
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
      } else if (currentPage <= 3) {
        for (let i = 2; i <= Math.min(4, totalPages); i++) {
          pages.push(i);
        }
      } else {
        for (let i = Math.max(2, totalPages - 3); i < totalPages; i++) {
          pages.push(i);
        }
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.pagination}>
        <div className={styles.previous} onClick={() => onPageChange(Math.max(1, currentPage - 1))}>
          <div className={styles.ic_container}>
            <Image src="/caret.svg" alt="Upload logo" className={styles.caretIconLeft} />
          </div>
        </div>

        <div className={styles.paginationPages}>
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              className={page === currentPage ? styles.pressedPageButton : styles.pageButton}
              onClick={() => typeof page === "number" && onPageChange(page)}
            >
              <div className={styles.pageNumber}>{page}</div>
            </button>
          ))}
        </div>

        <div
          className={styles.next}
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        >
          <div className={styles.ic_container}>
            <Image src="/caret.svg" alt="Upload logo" className={styles.caretIconRight} />
          </div>
        </div>
      </div>
    </div>
  );
}
