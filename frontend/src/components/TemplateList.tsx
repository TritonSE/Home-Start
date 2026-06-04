import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./TemplateList.module.css";

import type { Template } from "@/app/api/template";

import icMoreAsset from "@/assets/ic_more.svg";
import unionIconAsset from "@/assets/union.svg";

const unionIcon = unionIconAsset as string;
const icMore = icMoreAsset as string;

type TemplateListProps = {
  templates: Template[];
  onTemplateClick: (template: Template) => void;
  onMoreActions: (template: Template) => void;
};

export function TemplateList({ templates, onTemplateClick, onMoreActions }: TemplateListProps) {
  const [search, setSearch] = useState<string>("");
  const [displayTemplates, setDisplayTemplates] = useState(templates);

  useEffect(() => {
    const filtered = templates.filter((template) => {
      return (
        template.message.includes(search) ||
        template.title.includes(search) ||
        template.subject?.includes(search)
      );
    });
    setDisplayTemplates(filtered);
  }, [search, templates]);

  return (
    <div className={styles.content}>
      <div className={styles.searchBar}>
        <div className={styles.inputField}>
          <span className={styles.ic_search}>
            <Image
              src={unionIcon}
              alt="Union logo"
              className={styles.union}
              width={24}
              height={24}
            />
          </span>
          <form className={styles.textField} onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
            />
          </form>
        </div>
      </div>
      {displayTemplates.map((template) => (
        <div
          key={template._id}
          className={styles.templateCard}
          onClick={() => {
            onTemplateClick(template);
          }}
        >
          <span className={styles.templateTitle}>{template.title}</span>
          <Image
            className={styles.more}
            src={icMore}
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
