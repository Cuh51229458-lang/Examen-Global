# Entrega: definición previa al desarrollo

## Problema y contexto
Un estudiante lleva sus trabajos en distintos chats y libretas, pierde fechas límite y no distingue lo urgente de lo terminado. Entrega reúne esa información en una aplicación de uso personal durante el semestre.

## Usuarios y objetivo
Usuario principal: estudiante universitario. Objetivo: registrar, priorizar y dar seguimiento a entregas académicas, con información persistente y consultable desde distintos tamaños de pantalla.

## Información y entidades
- Materia: nombre único y color identificador.
- Entrega: título, descripción, materia relacionada, fecha límite, prioridad, estado y minutos estimados. Incluye identificador MongoDB y marcas de creación/actualización.

## Funcionalidades y alcance
Panel de indicadores; CRUD de entregas; búsqueda; filtros por estado; organización de materias; validaciones; confirmación antes de eliminar; estados de carga, error y vacío. Una sola agenda personal sin cuentas, autenticación, calificaciones, archivos adjuntos ni notificaciones externas. Funciona localmente; no debe exponerse como servicio multiusuario sin incorporar autorización.

## Arquitectura propuesta
Navegador -> React/Vite -> /api (proxy) -> Express/Node -> MongoDB. En Docker: Nginx sirve el frontend y dirige /api a backend:5001; backend usa db:27017; MongoDB conserva sus datos en un volumen.

## Criterios de aceptación
Crear una entrega y leerla desde la API; editarla; completar y filtrar; eliminarla; rechazar solicitudes incorrectas; conservar registros tras reiniciar API/base de datos; construir frontend; levantar tres servicios con Docker Compose cuando exista un motor Docker disponible.
