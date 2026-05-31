"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Volunteer } from "@/types/volunteer";

export type MessageMode = "text" | "email";

type TextingFlowState = {
  mode: MessageMode;

  subject: string;
  message: string;
  selectedRecipients: Volunteer[];
  selectedRecipientIds: string[];
  numSelectedRecipientIds: number;
  recipients: Volunteer[];
  recipientIds: string[];
  numRecipientIds: number;
  sendDate: Date | undefined;

  pageIndex: number;

  setMode: (mode: MessageMode) => void;

  setSubject: (subject: string) => void;
  setMessage: (msg: string) => void;

  toggleRecipient: (id: string) => void;
  setSelectedRecipients: (recipients: Volunteer[]) => void;
  clearSelectedRecipients: () => void;
  getSelectedRecipients: () => Volunteer[];
  getNumSelectedRecipientIds: () => number;
  getNumRecipientIds: () => number;
  setRecipients: (recipients: Volunteer[]) => void;
  setRecipientsPool: (recipients: Volunteer[]) => void;
  toggleSelectAll: (filteredVolunteers: Volunteer[]) => void;
  setSendDate: (date: Date | undefined) => void;

  resetDraft: () => void;
  setPageIndex: (index: number) => void;
};

export const useTextingFlowStore = create<TextingFlowState>()(
  persist(
    (set, get) => ({
      mode: "text",

      subject: "",
      message: "",
      selectedRecipients: [],
      selectedRecipientIds: [],
      recipients: [],
      recipientIds: [],
      numSelectedRecipientIds: 0,
      numRecipientIds: 0,
      sendDate: undefined,

      pageIndex: 0,

      setMode: (mode) => {
        set({ mode });
      },
      setSubject: (subject) => set({ subject }),
      setMessage: (msg) => set({ message: msg }),

      toggleRecipient: (id) => {
        const recipients = get().recipients;
        const prev = get().selectedRecipients;
        const prevIds = get().selectedRecipientIds;
        const exists = prevIds.includes(id);
        const recipient = recipients.find((item) => item._id === id);

        set({
          selectedRecipientIds: exists ? prevIds.filter((x) => x !== id) : [...prevIds, id],
        });

        if (exists) {
          set({
            selectedRecipients: prev.filter((item) => item._id !== id),
          });
          return;
        }

        if (recipient) {
          set({
            selectedRecipients: [...prev, recipient],
          });
        }
      },

      setSelectedRecipients: (recipients) =>
        set({
          selectedRecipients: recipients,
          selectedRecipientIds: recipients.map((recipient) => recipient._id),
        }),
      clearSelectedRecipients: () =>
        set({
          selectedRecipientIds: [],
          selectedRecipients: [],
        }),
      getSelectedRecipients: () => get().selectedRecipients,
      getNumSelectedRecipientIds: () => get().selectedRecipientIds.length,
      getNumRecipientIds: () => get().recipientIds.length,
      setRecipients: (recipients) => {
        set({
          recipients,
          recipientIds: recipients.map((recipient) => recipient._id),
          selectedRecipients: [],
          selectedRecipientIds: [],
          numSelectedRecipientIds: 0,
          numRecipientIds: recipients.length,
        });
      },
      setRecipientsPool: (recipients) => {
        set({
          recipients,
          recipientIds: recipients.map((recipient) => recipient._id),
          numRecipientIds: recipients.length,
        });
      },
      toggleSelectAll: (filteredVolunteers) => {
        const selectedRecipientIds = get().selectedRecipientIds;

        const allSelected =
          filteredVolunteers.length > 0 &&
          filteredVolunteers.every((v) => selectedRecipientIds.includes(v._id));

        if (allSelected) {
          set({
            selectedRecipientIds: selectedRecipientIds.filter(
              (id) => !filteredVolunteers.some((v) => v._id === id),
            ),
            selectedRecipients: get().selectedRecipients.filter(
              (r) => !filteredVolunteers.some((v) => v._id === r._id),
            ),
          });
          return;
        }

        const newVolunteers = filteredVolunteers.filter(
          (v) => !selectedRecipientIds.includes(v._id),
        );

        set({
          selectedRecipientIds: [...selectedRecipientIds, ...newVolunteers.map((v) => v._id)],
          selectedRecipients: [...get().selectedRecipients, ...newVolunteers],
        });
      },
      setSendDate: (date) => set({ sendDate: date }),

      resetDraft: () =>
        set({
          subject: "",
          message: "",
          selectedRecipientIds: [],
          selectedRecipients: [],
          sendDate: undefined,
        }),
      setPageIndex: (index) => set({ pageIndex: index }),
    }),
    {
      name: "texting-flow-draft",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
