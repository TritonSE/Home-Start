import styles from "./DropDown.module.css";

type DropDownProps = {
  onClick: () => void;
  selectedDisplay: string;
  dropdownOpen: boolean;
  items: number[] | string[];
  onSelect: (i: number) => void;
};

export function DropDown({
  onClick,
  selectedDisplay,
  dropdownOpen,
  items,
  onSelect,
}: DropDownProps) {
  return (
    <div className={styles.display}>
      <button
        className={styles.btnWrapper}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        aria-expanded={dropdownOpen}
        aria-haspopup="listbox"
      >
        {selectedDisplay}
      </button>
      {dropdownOpen && (
        <div className={styles.dropDown} role="listbox">
          <div className={styles.dropdownScroll}>
            {items.map((item, i) => (
              <div
                className={styles.dropdownItem}
                key={item}
                role="option"
                aria-selected={String(item) === selectedDisplay}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(i);
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
