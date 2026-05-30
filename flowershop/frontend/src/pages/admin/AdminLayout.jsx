import { NavLink, Outlet, Link } from "react-router-dom";
import AdminRoute from "../../components/AdminRoute.jsx";

const LINKS = [
  { to: "/admin", label: "Главная", end: true },
  { to: "/admin/flowers", label: "Цветы" },
  { to: "/admin/suppliers", label: "Поставщики" },
  { to: "/admin/sellers", label: "Продавцы" },
  { to: "/admin/lists", label: "Обобщённые списки" },
  { to: "/admin/reports", label: "Аналитика" },
  { to: "/admin/supplier-flowers", label: "Цветы поставщика" },
  { to: "/admin/orders", label: "Заказы" },
];

function Layout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__title">Админ-панель</div>
        <nav>
          <ul className="admin-nav">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.end} className={({ isActive }) => (isActive ? "active" : "")}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: "1rem 1.25rem" }}>
          <Link to="/" className="btn btn-sm btn-outline">← На сайт</Link>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminRoute>
      <Layout />
    </AdminRoute>
  );
}
