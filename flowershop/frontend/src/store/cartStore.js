import { create } from "zustand";
import api from "../api.js";

export const useCartStore = create((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/cart");
      set({ items: res.data.data || [] });
    } catch {
      set({ items: [] });
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (flowerId, sellerId, quantity = 1) => {
    const res = await api.post("/cart", { flowerId, sellerId, quantity });
    await get().fetchCart();
    return res.data.data;
  },

  updateQuantity: async (id, quantity) => {
    await api.put(`/cart/${id}`, { quantity });
    await get().fetchCart();
  },

  removeItem: async (id) => {
    await api.delete(`/cart/${id}`);
    await get().fetchCart();
  },

  clearCart: async () => {
    await api.delete("/cart");
    set({ items: [] });
  },

  total: () => get().items.reduce((s, i) => s + (i.flower?.price || 0) * i.quantity, 0),
  count: () => get().items.reduce((s, i) => s + i.quantity, 0),
}));
