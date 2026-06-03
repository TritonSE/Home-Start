"use client";

import IMask from "imask";
import Image from "next/image";
import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask";

import { DatePicker } from "./DatePicker";
import styles from "./DateTimePickerModal.module.css";
import { DropDown } from "./DropDown";
import Modal from "./Modal";

import chevronLeftAsset from "@/assets/chevron_left.svg";
import chevronRightAsset from "@/assets/chevron_right.svg";

const chevronLeft = chevronLeftAsset as string;
const chevronRight = chevronRightAsset as string;

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
  const [timePeriodDropDown, setTimePeriodDropDown] = useState<boolean>(false);
  const [timeNum, setTimeNum] = useState("");
  const [timePeriod, setTimePeriod] = useState("");
  const currYear = currentDate.getFullYear();
  const currMonth = currentDate.getMonth();

  useEffect(() => {
    const formattedSelectedTime = selectedDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const [formattedTime, formattedTimePeriod] = formattedSelectedTime.split(" ");
    setTimeNum(formattedTime);
    setTimePeriod(formattedTimePeriod);
  }, [selectedDate]);

  const monthList = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleString("default", { month: "long" }),
  );
  const yearList = Array.from({ length: 2 }, (_, i) => new Date().getFullYear() + i);
  const timePeriodList = ["AM", "PM"];

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

  const handleSelectTime = (time: string, period: string) => {
    const [hour, min] = time.split(":");
    let adjustedHour = Number(hour) % 12;
    adjustedHour = period === "AM" ? adjustedHour : adjustedHour + 12;
    const newSelectedDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      adjustedHour,
      Number(min),
      0,
      0,
    );
    setSelectedDate(newSelectedDate);
    setTimePeriodDropDown(false);
  };

  const closeDropDowns = () => {
    setMonthDropDown(false);
    setYearDropDown(false);
    setTimePeriodDropDown(false);
  };

  return (
    <Modal
      onClose={onClose}
      onClick={closeDropDowns}
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
              <button className={styles.btnWrapper} onClick={handlePrevMonth}>
                <Image
                  src={chevronLeft}
                  alt="Previous Month"
                  width={16}
                  height={16}
                  style={{ cursor: "pointer" }}
                />
              </button>
            </div>
            <DropDown
              onClick={() => {
                setTimePeriodDropDown(false);
                setMonthDropDown(!monthDropDown);
              }}
              selectedDisplay={currentDate.toLocaleString("default", { month: "long" })}
              dropdownOpen={monthDropDown}
              items={monthList}
              onSelect={(i) => {
                handleSelectMonth(i);
              }}
            />
            <DropDown
              onClick={() => {
                setTimePeriodDropDown(false);
                setYearDropDown(!yearDropDown);
              }}
              selectedDisplay={currentDate.getFullYear().toString()}
              dropdownOpen={yearDropDown}
              items={yearList}
              onSelect={(i) => {
                handleSelectYear(i);
              }}
            />
            <div className={styles.arrowPaddingRight}>
              <button className={styles.btnWrapper} onClick={handleNextMonth}>
                <Image
                  src={chevronRight}
                  alt="Next Month"
                  width={16}
                  height={16}
                  style={{ cursor: "pointer" }}
                />
              </button>
            </div>
          </div>
          <DatePicker
            currentDate={currentDate}
            selectedDate={selectedDate}
            onSelect={(i) => {
              handleSelectDay(i);
            }}
          />
        </div>
        <div className={styles.time}>
          <span className={styles.timeLabel}>Time</span>
          <div className={styles.selectedTimeOutside}>
            <div className={styles.selectedTime}>
              <IMaskInput
                className={styles.timeInput}
                mask="HH:mm"
                blocks={{
                  HH: {
                    mask: IMask.MaskedRange,
                    from: 1,
                    to: 12,
                    maxLength: 2,
                    autofix: "pad",
                  },
                  mm: {
                    mask: IMask.MaskedRange,
                    from: 0,
                    to: 59,
                    maxLength: 2,
                    autofix: "pad",
                  },
                }}
                placeholder="HH:MM"
                lazy={false}
                value={timeNum}
                inputMode="numeric"
                onAccept={(value) => {
                  setTimeNum(value);
                }}
                onComplete={(value) => {
                  handleSelectTime(value, timePeriod);
                }}
                onBlur={() => {
                  if (timeNum.includes("_")) {
                    setTimeNum(
                      selectedDate
                        .toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                        .split(" ")[0],
                    );
                  }
                }}
              />
            </div>
            <DropDown
              onClick={() => {
                setMonthDropDown(false);
                setYearDropDown(false);
                setTimePeriodDropDown(!timePeriodDropDown);
              }}
              selectedDisplay={timePeriod}
              dropdownOpen={timePeriodDropDown}
              items={timePeriodList}
              onSelect={(i) => {
                handleSelectTime(timeNum, timePeriodList[i]);
              }}
            />
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
