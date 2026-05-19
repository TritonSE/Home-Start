"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

import icCloseAsset from "@/assets/ic_close.svg";
import successFilledIconAsset from "@/assets/ic_success_filled.svg";
import styles from "@/components/messages/SuccessToast.module.css";

const successFilledIconSrc = successFilledIconAsset as string;
const icClose = icCloseAsset as string;

type Props = {
  open: boolean;
  title?: string;
  message: string;
  durationMs?: number;
  onDone?: () => void;
};

export default function SuccessToast({ open, message, durationMs = 1800, onDone }: Props) {
  useEffect(() => {
    if (!open) return;

    const t = window.setTimeout(() => {
      onDone?.();
    }, durationMs);

    return () => window.clearTimeout(t);
  }, [open, durationMs, onDone]);

  const body = useMemo(() => {
    if (!open) return null;

    return (
      <div className={styles.wrap} aria-live="polite" aria-atomic="true">
        <div className={styles.card} style={{ ["--toast-ms" as string]: `${durationMs}ms` }}>
          <Image src={successFilledIconSrc} alt="" width={20} height={20} />

          <div className={styles.textWrap}>
            <div className={styles.message}>{message}</div>
          </div>

          <Image
            src={icClose}
            alt="Close"
            width={0}
            height={0}
            onClick={() => {
              onDone?.();
            }}
          />
        </div>
      </div>
    );
  }, [open, message, durationMs]);

  if (typeof document === "undefined" || !body) {
    return null;
  }

  return createPortal(body, document.body);
}
