import { describe, expect, it } from "vitest";
import { puedeCambiarEstado } from "./estados";
import { borradorDeSolicitud, faltantesParaEnviar } from "./solicitud";

describe("faltantesParaEnviar", () => {
  it("borrador vacío: exige identificación, título y qué comunicar", () => {
    const campos = faltantesParaEnviar(borradorDeSolicitud.parse({})).map((f) => f.campo);
    expect(campos).toEqual(["nombreSolicitante", "correoSolicitante", "area", "titulo", "queComunicar"]);
  });

  it("objetivo, público y lugar pueden quedar pendientes o no aplicar", () => {
    const b = borradorDeSolicitud.parse({
      nombreSolicitante: "Persona de prueba",
      correoSolicitante: "prueba@ejemplo.cl",
      area: "Deportes",
      titulo: "[PRUEBA] Caso ficticio",
      queComunicar: { estado: "informado", valor: "Caso ficticio de prueba" },
      objetivo: { estado: "pendiente" },
      lugar: { estado: "no_aplica" },
    });
    expect(faltantesParaEnviar(b)).toEqual([]);
  });

  it("«qué comunicar» marcado como pendiente no basta para enviar", () => {
    const b = borradorDeSolicitud.parse({
      nombreSolicitante: "Persona de prueba",
      correoSolicitante: "prueba@ejemplo.cl",
      area: "Deportes",
      titulo: "[PRUEBA]",
      queComunicar: { estado: "pendiente" },
    });
    expect(faltantesParaEnviar(b).map((f) => f.campo)).toEqual(["queComunicar"]);
  });

  it("rechaza áreas que no están en la lista", () => {
    expect(borradorDeSolicitud.safeParse({ area: "Área Deportes" }).success).toBe(false);
  });
});

describe("puedeCambiarEstado", () => {
  it("el solicitante no cambia estados", () => {
    expect(puedeCambiarEstado("Recibida", "Agendada", "solicitante").permitido).toBe(false);
  });

  it("Agendada exige rango estimado completo", () => {
    expect(puedeCambiarEstado("Recibida", "Agendada", "comunicaciones").permitido).toBe(false);
    expect(
      puedeCambiarEstado("Recibida", "Agendada", "comunicaciones", {
        rangoEstimado: { desde: "2026-10-20", hasta: "2026-10-27" },
      }).permitido,
    ).toBe(true);
  });

  it("rechaza un rango invertido", () => {
    expect(
      puedeCambiarEstado("Recibida", "Agendada", "comunicaciones", {
        rangoEstimado: { desde: "2026-10-27", hasta: "2026-10-20" },
      }).permitido,
    ).toBe(false);
  });

  it("no se salta estados", () => {
    expect(puedeCambiarEstado("Recibida", "Entregada", "comunicaciones").permitido).toBe(false);
  });

  it("Entregada exige entregables y confirmación manual", () => {
    const entregables = [{ tipo: "enlace" as const, descripcion: "Nota web", url: "https://ejemplo.cl" }];
    expect(puedeCambiarEstado("Agendada", "Entregada", "comunicaciones", {}).permitido).toBe(false);
    expect(
      puedeCambiarEstado("Agendada", "Entregada", "comunicaciones", { entregables }).permitido,
    ).toBe(false);
    expect(
      puedeCambiarEstado("Agendada", "Entregada", "comunicaciones", {
        entregables,
        entregablesConfirmados: true,
      }).permitido,
    ).toBe(true);
  });
});
