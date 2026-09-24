// Herramienta de desarrollo: ejecuta un proceso mongod real con almacenamiento en disco.
// Docker usa la imagen oficial mongo; no depende de esta herramienta.
import { MongoMemoryServer } from "mongodb-memory-server";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
const dbPath = resolve(".data/mongo");
await mkdir(dbPath, { recursive: true });
const mongo = await MongoMemoryServer.create({
  instance: { port: 27019, dbPath, storageEngine: "wiredTiger" },
});
console.log(
  "MongoDB real en mongodb://127.0.0.1:27019/entrega; archivos: " + dbPath,
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await mongo.stop({ doCleanup: false });
    process.exit(0);
  });
