import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

export default function AdminRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login?redirect=/admin" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
