"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

import styles from "./DateTimePickerModal.module.css";
import Modal from "./Modal";

import chevronLeftAsset from "@/assets/chevron_left.svg";
import chevronRightAsset from "@/assets/chevron_right.svg";
import icCaretUpAsset from "@/assets/ic_caretup.svg";

const chevronLeft = chevronLeftAsset as string;
const chevronRight = chevronRightAsset as string;
const icCaretUp = icCaretUpAsset as string;

type DateTimePickerProps = {
  date: Date | null;
  onDone: (date: Date) => void;
  onClose: () => void;
};

export default function DateTimePicker({ date, onDone, onClose }: DateTimePickerProps) {
  const [currentDate, setCurrentDate] = useState(date ?? new Date());
  const [selectedDate, setSelectedDate] = useState(date ?? new Date());
  const [monthDropDown, setMonthDropDown] = useState<boolean>(false);
  const [yearDropDown, setYearDropDown] = useState<boolean>(false);
  const [timeDropDown, setTimeDropDown] = useState<boolean>(false);
  const currYear = currentDate.getFullYear();
  const currMonth = currentDate.getMonth();

  useEffect(() => {
    const now = date ? new Date(date) : new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    setSelectedDate(now);
  }, [date]);

  const monthList = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleString("default", { month: "long" }),
  );

  const yearList = Array.from({ length: 9 }, (_, i) => new Date().getFullYear() - 4 + i);

  const hourList = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const ampm = i < 12 ? "AM" : "PM";
    return `${hour}:00 ${ampm}`;
  });

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
  };

  const handleSelectYear = (year: number) => {
    setCurrentDate(new Date(year, currMonth, 1));
    setYearDropDown(false);
  };

  const handleSelectDay = (day: number) => {
    const newSelectedDate = new Date(
      currYear,
      currMonth,
      day,
      selectedDate.getHours(),
      selectedDate.getMinutes(),
      selectedDate.getSeconds(),
      selectedDate.getMilliseconds(),
    );
    setSelectedDate(newSelectedDate);
  };

  const handleSelectTime = (hour: number) => {
    const newSelectedDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hour,
      0,
      0,
      0,
    );
    setSelectedDate(newSelectedDate);
    setTimeDropDown(false);
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
          handleSelectDay(i);
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
    <Modal
      onClose={onClose}
      width="370px"
      radius="8px"
      title="Select Date"
      titleLineHeight={24}
      titleFontSize="20px"
      padding="20px"
    >
      <div className={styles.datetimePickerContainer}>
        <div className={styles.calendar}>
          <div className={styles.calendarHeader}>
            <div className={styles.arrowPaddingLeft}>
              <Image
                src={chevronLeft}
                alt="Previous Month"
                width={16}
                height={16}
                onClick={handlePrevMonth}
                style={{ cursor: "pointer" }}
              />
            </div>
            <div className={styles.month} onClick={() => setMonthDropDown(!monthDropDown)}>
              <div>{currentDate.toLocaleString("default", { month: "long" })}</div>
              <Image src={icCaretUp} alt="More Months" width={20} height={20} />
              {monthDropDown && (
                <div className={styles.dropDown}>
                  <div className={styles.dropdownScroll}>
                    {monthList.map((month, i) => (
                      <div
                        className={styles.dropdownItem}
                        key={month}
                        onClick={() => {
                          handleSelectMonth(i);
                        }}
                      >
                        {month}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.year} onClick={() => setYearDropDown(!yearDropDown)}>
              <div>{currentDate.getFullYear()}</div>
              <Image src={icCaretUp} alt="More Years" width={20} height={20} />
              {yearDropDown && (
                <div className={styles.dropDown}>
                  <div className={styles.dropdownScroll}>
                    {yearList.map((year) => (
                      <div
                        className={styles.dropdownItem}
                        key={year}
                        onClick={() => {
                          handleSelectYear(year);
                        }}
                      >
                        {year}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.arrowPaddingRight}>
              <Image
                src={chevronRight}
                alt="Next Month"
                width={16}
                height={16}
                onClick={handleNextMonth}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
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
        <div className={styles.time}>
          <span className={styles.timeLabel}>Time</span>
          <div className={styles.selectedTimeOutside}>
            <div
              className={`${styles.selectedTime} ${timeDropDown ? "" : styles.selectedTimeDropClose}`}
              onClick={() => {
                setTimeDropDown(!timeDropDown);
              }}
            >
              <span>
                {selectedDate.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
              <Image src={icCaretUp} alt="More Times" width={20} height={20} />
            </div>
            {timeDropDown && (
              <div className={styles.dropDown}>
                <div className={styles.dropdownScroll}>
                  {hourList.map((hour, i) => (
                    <div
                      className={styles.dropdownItemTime}
                      key={hour}
                      onClick={() => {
                        handleSelectTime(i);
                      }}
                    >
                      {hour}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={styles.buttons}>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onDone(selectedDate);
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
