import type { StaticImageData } from "next/image";
import styles from "./card.module.css";
import Image from "next/image";
import icCaretRight from "../../public/ic_caretright.png";
import { useState } from "react";

type CardProps = {
  icon: StaticImageData;
  majorText: string;
  minorText: string;
  onClick: () => void;
};

export default function Card({ icon, majorText, minorText, onClick }: CardProps) {
  return (
    <button className={styles.card} onClick={onClick}>
      <div className={styles.frame1}>
        <div className={styles.iconFrame}>
          <Image src={icon} alt="" />
        </div>
        <div className={styles.arrowFrame}>
          <Image src={icCaretRight} alt="" />
        </div>
      </div>
      <div className={styles.frame2}>
        <p className={styles.headersH5}>{majorText}</p>
      </div>
      <div className={styles.frame3}>
        <p className={styles.bodyMd}>{minorText}</p>
      </div>
    </button>
  );
}
