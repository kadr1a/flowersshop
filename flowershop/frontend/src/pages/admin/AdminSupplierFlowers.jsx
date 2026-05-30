import { useState, useEffect } from "react";
import api from "../../api.js";
import { useToastStore } from "../../store/toastStore.js";
import Modal from "../../components/Modal.jsx";

export default function AdminSupplierFlowers() {
  const toast = useToastStore((s) => s.add);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [linked, setLinked] = useState([]);
  const [allFlowers, setAllFlowers] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/admin/suppliers").then((r) => setSuppliers(r.data.data || []));
    api.get("/admin/flowers").then((r) => setAllFlowers(r.data.data || []));
  }, []);

  useEffect(() => {
    if (!supplierId) {
      setLinked([]);
      return;
    }
    setLoading(true);
    api
      .get(`/admin/supplier-flowers/${supplierId}`)
      .then((r) => setLinked(r.data.data || []))
      .finally(() => setLoading(false));
  }, [supplierId]);

  const unlink = async (flowerId) => {
    try {
      await api.delete("/admin/supplier-flowers", { data: { supplierId, flowerId } });
      setLinked((l) => l.filter((f) => f.id !== flowerId));
      toast("Связь удалена");
    } catch (e) {
      toast(e.message);
    }
  };

  const link = async (flowerId) => {
    try {
      await api.post("/admin/supplier-flowers", { supplierId, flowerId });
      const flower = allFlowers.find((f) => f.id === flowerId);
      if (flower) setLinked((l) => [...l, flower]);
      setModal(false);
      toast("Цветок привязан");
    } catch (e) {
      toast(e.message);
    }
  };

  const available = allFlowers.filter(
    (f) =>
      !linked.some((l) => l.id === f.id) &&
      f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="page-title">Цветы поставщика</h1>
      <div className="form-group" style={{ maxWidth: "400px" }}>
        <label>Поставщик</label>
        <select className="select" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
          <option value="">— Выберите поставщика —</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {supplierId && (
        <>
          <div className="admin-header">
            <span className="text-muted">Привязано: {linked.length}</span>
            <button type="button" className="btn btn-primary" onClick={() => setModal(true)}>
              + Добавить цветок
            </button>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead><tr><th>Название</th><th>Цена</th><th></th></tr></thead>
                <tbody>
                  {linked.map((f) => (
                    <tr key={f.id}>
                      <td>{f.name}</td>
                      <td>{f.price} ₽</td>
                      <td>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => unlink(f.id)}>
                          Удалить связь
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {modal && (
        <Modal title="Добавить цветок" onClose={() => setModal(false)}>
          <input
            className="input"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: "1rem" }}
          />
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {available.map((f) => (
              <div
                key={f.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span>{f.name}</span>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => link(f.id)}>
                  Выбрать
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
