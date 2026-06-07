"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./page.module.css";

import type { Message } from "@/app/api/messages";

import { getMessagesPage } from "@/app/api/messages";
import checkboxIconAsset from "@/assets/checkbox.svg";
import caretDownIconAsset from "@/assets/ic_caretdown.svg";
import icCaretLeftAsset from "@/assets/ic_caretleft_alt.svg";
import messageAsset from "@/assets/ic_message.svg";
import mailAsset from "@/assets/mail.svg";
import unionIconAsset from "@/assets/union.svg";
import { DateTimePickerFields } from "@/components/DateTimePickerModal";
import { MessageHistoryModal } from "@/components/MessageHistoryModal";
import historyStyles from "@/components/MessageHistorySections.module.css";
import Pagination from "@/components/messages/pagination";
import Modal from "@/components/Modal";
import searchBarStyles from "@/components/SearchBar.module.css";
import Sidebar from "@/components/Sidebar";

const checkboxIcon = checkboxIconAsset as string;
const icCaretLeft = icCaretLeftAsset as string;
const caretDownIcon = caretDownIconAsset as string;
const messageIcon = messageAsset as string;
const mailIcon = mailAsset as string;
const unionIcon = unionIconAsset as string;

const ITEMS_PER_PAGE = 25;
const FETCH_LIMIT = 100;

type MessageTypeFilter = "text" | "email";

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });
};

const getMessageTitle = (message: Message) => {
  return message.subject || (message.type === "text" ? "[Text Message]" : "(No subject)");
};

const matchesQuery = (message: Message, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const subject = message.subject?.toLowerCase() ?? "";
  const body = message.body.toLowerCase();
  return subject.includes(normalizedQuery) || body.includes(normalizedQuery);
};

const startOfDay = (date: Date | null) => {
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

const endOfDay = (date: Date | null) => {
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
};

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [typeFilters, setTypeFilters] = useState<Set<MessageTypeFilter>>(
    () => new Set(["text", "email"]),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const [isDatePeriodModalOpen, setIsDatePeriodModalOpen] = useState(false);
  const [activeDatePane, setActiveDatePane] = useState<"start" | "end">("start");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [draftStartDate, setDraftStartDate] = useState<Date | null>(null);
  const [draftEndDate, setDraftEndDate] = useState<Date | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadMessages = async () => {
      setIsLoading(true);
      setErrorMessage("");
      const firstPage = await getMessagesPage({ page: 1, limit: FETCH_LIMIT });

      if (cancelled) return;

      if (!firstPage.success) {
        setErrorMessage(firstPage.error);
        setIsLoading(false);
        return;
      }

      const loadedMessages = [...firstPage.data.messages];

      const remainingPages = Array.from(
        { length: Math.max(firstPage.data.totalPages - 1, 0) },
        (_, index) => index + 2,
      );
      const remainingResults = await Promise.all(
        remainingPages.map(async (page) => await getMessagesPage({ page, limit: FETCH_LIMIT })),
      );

      if (cancelled) return;

      const failedResult = remainingResults.find((result) => !result.success);
      if (failedResult) {
        setErrorMessage(failedResult.error);
        setIsLoading(false);
        return;
      }

      remainingResults.forEach((result) => {
        if (result.success) loadedMessages.push(...result.data.messages);
      });

      setMessages(loadedMessages);
      setIsLoading(false);
    };

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilters, startDate, endDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!filterRef.current) return;
      if (event.target instanceof Node && !filterRef.current.contains(event.target)) {
        setIsTypeFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      if (!typeFilters.has(message.type)) return false;
      const messageTime = new Date(message.timestamp).getTime();
      if (startDate && messageTime < startDate.getTime()) return false;
      if (endDate && messageTime > endDate.getTime()) return false;
      return matchesQuery(message, search);
    });
  }, [endDate, messages, search, startDate, typeFilters]);

  const displayedMessages = filteredMessages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const typeOptions: { label: string; value: MessageTypeFilter }[] = [
    { label: "Text", value: "text" },
    { label: "Email", value: "email" },
  ];

  return (
    <Sidebar>
      <div className={styles.page}>
        <main className={styles.main}>
          <header className={styles.header}>
            <button
              type="button"
              className={styles.backButton}
              aria-label="Back to dashboard"
              onClick={() => router.push("/dashboard")}
            >
              <Image src={icCaretLeft} alt="" width={24} height={24} />
            </button>
            <h1 className={styles.title}>Messages</h1>
          </header>

          <section className={searchBarStyles.searchBar} aria-label="Message history controls">
            <div className={searchBarStyles.inputField}>
              <span className={searchBarStyles.ic_search}>
                <Image
                  src={unionIcon}
                  alt="Union logo"
                  className={searchBarStyles.union}
                  width={24}
                  height={24}
                />
              </span>
              <form
                className={searchBarStyles.textField}
                onSubmit={(event) => event.preventDefault()}
              >
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                />
              </form>
            </div>

            <div
              className={`${searchBarStyles.tagsContainer} ${styles.messageFilterPills}`}
              ref={filterRef}
            >
              <div className={searchBarStyles.pillWrapper}>
                <button
                  type="button"
                  className={`${searchBarStyles.pillTagStatus} ${
                    isTypeFilterOpen ? searchBarStyles.pillTagActive : ""
                  }`}
                  aria-expanded={isTypeFilterOpen}
                  onClick={() => {
                    setIsTypeFilterOpen((open) => !open);
                  }}
                >
                  <span className={searchBarStyles.pillTagContent}>
                    <span className={searchBarStyles.pillTagText}>Message Type</span>
                    <span className={searchBarStyles.pillTagIconBox} aria-hidden="true">
                      <Image
                        src={caretDownIcon}
                        alt=""
                        className={`${searchBarStyles.pillTagIconDown} ${
                          isTypeFilterOpen ? searchBarStyles.pillTagIconOpen : ""
                        }`}
                        width={12}
                        height={7}
                      />
                    </span>
                  </span>
                </button>

                {isTypeFilterOpen && (
                  <div
                    className={`${searchBarStyles.dropdown} ${searchBarStyles.dropdownSmall}`}
                    role="menu"
                  >
                    <div className={searchBarStyles.dropdownItemContainer}>
                      {typeOptions.map((option) => {
                        const selected = typeFilters.has(option.value);
                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={`${searchBarStyles.dropdownItem} ${
                              selected ? searchBarStyles.dropdownItemSelected : ""
                            }`}
                            role="menuitemcheckbox"
                            aria-checked={selected}
                            onClick={() => {
                              setTypeFilters((current) => {
                                const next = new Set(current);
                                if (next.has(option.value)) {
                                  next.delete(option.value);
                                } else {
                                  next.add(option.value);
                                }
                                return next;
                              });
                            }}
                          >
                            <span
                              className={`${searchBarStyles.checkBox} ${
                                selected ? searchBarStyles.checkBoxChecked : ""
                              }`}
                              aria-hidden="true"
                            >
                              {selected && (
                                <Image
                                  src={checkboxIcon}
                                  alt=""
                                  className={searchBarStyles.checkIcon}
                                  width={16}
                                  height={16}
                                />
                              )}
                            </span>
                            <div className={searchBarStyles.filterLabel}>{option.label}</div>
                          </button>
                        );
                      })}
                    </div>
                    <div className={searchBarStyles.dropdownFooter}>
                      <button
                        type="button"
                        className={searchBarStyles.dropdownClearButton}
                        onClick={() => setTypeFilters(new Set())}
                        disabled={typeFilters.size === 0}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className={searchBarStyles.pillWrapper}>
                <button
                  type="button"
                  className={`${searchBarStyles.pillTagStatus} ${
                    isDatePeriodModalOpen ? searchBarStyles.pillTagActive : ""
                  }`}
                  aria-expanded={isDatePeriodModalOpen}
                  onClick={() => {
                    setIsTypeFilterOpen(false);
                    setDraftStartDate(startDate);
                    setDraftEndDate(endDate);
                    setActiveDatePane("start");
                    setIsDatePeriodModalOpen(true);
                  }}
                >
                  <span className={searchBarStyles.pillTagContent}>
                    <span className={searchBarStyles.pillTagText}>Date Filter</span>
                  </span>
                </button>
              </div>
            </div>
          </section>

          <section className={styles.historySection}>
            <div className={historyStyles.messageList}>
              {isLoading && <div className={styles.emptyState}>Loading messages...</div>}
              {!isLoading && errorMessage && (
                <div className={styles.emptyState}>{errorMessage}</div>
              )}
              {!isLoading && !errorMessage && displayedMessages.length === 0 && (
                <div className={styles.emptyState}>No messages found.</div>
              )}
              {!isLoading &&
                !errorMessage &&
                displayedMessages.map((message) => (
                  <div
                    key={message._id}
                    className={historyStyles.messageRow}
                    onClick={() => setSelectedMessage(message)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedMessage(message);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={historyStyles.messageIconWrapper}>
                      <Image
                        src={message.type === "text" ? messageIcon : mailIcon}
                        alt=""
                        width={24}
                        height={24}
                      />
                    </div>
                    <div className={historyStyles.messageInfo}>
                      <div className={historyStyles.messageSubjectCol}>
                        <span className={historyStyles.messageSubject}>
                          {getMessageTitle(message)}
                        </span>
                      </div>
                      <div className={historyStyles.messagemessageCol}>
                        <span className={historyStyles.messagemessage}>{message.body}</span>
                      </div>
                      <div className={styles.typeDateGroup}>
                        <span className={historyStyles.messageDate}>
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div className={styles.summaryRow}>Total messages: {filteredMessages.length}</div>
          </section>

          <Pagination
            totalItems={filteredMessages.length}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            setPageIndex={setCurrentPage}
          />
        </main>

        {selectedMessage && (
          <MessageHistoryModal
            message={selectedMessage}
            onClose={() => setSelectedMessage(undefined)}
            onActionButton={() => {
              const params = new URLSearchParams({
                type: selectedMessage.type,
                message: selectedMessage.body,
              });
              if (selectedMessage.type === "email" && selectedMessage.subject) {
                params.set("subject", selectedMessage.subject);
              }
              router.push(`/messages/templates/new?${params.toString()}`);
            }}
          />
        )}

        {isDatePeriodModalOpen && (
          <Modal
            onClose={() => setIsDatePeriodModalOpen(false)}
            width="min(780px, calc(100vw - 32px))"
            radius="8px"
            title="Select Date Range"
            titleLineHeight={24}
            titleFontSize="20px"
            padding="20px"
          >
            <div className={styles.datePaneSwitch} role="tablist" aria-label="Date range">
              <button
                type="button"
                className={`${styles.datePaneSwitchButton} ${
                  activeDatePane === "start" ? styles.datePaneSwitchButtonActive : ""
                }`}
                onClick={() => setActiveDatePane("start")}
                role="tab"
                aria-selected={activeDatePane === "start"}
              >
                Start
              </button>
              <button
                type="button"
                className={`${styles.datePaneSwitchButton} ${
                  activeDatePane === "end" ? styles.datePaneSwitchButtonActive : ""
                }`}
                onClick={() => setActiveDatePane("end")}
                role="tab"
                aria-selected={activeDatePane === "end"}
              >
                End
              </button>
            </div>
            <div className={styles.datePeriodModal}>
              <div
                className={`${styles.datePickerColumn} ${
                  activeDatePane === "start" ? styles.datePickerColumnActive : ""
                }`}
              >
                <span className={styles.datePickerTitle}>Start</span>
                <DateTimePickerFields
                  date={draftStartDate}
                  onChange={setDraftStartDate}
                  showTime={false}
                />
              </div>
              <div className={styles.datePickerDivider} aria-hidden="true" />
              <div
                className={`${styles.datePickerColumn} ${
                  activeDatePane === "end" ? styles.datePickerColumnActive : ""
                }`}
              >
                <span className={styles.datePickerTitle}>End</span>
                <DateTimePickerFields
                  date={draftEndDate}
                  onChange={setDraftEndDate}
                  showTime={false}
                />
              </div>
            </div>
            <div className={styles.datePeriodButtons}>
              <button
                type="button"
                className={styles.datePeriodClearButton}
                onClick={() => {
                  setDraftStartDate(null);
                  setDraftEndDate(null);
                  setStartDate(null);
                  setEndDate(null);
                  setIsDatePeriodModalOpen(false);
                }}
              >
                Clear Date Range
              </button>
              <button
                type="button"
                className={styles.datePeriodSecondaryButton}
                onClick={() => setIsDatePeriodModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.datePeriodPrimaryButton}
                onClick={() => {
                  setStartDate(startOfDay(draftStartDate));
                  setEndDate(endOfDay(draftEndDate));
                  setIsDatePeriodModalOpen(false);
                }}
              >
                Apply Range
              </button>
            </div>
          </Modal>
        )}
      </div>
    </Sidebar>
  );
}
