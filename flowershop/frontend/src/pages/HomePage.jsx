import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api.js";
import FlowerCard from "../components/FlowerCard.jsx";
import FilterPanel from "../components/FilterPanel.jsx";

const TABS = [
  { label: "Популярные", slug: "popular" },
  { label: "Все", slug: "all" },
  { label: "Монобукеты", slug: "monobukety" },
  { label: "Свадебные", slug: "svadebnye" },
  { label: "В корзинках", slug: "v-korzinkakh" },
  { label: "В коробках", slug: "v-korobkakh" },
  { label: "В пачках", slug: "v-pachkakh" },
  { label: "Розы", slug: "rozy" },
  { label: "Тюльпаны", slug: "tyulpany" },
  { label: "Хризантемы", slug: "khrizantemy" },
  { label: "Пионы", slug: "piony" },
];

const LIMIT = 20;

export default function HomePage() {
  const [params, setParams] = useSearchParams();
  const [flowers, setFlowers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = params.get("category") || "popular";
  const page = parseInt(params.get("page") || "1");

  const fetchFlowers = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams(params);
      p.set("limit", String(LIMIT));
      p.set("page", String(page));
      if (category === "popular") {
        p.set("isPopular", "true");
        p.delete("category");
      }
      const res = await api.get(`/catalog/flowers?${p.toString()}`);
      setFlowers(res.data.data || []);
      setTotal(res.data.count || 0);
    } catch {
      setFlowers([]);
    } finally {
      setLoading(false);
    }
  }, [params, category, page]);

  useEffect(() => {
    fetchFlowers();
  }, [fetchFlowers]);

  const setCategory = (slug) => {
    const p = new URLSearchParams(params);
    p.set("category", slug);
    p.delete("page");
    setParams(p);
  };

  const setSort = (sort) => {
    const p = new URLSearchParams(params);
    p.set("sort", sort);
    p.delete("page");
    setParams(p);
  };

  const setPage = (n) => {
    const p = new URLSearchParams(params);
    p.set("page", String(n));
    setParams(p);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="page">
      <div className="container">
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.slug}
              type="button"
              className={`tab ${category === t.slug ? "active" : ""}`}
              onClick={() => setCategory(t.slug)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="catalog-layout">
          <FilterPanel open={filtersOpen} onMobileClose={() => setFiltersOpen(false)} />

          <div>
            <div className="catalog-toolbar">
              <button
                type="button"
                className="btn btn-outline filters-toggle"
                onClick={() => setFiltersOpen(true)}
              >
                ☰ Фильтры
              </button>
              <select
                className="select"
                style={{ width: "auto" }}
                value={params.get("sort") || "popular"}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="price_asc">Сначала дешевле</option>
                <option value="price_desc">Сначала дороже</option>
                <option value="popular">По популярности</option>
              </select>
              <span className="text-muted">Найдено: {total}</span>
            </div>

            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : flowers.length === 0 ? (
              <div className="empty-state">Цветы не найдены</div>
            ) : (
              <div className="flower-grid">
                {flowers.map((f) => <FlowerCard key={f.id} flower={f} />)}
              </div>
            )}

            {totalPages > 1 && (
              <div className="pagination">
                <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  ← Назад
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => Math.abs(n - page) <= 2 || n === 1 || n === totalPages)
                  .map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={page === n ? "active" : ""}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Вперёд →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
