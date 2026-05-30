import { useState, useEffect } from "react";
import api from "../../api.js";
import { KIND_LABELS, SEASON_LABELS, GROWING_LABELS } from "../../utils/labels.js";

export default function AdminLists() {
  const [flowers, setFlowers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/lists/flowers"),
      api.get("/admin/lists/suppliers"),
      api.get("/admin/lists/sellers"),
    ])
      .then(([f, s, sel]) => {
        setFlowers(f.data.data || []);
        setSuppliers(s.data.data || []);
        setSellers(sel.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Обобщённые списки</h1>

      <section className="lists-section">
        <h2>Сведения о цветах</h2>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Вид</th>
                <th>Сезон</th>
                <th>Страна</th>
                <th>Цена</th>
                <th>Выращивание</th>
                <th>Сорта</th>
                <th>Поставщики</th>
                <th>Продавцы</th>
              </tr>
            </thead>
            <tbody>
              {flowers.map((f) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>{KIND_LABELS[f.kind]}</td>
                  <td>{SEASON_LABELS[f.season]}</td>
                  <td>{f.country}</td>
                  <td>{f.price}</td>
                  <td>{GROWING_LABELS[f.growingType]}</td>
                  <td>{f.varieties}</td>
                  <td>{f.suppliers}</td>
                  <td>{f.sellers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="lists-section">
        <h2>Сведения о поставщиках</h2>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>ФИО</th><th>Вид хозяйства</th><th>Адрес</th></tr></thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}><td>{s.name}</td><td>{s.businessType}</td><td>{s.address}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="lists-section">
        <h2>Сведения о продавцах</h2>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>ФИО</th><th>Адрес</th></tr></thead>
            <tbody>
              {sellers.map((s) => (
                <tr key={s.id}><td>{s.name}</td><td>{s.address}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
