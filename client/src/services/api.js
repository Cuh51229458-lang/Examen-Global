const base = import.meta.env.VITE_API_URL || "/api";
export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new Error(
      "No podemos conectar con el servidor. Comprueba que la API y MongoDB estén disponibles.",
    );
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      data?.message || "El servidor no pudo procesar la solicitud.",
    );
  if (!data) throw new Error("El servidor devolvió una respuesta inesperada.");
  return data;
}
export const api = {
  entregas: () => request("/entregas"),
  entrega: (id) => request(`/entregas/${id}`),
  materias: () => request("/materias"),
  crear: (data) =>
    request("/entregas", { method: "POST", body: JSON.stringify(data) }),
  actualizar: (id, data) =>
    request(`/entregas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminar: (id) => request(`/entregas/${id}`, { method: "DELETE" }),
  crearMateria: (data) =>
    request("/materias", { method: "POST", body: JSON.stringify(data) }),
};
