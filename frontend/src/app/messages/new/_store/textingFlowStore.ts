"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type TextingFlowState = {
  message: string;
  selectedRecipientIds: string[]; 

  setMessage: (msg: string) => void;

  toggleRecipient: (id: string) => void;
  setRecipients: (ids: string[]) => void;
  clearRecipients: () => void;
  resetDraft: () => void;
};

export const useTextingFlowStore = create<TextingFlowState>()(
  persist(
    (set, get) => ({
      message: "",
      selectedRecipientIds: [],

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