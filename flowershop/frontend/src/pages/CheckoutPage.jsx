import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";
import { useCartStore } from "../store/cartStore.js";
import { useToastStore } from "../store/toastStore.js";
import PrivateRoute from "../components/PrivateRoute.jsx";

function CheckoutForm() {
  const navigate = useNavigate();
  const total = useCartStore((s) => s.total());
  const items = useCartStore((s) => s.items);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const toast = useToastStore((s) => s.add);
  const [form, setForm] = useState({ customerName: "", phone: "", deliveryAddress: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/orders/checkout", form);
      await fetchCart();
      toast("Заказ успешно оформлен!");
      navigate("/profile?tab=orders&success=1");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return <div className="container empty-state">Корзина пуста</div>;
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: "560px" }}>
        <h1 className="page-title">Оформление заказа</h1>
        <div className="profile-panel">
          <p style={{ marginBottom: "1rem" }}>
            Сумма заказа: <strong>{total.toLocaleString("ru-RU")} ₽</strong>
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>ФИО *</label>
              <input
                className="input"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Телефон *</label>
              <input
                className="input"
                required
                placeholder="+7 (999) 123-45-67"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Адрес доставки *</label>
              <textarea
                className="textarea"
                required
                value={form.deliveryAddress}
                onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Оформление..." : "Подтвердить заказ"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <PrivateRoute>
      <CheckoutForm />
    </PrivateRoute>
  );
}
