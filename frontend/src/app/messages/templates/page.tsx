"use client";

import { join } from "node:path";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import styles from "./page.module.css";

import type { Template } from "@/app/api/template";

import { deleteTemplate, getTemplates, TemplateType } from "@/app/api/template";
import icAddAsset from "@/assets/ic_add.svg";
import icCaretLeftAsset from "@/assets/ic_caretleft_alt.svg";
import { initMsal, signInWithOutlook } from "@/auth/msal";
import SuccessToast from "@/components/messages/SuccessToast";
import Sidebar from "@/components/Sidebar";
import TemplateActionPopup from "@/components/TemplateActionPopup";
import { TemplateList } from "@/components/TemplateList";
import { TemplatePreview } from "@/components/TemplatePreview";
import { TemplateTypeSelect } from "@/components/TemplateTypeSelect";

const icAdd = icAddAsset as string;
const icCaretLeft = icCaretLeftAsset as string;

export default function TemplatePage() {
  const router = useRouter();
  const pathname = usePathname();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [displayTemplates, setDisplayTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | undefined>(undefined);
  const [openPopup, setOpenPopup] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(false);
  const [templateType, setTemplateType] = useState<TemplateType>(TemplateType.TEXT);
  const [successToast, setSuccessToast] = useState("");

  const fetchTemplates = () => {
    getTemplates()
      .then((result) => {
        if (result.success) {
          setTemplates(result.data);
          setDisplayTemplates(result.data.filter((template) => template.type === templateType));
        } else {
          console.error(result.error);
        }
      })
      .catch((reason) => {
        console.error(reason);
      });
  };

  useEffect(() => {
    fetchTemplates();
    const message = sessionStorage.getItem("success-toast");
    if (message) {
      setSuccessToast(message);
      sessionStorage.removeItem("success-toast");
    }
  }, []);

  useEffect(() => {
    setDisplayTemplates(templates.filter((template) => template.type === templateType));
  }, [templateType]);

  const handleAddTemplateClicked = () => {
    const path = join(pathname, "new");
    router.push(`${path}?type=${templateType}`);
  };

  const handleEditTemplateClicked = () => {
    if (selectedTemplate) {
      const path = join(pathname, `edit?templateId=${selectedTemplate._id}`);
      void router.push(path);
    }
  };

  const handleDeleteTemplateClicked = () => {
    const templateId = selectedTemplate?._id;
    if (templateId) {
      setOpenPopup(false);
      setSelectedTemplate(undefined);
      setPreviewTemplate(false);

      deleteTemplate(templateId)
        .then((result) => {
          if (result.success) {
            // reload data
            fetchTemplates();
            setSuccessToast("Template Deleted");
          } else {
            console.error(result.error);
          }
        })
        .catch((reason) => console.error(reason));
    }
  };

  const handleBackClicked = () => {
    if (previewTemplate) {
      setPreviewTemplate(false);
    } else {
      router.back();
    }
  };

  const onSelectTemplate = async (template: Template) => {
    sessionStorage.setItem("success-toast", "Template Successfully Pasted");
    if (template.type === TemplateType.EMAIL && !(await initMsal())) {
      await signInWithOutlook();
    }
    void router.push("/communication");
  };

  const onToastDone = () => {
    setSuccessToast("");
  };

  return (
    <Sidebar>
      <SuccessToast
        open={!!successToast}
        message={successToast}
        durationMs={2600}
        onDone={onToastDone}
      />
      <div className={styles.page}>
        <header className={styles.header}>
          <Image
            src={icCaretLeft}
            alt=""
            width={40}
            height={40}
            className={styles.backIcon}
            onClick={handleBackClicked}
          />
          <h1 className={styles.headerTitle}>Templates</h1>
          {previewTemplate ? (
            <span style={{ height: "40px", width: "40px" }}></span>
          ) : (
            <div className={styles.plusCircle} onClick={handleAddTemplateClicked}>
              <Image src={icAdd} alt="" width={24} height={24} />
            </div>
          )}
        </header>
        {previewTemplate && selectedTemplate ? (
          <TemplatePreview
            template={selectedTemplate}
            onUse={(template: Template) => void onSelectTemplate(template)}
          />
        ) : (
          <>
            <div className={styles.templateType}>
              <TemplateTypeSelect
                type={templateType}
                selectText={() => {
                  setTemplateType(TemplateType.TEXT);
                }}
                selectEmail={() => {
                  setTemplateType(TemplateType.EMAIL);
                }}
              />
            </div>
            <TemplateList
              templates={displayTemplates}
              onTemplateClick={(template) => {
                setSelectedTemplate(template);
                setPreviewTemplate(true);
                setOpenPopup(false);
              }}
              onMoreActions={(template) => {
                setSelectedTemplate(template);
                setOpenPopup(true);
                setPreviewTemplate(false);
              }}
            />
            <TemplateActionPopup
              templateTitle={selectedTemplate?.title}
              open={openPopup}
              onClose={() => {
                setSelectedTemplate(undefined);
                setOpenPopup(false);
                setPreviewTemplate(false);
              }}
              onEdit={handleEditTemplateClicked}
              onDelete={handleDeleteTemplateClicked}
            />
          </>
        )}
      </div>
    </Sidebar>
  );
}
