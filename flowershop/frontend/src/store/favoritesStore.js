import { create } from "zustand";
import api from "../api.js";

const LS_KEY = "favorites";

function getLocalIds() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function setLocalIds(ids) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

export const useFavoritesStore = create((set, get) => ({
  items: [],
  localIds: getLocalIds(),
  loading: false,

  fetchFavorites: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ items: [], localIds: getLocalIds() });
      return;
    }
    set({ loading: true });
    try {
      const res = await api.get("/favorites");
      set({ items: res.data.data || [], localIds: [] });
    } catch {
      set({ items: [] });
    } finally {
      set({ loading: false });
    }
  },

  syncLocal: async () => {
    const ids = getLocalIds();
    if (!ids.length || !localStorage.getItem("token")) return;
    try {
      await api.post("/favorites/sync", { flowerIds: ids });
      localStorage.removeItem(LS_KEY);
      set({ localIds: [] });
      await get().fetchFavorites();
    } catch {
      /* ignore */
    }
  },

  isFavorite: (flowerId) => {
    const { items, localIds } = get();
    if (localStorage.getItem("token")) {
      return items.some((f) => f.flowerId === flowerId);
    }
    return localIds.includes(flowerId);
  },

  toggle: async (flowerId) => {
    const token = localStorage.getItem("token");
    if (token) {
      if (get().isFavorite(flowerId)) {
        await api.delete(`/favorites/${flowerId}`);
      } else {
        await api.post(`/favorites/${flowerId}`);
      }
      await get().fetchFavorites();
    } else {
      const ids = getLocalIds();
      const next = ids.includes(flowerId)
        ? ids.filter((id) => id !== flowerId)
        : [...ids, flowerId];
      setLocalIds(next);
      set({ localIds: next });
    }
  },
}));
