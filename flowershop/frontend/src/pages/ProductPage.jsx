import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api.js";
import { useCartStore } from "../store/cartStore.js";
import { useFavoritesStore } from "../store/favoritesStore.js";
import { useAuthStore } from "../store/authStore.js";
import { useToastStore } from "../store/toastStore.js";
import { KIND_LABELS, SEASON_LABELS, GROWING_LABELS } from "../utils/labels.js";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flower, setFlower] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sellerId, setSellerId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const addToCart = useCartStore((s) => s.addToCart);
  const isFav = useFavoritesStore((s) => s.isFavorite(id));
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const user = useAuthStore((s) => s.user);
  const toast = useToastStore((s) => s.add);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/catalog/flowers/${id}`)
      .then((res) => {
        setFlower(res.data.data);
        const sellers = res.data.data?.sellers || [];
        if (sellers.length) setSellerId(sellers[0].id);
      })
      .catch(() => setFlower(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCart = async () => {
    if (!user) {
      toast("Войдите, чтобы добавить в корзину");
      return;
    }
    if (!sellerId) {
      toast("Выберите продавца");
      return;
    }
    try {
      await addToCart(id, sellerId, quantity);
      toast("Добавлено в корзину");
    } catch (err) {
      toast(err.message);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!flower) return <div className="container empty-state">Товар не найден</div>;

  return (
    <div className="page">
      <div className="container">
        <button type="button" className="back-link" onClick={() => navigate(-1)}>
          ← Назад
        </button>
        <div className="product-layout">
          <img src={flower.imageUrl} alt={flower.name} className="product-img" />
          <div>
            <h1>{flower.name}</h1>
            <div className="product-price">{flower.price.toLocaleString("ru-RU")} ₽</div>
            <p className="text-muted">
              {KIND_LABELS[flower.kind]} · {SEASON_LABELS[flower.season]} · {flower.country} ·{" "}
              {GROWING_LABELS[flower.growingType]}
            </p>
            <p style={{ margin: "1rem 0" }}>{flower.description}</p>

            {flower.varieties?.length > 0 && (
              <>
                <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Сорта</h3>
                <ul className="variety-list">
                  {flower.varieties.map((v) => (
                    <li key={v.id}>{v.name}</li>
                  ))}
                </ul>
              </>
            )}

            <div className="form-group">
              <label>Продавец</label>
              <select className="select" value={sellerId} onChange={(e) => setSellerId(e.target.value)}>
                {(flower.sellers || []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name} — {s.address}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Количество</label>
              <input
                type="number"
                className="input"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ maxWidth: "120px" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <button type="button" className="btn btn-primary" onClick={handleCart}>
                В корзину
              </button>
              <button
                type="button"
                className={`btn btn-icon fav-btn ${isFav ? "active" : ""}`}
                onClick={() => toggleFav(id)}
              >
                ♥
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
