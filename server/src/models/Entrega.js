import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true, maxlength: 100 },
    clave: { type: String, required: true },
    descripcion: { type: String, default: "", maxlength: 1000 },
    materia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Materia",
      required: true,
    },
    fechaLimite: { type: String, required: true },
    prioridad: {
      type: String,
      enum: ["alta", "media", "baja"],
      required: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "en_progreso", "completada"],
      required: true,
    },
    minutos: { type: Number, required: true, min: 5, max: 2400 },
  },
  { timestamps: true, versionKey: false },
);
schema.index({ materia: 1, clave: 1 }, { unique: true });
export default mongoose.model("Entrega", schema);
