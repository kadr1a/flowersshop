import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

export default function PrivateRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const location = useLocation();

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  return children;
}
