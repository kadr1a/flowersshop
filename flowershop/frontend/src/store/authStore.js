import { create } from "zustand";
import api from "../api.js";

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,

  fetchMe: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ user: null });
      return null;
    }
    set({ loading: true });
    try {
      const res = await api.get("/auth/me");
      set({ user: res.data.data });
      return res.data.data;
    } catch {
      localStorage.removeItem("token");
      set({ user: null });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.data.token);
    set({ user: res.data.data.user });
    return res.data.data.user;
  },

  register: async (data) => {
    const res = await api.post("/auth/register", data);
    localStorage.setItem("token", res.data.data.token);
    set({ user: res.data.data.user });
    return res.data.data.user;
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null });
  },

  updateProfile: async (data) => {
    const res = await api.put("/auth/profile", data);
    set({ user: res.data.data });
    return res.data.data;
  },

  isAdmin: () => get().user?.role === "admin",
  isAuth: () => !!get().user,
}));
