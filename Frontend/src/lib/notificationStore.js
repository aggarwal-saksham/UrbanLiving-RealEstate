import { create } from "zustand";
import apiRequest from "./apiRequest";

export const useNotificationStore = create((set) => ({
  number: 0,
  fetch: async () => {
    try {
      const res = await apiRequest("/users/notification");
      set({ number: res.data });
    } catch (error) {
      set({ number: 0 });
    }
  },
  decrease: () => {
    set((prev) => ({ number: Math.max(prev.number - 1, 0) }));
  },
  reset: () => {
    set({ number: 0 });
  },
}));
