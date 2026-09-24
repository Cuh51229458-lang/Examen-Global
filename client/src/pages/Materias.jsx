import { useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { api } from "../services/api.js";
export default function Materias({ materias, items, refresh, notify }) {
  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState("#52745b");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.crearMateria({ nombre: nombre.trim(), color });
      setNombre("");
      await refresh();
      notify("Materia creada. Ya puedes asignarle entregas.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className="section-heading">
        <div>
          <span className="eyebrow">CADA ÁREA, EN SU LUGAR</span>
          <h1>Mis materias</h1>
          <p>Organiza tus entregas por asignatura.</p>
        </div>
      </section>
      <div className="course-grid">
        {materias.map((m) => (
          <article className="course-card" key={m._id}>
            <span className="course-icon" style={{ color: m.color }}>
              <BookOpen />
            </span>
            <h3>{m.nombre}</h3>
            <p>
              {items.filter((i) => i.materia._id === m._id).length} entregas
              registradas
            </p>
          </article>
        ))}
      </div>
      <section className="panel course-form">
        <h2>Agregar materia</h2>
        <form onSubmit={submit}>
          <label>
            Nombre
            <input
              required
              maxLength={60}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Programación web"
            />
          </label>
          <label>
            Color
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </label>
          <button className="primary" disabled={busy}>
            <Plus size={16} />
            {busy ? "Guardando…" : "Crear materia"}
          </button>
        </form>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>
    </>
  );
}
