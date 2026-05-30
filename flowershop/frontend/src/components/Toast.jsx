import { useToastStore } from "../store/toastStore.js";

export default function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast">{t.message}</div>
      ))}
    </div>
  );
}
