"use client";

import styles from "./ActionBar.module.css";
import { useState } from "react";
import PageBar from "./PageBar";

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
        <PageBar totalItems={100} />
      </div>
    </div>
  );
}
