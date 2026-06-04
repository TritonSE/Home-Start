import styles from "./DatePicker.module.css";

type DatePickerProps = {
  currentDate: Date;
  selectedDate: Date;
  onSelect: (i: number) => void;
};

export function DatePicker({ currentDate, selectedDate, onSelect }: DatePickerProps) {
  const currYear = currentDate.getFullYear();
  const currMonth = currentDate.getMonth();

  const isSameDate = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currYear, currMonth);
  const firstDay = getFirstDayOfMonth(currYear, currMonth);
  const dates = [];

  for (let i = 0; i < firstDay; i++) {
    dates.push(<div key={`emptyDateCell-${i.toString()}`} />);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const day = new Date(currYear, currMonth, i);
    const isSelected = selectedDate && isSameDate(day, selectedDate);

    dates.push(
      <button
        type="button"
        key={i}
        className={styles.dateCell}
        onClick={() => {
          onSelect(i);
        }}
      >
        {isSelected ? <span className={styles.selectedDate}>{i}</span> : <span>{i}</span>}
      </button>,
    );
  }

  for (let i = dates.length; i <= 35; i++) {
    dates.push(<div key={`emptyDateCell-${i.toString()}`} className={styles.dateCell} />);
  }

  return (
    <div className={styles.calendarContent}>
      <div className={styles.week}>
        <span className={styles.day}>Su</span>
        <span className={styles.day}>Mo</span>
        <span className={styles.day}>Tu</span>
        <span className={styles.day}>We</span>
        <span className={styles.day}>Th</span>
        <span className={styles.day}>Fr</span>
        <span className={styles.day}>Sa</span>
      </div>
      <div className={styles.dateGrid}>{dates}</div>
    </div>
  );
}
