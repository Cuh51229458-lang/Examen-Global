#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v docker >/dev/null || { echo "Falta instalar e iniciar Docker."; exit 1; }
command -v node >/dev/null || { echo "Se necesita Node.js 20+ para la comprobación HTTP."; exit 1; }
mkdir -p "../documentacion/Examen Global"
exec > >(tee "../documentacion/Examen Global/docker-verificacion.txt") 2>&1
echo "=== Construcción y ejecución real ==="
date -u
echo "+ docker compose up --build -d --wait"
docker compose up --build -d --wait --wait-timeout 180
echo "+ docker compose ps"
docker compose ps
node scripts/docker-http.mjs create
docker compose ps --format json > "../documentacion/Examen Global/docker-antes.json"
echo "+ docker compose down"
docker compose down
echo "+ docker compose up -d --wait"
docker compose up -d --wait --wait-timeout 180
echo "+ docker compose ps"
docker compose ps
docker compose ps --format json > "../documentacion/Examen Global/docker-despues.json"
node scripts/docker-http.mjs verify
echo "PASS: frontend -> backend -> MongoDB y persistencia tras recrear contenedores."
