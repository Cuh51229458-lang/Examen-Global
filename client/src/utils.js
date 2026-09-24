export const estados = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
};
export function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function vencida(item) {
  return item.estado !== "completada" && item.fechaLimite < hoy();
}
export function fechaTexto(value) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T12:00:00`));
}
export function payload(item) {
  return {
    titulo: item.titulo,
    descripcion: item.descripcion,
    materia: item.materia._id,
    fechaLimite: item.fechaLimite,
    prioridad: item.prioridad,
    estado: item.estado,
    minutos: item.minutos,
  };
}
