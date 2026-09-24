# Evidencias del examen global

## Comprobado en esta Mac

- Compilación del frontend con Vite.
- API Express conectada a MongoDB real, almacenado en disco con WiredTiger.
- Ocho pruebas de integración aprobadas, con reinicio real de mongod conservando registros.
- CRUD completo desde React, consulta individual, recarga, filtros, validaciones y recuperación tras fallo de conexión.
- Capturas en `docs/capturas`.
- Respuestas HTTP reales en `docs/evidencia-api.json`.
- Consulta directa a MongoDB en `docs/evidencia-db.json`.
- PDF en `output/pdf/evidencias-entrega.pdf`.
- Grabación local en `output/video/demostracion-local.webm`.

## Pendiente por entorno

Docker no está instalado. No existen evidencias de contenedores ejecutándose ni de construcción de imágenes en esta máquina. `Dockerfile`, `docker-compose.yml` y script reproducible están implementados; ejecutar `bash scripts/verificar-docker.sh` y anexar los resultados reales antes de entregar como validación completa de Docker.

La portada no incluye nombre personal porque no fue proporcionado. La defensa oral y la sección Docker del video corresponden al estudiante. No se presentan pruebas locales como si fueran pruebas Docker.
