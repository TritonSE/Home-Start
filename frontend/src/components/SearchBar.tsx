"use client";

import styles from "./SearchBar.module.css";
import { useState } from "react";

export default function SearchBar() {
  const [search, setSearch] = useState<string>();

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchField}>
        <div className={styles.inputField}>
          <span className={styles.ic_search}>
            <img src="/Union.svg" alt="Union logo" className={styles.union} />
          </span>
          <form className={styles.textField}>
            <input type="text" value={search} placeholder="Search Volunteer"></input>
          </form>
        </div>
      </div>

      <div className={styles.tagsContainer}>
        <button className={styles.pillTagAll}>
          {" "}
          <span className={styles.pillTagText}> All </span>{" "}
        </button>
        <button className={styles.pillTagType}>
          {" "}
          <span className={styles.pillTagText}>Volunteer Type</span>{" "}
        </button>
        <button className={styles.pillTagAdded}>
          {" "}
          <span className={styles.pillTagText}>Added By</span>{" "}
        </button>
      </div>
    </div>
  );
}
