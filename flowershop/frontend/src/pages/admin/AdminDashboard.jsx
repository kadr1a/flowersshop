import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api.js";

const QUICK_LINKS = [
  { to: "/admin/flowers", label: "Управление цветами", desc: "CRUD, сорта, связи с поставщиками и продавцами" },
  { to: "/admin/suppliers", label: "Поставщики", desc: "ФИО, вид хозяйства, адрес" },
  { to: "/admin/sellers", label: "Продавцы", desc: "ФИО и адрес магазинов" },
  { to: "/admin/lists", label: "Обобщённые списки", desc: "Сводные таблицы по цветам, поставщикам, продавцам" },
  { to: "/admin/reports", label: "Аналитические запросы", desc: "6 отчётов по базе данных" },
  { to: "/admin/supplier-flowers", label: "Цветы поставщика", desc: "Добавление и удаление связей" },
  { to: "/admin/orders", label: "Заказы", desc: "Статусы и история заказов клиентов" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((r) => setStats(r.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Панель администратора</h1>
      <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
        Управление каталогом, поставщиками, продавцами, аналитикой и заказами
      </p>

      <div className="admin-stats-grid">
        {[
          { label: "Цветов", value: stats?.flowers ?? 0 },
          { label: "Сортов", value: stats?.varieties ?? 0 },
          { label: "Поставщиков", value: stats?.suppliers ?? 0 },
          { label: "Продавцов", value: stats?.sellers ?? 0 },
          { label: "Заказов", value: stats?.orders ?? 0 },
          { label: "Ожидают обработки", value: stats?.pendingOrders ?? 0 },
        ].map((s) => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-card__value">{s.value}</div>
            <div className="admin-stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 className="admin-section-title">Разделы</h2>
      <div className="admin-links-grid">
        {QUICK_LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="admin-link-card">
            <strong>{link.label}</strong>
            <span>{link.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
