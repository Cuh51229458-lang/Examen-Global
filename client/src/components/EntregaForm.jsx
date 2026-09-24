import { useState } from "react";
import Modal from "./Modal.jsx";
import { hoy, payload } from "../utils.js";
export default function EntregaForm({ item, materias, onSave, onClose }) {
  const [values, setValues] = useState(
    item
      ? payload(item)
      : {
          titulo: "",
          descripcion: "",
          materia: materias[0]?._id || "",
          fechaLimite: hoy(),
          prioridad: "media",
          estado: "pendiente",
          minutos: 60,
        },
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  function change(e) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  }
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!values.titulo.trim()) {
      setError("Escribe un título para la entrega.");
      return;
    }
    setBusy(true);
    try {
      await onSave({
        ...values,
        titulo: values.titulo.trim(),
        minutos: Number(values.minutos),
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }
  return (
    <Modal
      title={item ? "Editar entrega" : "Una nueva meta"}
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={submit} className="form-grid">
        <label className="full">
          Título de la entrega
          <input
            autoFocus
            name="titulo"
            value={values.titulo}
            onChange={change}
            required
            maxLength={100}
            placeholder="Ej. Documentar la API del proyecto"
          />
        </label>
        <label>
          Materia
          <select
            name="materia"
            value={values.materia}
            onChange={change}
            required
          >
            <option value="" disabled>
              Selecciona una materia
            </option>
            {materias.map((m) => (
              <option key={m._id} value={m._id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Fecha límite
          <input
            type="date"
            name="fechaLimite"
            value={values.fechaLimite}
            onChange={change}
            min="2000-01-01"
            max="2099-12-31"
            required
          />
        </label>
        <label>
          Prioridad
          <select name="prioridad" value={values.prioridad} onChange={change}>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </label>
        <label>
          Estado
          <select name="estado" value={values.estado} onChange={change}>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="completada">Completada</option>
          </select>
        </label>
        <label className="full">
          Tiempo estimado (minutos)
          <input
            type="number"
            name="minutos"
            value={values.minutos}
            onChange={change}
            required
            min="5"
            max="2400"
            step="1"
          />
        </label>
        <label className="full">
          Descripción <span className="muted">(opcional)</span>
          <textarea
            name="descripcion"
            value={values.descripcion}
            onChange={change}
            maxLength={1000}
            rows="3"
            placeholder="Anota los requisitos y el siguiente paso…"
          />
        </label>
        {error && (
          <p role="alert" className="error full">
            {error}
          </p>
        )}
        <div className="modal-actions full">
          <button
            type="button"
            className="secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancelar
          </button>
          <button className="primary" disabled={busy || !materias.length}>
            {busy ? "Guardando…" : "Guardar entrega"}
          </button>
        </div>
        {!materias.length && (
          <p className="error full">
            Primero crea una materia desde la sección Materias.
          </p>
        )}
      </form>
    </Modal>
  );
}
