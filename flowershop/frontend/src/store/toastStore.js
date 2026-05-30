import { create } from "zustand";

export const useToastStore = create((set) => ({
  toasts: [],
  add: (message) => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
}));
