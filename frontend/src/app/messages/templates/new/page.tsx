"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "./page.module.css";

import { createTemplate } from "@/app/api/template";
import icCaretLeftAsset from "@/assets/icCaretleft.svg";
import SuccessToast from "@/components/messages/SuccessToast";
import Sidebar from "@/components/Sidebar";
import { TemplateCreate } from "@/components/TemplateCreate";

const icCaretLeft = icCaretLeftAsset as string;

export default function CreateTemplatePage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const onSave = (title: string, message: string, type: string) => {
    const createTemplateRequest = {
      title,
      message,
      type,
    };
    createTemplate(createTemplateRequest)
      .then((result) => {
        if (result.success) {
          setShowSuccess(true);
        } else {
          console.error(result.error);
        }
      })
      .catch((reason) => {
        console.error(reason);
      });
  };

  const onToastDone = () => {
    setShowSuccess(false);
    router.push("/messages/templates");
  };

  return (
    <Sidebar>
      <div className={styles.page}>
        <SuccessToast
          open={showSuccess}
          message="Your template was saved."
          durationMs={2600}
          onDone={onToastDone}
        />
        <header className={styles.header}>
          <Image src={icCaretLeft} alt="" width={40} height={40} onClick={() => router.back()} />
          <h1 className={styles.headerTitle}>Compose Template</h1>
          <span style={{ height: "40px" }}></span>
        </header>
        <TemplateCreate onSave={onSave} />
      </div>
    </Sidebar>
  );
}
