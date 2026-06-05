"use client";

import Image from "next/image";
import { useState } from "react";

import { DatePicker } from "./DatePicker";
import styles from "./DateTimePickerModal.module.css";
import { DropDown } from "./DropDown";
import Modal from "./Modal";

import chevronLeftAsset from "@/assets/chevron_left.svg";
import chevronRightAsset from "@/assets/chevron_right.svg";

const chevronLeft = chevronLeftAsset as string;
const chevronRight = chevronRightAsset as string;

const DEFAULT_BIRTHDAY_DATE = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 25);
  return date;
};

type BirthdayPickerModalProps = {
  date: Date | null;
  onDone: (date: Date) => void;
  onClose: () => void;
  zIndex?: number;
};

export default function BirthdayPickerModal({
  date,
  onDone,
  onClose,
  zIndex = 1050,
}: BirthdayPickerModalProps) {
  const initialDate = date ?? DEFAULT_BIRTHDAY_DATE();
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [monthDropDown, setMonthDropDown] = useState(false);
  const [yearDropDown, setYearDropDown] = useState(false);

  const currYear = currentDate.getFullYear();
  const currMonth = currentDate.getMonth();
  const currentCalendarYear = new Date().getFullYear();
  const yearList = Array.from({ length: 101 }, (_, i) => currentCalendarYear - i);
  const monthList = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleString("default", { month: "long" }),
  );

  const handlePrevMonth = () => {
    const newMonth = currMonth === 0 ? 11 : currMonth - 1;
    const newYear = currMonth === 0 ? currYear - 1 : currYear;
    setCurrentDate(new Date(newYear, newMonth, 1));
  };

  const handleNextMonth = () => {
    const newMonth = currMonth === 11 ? 0 : currMonth + 1;
    const newYear = currMonth === 11 ? currYear + 1 : currYear;
    setCurrentDate(new Date(newYear, newMonth, 1));
  };

  const handleSelectMonth = (month: number) => {
    setCurrentDate(new Date(currYear, month, 1));
    setMonthDropDown(false);
    setYearDropDown(false);
  };

  const handleSelectYear = (yearIndex: number) => {
    setCurrentDate(new Date(yearList[yearIndex], currMonth, 1));
    setYearDropDown(false);
    setMonthDropDown(false);
  };

  const handleSelectDay = (day: number) => {
    setSelectedDate(new Date(currYear, currMonth, day));
  };

  const closeDropDowns = () => {
    setMonthDropDown(false);
    setYearDropDown(false);
  };

  return (
    <Modal
      onClose={onClose}
      onClick={closeDropDowns}
      width="370px"
      radius="8px"
      title="Select Birthday"
      titleLineHeight={24}
      titleFontSize="20px"
      padding="20px"
      zIndex={zIndex}
    >
      <div className={styles.datetimePickerContainer}>
        <div className={styles.calendar}>
          <div className={styles.calendarHeader}>
            <div className={styles.arrowPaddingLeft}>
              <button type="button" className={styles.btnWrapper} onClick={handlePrevMonth}>
                <Image src={chevronLeft} alt="Previous Month" width={16} height={16} />
              </button>
            </div>
            <DropDown
              onClick={() => {
                setMonthDropDown(!monthDropDown);
                setYearDropDown(false);
              }}
              selectedDisplay={currentDate.toLocaleString("default", { month: "long" })}
              dropdownOpen={monthDropDown}
              items={monthList}
              onSelect={handleSelectMonth}
            />
            <DropDown
              onClick={() => {
                setYearDropDown(!yearDropDown);
                setMonthDropDown(false);
              }}
              selectedDisplay={currentDate.getFullYear().toString()}
              dropdownOpen={yearDropDown}
              items={yearList}
              onSelect={handleSelectYear}
            />
            <div className={styles.arrowPaddingRight}>
              <button type="button" className={styles.btnWrapper} onClick={handleNextMonth}>
                <Image src={chevronRight} alt="Next Month" width={16} height={16} />
              </button>
            </div>
          </div>
          <DatePicker
            currentDate={currentDate}
            selectedDate={selectedDate}
            onSelect={handleSelectDay}
          />
        </div>
        <div className={styles.buttons}>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onDone(selectedDate);
              onClose();
            }}
            className={styles.doneButton}
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
