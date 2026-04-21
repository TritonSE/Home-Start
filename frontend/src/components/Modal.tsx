import Image from "next/image";

import styles from "./Modal.module.css";

import type { ReactNode } from "react";

import icCloseLargeAsset from "@/assets/ic_close_large.svg";

const icCloseLarge = icCloseLargeAsset as string;

type ModalProps = {
  onClose: () => void;
  onClick?: () => void;
  width: string;
  radius: string;
  title: string;
  subtitle?: string;
  titleLineHeight: number;
  titleFontSize: string;
  padding: string;
  children?: ReactNode;
};

export default function Modal({
  onClose,
  onClick,
  width,
  radius,
  title,
  subtitle,
  titleLineHeight,
  titleFontSize,
  padding,
  children,
}: ModalProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        style={{ padding, width, borderRadius: radius }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <div className={styles.header} style={{ lineHeight: `${titleLineHeight}px` }}>
          <div className={styles.titles} style={{ fontSize: titleFontSize }}>
            <p className={styles.title}>{title}</p>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <button
            className={styles.close}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close"
          >
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
