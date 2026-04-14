import Image from "next/image";

import styles from "./TemplateList.module.css";

import type { Template } from "@/app/api/template";

type TemplateListProps = {
  templates: Template[];
  onTemplateClick: (template: Template) => void;
  onMoreActions: (template: Template) => void;
};

export function TemplateList({ templates, onTemplateClick, onMoreActions }: TemplateListProps) {
  return (
    <div className={styles.content}>
      {templates.map((template) => (
        <div
          key={template._id}
          className={styles.templateCard}
          onClick={() => {
            onTemplateClick(template);
          }}
        >
          <span>{template.title}</span>
          <Image
            src="/ic_more.svg"
            alt=""
            width={24}
            height={24}
            onClick={(e) => {
              e.stopPropagation();
              onMoreActions(template);
            }}
          />
        </div>
      ))}
    </div>
  );
}
