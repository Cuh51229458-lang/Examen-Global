import mongoose from "mongoose";
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export function idValido(id) {
  if (!mongoose.isObjectIdOrHexString(id))
    throw new ApiError(400, "El identificador no es válido.");
}
function texto(value, nombre, max) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw new ApiError(
      400,
      `${nombre} es obligatorio y debe tener hasta ${max} caracteres.`,
    );
  }
  return value.trim();
}
export function validarMateria(body = {}) {
  const nombre = texto(body.nombre, "El nombre", 60);
  if (typeof body.color !== "string" || !/^#[a-fA-F0-9]{6}$/.test(body.color))
    throw new ApiError(
      400,
      "El color debe ser hexadecimal, por ejemplo #52745b.",
    );
  return { nombre, clave: nombre.toLocaleLowerCase("es"), color: body.color };
}
export function validarEntrega(body = {}) {
  const titulo = texto(body.titulo, "El título", 100);
  idValido(body.materia);
  const fecha = body.fechaLimite;
  if (
    typeof fecha !== "string" ||
    !/^20\d{2}-\d{2}-\d{2}$/.test(fecha) ||
    !Number.isFinite(Date.parse(fecha)) ||
    new Date(fecha).toISOString().slice(0, 10) !== fecha
  )
    throw new ApiError(
      400,
      "La fecha debe ser válida y estar entre 2000 y 2099.",
    );
  if (!["alta", "media", "baja"].includes(body.prioridad))
    throw new ApiError(400, "Selecciona una prioridad válida.");
  if (!["pendiente", "en_progreso", "completada"].includes(body.estado))
    throw new ApiError(400, "Selecciona un estado válido.");
  if (
    !Number.isInteger(body.minutos) ||
    body.minutos < 5 ||
    body.minutos > 2400
  )
    throw new ApiError(
      400,
      "El tiempo debe ser un entero entre 5 y 2400 minutos.",
    );
  if (
    body.descripcion !== undefined &&
    (typeof body.descripcion !== "string" || body.descripcion.length > 1000)
  )
    throw new ApiError(400, "La descripción admite hasta 1000 caracteres.");
  return {
    titulo,
    clave: titulo.toLocaleLowerCase("es"),
    materia: body.materia,
    fechaLimite: fecha,
    prioridad: body.prioridad,
    estado: body.estado,
    minutos: body.minutos,
    descripcion: (body.descripcion || "").trim(),
  };
}
