import { Template } from "../api/template";
import icMore from "../../../public/ic_more.svg";

import styles from "./TemplateList.module.css";
import Image from "next/image";

// import { openSans } from "../layout";

type TemplateListProps = {
  templates: Template[];
  onMoreActions: (template: Template) => void;
};

export function TemplateList({ templates, onMoreActions }: TemplateListProps) {
  return (
    <div className={styles.content}>
      {templates.map((template) => (
        <div key={template._id} className={styles.templateCard}>
          <span>{template.title}</span>
          <Image
            src={icMore}
            alt=""
            onClick={() => {
              onMoreActions(template);
            }}
          />
        </div>
      ))}
    </div>
  );
}
