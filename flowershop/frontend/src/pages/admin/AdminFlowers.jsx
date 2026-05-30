import { useState, useEffect } from "react";
import api from "../../api.js";
import { useToastStore } from "../../store/toastStore.js";
import Modal from "../../components/Modal.jsx";
import { KIND_LABELS, SEASON_LABELS, GROWING_LABELS } from "../../utils/labels.js";

const EMPTY = {
  name: "",
  kind: "garden",
  season: "summer",
  country: "",
  price: "",
  growingType: "greenhouse",
  imageUrl: "",
  description: "",
  isPopular: false,
  varieties: [],
  supplierIds: [],
  sellerIds: [],
  categoryIds: [],
  tagIds: [],
};

export default function AdminFlowers() {
  const toast = useToastStore((s) => s.add);
  const [flowers, setFlowers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [varietyInput, setVarietyInput] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [f, sup, sel, cat, tg] = await Promise.all([
        api.get("/admin/flowers"),
        api.get("/admin/suppliers"),
        api.get("/admin/sellers"),
        api.get("/admin/categories"),
        api.get("/admin/tags"),
      ]);
      setFlowers(f.data.data || []);
      setSuppliers(sup.data.data || []);
      setSellers(sel.data.data || []);
      setCategories(cat.data.data || []);
      setTags(tg.data.data || []);
    } catch (err) {
      toast(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(EMPTY);
    setModal("create");
  };

  const openEdit = (flower) => {
    setForm({
      name: flower.name,
      kind: flower.kind,
      season: flower.season,
      country: flower.country,
      price: flower.price,
      growingType: flower.growingType,
      imageUrl: flower.imageUrl,
      description: flower.description,
      isPopular: flower.isPopular,
      varieties: flower.varieties?.map((v) => v.name) || [],
      supplierIds: flower.suppliers?.map((s) => s.id) || [],
      sellerIds: flower.sellers?.map((s) => s.id) || [],
      categoryIds: flower.categories?.map((c) => c.id) || [],
      tagIds: flower.tags?.map((t) => t.id) || [],
    });
    setModal(flower.id);
  };

  const toggleArr = (key, id) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(id) ? f[key].filter((x) => x !== id) : [...f[key], id],
    }));
  };

  const addVariety = () => {
    if (!varietyInput.trim()) return;
    setForm((f) => ({ ...f, varieties: [...f.varieties, varietyInput.trim()] }));
    setVarietyInput("");
  };

  const save = async () => {
    if (!form.name || !form.country || !form.imageUrl || !form.description || !form.price || form.price <= 0) {
      toast("Заполните все обязательные поля, цена > 0");
      return;
    }
    const payload = { ...form, price: parseFloat(form.price) };
    try {
      if (modal === "create") {
        await api.post("/admin/flowers", payload);
        toast("Цветок добавлен");
      } else {
        await api.put(`/admin/flowers/${modal}`, payload);
        toast("Цветок обновлён");
      }
      setModal(null);
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm("Удалить цветок?")) return;
    try {
      await api.delete(`/admin/flowers/${id}`);
      toast("Удалено");
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1 className="page-title" style={{ margin: 0 }}>Управление цветами</h1>
        <button type="button" className="btn btn-primary" onClick={openCreate}>+ Добавить цветок</button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Вид</th>
                <th>Сезон</th>
                <th>Цена</th>
                <th>Популярный</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {flowers.map((f) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>{KIND_LABELS[f.kind]}</td>
                  <td>{SEASON_LABELS[f.season]}</td>
                  <td>{f.price} ₽</td>
                  <td>{f.isPopular ? "✓" : ""}</td>
                  <td>
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => openEdit(f)}>Изменить</button>{" "}
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(f.id)}>Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={modal === "create" ? "Новый цветок" : "Редактирование"}
          onClose={() => setModal(null)}
          actions={
            <>
              <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Отмена</button>
              <button type="button" className="btn btn-primary" onClick={save}>Сохранить</button>
            </>
          }
        >
          <div className="admin-form" style={{ boxShadow: "none", padding: 0, maxWidth: "100%" }}>
            <div className="form-row">
              <div className="form-group">
                <label>Название *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Цена *</label>
                <input type="number" className="input" min={0.01} step={0.01} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Вид</label>
                <select className="select" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                  <option value="garden">Садовый</option>
                  <option value="indoor">Комнатный</option>
                </select>
              </div>
              <div className="form-group">
                <label>Сезон</label>
                <select className="select" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })}>
                  {Object.entries(SEASON_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Страна *</label>
                <input className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Выращивание</label>
                <select className="select" value={form.growingType} onChange={(e) => setForm({ ...form, growingType: e.target.value })}>
                  {Object.entries(GROWING_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>URL изображения *</label>
              <input className="input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Описание *</label>
              <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <label style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} />
              Популярный
            </label>

            <div className="form-group">
              <label>Сорта</label>
              <div className="variety-tags">
                {form.varieties.map((v, i) => (
                  <span key={i} className="variety-tag">
                    {v}
                    <button type="button" onClick={() => setForm((f) => ({ ...f, varieties: f.varieties.filter((_, j) => j !== i) }))}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input className="input" value={varietyInput} onChange={(e) => setVarietyInput(e.target.value)} placeholder="Название сорта" />
                <button type="button" className="btn btn-sm btn-primary" onClick={addVariety}>+</button>
              </div>
            </div>

            {[
              { key: "supplierIds", label: "Поставщики", items: suppliers },
              { key: "sellerIds", label: "Продавцы", items: sellers },
              { key: "categoryIds", label: "Категории", items: categories },
              { key: "tagIds", label: "Теги", items: tags },
            ].map(({ key, label, items }) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <div className="checkbox-grid">
                  {items.map((item) => (
                    <label key={item.id}>
                      <input type="checkbox" checked={form[key].includes(item.id)} onChange={() => toggleArr(key, item.id)} />
                      {item.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
