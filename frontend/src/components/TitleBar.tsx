import Image from "next/image";
import { useState } from "react";

import ExportButton from "./ExportButton";
import ImportButton from "./ImportButton";
import ImportVolunteerModal from "./ImportVolunteerModal";
import styles from "./TitleBar.module.css";

import type { VolunteerWithTags } from "@/types/volunteer";

import icCaretLeftAsset from "@/assets/ic_caretleft_alt.svg";
import icMoreAsset from "@/assets/ic_more.svg";

const icCaretLeft = icCaretLeftAsset as string;
const icMore = icMoreAsset as string;

type TitleBarProps = {
  onImportComplete: () => void | Promise<void>;
  selectedVolunteers?: VolunteerWithTags[];
  onBack?: () => void;
};

export default function TitleBar({
  onImportComplete,
  selectedVolunteers = [],
  onBack,
}: TitleBarProps) {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleImportClick = () => {
    setMobileMenuOpen(false);
    setOpen(true);
  };

  return (
    <div className={styles.titleBar}>
      {onBack && (
        <button
          type="button"
          className={styles.backButton}
          aria-label="Back to dashboard"
          onClick={onBack}
        >
          <Image src={icCaretLeft} alt="" width={24} height={24} />
        </button>
      )}
      <label className={styles.volunteers}> Volunteers </label>
      <div className={styles.importExportButtons}>
        <ExportButton selectedVolunteers={selectedVolunteers} />
        <ImportButton onClick={handleImportClick} />
      </div>
      <div className={styles.mobileActions}>
        <button
          type="button"
          className={styles.moreButton}
          aria-label="Import and export options"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((current) => !current)}
        >
          <Image src={icMore} alt="" width={24} height={24} />
        </button>
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <ExportButton selectedVolunteers={selectedVolunteers} />
            <ImportButton onClick={handleImportClick} />
          </div>
        )}
      </div>
      {open && (
        <ImportVolunteerModal onClose={() => setOpen(false)} onComplete={onImportComplete} />
      )}
    </div>
  );
}
