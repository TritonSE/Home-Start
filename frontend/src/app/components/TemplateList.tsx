import { Template } from "../api/template";
import icMore from "../../../public/ic_more.svg";

import styles from "./TemplateList.module.css";
import Image from "next/image";

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
            src={icMore}
            alt=""
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
