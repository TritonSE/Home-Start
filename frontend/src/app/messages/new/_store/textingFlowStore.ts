"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type MessageMode = "text" | "email";

type TextingFlowState = {
  mode: MessageMode;

  subject: string;
  message: string;
  selectedRecipientIds: string[];

  setMode: (mode: MessageMode) => void;

  setSubject: (subject: string) => void;
  setMessage: (msg: string) => void;

  toggleRecipient: (id: string) => void;
  setRecipients: (ids: string[]) => void;
  clearRecipients: () => void;

  resetDraft: () => void;
};

export const useTextingFlowStore = create<TextingFlowState>()(
  persist(
    (set, get) => ({
      mode: "text",

      subject: "",
      message: "",
      selectedRecipientIds: [],

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

      setRecipients: (ids) => set({ selectedRecipientIds: ids }),
      clearRecipients: () => set({ selectedRecipientIds: [] }),

      resetDraft: () =>
        set({
          mode: "text",
          subject: "",
          message: "",
          selectedRecipientIds: [],
        }),
    }),
    {
      name: "texting-flow-draft",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);