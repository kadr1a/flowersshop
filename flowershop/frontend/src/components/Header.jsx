import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { useCartStore } from "../store/cartStore.js";
import { useFavoritesStore } from "../store/favoritesStore.js";

export default function Header() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const cartCount = useCartStore((s) => s.count());
  const favCount = useFavoritesStore((s) => {
    if (s.items.length) return s.items.length;
    return s.localIds.length;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const val = e.target.search.value.trim();
    const p = new URLSearchParams(params);
    if (val) p.set("search", val);
    else p.delete("search");
    p.delete("page");
    setParams(p);
    navigate(`/?${p.toString()}`);
  };

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo">FlowerShop</Link>
        <form className="header__search" onSubmit={handleSearch}>
          <input
            name="search"
            className="input"
            placeholder="Поиск цветов..."
            defaultValue={params.get("search") || ""}
          />
        </form>
        <nav className="header__nav">
          <Link to="/favorites" className="header__link" title="Избранное">
            ♥
            {favCount > 0 && <span className="header__badge">{favCount}</span>}
          </Link>
          <Link to="/cart" className="header__link" title="Корзина">
            🛒
            {cartCount > 0 && <span className="header__badge">{cartCount}</span>}
          </Link>
          {user ? (
            <>
              {user.role === "admin" && (
                <Link to="/admin" className="btn btn-sm btn-outline" title="Админ-панель">
                  Админ
                </Link>
              )}
              <Link to="/profile" className="header__link" title="Профиль">👤</Link>
            </>
          ) : (
            <Link to="/login" className="btn btn-sm btn-primary">Войти</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
