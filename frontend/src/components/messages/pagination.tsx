import Image from "next/image";

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
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === numOfPages;

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
          <div className={styles.leftNumber}>{currentPage}</div>
          <div className={styles.tripleDots}>...</div>
          <div className={styles.rightNumber}>{numOfPages}</div>
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
