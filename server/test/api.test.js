import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "../src/app.js";
import Materia from "../src/models/Materia.js";
import Entrega from "../src/models/Entrega.js";
let mongo, server, base, folder, materia, record;
const body = () => ({
  titulo: "Prueba de entrega",
  descripcion: "Caso de prueba",
  materia: materia._id,
  fechaLimite: "2026-10-15",
  prioridad: "alta",
  estado: "pendiente",
  minutos: 50,
});
async function call(path, method = "GET", data) {
  const response = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(data !== undefined && { body: JSON.stringify(data) }),
  });
  return {
    status: response.status,
    data: response.status === 204 ? null : await response.json(),
  };
}
before(async () => {
  folder = await mkdtemp(join(tmpdir(), "entrega-test-"));
  mongo = await MongoMemoryServer.create({
    instance: { dbPath: folder, storageEngine: "wiredTiger" },
  });
  await mongoose.connect(mongo.getUri("test"));
  await Promise.all([Materia.init(), Entrega.init()]);
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
  if (folder) await rm(folder, { recursive: true, force: true });
});
test("health informa conexión real a MongoDB", async () => {
  assert.equal((await call("/health")).data.database, "connected");
});
test("crear materia y rechazar duplicados sin distinguir mayúsculas", async () => {
  const result = await call("/materias", "POST", {
    nombre: "Web",
    color: "#52745b",
  });
  assert.equal(result.status, 201);
  materia = result.data;
  assert.equal(
    (await call("/materias", "POST", { nombre: " WEB ", color: "#52745b" }))
      .status,
    409,
  );
});
test("CREATE y READ individual devuelven datos persistidos", async () => {
  const result = await call("/entregas", "POST", body());
  assert.equal(result.status, 201);
  record = result.data;
  assert.equal(
    (await call(`/entregas/${record._id}`)).data.titulo,
    "Prueba de entrega",
  );
  assert.equal((await Entrega.findById(record._id)).minutos, 50);
  assert.equal((await call("/entregas")).data.length, 1);
});
test("validaciones: vacío, fecha inexistente, rangos, tipos, estado, referencia y duplicados", async () => {
  for (const patch of [
    { titulo: " " },
    { fechaLimite: "2026-02-30" },
    { minutos: 0 },
    { minutos: 4.5 },
    { minutos: "50" },
    { estado: "otro" },
    { prioridad: "urgente" },
    { materia: "000000000000000000000000" },
    { descripcion: 5 },
  ])
    assert.equal(
      (await call("/entregas", "POST", { ...body(), ...patch })).status,
      400,
    );
  assert.equal((await call("/entregas", "POST", body())).status, 409);
  assert.equal((await call("/entregas/no-es-id")).status, 400);
  assert.equal((await call("/entregas/000000000000000000000000")).status, 404);
});
test("UPDATE modifica la base de datos", async () => {
  assert.equal(
    (
      await call(`/entregas/${record._id}`, "PUT", {
        ...body(),
        estado: "completada",
        minutos: 80,
      })
    ).status,
    200,
  );
  assert.equal((await Entrega.findById(record._id)).estado, "completada");
});
test("persistencia: detener mongod y abrir los mismos archivos conserva el registro", async () => {
  await mongoose.disconnect();
  await mongo.stop({ doCleanup: false });
  mongo = await MongoMemoryServer.create({
    instance: { dbPath: folder, storageEngine: "wiredTiger" },
  });
  await mongoose.connect(mongo.getUri("test"));
  assert.equal((await call(`/entregas/${record._id}`)).data.minutos, 80);
});
test("DELETE elimina y consultas posteriores responden 404", async () => {
  assert.equal((await call(`/entregas/${record._id}`, "DELETE")).status, 204);
  assert.equal(await Entrega.findById(record._id), null);
  assert.equal((await call(`/entregas/${record._id}`)).status, 404);
  assert.equal((await call(`/entregas/${record._id}`, "DELETE")).status, 404);
});
test("JSON roto y rutas desconocidas generan mensajes legibles", async () => {
  const response = await fetch(base + "/entregas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{invalido",
  });
  assert.equal(response.status, 400);
  assert.equal((await call("/no-existe")).status, 404);
});
