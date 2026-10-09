// Estructura de una solicitud comunicacional.
//
// Cada campo de contenido distingue explícitamente entre:
//   - "informado": la persona entregó el dato (se guarda tal cual lo dijo, o como lo corrigió).
//   - "pendiente": el dato corresponde, pero aún no se conoce.
//   - "no_aplica": el dato no corresponde a este caso (p. ej. lugar, si no hay actividad).
// Un campo ausente significa que la conversación todavía no lo abordó.
// Así la IA no necesita rellenar vacíos y la vista previa muestra qué es hecho y qué falta.

import { z } from "zod";
import { AREAS } from "./areas";

export const valorDeCampo = z.discriminatedUnion("estado", [
  z.object({ estado: z.literal("informado"), valor: z.string().trim().min(1) }),
  z.object({ estado: z.literal("pendiente"), nota: z.string().optional() }),
  z.object({ estado: z.literal("no_aplica") }),
]);
export type ValorDeCampo = z.infer<typeof valorDeCampo>;

export const adjunto = z.object({
  tipo: z.enum(["archivo", "enlace"]),
  nombre: z.string(),
  url: z.string().url(),
});

// Clasificación aprobada por José el 2026-10-09:
//   identificación  → se exige para enviar.
//   comprensión     → «qué comunicar» se exige; objetivo y público pueden quedar pendientes.
//   condicional     → solo si hay una actividad (fecha, horario, lugar).
//   complementario  → opcional.
//   Comunicaciones  → no lo completa el solicitante (productos, rango estimado, etc.).
export const borradorDeSolicitud = z.object({
  // Identificación
  nombreSolicitante: z.string().trim().optional(),
  correoSolicitante: z.string().trim().optional(),
  area: z.enum(AREAS).optional(),
  subarea: valorDeCampo.optional(),

  // Comprensión del encargo (título y resumen los organiza la IA y el solicitante los corrige)
  titulo: z.string().trim().optional(),
  queComunicar: valorDeCampo.optional(),
  objetivo: valorDeCampo.optional(),
  publico: valorDeCampo.optional(),

  // Condicionales a una actividad
  fechaActividad: valorDeCampo.optional(),
  horario: valorDeCampo.optional(),
  lugar: valorDeCampo.optional(),

  // Complementarios
  antecedentes: valorDeCampo.optional(),
  contacto: valorDeCampo.optional(),
  adjuntos: z.array(adjunto).default([]),
  // Cuña: frase textual de alguien del equipo, con nombre y rol (pauta de corresponsales).
  // La entrega la persona; la IA nunca la redacta.
  cuna: z
    .object({
      texto: z.string().trim().min(1),
      nombre: z.string().trim().optional(),
      rol: z.string().trim().optional(),
    })
    .optional(),
  // Fecha en que el solicitante necesita disponer de la comunicación o los materiales.
  // Es distinta de la fecha de la actividad y de la estimación que define Comunicaciones.
  fechaRequerida: valorDeCampo.optional(),
  // Preferencia de producto expresada por el solicitante: se conserva, no es una decisión.
  preferenciaDeProducto: valorDeCampo.optional(),
  informacionAdicional: valorDeCampo.optional(),
});
export type BorradorDeSolicitud = z.infer<typeof borradorDeSolicitud>;

export interface Faltante {
  campo: keyof BorradorDeSolicitud;
  motivo: string;
}

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Lista lo que impide enviar la solicitud. Una lista vacía significa que se puede pedir confirmación. */
export function faltantesParaEnviar(b: BorradorDeSolicitud): Faltante[] {
  const faltantes: Faltante[] = [];
  if (!b.nombreSolicitante) faltantes.push({ campo: "nombreSolicitante", motivo: "Falta el nombre." });
  if (!b.correoSolicitante) {
    faltantes.push({ campo: "correoSolicitante", motivo: "Falta el correo." });
  } else if (!CORREO.test(b.correoSolicitante)) {
    faltantes.push({ campo: "correoSolicitante", motivo: "El correo no parece válido." });
  }
  if (!b.area) faltantes.push({ campo: "area", motivo: "Falta el área." });
  if (!b.titulo) faltantes.push({ campo: "titulo", motivo: "Falta el título de la solicitud." });
  if (b.queComunicar?.estado !== "informado") {
    faltantes.push({ campo: "queComunicar", motivo: "Falta saber qué se necesita comunicar." });
  }
  return faltantes;
}
