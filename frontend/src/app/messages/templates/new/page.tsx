"use client";

import styles from "./page.module.css";
import icCaretLeft from "@/assets/ic_caretleft.svg";
import Image from "next/image";
import { TemplateCreate } from "@/components/TemplateCreate";
import Sidebar from "@/components/Sidebar";
import { createTemplate } from "@/app/api/template";
import SuccessToast from "@/components/messages/SuccessToast";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTemplatePage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const onSave = async (title: string, message: string, type: string) => {
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
          <Image src={icCaretLeft} alt="" onClick={() => router.back()} />
          <h1 className={styles.headerTitle}>Compose Template</h1>
          <span style={{ height: "40px" }}></span>
        </header>
        <TemplateCreate onSave={onSave} />
      </div>
    </Sidebar>
  );
}
