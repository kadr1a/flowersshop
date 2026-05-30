import { Link } from "react-router-dom";
import { useFavoritesStore } from "../store/favoritesStore.js";
import { useCartStore } from "../store/cartStore.js";
import { useAuthStore } from "../store/authStore.js";
import { useToastStore } from "../store/toastStore.js";

const KIND_LABELS = { garden: "Садовый", indoor: "Комнатный" };

export default function FlowerCard({ flower }) {
  const isFav = useFavoritesStore((s) => s.isFavorite(flower.id));
  const toggle = useFavoritesStore((s) => s.toggle);
  const addToCart = useCartStore((s) => s.addToCart);
  const user = useAuthStore((s) => s.user);
  const toast = useToastStore((s) => s.add);

  const handleCart = async (e) => {
    e.preventDefault();
    if (!user) {
      toast("Войдите, чтобы добавить в корзину");
      return;
    }
    const seller = flower.sellers?.[0];
    if (!seller) {
      toast("Нет доступных продавцов");
      return;
    }
    try {
      await addToCart(flower.id, seller.id, 1);
      toast("Добавлено в корзину");
    } catch (err) {
      toast(err.message);
    }
  };

  const handleFav = async (e) => {
    e.preventDefault();
    await toggle(flower.id);
  };

  return (
    <Link to={`/product/${flower.id}`} className="card flower-card">
      <div className="flower-card__img-wrap">
        <img src={flower.imageUrl} alt={flower.name} className="flower-card__img" />
        <button
          className={`fav-btn flower-card__fav ${isFav ? "active" : ""}`}
          onClick={handleFav}
          aria-label="Избранное"
        >
          ♥
        </button>
      </div>
      <div className="flower-card__body">
        <div className="flower-card__name">{flower.name}</div>
        <div className="text-muted" style={{ fontSize: "0.8rem" }}>{KIND_LABELS[flower.kind]}</div>
        <div className="flower-card__price">{flower.price.toLocaleString("ru-RU")} ₽</div>
        <div className="flower-card__actions">
          <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={handleCart}>
            В корзину
          </button>
        </div>
      </div>
    </Link>
  );
}
