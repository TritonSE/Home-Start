"use client";

import styles from "./SearchBar.module.css";
import { useState } from "react";

export default function SearchBar() {
  const [search, setSearch] = useState<string>();

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchField}>
        <span className={styles.inputField}>
          <form className={styles.textField}>
            <input type="text" value={search} placeholder="Search Volunteer"></input>
          </form>
        </span>
      </div>
    </div>
  );
}
