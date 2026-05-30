import { useState, useEffect } from "react";
import api from "../../api.js";
import { useToastStore } from "../../store/toastStore.js";
import { STATUS_LABELS } from "../../utils/labels.js";

const STATUSES = ["pending", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const toast = useToastStore((s) => s.add);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/orders")
      .then((r) => setOrders(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      setOrders((o) => o.map((ord) => (ord.id === id ? { ...ord, status } : ord)));
      toast("Статус обновлён");
    } catch (e) {
      toast(e.message);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Заказы</h1>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Клиент</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id.slice(0, 8)}...</td>
                <td>{o.user?.name || o.customerName}<br /><small className="text-muted">{o.user?.email}</small></td>
                <td>{o.total.toLocaleString("ru-RU")} ₽</td>
                <td>
                  <select
                    className="select"
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    style={{ minWidth: "140px" }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
                <td>{new Date(o.createdAt).toLocaleString("ru-RU")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
