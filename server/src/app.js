import express from "express";
import api from "./routes/api.js";
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use("/api", api);
app.use((req, res) => res.status(404).json({ message: "Ruta no encontrada." }));
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.code === 11000)
    return res
      .status(409)
      .json({
        message:
          "Ya existe un registro con ese nombre en la misma materia o catálogo.",
      });
  if (err.type === "entity.parse.failed")
    return res
      .status(400)
      .json({ message: "El cuerpo debe contener JSON válido." });
  if (err.type === "entity.too.large")
    return res
      .status(413)
      .json({ message: "La solicitud es demasiado grande." });
  if (err.name === "ValidationError" || err.name === "CastError")
    return res.status(400).json({ message: "Revisa los campos enviados." });
  if (err.status) return res.status(err.status).json({ message: err.message });
  console.error("Error del servidor:", err.name);
  res
    .status(503)
    .json({
      message: "No se pudo acceder al servicio de datos. Intenta de nuevo.",
    });
});
export default app;
