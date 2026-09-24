// Arranque local: mantiene MongoDB y la API bajo un mismo proceso.
// npm run dev desde la raíz también inicia Vite. Docker usa npm start.
import dotenv from "dotenv";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { mkdir, copyFile } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";
import net from "node:net";

const serverDir = fileURLToPath(new URL("../", import.meta.url));
const rootDir = resolve(serverDir, "..");
try { await copyFile(resolve(serverDir, ".env.example"), resolve(serverDir, ".env"), constants.COPYFILE_EXCL); }
catch (error) { if (error.code !== "EEXIST") throw error; }
dotenv.config({ path: resolve(serverDir, ".env") });
const uri = process.env.MONGODB_URI;
const port = Number(process.env.PORT || 5001);
const children = [];
let mongo;
let closing = false;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function occupied(port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ port, host: "127.0.0.1" });
    socket.setTimeout(800);
    const finish = result => { socket.destroy(); resolve(result); };
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(false));
  });
}
async function pingMongo() {
  const client = new mongoose.mongo.MongoClient(uri, { serverSelectionTimeoutMS: 1500 });
  try { await client.connect(); await client.db().command({ ping: 1 }); }
  finally { await client.close(); }
}
async function waitHttp(url, check) {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1200) });
      if (response.ok && (!check || await check(response))) return;
    } catch { /* El servicio todavía está iniciando o reconectando. */ }
    await pause(500);
  }
  throw new Error("El servicio no respondió a tiempo: " + url);
}
async function shutdown(code = 0) {
  if (closing) return;
  closing = true;
  for (const child of children) child.kill("SIGTERM");
  await Promise.all(children.map(child => child.exitCode !== null ? Promise.resolve() : Promise.race([new Promise(resolve => child.once("exit", resolve)), pause(3000)])));
  if (mongo) await mongo.stop({ doCleanup: false });
  process.exit(code);
}
function launch(args, cwd) {
  const child = spawn(process.execPath, args, { cwd, stdio: "inherit", env: process.env });
  children.push(child);
  child.once("error", error => { console.error(error.message); shutdown(1); });
  child.once("exit", code => { if (!closing) { console.error("Un servicio se detuvo. Vuelve a ejecutar npm run dev."); shutdown(code || 1); } });
}
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => shutdown());
try {
  if (!uri) throw new Error("Falta MONGODB_URI en server/.env.");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT debe ser un puerto válido.");
  try { await pingMongo(); console.log("MongoDB existente: conexión verificada."); }
  catch {
    const local = /^mongodb:\/\/(127\.0\.0\.1|localhost):27019\//.test(uri);
    if (!local) throw new Error("No se pudo conectar con el MongoDB configurado en server/.env.");
    if (await occupied(27019)) throw new Error("El puerto 27019 está ocupado, pero MongoDB no responde. Revisa el proceso de la base de datos.");
    const dbPath = resolve(serverDir, ".data/mongo");
    await mkdir(dbPath, { recursive: true });
    mongo = await MongoMemoryServer.create({ instance: { port: 27019, dbPath, storageEngine: "wiredTiger" } });
    await pingMongo();
    console.log("MongoDB iniciado; los datos se conservan en server/.data/mongo.");
  }
  if (await occupied(port)) console.log("La API ya está abierta; esperando su conexión con MongoDB…");
  else launch(["--watch", "src/server.js"], serverDir);
  await waitHttp(`http://127.0.0.1:${port}/api/health`, async r => (await r.json()).database === "connected");
  console.log(`API verificada: http://127.0.0.1:${port}/api/health`);
  if (process.argv.includes("--full")) {
    if (!await occupied(5176)) launch([resolve(rootDir, "client/node_modules/vite/bin/vite.js"), "--host", "127.0.0.1", "--port", "5176", "--strictPort"], resolve(rootDir, "client"));
    await waitHttp("http://127.0.0.1:5176/");
    console.log("Aplicación lista: http://127.0.0.1:5176/");
  }
  console.log("Mantén esta terminal abierta. Ctrl+C detiene solo los servicios iniciados aquí.");
  setInterval(() => {}, 60000);
} catch (error) { console.error(error.message); await shutdown(1); }
