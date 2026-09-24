#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v docker >/dev/null || { echo "Falta instalar e iniciar Docker."; exit 1; }
command -v node >/dev/null || { echo "Se necesita Node.js 20+ para la comprobación HTTP."; exit 1; }
mkdir -p "../documentacion/Examen Global"
exec > >(tee "../documentacion/Examen Global/docker-verificacion.txt") 2>&1
echo "=== Construcción y ejecución real ==="
date -u
docker compose up --build -d --wait
docker compose ps
node scripts/docker-http.mjs create
docker compose down
docker compose up -d --wait
docker compose ps
node scripts/docker-http.mjs verify
echo "PASS: frontend -> backend -> MongoDB y persistencia tras recrear contenedores."
