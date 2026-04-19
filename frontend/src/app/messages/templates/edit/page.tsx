"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import styles from "./page.module.css";

import { updateTemplate } from "@/app/api/template";
import icCaretLeftAsset from "@/assets/icCaretleft.svg";
import SuccessToast from "@/components/messages/SuccessToast";
import Sidebar from "@/components/Sidebar";
import { TemplateCreate } from "@/components/TemplateCreate";

const icCaretLeft = icCaretLeftAsset as string;

function EditTemplateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId") ?? "";
  const [showSuccess, setShowSuccess] = useState(false);

  const onSave = (title: string, message: string, type: string) => {
    const createTemplateRequest = {
      title,
      message,
      type,
    };
    updateTemplate(templateId, createTemplateRequest)
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
          <h1 className={styles.headerTitle}>Edit</h1>
          <span style={{ height: "40px", width: "40px" }}></span>
        </header>
        <TemplateCreate onSave={onSave} templateId={templateId} />
      </div>
    </Sidebar>
  );
}

export default function EditTemplatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditTemplateContent />
    </Suspense>
  );
}
