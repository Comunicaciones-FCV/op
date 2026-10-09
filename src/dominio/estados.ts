// Estados principales de una solicitud: Recibida → Agendada → Entregada.
//
// Solo el equipo de Comunicaciones los cambia. La IA nunca declara una solicitud
// Agendada ni Entregada. Cada estado tiene un único correo al solicitante.
// Producción, revisión y correcciones se gestionan en los productos, sin nuevos estados.

export const ESTADOS = ["Recibida", "Agendada", "Entregada"] as const;
export type Estado = (typeof ESTADOS)[number];

export type Rol = "solicitante" | "comunicaciones" | "administrador";

export interface RangoEstimado {
  desde: string; // AAAA-MM-DD
  hasta: string; // AAAA-MM-DD
}

export interface Entregable {
  tipo: "enlace" | "archivo";
  descripcion: string;
  url: string;
}

export interface DatosDeTransicion {
  rangoEstimado?: RangoEstimado;
  entregables?: Entregable[];
  /** El equipo revisó y confirmó manualmente los entregables antes del correo final. */
  entregablesConfirmados?: boolean;
}

export type ResultadoDeTransicion =
  | { permitido: true }
  | { permitido: false; motivo: string };

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export function puedeCambiarEstado(
  actual: Estado,
  nuevo: Estado,
  rol: Rol,
  datos: DatosDeTransicion = {},
): ResultadoDeTransicion {
  if (rol === "solicitante") {
    return { permitido: false, motivo: "Solo el equipo de Comunicaciones cambia el estado." };
  }
  if (ESTADOS.indexOf(nuevo) !== ESTADOS.indexOf(actual) + 1) {
    return { permitido: false, motivo: `No se puede pasar de ${actual} a ${nuevo}.` };
  }

  if (nuevo === "Agendada") {
    const r = datos.rangoEstimado;
    if (!r || !FECHA.test(r.desde) || !FECHA.test(r.hasta)) {
      return { permitido: false, motivo: "Falta completar el rango estimado de entrega." };
    }
    if (r.desde > r.hasta) {
      return { permitido: false, motivo: "El rango estimado termina antes de comenzar." };
    }
  }

  if (nuevo === "Entregada") {
    if (!datos.entregables || datos.entregables.length === 0) {
      return { permitido: false, motivo: "No hay entregables: no se envía un correo final vacío." };
    }
    if (!datos.entregablesConfirmados) {
      return { permitido: false, motivo: "El equipo debe confirmar los entregables antes del envío." };
    }
  }

  return { permitido: true };
}
