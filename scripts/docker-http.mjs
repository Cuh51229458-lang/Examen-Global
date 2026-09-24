import { readFile, writeFile, mkdir, unlink } from "node:fs/promises";
import assert from "node:assert/strict";
let port = process.env.WEB_PORT || "8080";
if (!process.env.WEB_PORT) {
  try {
    const env = await readFile(".env", "utf8");
    port = env.match(/^WEB_PORT=(\d+)/m)?.[1] || port;
  } catch {}
}
const base = `http://127.0.0.1:${port}/api`;
async function call(path, method = "GET", body) {
  const response = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  assert.ok(response.ok, `${method} ${path}: ${response.status}`);
  return response.status === 204 ? null : response.json();
}
await mkdir("../documentacion/Examen Global/temporales", { recursive: true });
assert.equal((await call("/health")).database, "connected");
if (process.argv[2] === "create") {
  let materia = (await call("/materias"))[0];
  if (!materia)
    materia = await call("/materias", "POST", {
      nombre: "Verificación Docker",
      color: "#52745b",
    });
  const item = await call("/entregas", "POST", {
    titulo: `Persistencia Docker ${Date.now()}`,
    materia: materia._id,
    fechaLimite: "2026-12-31",
    prioridad: "baja",
    estado: "pendiente",
    minutos: 5,
  });
  await writeFile("../documentacion/Examen Global/temporales/docker-record.json", JSON.stringify(item));
  console.log("CREATE desde el proxy frontend:", item._id, item.titulo);
} else {
  const expected = JSON.parse(await readFile("../documentacion/Examen Global/temporales/docker-record.json", "utf8"));
  const found = await call("/entregas/" + expected._id);
  assert.equal(found.titulo, expected.titulo);
  console.log("READ tras down/up: registro conservado", found._id);
  await call("/entregas/" + found._id, "DELETE");
  await unlink("../documentacion/Examen Global/temporales/docker-record.json");
}
