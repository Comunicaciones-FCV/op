// Almacenamiento local del PROTOTIPO: un archivo JSON y una carpeta en `.datos/`.
// Sirve para probar el recorrido completo en un solo servidor. Se reemplazará por la
// base de datos definitiva cuando se decida el alojamiento.
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BorradorDeSolicitud } from "@/dominio/solicitud";

const CARPETA = path.join(process.cwd(), ".datos");
const ARCHIVO = path.join(CARPETA, "solicitudes.json");
export const CARPETA_ARCHIVOS = path.join(CARPETA, "archivos");

export interface SolicitudConfirmada {
  numero: number;
  claveIdempotencia: string;
  confirmadaEn: string; // ISO
  viernesDePauta: string; // AAAA-MM-DD
  borrador: BorradorDeSolicitud;
  envioAMonday: "pendiente_integracion_no_habilitada";
  correoDeRecepcion: "pendiente_integracion_no_habilitada";
}

interface Datos {
  ultimoNumero: number;
  solicitudes: SolicitudConfirmada[];
}

async function leer(): Promise<Datos> {
  try {
    return JSON.parse(await readFile(ARCHIVO, "utf8")) as Datos;
  } catch {
    return { ultimoNumero: 0, solicitudes: [] };
  }
}

async function escribir(datos: Datos): Promise<void> {
  await mkdir(CARPETA, { recursive: true });
  const temporal = `${ARCHIVO}.${process.pid}.tmp`;
  await writeFile(temporal, JSON.stringify(datos, null, 2));
  await rename(temporal, ARCHIVO);
}

// Serializa las escrituras dentro del proceso para que dos envíos simultáneos no se pisen.
let cola: Promise<unknown> = Promise.resolve();
function enSerie<T>(tarea: () => Promise<T>): Promise<T> {
  const resultado = cola.then(tarea, tarea);
  cola = resultado.catch(() => undefined);
  return resultado;
}

/**
 * Registra una solicitud confirmada. Si la misma clave ya se registró (doble clic, reintento),
 * devuelve la existente en lugar de crear otra.
 */
export function registrarSolicitud(
  claveIdempotencia: string,
  borrador: BorradorDeSolicitud,
  viernesDePauta: string,
  confirmadaEn: Date,
): Promise<{ solicitud: SolicitudConfirmada; yaExistia: boolean }> {
  return enSerie(async () => {
    const datos = await leer();
    const existente = datos.solicitudes.find((s) => s.claveIdempotencia === claveIdempotencia);
    if (existente) return { solicitud: existente, yaExistia: true };

    const solicitud: SolicitudConfirmada = {
      numero: datos.ultimoNumero + 1,
      claveIdempotencia,
      confirmadaEn: confirmadaEn.toISOString(),
      viernesDePauta,
      borrador,
      envioAMonday: "pendiente_integracion_no_habilitada",
      correoDeRecepcion: "pendiente_integracion_no_habilitada",
    };
    datos.ultimoNumero = solicitud.numero;
    datos.solicitudes.push(solicitud);
    await escribir(datos);
    return { solicitud, yaExistia: false };
  });
}
