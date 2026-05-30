import { useState, useEffect } from "react";
import api from "../../api.js";
import { SEASON_LABELS } from "../../utils/labels.js";

const TABS = [
  { id: "1", label: "1. Цветы для каждого поставщика" },
  { id: "2", label: "2. Цветы по сезону цветения" },
  { id: "3", label: "3. Цветы по стране выведения" },
  { id: "4", label: "4. Где купить заданный сорт" },
  { id: "5", label: "5. Продавцы самых дорогих цветов" },
  { id: "6", label: "6. Совпадающие поставщики у продавцов" },
];

export default function AdminReports() {
  const [tab, setTab] = useState("1");
  const [result, setResult] = useState([]);
  const [maxPrice, setMaxPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  const [suppliers, setSuppliers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [sellers, setSellers] = useState([]);

  const [supplierId, setSupplierId] = useState("");
  const [season, setSeason] = useState("");
  const [country, setCountry] = useState("");
  const [variety, setVariety] = useState("");
  const [sellerA, setSellerA] = useState("");
  const [sellerB, setSellerB] = useState("");

  useEffect(() => {
    api.get("/admin/reports/suppliers").then((r) => setSuppliers(r.data.data || []));
    api.get("/admin/reports/seasons").then((r) => setSeasons(r.data.data || []));
    api.get("/admin/sellers").then((r) => setSellers(r.data.data || []));
  }, []);

  const run = async () => {
    setLoading(true);
    setResult([]);
    setMaxPrice(null);
    try {
      let r;
      switch (tab) {
        case "1":
          r = await api.get(`/admin/reports/flowers-by-supplier?supplierId=${supplierId}`);
          setResult(r.data.data || []);
          break;
        case "2":
          r = await api.get(`/admin/reports/flowers-by-season?season=${season}`);
          setResult(r.data.data || []);
          break;
        case "3":
          r = await api.get(`/admin/reports/flowers-by-country?country=${encodeURIComponent(country)}`);
          setResult(r.data.data || []);
          break;
        case "4":
          r = await api.get(`/admin/reports/sellers-by-variety?variety=${encodeURIComponent(variety)}`);
          setResult(r.data.data || []);
          break;
        case "5":
          r = await api.get("/admin/reports/sellers-of-most-expensive");
          setResult(r.data.data || []);
          setMaxPrice(r.data.maxPrice);
          break;
        case "6":
          r = await api.get(`/admin/reports/common-suppliers?sellerA=${sellerA}&sellerB=${sellerB}`);
          setResult(r.data.data || []);
          break;
        default:
          break;
      }
    } catch {
      setResult([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Аналитические отчёты</h1>
      <div className="reports-tabs">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => { setTab(t.id); setResult([]); }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="report-panel">
        {tab === "1" && (
          <div className="form-group">
            <label>Поставщик</label>
            <select className="select" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <option value="">— Выберите —</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        {tab === "2" && (
          <div className="form-group">
            <label>Сезон</label>
            <select className="select" value={season} onChange={(e) => setSeason(e.target.value)}>
              <option value="">— Выберите —</option>
              {seasons.map((s) => <option key={s} value={s}>{SEASON_LABELS[s] || s}</option>)}
            </select>
          </div>
        )}
        {tab === "3" && (
          <div className="form-group">
            <label>Страна</label>
            <input className="input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Введите страну" />
          </div>
        )}
        {tab === "4" && (
          <div className="form-group">
            <label>Название сорта</label>
            <input className="input" value={variety} onChange={(e) => setVariety(e.target.value)} placeholder="Например: Чайно-гибридная" />
          </div>
        )}
        {tab === "5" && <p className="text-muted">Автоматический запрос — продавцы самых дорогих цветов</p>}
        {tab === "6" && (
          <div className="form-row">
            <div className="form-group">
              <label>Продавец 1</label>
              <select className="select" value={sellerA} onChange={(e) => setSellerA(e.target.value)}>
                <option value="">—</option>
                {sellers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Продавец 2</label>
              <select className="select" value={sellerB} onChange={(e) => setSellerB(e.target.value)}>
                <option value="">—</option>
                {sellers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        )}
        {tab !== "5" && (
          <button type="button" className="btn btn-primary" onClick={run} style={{ marginTop: "1rem" }}>
            Выполнить запрос
          </button>
        )}
        {tab === "5" && (
          <button type="button" className="btn btn-primary" onClick={run} style={{ marginTop: "1rem" }}>
            Загрузить
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="data-table-wrap">
          {tab === "5" && maxPrice != null && (
            <p style={{ padding: "1rem", fontWeight: 600 }}>Максимальная цена: {maxPrice} ₽</p>
          )}
          <table className="data-table">
            <thead>
              <tr>
                {tab === "1" && <><th>Название</th><th>Цена</th><th>Сезон</th></>}
                {tab === "2" && <><th>Название</th><th>Страна</th><th>Цена</th></>}
                {tab === "3" && <><th>Название</th><th>Сезон</th><th>Цена</th></>}
                {(tab === "4" || tab === "5") && <><th>Продавец</th><th>Адрес</th><th>Цветок</th><th>Цена</th></>}
                {tab === "6" && <><th>Название</th><th>Вид хозяйства</th><th>Адрес</th></>}
              </tr>
            </thead>
            <tbody>
              {result.map((row, i) => (
                <tr key={i}>
                  {tab === "1" && <><td>{row.name}</td><td>{row.price}</td><td>{SEASON_LABELS[row.season] || row.season}</td></>}
                  {tab === "2" && <><td>{row.name}</td><td>{row.country}</td><td>{row.price}</td></>}
                  {tab === "3" && <><td>{row.name}</td><td>{SEASON_LABELS[row.season] || row.season}</td><td>{row.price}</td></>}
                  {(tab === "4" || tab === "5") && (
                    <>
                      <td>{row.sellerName}</td>
                      <td>{row.address}</td>
                      <td>{row.flowerName}</td>
                      <td>{row.price}</td>
                    </>
                  )}
                  {tab === "6" && <><td>{row.name}</td><td>{row.businessType}</td><td>{row.address}</td></>}
                </tr>
              ))}
            </tbody>
          </table>
          {!result.length && <p className="empty-state">Нет данных</p>}
        </div>
      )}
    </div>
  );
}
