import type { StaticImageData } from "next/image";
import styles from "./card.module.css";
import Image from "next/image";
import icCaretRight from "../../public/ic_caretright.png";

type CardProps = {
  icon: StaticImageData;
  majorText: string;
  minorText: string;
};

export default function Card({ icon, majorText, minorText }: CardProps) {
  return (
    <div className={styles.card}>
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
    </div>
  );
}
