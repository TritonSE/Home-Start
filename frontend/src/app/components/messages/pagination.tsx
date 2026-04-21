import { useTextingFlowStore } from "@/app/messages/new/_store/textingFlowStore";
import RecipientRow from "./RecipientRow";
import Image from "next/image";

import styles from "./pagination.module.css";
import { useMemo } from "react";

import doubleLeftArrow from "@/assets/doubleLeftArrow.svg";
import leftArrow from "@/assets/icCaretleft.svg";
import rightArrow from "@/assets/icCaretright.svg";
import doubleRightArrow from "@/assets/doubleRightArrow.svg";

type VolunteerRow = {
  id: string;
  firstName: string;
  lastName: string;
  tags: string[];
};

type PaginationProps = {
  volunteers: VolunteerRow[];
};

export default function Pagination({ volunteers }: PaginationProps) {
  const toggleRecipient = useTextingFlowStore((s) => s.toggleRecipient);
  const selectedRecipientIds = useTextingFlowStore((s) => s.selectedRecipientIds);

  const selectedSet = useMemo(() => new Set(selectedRecipientIds), [selectedRecipientIds]);
  return (
    <div className={styles.container}>
        <div className={styles.list}>
            {volunteers.map((r) => (
                <RecipientRow
                    key={r.id}
                    name={`${r.firstName} ${r.lastName}`}
                    tags={r.tags}
                    selected={selectedSet.has(r.id)}
                    onToggle={() => toggleRecipient(r.id)}
                    checkboxPosition="left"
                    disableSelectedStyle
                />
            ))}
        </div>
        <div className={styles.pagination}>
            <div className={styles.leftPagination}>
                <button className={styles.leftDoubleArrow}>
                    <Image src={doubleLeftArrow} alt="" aria-hidden className={styles.leftDoubleArrowImage}/>
                </button>
                <button className={styles.leftArrow}>
                    <Image src={leftArrow} alt="" aria-hidden className={styles.leftArrowImage}/>
                </button>
            </div>
            <div className={styles.middlePagination}>
                <div className={styles.leftNumber}>
                    1
                </div>
                <div className={styles.tripleDots}>
                    ...
                </div>
                <div className={styles.rightNumber}>
                    25
                </div>
            </div>
            <div className={styles.rightPagination}>
                <button className={styles.rightArrow}>
                    <Image src={rightArrow} alt="" aria-hidden className={styles.rightArrowImage}/>
                </button>
                <button className={styles.rightDoubleArrow}>
                    <Image src={doubleRightArrow} alt="" aria-hidden className={styles.doubleRightArrowImage}/>
                </button>
            </div>
        </div>
    </div>
  );
}