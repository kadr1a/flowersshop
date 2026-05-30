export default function Modal({ title, children, onClose, actions }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {title && <h2 className="modal__title">{title}</h2>}
        {children}
        {actions && <div className="modal__actions">{actions}</div>}
      </div>
    </div>
  );
}
