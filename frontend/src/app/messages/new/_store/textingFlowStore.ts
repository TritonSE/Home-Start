"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type MessageMode = "text" | "email";

type TextingFlowState = {
  mode: MessageMode;

  subject: string;
  message: string;
  selectedRecipientIds: string[];
  selectedRecipients: Recipient[];

  pageIndex: number;

  setMode: (mode: MessageMode) => void;

  setSubject: (subject: string) => void;
  setMessage: (msg: string) => void;

  toggleRecipient: (id: string) => void;
  setRecipientIds: (ids: string[]) => void;
  setRecipients: (recipients: Recipient[]) => void;
  clearRecipients: () => void;
  getRecipients: () => Recipient[];

  resetDraft: () => void;
  setPageIndex: (index: number) => void;
};

type Recipient = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export const useTextingFlowStore = create<TextingFlowState>()(
  persist(
    (set, get) => ({
      mode: "email",

      subject: "",
      message: "",
      selectedRecipientIds: [],
      selectedRecipients: [],

      pageIndex: 0,

      setMode: (mode) => set({ mode }),
      setSubject: (subject) => set({ subject }),
      setMessage: (msg) => set({ message: msg }),

      toggleRecipient: (id) => {
        const prev = get().selectedRecipientIds;
        const exists = prev.includes(id);
        set({
          selectedRecipientIds: exists ? prev.filter((x) => x !== id) : [...prev, id],
        });
      },

      setRecipientIds: (ids) => set({ selectedRecipientIds: ids }),
      setRecipients: (recipients) => set({ selectedRecipients: recipients }),
      clearRecipients: () => set({ selectedRecipientIds: [] }),
      getRecipients: () => get().selectedRecipients,

      resetDraft: () =>
        set({
          mode: "email",
          subject: "",
          message: "",
          selectedRecipientIds: [],
        }),
      setPageIndex: (index) => set({ pageIndex: index }),
    }),
    {
      name: "texting-flow-draft",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
