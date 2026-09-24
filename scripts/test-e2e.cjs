const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const dir = require("node:path").resolve("../documentacion/Examen Global/capturas");
fs.mkdirSync(dir, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const old = await fetch("http://127.0.0.1:5001/api/entregas").then((r) =>
    r.json(),
  );
  for (const i of old.filter((i) =>
    ["Entrega de prueba E2E", "Entrega E2E editada"].includes(i.titulo),
  ))
    await fetch("http://127.0.0.1:5001/api/entregas/" + i._id, {
      method: "DELETE",
    });
  const page = await browser.newPage({
    viewport: { width: 1512, height: 1100 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5176");
  await page
    .getByRole("button", {
      name: "Integrar la API del proyecto final",
      exact: true,
    })
    .waitFor();
  await page.screenshot({
    path: dir + "/01-panel.png",
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: "Nueva entrega", exact: true })
    .click();
  await page.getByLabel("Título de la entrega").fill("Entrega de prueba E2E");
  await page.getByLabel("Fecha límite").fill("2026-10-20");
  await page
    .getByLabel("Descripción")
    .fill("Registro creado desde React y persistido por Express en MongoDB.");
  await page.screenshot({
    path: dir + "/02-formulario.png",
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: "Guardar entrega", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Entrega de prueba E2E", exact: true })
    .waitFor();
  await page.reload();
  await page
    .getByRole("button", { name: "Entrega de prueba E2E", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Entrega de prueba E2E", exact: true })
    .click();
  await page
    .getByText(
      "Registro creado desde React y persistido por Express en MongoDB.",
      { exact: true },
    )
    .waitFor();
  await page.screenshot({
    path: dir + "/03-detalle-api.png",
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: "Editar entrega", exact: true })
    .click();
  await page.getByLabel("Título de la entrega").fill("Entrega E2E editada");
  await page.locator("select[name=estado]").selectOption("en_progreso");
  await page
    .getByRole("button", { name: "Guardar entrega", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Entrega E2E editada", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Completar Entrega E2E editada", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reabrir Entrega E2E editada", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Completada", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Entrega E2E editada", exact: true })
      .count(),
    1,
  );
  await page.screenshot({
    path: dir + "/04-completadas.png",
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: "Eliminar Entrega E2E editada", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Entrega E2E editada", exact: true })
      .count(),
    1,
  );
  await page
    .getByRole("button", { name: "Eliminar Entrega E2E editada", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirmar eliminación", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Entrega eliminada." })
    .waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "Entrega E2E editada", exact: true })
      .count(),
    0,
  );
  await page.getByRole("button", { name: "Todas", exact: true }).click();
  await page.getByRole("button", { name: "Materias", exact: true }).click();
  await page.screenshot({
    path: dir + "/05-materias.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Mi resumen", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: dir + "/06-movil.png",
    fullPage: true,
    animations: "disabled",
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.getByLabel("Buscar entregas").fill("sin resultado xy");
  await page.getByText("Un espacio para tu próximo logro").waitFor();
  await page.route("**/api/**", (r) => r.abort());
  await page.reload();
  await page.getByRole("alert").waitFor();
  await page.screenshot({
    path: dir + "/07-error-conexion.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.unroute("**/api/**");
  await page.getByRole("button", { name: "Reintentar", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Integrar la API del proyecto final",
      exact: true,
    })
    .waitFor();
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    dir + "/../pruebas-navegador.txt",
    "PASS: CRUD desde React sobre API real; detalle individual; persistencia al recargar; cancelar eliminación; confirmar eliminación; filtros; búsqueda vacía; móvil sin desbordamiento; fallo de red y reintento; cero errores JavaScript.\n",
  );
  await browser.close();
  console.log(
    "PASS: navegador, CRUD, persistencia, filtros, móvil y recuperación de conexión.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
