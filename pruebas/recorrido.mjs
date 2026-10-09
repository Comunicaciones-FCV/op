// Prueba de punta a punta del prototipo en un navegador real (Chromium), en escritorio y celular.
// Uso: con el servidor corriendo, `node pruebas/recorrido.mjs http://localhost:3100`
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3100";
const CAPTURAS = "capturas";
await mkdir(CAPTURAS, { recursive: true });

const resultados = [];
function comprobar(nombre, condicion) {
  resultados.push({ nombre, ok: Boolean(condicion) });
  if (!condicion) console.error(`  ✗ ${nombre}`);
}

// PNG de 1×1 para probar la subida de fotos.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function recorrido(navegador, nombre, contexto) {
  console.log(`\n== ${nombre} ==`);
  const ctx = await navegador.newContext(contexto);
  const p = await ctx.newPage();
  const foto = (n) => p.screenshot({ path: `${CAPTURAS}/${nombre}-${n}.png` });

  // 1. Ingreso
  await p.goto(BASE);
  comprobar(`${nombre}: «Entrar con Google» desactivado y explicado`,
    await p.getByRole("button", { name: "Entrar con Google" }).isDisabled());
  await foto("1-ingreso");
  await p.getByRole("link", { name: "Entrar en modo prueba" }).click();
  await p.waitForURL("**/solicitud");

  // 2. Bienvenida aprobada
  comprobar(`${nombre}: mensaje de bienvenida`, await p.getByText("Cuéntame con tus palabras qué necesitas comunicar").isVisible());

  // 3. Distribución de altura: la barra de escritura queda al fondo de la pantalla
  const alto = p.viewportSize().height;
  const barra = await p.locator(".barra-escritura").boundingBox();
  comprobar(`${nombre}: barra de escritura al fondo de la pantalla`, Math.abs(barra.y + barra.height - alto) <= 1);
  await foto("2-conversacion");

  // 4. Mensaje libre: aviso honesto de IA no conectada
  await p.getByRole("textbox", { name: "Mensaje" }).fill("Queremos contar algo del área (mensaje de prueba)");
  await p.getByRole("button", { name: "Enviar mensaje" }).click();
  await p.getByText("la IA todavía no está conectada").waitFor();
  comprobar(`${nombre}: aviso de IA no conectada (sin respuesta simulada)`, true);

  // 5. Área con botones
  await p.getByRole("button", { name: "Deportes", exact: true }).click();
  comprobar(`${nombre}: área elegida queda en la conversación`, await p.getByText("Área: Deportes").isVisible());
  comprobar(`${nombre}: botones de área desaparecen`, (await p.getByText("¿De qué área es la solicitud?").count()) === 0);

  // 6. Subir una foto
  await p.locator('input[type="file"]').setInputFiles({ name: "foto-prueba.png", mimeType: "image/png", buffer: PNG });
  await p.getByText("Adjunté: foto-prueba.png").waitFor();
  comprobar(`${nombre}: foto adjunta visible`, await p.locator(".adjunto").getByText("foto-prueba.png").isVisible());

  // 7. Micrófono identificable
  comprobar(`${nombre}: botón de micrófono con nombre claro`,
    await p.getByRole("button", { name: "Dictar con el micrófono" }).isVisible());

  // 8. Menú: abre, cierra con ×, con clic fuera y con Escape
  const panel = p.locator("#menu-principal");
  await p.getByRole("button", { name: "Abrir menú" }).click();
  comprobar(`${nombre}: menú abre`, await panel.isVisible());
  await foto("3-menu");
  await p.getByRole("button", { name: "Cerrar menú" }).click();
  comprobar(`${nombre}: menú cierra con ×`, (await panel.count()) === 0);
  await p.getByRole("button", { name: "Abrir menú" }).click();
  await p.mouse.click(10, alto / 2);
  comprobar(`${nombre}: menú cierra al tocar fuera`, (await panel.count()) === 0);
  await p.getByRole("button", { name: "Abrir menú" }).click();
  await p.keyboard.press("Escape");
  comprobar(`${nombre}: menú cierra con Escape`, (await panel.count()) === 0);

  // 9. Caso de prueba → pregunta de cierre
  await p.getByRole("button", { name: "Cargar caso de prueba" }).click();
  const cierre = p.locator(".tarjeta").filter({ hasText: "¿Alguna información más antes de enviar la solicitud?" });
  comprobar(`${nombre}: aparece la pregunta de cierre`, await cierre.isVisible());
  await foto("4-cierre");

  // «Sí» vuelve a la conversación; la pregunta reaparece tras agregar información
  await cierre.getByRole("button", { name: "Sí" }).click();
  comprobar(`${nombre}: «Sí» permite agregar información`, await p.getByText("Cuéntame qué más quieres agregar.").isVisible());
  comprobar(`${nombre}: tras «Sí» no se muestra el cierre todavía`, (await cierre.count()) === 0);
  await p.getByRole("textbox", { name: "Mensaje" }).fill("Un dato más (prueba)");
  await p.getByRole("button", { name: "Enviar mensaje" }).click();
  await p.getByText("Un dato más (prueba)").waitFor();
  await cierre.waitFor();
  comprobar(`${nombre}: la pregunta de cierre vuelve después de agregar`, true);

  // «No» lleva a la vista previa, sin enviar
  await cierre.getByRole("button", { name: "No" }).click();
  comprobar(`${nombre}: vista previa sin envío`, await p.getByText("Todavía no se ha enviado").isVisible());
  await foto("5-vista-previa");

  // 10. Corrección del título
  const seccionTitulo = p.locator("section").filter({ has: p.getByRole("heading", { name: "Título" }) });
  await seccionTitulo.getByRole("button", { name: "Corregir" }).click();
  await p.getByLabel("Título").fill("[PRUEBA] Título corregido");
  await seccionTitulo.getByRole("button", { name: "Guardar" }).click();
  comprobar(`${nombre}: título corregido`, await p.getByText("[PRUEBA] Título corregido").isVisible());

  // Corrección de un campo a «pendiente»
  const lugar = p.locator(".campo").filter({ hasText: "Lugar" });
  await lugar.getByRole("button", { name: "Corregir" }).click();
  await lugar.getByLabel("Pendiente").check();
  await lugar.getByRole("button", { name: "Guardar" }).click();
  comprobar(`${nombre}: campo marcado como pendiente`, await lugar.getByText("Pendiente").isVisible());

  // 11. Confirmación con doble clic: debe quedar una sola solicitud
  const respuestas = [];
  p.on("response", (r) => r.url().endsWith("/api/solicitudes") && respuestas.push(r.status()));
  await p.getByRole("button", { name: "Confirmar y enviar" }).dblclick();
  await p.getByText(/Solicitud N° \d+ recibida/).waitFor();
  comprobar(`${nombre}: doble clic genera un solo envío`, respuestas.length === 1 && respuestas[0] === 201);
  comprobar(`${nombre}: resultado aclara que la pauta no es fecha de entrega`,
    await p.getByText("Esa no es la fecha de entrega").isVisible());
  await foto("6-resultado");

  await ctx.close();
}

async function pruebasDeServidor() {
  console.log("\n== Servidor ==");
  const clave = crypto.randomUUID();
  const borrador = {
    nombreSolicitante: "Persona de prueba", correoSolicitante: "prueba@example.org", area: "Deportes",
    titulo: "[PRUEBA] Idempotencia", queComunicar: { estado: "informado", valor: "[PRUEBA]" }, adjuntos: [],
  };
  const enviar = (b) => fetch(`${BASE}/api/solicitudes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
  const [a, b] = await Promise.all([enviar({ claveIdempotencia: clave, borrador }), enviar({ claveIdempotencia: clave, borrador })]);
  const [da, db] = [await a.json(), await b.json()];
  comprobar("servidor: dos envíos simultáneos con la misma clave → misma solicitud", da.numero === db.numero);
  const incompleta = await enviar({ claveIdempotencia: crypto.randomUUID(), borrador: { adjuntos: [] } });
  comprobar("servidor: rechaza solicitud sin datos obligatorios (422)", incompleta.status === 422);
  const ia = await fetch(`${BASE}/api/conversacion`, { method: "POST" });
  comprobar("servidor: conversación informa IA no conectada (503)", ia.status === 503);
  const malo = new FormData();
  malo.append("archivo", new Blob(["hola"], { type: "text/plain" }), "nota.txt");
  const subida = await fetch(`${BASE}/api/archivos`, { method: "POST", body: malo });
  comprobar("servidor: rechaza archivos que no son imagen ni PDF", subida.status === 415);
}

const navegador = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
await recorrido(navegador, "escritorio", { viewport: { width: 1280, height: 800 } });
await recorrido(navegador, "celular", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await navegador.close();
await pruebasDeServidor();

const fallidas = resultados.filter((r) => !r.ok);
console.log(`\n${resultados.length - fallidas.length}/${resultados.length} comprobaciones correctas`);
process.exit(fallidas.length ? 1 : 0);
