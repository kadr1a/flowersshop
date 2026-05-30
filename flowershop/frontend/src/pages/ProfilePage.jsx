import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api.js";
import { useAuthStore } from "../store/authStore.js";
import { useFavoritesStore } from "../store/favoritesStore.js";
import { useToastStore } from "../store/toastStore.js";
import PrivateRoute from "../components/PrivateRoute.jsx";
import FlowerCard from "../components/FlowerCard.jsx";
import Modal from "../components/Modal.jsx";
import { STATUS_LABELS } from "../utils/labels.js";

function ProfileContent() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const { items, fetchFavorites } = useFavoritesStore();
  const toast = useToastStore((s) => s.add);
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "profile";
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone || "", password: "" });
  }, [user]);

  useEffect(() => {
    if (params.get("success")) toast("Заказ успешно оформлен!");
  }, [params, toast]);

  useEffect(() => {
    if (tab === "orders") {
      api.get("/orders/my").then((r) => setOrders(r.data.data || [])).catch(() => {});
    }
    if (tab === "favorites") fetchFavorites();
  }, [tab, fetchFavorites]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const data = { name: form.name, phone: form.phone };
      if (form.password) data.password = form.password;
      await updateProfile(data);
      toast("Профиль обновлён");
      setForm((f) => ({ ...f, password: "" }));
    } catch (err) {
      toast(err.message);
    }
  };

  const setTab = (t) => {
    const p = new URLSearchParams(params);
    p.set("tab", t);
    setParams(p);
  };

  const flowers = items.map((f) => f.flower).filter(Boolean);

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Личный кабинет</h1>
        <div className="profile-tabs">
          {["profile", "favorites", "orders"].map((t) => (
            <button
              key={t}
              type="button"
              className={`tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "profile" ? "Профиль" : t === "favorites" ? "Избранное" : "История заказов"}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="profile-panel" style={{ maxWidth: "480px" }}>
            <form onSubmit={saveProfile}>
              <div className="form-group">
                <label>Имя</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="input" value={user?.email || ""} disabled />
              </div>
              <div className="form-group">
                <label>Телефон</label>
                <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Новый пароль</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Оставьте пустым, чтобы не менять"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary">Сохранить</button>
            </form>
          </div>
        )}

        {tab === "favorites" && (
          flowers.length ? (
            <div className="flower-grid">{flowers.map((f) => <FlowerCard key={f.id} flower={f} />)}</div>
          ) : (
            <div className="empty-state">Избранное пусто</div>
          )
        )}

        {tab === "orders" && (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Дата</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedOrder(o)}
                  >
                    <td>{o.id.slice(0, 8)}...</td>
                    <td>{new Date(o.createdAt).toLocaleDateString("ru-RU")}</td>
                    <td>{o.total.toLocaleString("ru-RU")} ₽</td>
                    <td>{STATUS_LABELS[o.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedOrder && (
          <Modal title={`Заказ ${selectedOrder.id.slice(0, 8)}`} onClose={() => setSelectedOrder(null)}>
            <table className="data-table">
              <thead>
                <tr><th>Товар</th><th>Продавец</th><th>Кол-во</th><th>Цена</th></tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item) => (
                  <tr key={item.id}>
                    <td>{item.flower?.name}</td>
                    <td>{item.seller?.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.priceAtTime.toLocaleString("ru-RU")} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <PrivateRoute>
      <ProfileContent />
    </PrivateRoute>
  );
}
