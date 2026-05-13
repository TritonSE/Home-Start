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
    <div
      className={styles.display}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div>{selectedDisplay}</div>
      {dropdownOpen && (
        <div className={styles.dropDown}>
          <div className={styles.dropdownScroll}>
            {items.map((item, i) => (
              <div
                className={styles.dropdownItem}
                key={item}
                onClick={() => {
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
