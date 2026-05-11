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
  toggleSelectAll: (filteredVolunteers: Volunteer[]) => void;

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
      toggleSelectAll: (filteredVolunteers) => {
        const recipients = get().recipients;
        const recipientIds = get().recipientIds;
        const selectedRecipientIds = get().selectedRecipientIds;

        if (recipientIds.length === 0) {
          set({
            selectedRecipientIds: [],
            selectedRecipients: [],
          });
          return;
        }

        const allSelected = filteredVolunteers.every((v) => selectedRecipientIds.includes(v._id));
        const selectedRecipientIdsTemp = [...get().selectedRecipientIds];
        const selectedRecipientsTemp = [...get().selectedRecipients];
        if (allSelected) {
          for (const volunteer of filteredVolunteers) {
            const indexId = selectedRecipientIdsTemp.indexOf(volunteer._id);
            const index = selectedRecipientsTemp.findIndex((r) => r._id === volunteer._id);
            if (index > -1) {
              selectedRecipientsTemp.splice(index, 1);
            }
            if (indexId > -1) {
              selectedRecipientIdsTemp.splice(indexId, 1);
            }
          }
          set({
            selectedRecipientIds: selectedRecipientIdsTemp,
            selectedRecipients: selectedRecipientsTemp,
          });
          return;
        }
        for (const volunteer of filteredVolunteers) {
          if (!selectedRecipientIds.includes(volunteer._id)) {
            selectedRecipientIdsTemp.push(volunteer._id);
            const recipient = recipients.find((r) => r._id === volunteer._id);
            if (recipient) {
              selectedRecipientsTemp.push(recipient);
            }
          }
        }
        set({
          selectedRecipientIds: selectedRecipientIdsTemp,
          selectedRecipients: selectedRecipientsTemp,
        });
      },

      resetDraft: () =>
        set({
          subject: "",
          message: "",
          selectedRecipientIds: [],
          selectedRecipients: [],
        }),
      setPageIndex: (index) => set({ pageIndex: index }),
    }),
    {
      name: "texting-flow-draft",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
