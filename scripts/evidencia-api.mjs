import { writeFile } from "node:fs/promises";
const base = process.env.API_URL || "http://127.0.0.1:5001/api";
const log = [];
async function call(path, method = "GET", body) {
  const response = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = response.status === 204 ? null : await response.json();
  log.push({ method, path, status: response.status, response: data });
  if (!response.ok && response.status !== 404)
    throw new Error(JSON.stringify(data));
  return data;
}
await call("/health");
const materia = (await call("/materias"))[0];
if (!materia) throw new Error("Primero crea una materia o ejecuta seed.");
const body = {
  titulo: "Evidencia API " + Date.now(),
  materia: materia._id,
  descripcion: "Registro temporal de evidencia",
  fechaLimite: "2026-12-01",
  prioridad: "media",
  estado: "pendiente",
  minutos: 45,
};
const item = await call("/entregas", "POST", body);
await call("/entregas/" + item._id);
await call("/entregas/" + item._id, "PUT", { ...body, estado: "completada" });
await call("/entregas/" + item._id, "DELETE");
await call("/entregas/" + item._id);
await writeFile(
  "docs/evidencia-api.json",
  JSON.stringify({ fecha: new Date().toISOString(), base, log }, null, 2),
);
console.log(log.map((e) => `${e.method} ${e.path} -> ${e.status}`).join("\n"));
