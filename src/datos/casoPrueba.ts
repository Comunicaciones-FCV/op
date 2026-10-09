import type { BorradorDeSolicitud } from "@/dominio/solicitud";

// Caso FICTICIO para probar la vista previa mientras la IA no está conectada.
// Autorizado: ejemplo de Deportes identificado como prueba. No representa una solicitud real.
export const CASO_DE_PRUEBA: Partial<BorradorDeSolicitud> = {
  area: "Deportes",
  titulo: "[PRUEBA] Torneo ficticio de baby fútbol",
  queComunicar: {
    estado: "informado",
    valor: "[PRUEBA] Caso ficticio: se realizó un torneo de baby fútbol entre equipos de niños y niñas.",
  },
  objetivo: { estado: "informado", valor: "[PRUEBA] Dar a conocer la actividad y agradecer a quienes participaron." },
  publico: { estado: "pendiente", nota: "La persona no lo tenía claro." },
  fechaActividad: { estado: "informado", valor: "[PRUEBA] Sábado 3 de octubre" },
  horario: { estado: "no_aplica" },
  lugar: { estado: "informado", valor: "[PRUEBA] Cancha ficticia" },
  cuna: undefined,
  fechaRequerida: { estado: "pendiente" },
  preferenciaDeProducto: { estado: "informado", valor: "[PRUEBA] Le gustaría un reel." },
};
