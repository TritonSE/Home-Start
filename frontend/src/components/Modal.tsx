import Image from "next/image";

import styles from "./Modal.module.css";

import type { ReactNode } from "react";

import icCloseLargeAsset from "@/assets/ic_close_large_alt.svg";

const icCloseLarge = icCloseLargeAsset as string;

type ModalProps = {
  onClose: () => void;
  width: string;
  radius: string;
  title: string;
  titleLineHeight: number;
  titleFontSize: string;
  padding: string;
  zIndex?: number;
  children?: ReactNode;
};

export default function Modal({
  onClose,
  width,
  radius,
  title,
  titleLineHeight,
  titleFontSize,
  padding,
  zIndex = 3,
  children,
}: ModalProps) {
  return (
    <div className={styles.overlay} onClick={onClose} style={{ zIndex: zIndex - 1 }}>
      <div
        className={styles.modal}
        style={{ padding, width, borderRadius: radius, zIndex }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header} style={{ lineHeight: `${titleLineHeight}px` }}>
          <p className={styles.title} style={{ fontSize: titleFontSize }}>
            {title}
          </p>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <Image
              src={icCloseLarge}
              alt="Close"
              width={titleLineHeight}
              height={titleLineHeight}
            />
          </button>
        </div>

        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
