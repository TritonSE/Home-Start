"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import styles from "./page.module.css";

import type { CreateTemplateRequest, Template } from "@/app/api/template";

import { getTemplate, TemplateType, updateTemplate } from "@/app/api/template";
import icCaretLeftAsset from "@/assets/ic_caretleft_alt.svg";
import SuccessToast from "@/components/messages/SuccessToast";
import Sidebar from "@/components/Sidebar";
import { TemplateCreate } from "@/components/TemplateCreate";

const icCaretLeft = icCaretLeftAsset as string;

function EditTemplateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId") ?? "";
  const [showSuccess, setShowSuccess] = useState(false);
  const [template, setTemplate] = useState<Template | undefined>(undefined);

  useEffect(() => {
    if (!templateId) return;

    getTemplate(templateId)
      .then((result) => {
        if (result.success) {
          setTemplate(result.data);
        } else {
          console.error(result.error);
        }
      })
      .catch((reason) => console.error(reason));
  }, [templateId]);

  const onSave = (title: string, message: string, type: TemplateType, subject: string) => {
    const createTemplateRequest: CreateTemplateRequest = {
      title,
      message,
      type,
    };
    if (subject) {
      createTemplateRequest.subject = subject;
    }
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
    void router.push("/messages/templates");
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
        <TemplateCreate
          onSave={onSave}
          title={template?.title ?? ""}
          message={template?.message ?? ""}
          type={template?.type ?? TemplateType.TEXT}
          subject={template?.subject}
        />
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
