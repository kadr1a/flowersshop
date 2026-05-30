import { useState, useEffect } from "react";
import api from "../../api.js";
import { useToastStore } from "../../store/toastStore.js";
import Modal from "../../components/Modal.jsx";

const EMPTY = { name: "", businessType: "", address: "" };

export default function AdminSuppliers() {
  const toast = useToastStore((s) => s.add);
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = () => api.get("/admin/suppliers").then((r) => setItems(r.data.data || [])).catch((e) => toast(e.message));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name || !form.businessType || !form.address) {
      toast("Заполните все поля");
      return;
    }
    try {
      if (modal === "create") await api.post("/admin/suppliers", form);
      else await api.put(`/admin/suppliers/${modal}`, form);
      toast("Сохранено");
      setModal(null);
      load();
    } catch (e) {
      toast(e.message);
    }
  };

  const remove = async (id) => {
    if (!confirm("Удалить?")) return;
    try {
      await api.delete(`/admin/suppliers/${id}`);
      load();
    } catch (e) {
      toast(e.message);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1 className="page-title" style={{ margin: 0 }}>Поставщики</h1>
        <button type="button" className="btn btn-primary" onClick={() => { setForm(EMPTY); setModal("create"); }}>+ Добавить</button>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>ФИО</th><th>Вид хозяйства</th><th>Адрес</th><th></th></tr></thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.businessType}</td>
                <td>{s.address}</td>
                <td>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => { setForm(s); setModal(s.id); }}>Изменить</button>{" "}
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(s.id)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <Modal title={modal === "create" ? "Новый поставщик" : "Редактирование"} onClose={() => setModal(null)} actions={<><button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Отмена</button><button type="button" className="btn btn-primary" onClick={save}>Сохранить</button></>}>
          <div className="form-group"><label>ФИО</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label>Вид хозяйства</label><input className="input" value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} /></div>
          <div className="form-group"><label>Адрес</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
        </Modal>
      )}
    </div>
  );
}
