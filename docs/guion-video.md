# Guion de defensa (máximo 10 minutos)

El archivo `output/video/demostracion-local.webm` es una grabación técnica de la aplicación local. No contiene una defensa oral ni contenedores Docker: estas partes debe completarlas el estudiante.

1. 0:00-0:45. Presentarte y explicar el problema: trabajos dispersos, fechas olvidadas. Usuarios: estudiantes; alcance personal.
2. 0:45-1:30. Explicar Usuario -> React -> API REST -> Express -> MongoDB. Mostrar carpetas y modelos.
3. 1:30-3:00. En un equipo con Docker, ejecutar `docker compose up --build -d --wait` y `docker compose ps`. Mostrar tres servicios sanos y explicar DNS backend/db y volumen.
4. 3:00-4:00. Abrir localhost:8080, mostrar resumen y crear una materia si es necesario.
5. 4:00-5:30. Crear una entrega, abrir detalle, editar tiempo/prioridad y completar. Explicar POST, GET y PUT.
6. 5:30-6:00. Eliminar la entrega con confirmación, explicar DELETE.
7. 6:00-7:00. Crear otra entrega, reiniciar con `docker compose down` y `docker compose up -d --wait`, recargar y demostrar persistencia. No usar `-v`.
8. 7:00-8:00. Mostrar `docs/evidencia-api.json`, `npm test` y MongoDB (`docker compose exec db mongosh entrega --eval 'db.entregas.find().limit(2)'`).
9. 8:00-9:00. Mostrar GitHub e historial progresivo. Explicar un componente, validación del backend y archivo Compose.
10. 9:00-9:30. Conclusión y límites: uso local personal, sin autenticación; no exponer públicamente sin controles adicionales.

## Preguntas frecuentes

- ¿Por qué validar dos veces? React ayuda al usuario; Express protege la integridad aunque alguien llame la API directamente.
- ¿Qué es CRUD? Crear, leer, actualizar y eliminar registros persistentes.
- ¿Qué almacena un volumen? Archivos de MongoDB fuera del ciclo de vida del contenedor.
- ¿Por qué no localhost dentro del backend? En un contenedor localhost apunta al propio contenedor; `db` identifica el servicio MongoDB.
- ¿Qué hace Mongoose? Define modelos, valida y ejecuta operaciones MongoDB.
- ¿Qué hacen FROM/WORKDIR/COPY/RUN/EXPOSE/CMD? Seleccionan imagen base, directorio, archivos, pasos de construcción, puerto documentado y comando de inicio.
- ¿Dónde se calculan los indicadores? En React a partir de registros obtenidos por GET, no desde ejemplos estáticos.
