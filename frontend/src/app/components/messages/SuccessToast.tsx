"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./SuccessToast.module.css";
import Image from "next/image";
import successIcon from "@/assets/success.svg";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  durationMs?: number;
  onDone?: () => void;
};

export default function SuccessToast({
  open,
  title = "Success!",
  message,
  durationMs = 1800,
  onDone,
}: Props) {
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
        <Image src={successIcon} alt="" className={styles.icon} width={24} height={24} />

          <div className={styles.textWrap}>
            <div className={styles.title}>{title}</div>
            <div className={styles.message}>{message}</div>
          </div>
        </div>
      </div>
    );
  }, [open, title, message, durationMs]);

  return createPortal(body, document.body);
}
