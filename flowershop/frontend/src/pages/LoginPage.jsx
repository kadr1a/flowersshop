import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { useCartStore } from "../store/cartStore.js";
import { useFavoritesStore } from "../store/favoritesStore.js";
import { useToastStore } from "../store/toastStore.js";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const syncFav = useFavoritesStore((s) => s.syncLocal);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const fetchFav = useFavoritesStore((s) => s.fetchFavorites);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToastStore((s) => s.add);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let loggedUser;
      if (mode === "login") {
        loggedUser = await login(form.email, form.password);
      } else {
        loggedUser = await register({
          email: form.email,
          password: form.password,
          name: form.name,
          phone: form.phone || undefined,
        });
      }
      await syncFav();
      await fetchCart();
      await fetchFav();
      toast(mode === "login" ? "Добро пожаловать!" : "Регистрация успешна!");
      const redirect = params.get("redirect") || (loggedUser?.role === "admin" ? "/admin" : "/");
      navigate(redirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{mode === "login" ? "Вход" : "Регистрация"}</h1>
        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-group">
              <label>Имя</label>
              <input
                className="input"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="input"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              className="input"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          {mode === "register" && (
            <div className="form-group">
              <label>Телефон (необязательно)</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          )}
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.9rem" }}>
          {mode === "login" ? (
            <>Нет аккаунта? <button type="button" className="btn btn-sm btn-outline" onClick={() => setMode("register")}>Регистрация</button></>
          ) : (
            <>Уже есть аккаунт? <button type="button" className="btn btn-sm btn-outline" onClick={() => setMode("login")}>Войти</button></>
          )}
        </p>
        <p className="text-muted" style={{ fontSize: "0.75rem", marginTop: "1rem", textAlign: "center" }}>
          Тест: admin@flowers.com / admin123<br />
          client@example.com / client123
        </p>
        <p style={{ textAlign: "center", marginTop: "0.5rem" }}>
          <Link to="/">← На главную</Link>
        </p>
      </div>
    </div>
  );
}
