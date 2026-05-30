import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import { useFavoritesStore } from "../store/favoritesStore.js";
import FlowerCard from "../components/FlowerCard.jsx";

export default function FavoritesPage() {
  const { items, localIds, loading, fetchFavorites } = useFavoritesStore();
  const [guestFlowers, setGuestFlowers] = useState([]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    if (!localStorage.getItem("token") && localIds.length) {
      Promise.all(
        localIds.map((id) =>
          api.get(`/catalog/flowers/${id}`).then((r) => r.data.data).catch(() => null)
        )
      ).then((res) => setGuestFlowers(res.filter(Boolean)));
    } else {
      setGuestFlowers([]);
    }
  }, [localIds]);

  const flowers = localStorage.getItem("token")
    ? items.map((f) => f.flower).filter(Boolean)
    : guestFlowers;

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Избранное</h1>
        {!localStorage.getItem("token") && localIds.length > 0 && (
          <p className="text-muted" style={{ marginBottom: "1rem" }}>
            Войдите, чтобы синхронизировать избранное с аккаунтом
          </p>
        )}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : flowers.length === 0 && !localIds.length ? (
          <div className="empty-state">
            Список пуст. <Link to="/">Перейти в каталог</Link>
          </div>
        ) : flowers.length > 0 ? (
          <div className="flower-grid">
            {flowers.map((f) => <FlowerCard key={f.id} flower={f} />)}
          </div>
        ) : (
          <div className="empty-state">Загрузка избранного...</div>
        )}
      </div>
    </div>
  );
}
