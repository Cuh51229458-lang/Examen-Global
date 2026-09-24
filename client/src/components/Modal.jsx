import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export default function Modal({ title, onClose, children, busy = false }) {
  const dialog = useRef(null);
  useEffect(() => { const node = dialog.current; node.showModal(); return () => node.close(); }, []);
  return <dialog ref={dialog} className="modal" aria-labelledby="modal-title" onCancel={e => { e.preventDefault(); if (!busy) onClose(); }}>
    <div className="modal-header"><div><span className="eyebrow">TU AGENDA ACADÉMICA</span><h2 id="modal-title">{title}</h2></div><button className="icon-button" aria-label="Cerrar" onClick={onClose} disabled={busy}><X size={20}/></button></div>{children}
  </dialog>;
}
