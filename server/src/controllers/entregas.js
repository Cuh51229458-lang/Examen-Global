import Entrega from "../models/Entrega.js";
import Materia from "../models/Materia.js";
import { ApiError, idValido, validarEntrega } from "../validation.js";
export async function listar(req, res) {
  res.json(
    await Entrega.find()
      .populate("materia")
      .sort({ fechaLimite: 1, createdAt: -1 }),
  );
}
export async function obtener(req, res) {
  idValido(req.params.id);
  const item = await Entrega.findById(req.params.id).populate("materia");
  if (!item) throw new ApiError(404, "La entrega ya no existe.");
  res.json(item);
}
async function datos(body) {
  const value = validarEntrega(body);
  if (!(await Materia.exists({ _id: value.materia })))
    throw new ApiError(400, "La materia seleccionada no existe.");
  return value;
}
export async function crear(req, res) {
  const item = await Entrega.create(await datos(req.body));
  await item.populate("materia");
  res.status(201).location(`/api/entregas/${item.id}`).json(item);
}
export async function actualizar(req, res) {
  idValido(req.params.id);
  const item = await Entrega.findByIdAndUpdate(
    req.params.id,
    await datos(req.body),
    { new: true, runValidators: true },
  ).populate("materia");
  if (!item) throw new ApiError(404, "La entrega ya no existe.");
  res.json(item);
}
export async function eliminar(req, res) {
  idValido(req.params.id);
  if (!(await Entrega.findByIdAndDelete(req.params.id)))
    throw new ApiError(404, "La entrega ya no existe.");
  res.status(204).end();
}
