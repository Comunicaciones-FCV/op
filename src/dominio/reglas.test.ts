import { describe, expect, it } from "vitest";
import { aprobarEntrega, puedeCambiarEstado } from "./estados";
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

const entregables = [{ tipo: "enlace" as const, descripcion: "Nota web", url: "https://ejemplo.cl" }];
const envio = { entregables, envioConfirmadoPorEquipo: true };

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

  it("no se entrega sin haber agendado", () => {
    expect(puedeCambiarEstado("Recibida", "Entrega definitiva", "comunicaciones", envio).permitido).toBe(false);
  });

  it("producto sin revisión: de Agendada directo a Entrega definitiva", () => {
    expect(puedeCambiarEstado("Agendada", "Entrega definitiva", "comunicaciones", envio).permitido).toBe(true);
  });

  it("permite varias rondas de entrega en revisión", () => {
    expect(puedeCambiarEstado("Agendada", "Entrega en revisión", "comunicaciones", envio).permitido).toBe(true);
    expect(
      puedeCambiarEstado("Entrega en revisión", "Entrega en revisión", "comunicaciones", envio).permitido,
    ).toBe(true);
    expect(
      puedeCambiarEstado("Entrega en revisión", "Entrega definitiva", "comunicaciones", envio).permitido,
    ).toBe(true);
  });

  it("toda entrega exige entregables y el envío de un integrante del equipo", () => {
    expect(puedeCambiarEstado("Agendada", "Entrega en revisión", "comunicaciones", {}).permitido).toBe(false);
    expect(
      puedeCambiarEstado("Agendada", "Entrega en revisión", "comunicaciones", { entregables }).permitido,
    ).toBe(false);
  });

  it("la Entrega definitiva es el final", () => {
    expect(
      puedeCambiarEstado("Entrega definitiva", "Entrega en revisión", "comunicaciones", envio).permitido,
    ).toBe(false);
  });
});

describe("aprobarEntrega", () => {
  it("aprobar en una entrega en revisión cierra como Entrega definitiva", () => {
    expect(aprobarEntrega("Entrega en revisión", false)).toEqual({
      permitido: true,
      nuevoEstado: "Entrega definitiva",
    });
  });

  it("se puede aprobar la Entrega definitiva", () => {
    expect(aprobarEntrega("Entrega definitiva", false).permitido).toBe(true);
  });

  it("no hay nada que aprobar antes de una entrega", () => {
    expect(aprobarEntrega("Agendada", false).permitido).toBe(false);
  });

  it("no se aprueba dos veces", () => {
    expect(aprobarEntrega("Entrega definitiva", true).permitido).toBe(false);
  });
});
