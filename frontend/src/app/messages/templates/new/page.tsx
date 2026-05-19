"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import styles from "./page.module.css";

import { createTemplate, type CreateTemplateRequest, TemplateType } from "@/app/api/template";
import icCaretLeftAsset from "@/assets/ic_caretleft_alt.svg";
import Sidebar from "@/components/Sidebar";
import { TemplateCreate } from "@/components/TemplateCreate";

const icCaretLeft = icCaretLeftAsset as string;

function CreateTemplateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const templateType =
    searchParams.get("type") === "email" ? TemplateType.EMAIL : TemplateType.TEXT;

  const onSave = (title: string, message: string, type: TemplateType, subject: string) => {
    const createTemplateRequest: CreateTemplateRequest = {
      title,
      message,
      type,
    };
    if (subject) {
      createTemplateRequest.subject = subject;
    }
    createTemplate(createTemplateRequest)
      .then((result) => {
        if (result.success) {
          sessionStorage.setItem("success-toast", "Your template was saved.");
          void router.push("/messages/templates");
        } else {
          console.error(result.error);
        }
      })
      .catch((reason) => {
        console.error(reason);
      });
  };

  return (
    <Sidebar>
      <div className={styles.page}>
        <header className={styles.header}>
          <Image src={icCaretLeft} alt="" width={40} height={40} onClick={() => router.back()} />
          <h1 className={styles.headerTitle}>Create Template</h1>
          <span style={{ height: "40px" }}></span>
        </header>
        <TemplateCreate onSave={onSave} title="" message="" type={templateType} />
      </div>
    </Sidebar>
  );
}

export default function CreateTemplate() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateTemplateContent />
    </Suspense>
  );
}
