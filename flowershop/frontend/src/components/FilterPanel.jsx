import { useSearchParams } from "react-router-dom";

const COLORS = ["красный", "розовый", "белый", "жёлтый"];
const EVENTS = ["день рождения", "свадьба", "8 марта", "извинение"];
const QUANTITIES = ["3", "5", "7", "11", "21", "51"];
const ROSE_VARIETIES = ["Пионовидная", "Кустовая", "Чайно-гибридная", "Флорибунда"];

const FILTER_KEYS = ["color", "event", "quantity", "minPrice", "maxPrice", "variety", "sort"];

export default function FilterPanel({ open, onMobileClose }) {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "popular";
  const isRoses = category === "rozy";

  const update = (key, value, multi = false) => {
    const p = new URLSearchParams(params);
    if (multi) {
      const current = p.getAll(key);
      if (current.includes(value)) {
        p.delete(key);
        current.filter((v) => v !== value).forEach((v) => p.append(key, v));
      } else {
        p.append(key, value);
      }
    } else {
      if (value) p.set(key, value);
      else p.delete(key);
    }
    p.delete("page");
    setParams(p);
  };

  const clearFilters = () => {
    const p = new URLSearchParams();
    p.set("category", category);
    const search = params.get("search");
    if (search) p.set("search", search);
    setParams(p);
    onMobileClose?.();
  };

  const toggleColor = (c) => update("color", c, true);
  const toggleEvent = (e) => update("event", e, true);
  const setQuantity = (q) => {
    const p = new URLSearchParams(params);
    if (params.get("quantity") === q) p.delete("quantity");
    else p.set("quantity", q);
    p.delete("page");
    setParams(p);
  };

  const minPrice = params.get("minPrice") || "0";
  const maxPrice = params.get("maxPrice") || "10000";

  const hasActiveFilters = FILTER_KEYS.some((key) => params.has(key));

  return (
    <aside className={`filters-sidebar ${open ? "open" : ""}`}>
      <div className="filters-sidebar__head">
        <h3>Фильтры</h3>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
        >
          Очистить фильтры
        </button>
      </div>

      <div className="filter-section">
        <h3>Цвет</h3>
        <div className="checkbox-list">
          {COLORS.map((c) => (
            <label key={c}>
              <input
                type="checkbox"
                checked={params.getAll("color").includes(c)}
                onChange={() => toggleColor(c)}
              />
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Событие</h3>
        <div className="checkbox-list">
          {EVENTS.map((e) => (
            <label key={e}>
              <input
                type="checkbox"
                checked={params.getAll("event").includes(e)}
                onChange={() => toggleEvent(e)}
              />
              {e.charAt(0).toUpperCase() + e.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Количество</h3>
        <div className="qty-buttons">
          {QUANTITIES.map((q) => (
            <button
              key={q}
              type="button"
              className={`qty-btn ${params.get("quantity") === q ? "active" : ""}`}
              onClick={() => setQuantity(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Цена</h3>
        <div className="price-range">
          <input
            type="number"
            className="input"
            value={minPrice}
            min={0}
            onChange={(e) => update("minPrice", e.target.value)}
            style={{ width: "80px" }}
          />
          <span>—</span>
          <input
            type="number"
            className="input"
            value={maxPrice}
            min={0}
            onChange={(e) => update("maxPrice", e.target.value)}
            style={{ width: "80px" }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={10000}
          step={100}
          value={maxPrice}
          onChange={(e) => update("maxPrice", e.target.value)}
          style={{ width: "100%", marginTop: "0.5rem" }}
        />
      </div>

      {isRoses && (
        <div className="filter-section">
          <h3>Сорт роз</h3>
          <select
            className="select"
            value={params.get("variety") || ""}
            onChange={(e) => update("variety", e.target.value)}
          >
            <option value="">Все</option>
            {ROSE_VARIETIES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      )}

      {open && onMobileClose && (
        <button type="button" className="btn btn-sm btn-primary filters-close-mobile" onClick={onMobileClose}>
          Применить
        </button>
      )}
    </aside>
  );
}
