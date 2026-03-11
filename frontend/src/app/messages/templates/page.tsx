"use client";

import styles from "./page.module.css";
import icAdd from "../../../../public/ic_add.svg";
import icCaretLeft from "../../../../public/ic_caretleft.svg";
import Image from "next/image";
import { useState, useEffect } from "react";
import { deleteTemplate, getTemplates, Template } from "@/app/api/template";
import { TemplateList } from "@/app/components/TemplateList";
import { usePathname, useRouter } from "next/navigation";
import { join } from "path";
import Sidebar from "../../components/sidebar";
import TemplateActionPopup from "@/app/components/TemplateActionPopup";

export default function TemplatePage() {
  const router = useRouter();
  const pathname = usePathname();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | undefined>(undefined);
  const [openPopup, setOpenPopup] = useState(false);

  const fetchTemplates = () => {
    getTemplates()
      .then((result) => {
        if (result.success) {
          setTemplates(result.data);
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
  }, []);

  const handleAddTemplateClicked = () => {
    const path = join(pathname, "new");
    router.push(path);
  };

  const handleEditTemplateClicked = () => {
    if (selectedTemplate) {
      const path = join(pathname, `edit?templateId=${selectedTemplate._id}`);
      router.push(path);
    }
  };

  const handleDeleteTemplateClicked = () => {
    if (selectedTemplate) {
      deleteTemplate(selectedTemplate._id)
        .then((result) => {
          if (result.success) {
            setOpenPopup(false);
            // reload data
            fetchTemplates();
          } else {
            console.error(result.error);
          }
        })
        .catch((reason) => console.error(reason));
    }
  };

  return (
    <Sidebar>
      <div className={styles.page}>
        <header className={styles.header}>
          <Image src={icCaretLeft} alt="" onClick={() => router.back()} />
          <h1 className={styles.headerTitle}>Templates</h1>
          <div className={styles.plusCircle} onClick={handleAddTemplateClicked}>
            <Image src={icAdd} alt="" />
          </div>
        </header>
        <TemplateList
          templates={templates}
          onMoreActions={(template) => {
            setSelectedTemplate(template);
            setOpenPopup(true);
          }}
        />
        <TemplateActionPopup
          templateTitle={selectedTemplate?.title}
          open={openPopup}
          onClose={() => {
            setSelectedTemplate(undefined);
            setOpenPopup(false);
          }}
          onEdit={handleEditTemplateClicked}
          onDelete={handleDeleteTemplateClicked}
        />
      </div>
    </Sidebar>
  );
}
