"use client";

import styles from "./ActionBar.module.css";
import { useState } from "react";

export default function SearchBar() {
  const [search, setSearch] = useState<string>();

  return (
    //The first page button is hardcoded to display the current page background color
    <div className={styles.actionBarContainer}>
      <div className={styles.actionBar}>
        <button className={styles.uploadButton}>
          <span className={styles.ic_container}>
            <img src="/upload.svg" alt="Upload logo" className={styles.uploadIcon} />
          </span>
          <div className={styles.buttonText}>Upload CSV</div>
        </button>

        <div className={styles.pagination}>
          <div className={styles.previous}>
            <span className={styles.ic_container}>
              <img src="/caret.svg" alt="Upload logo" className={styles.caretIconLeft} />
            </span>
          </div>
          <div className={styles.paginationPages}>
            <button className={styles.pressedPageButton}>
              <div className={styles.pageNumber}>1</div>
            </button>
            <button className={styles.pageButton}>
              <div className={styles.pageNumber}>2</div>
            </button>
            <button className={styles.pageButton}>
              <div className={styles.pageNumber}>...</div>
            </button>
            <button className={styles.pageButton}>
              <div className={styles.pageNumber}>67</div>
            </button>
          </div>
          <div className={styles.next}>
            <span className={styles.ic_container}>
              <img src="/caret.svg" alt="Upload logo" className={styles.caretIconRight} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
