import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore.js";
import { useAuthStore } from "../store/authStore.js";
import PrivateRoute from "../components/PrivateRoute.jsx";

function CartContent() {
  const { items, loading, fetchCart, updateQuantity, removeItem, total } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Корзина</h1>
        {items.length === 0 ? (
          <div className="empty-state">
            Корзина пуста. <Link to="/">Перейти в каталог</Link>
          </div>
        ) : (
          <>
            <div className="data-table-wrap">
              <table className="data-table cart-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Название</th>
                    <th>Продавец</th>
                    <th>Цена</th>
                    <th>Кол-во</th>
                    <th>Итого</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img src={item.flower?.imageUrl} alt="" />
                      </td>
                      <td>{item.flower?.name}</td>
                      <td>{item.seller?.name}</td>
                      <td>{item.flower?.price?.toLocaleString("ru-RU")} ₽</td>
                      <td>
                        <input
                          type="number"
                          className="input"
                          min={1}
                          value={item.quantity}
                          style={{ width: "70px" }}
                          onChange={(e) =>
                            updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))
                          }
                        />
                      </td>
                      <td>{((item.flower?.price || 0) * item.quantity).toLocaleString("ru-RU")} ₽</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => removeItem(item.id)}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cart-summary">
              <strong>Итого: {total().toLocaleString("ru-RU")} ₽</strong>
              <Link to="/checkout" className="btn btn-primary">
                Оформить заказ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    return (
      <div className="page container empty-state">
        <Link to="/login?redirect=/cart">Войдите</Link>, чтобы увидеть корзину
      </div>
    );
  }
  return (
    <PrivateRoute>
      <CartContent />
    </PrivateRoute>
  );
}
