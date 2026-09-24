import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 60 },
    clave: { type: String, required: true, unique: true },
    color: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
  },
  { timestamps: true, versionKey: false },
);
export default mongoose.model("Materia", schema);
