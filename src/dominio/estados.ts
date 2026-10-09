// Estados de una solicitud:
//   Recibida → Agendada → Entrega en revisión (una o más rondas) → Entrega definitiva
//   Recibida → Agendada → Entrega definitiva (productos que no necesitan revisión)
//
// Solo el equipo de Comunicaciones cambia los estados. La IA nunca los decide.
// Todo correo de entrega lleva el botón «Apruebo». La aprobación del solicitante marca el
// éxito de la orden de producción: queda registrada, cierra la solicitud y no genera otro correo.
// El solicitante no visa entregables: el clic de «Enviar» del equipo es el visado.

export const ESTADOS = ["Recibida", "Agendada", "Entrega en revisión", "Entrega definitiva"] as const;
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
  /** Un integrante de Comunicaciones revisó el correo de entrega y presionó «Enviar». */
  envioConfirmadoPorEquipo?: boolean;
}

export type ResultadoDeTransicion =
  | { permitido: true }
  | { permitido: false; motivo: string };

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

const TRANSICIONES: Record<Estado, readonly Estado[]> = {
  Recibida: ["Agendada"],
  Agendada: ["Entrega en revisión", "Entrega definitiva"],
  // Repetir «Entrega en revisión» corresponde a una nueva ronda de entrega.
  "Entrega en revisión": ["Entrega en revisión", "Entrega definitiva"],
  "Entrega definitiva": [],
};

const ESTADOS_DE_ENTREGA: readonly Estado[] = ["Entrega en revisión", "Entrega definitiva"];

export function puedeCambiarEstado(
  actual: Estado,
  nuevo: Estado,
  rol: Rol,
  datos: DatosDeTransicion = {},
): ResultadoDeTransicion {
  if (rol === "solicitante") {
    return { permitido: false, motivo: "Solo el equipo de Comunicaciones cambia el estado." };
  }
  if (!TRANSICIONES[actual].includes(nuevo)) {
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

  if (ESTADOS_DE_ENTREGA.includes(nuevo)) {
    if (!datos.entregables || datos.entregables.length === 0) {
      return { permitido: false, motivo: "No hay entregables: no se envía un correo de entrega vacío." };
    }
    if (!datos.envioConfirmadoPorEquipo) {
      return { permitido: false, motivo: "El correo de entrega lo envía un integrante del equipo." };
    }
  }

  return { permitido: true };
}

export type ResultadoDeAprobacion =
  | { permitido: true; nuevoEstado: Estado }
  | { permitido: false; motivo: string };

/** El solicitante aprueba desde el botón «Apruebo» de cualquier correo de entrega. */
export function aprobarEntrega(actual: Estado, yaAprobada: boolean): ResultadoDeAprobacion {
  if (yaAprobada) return { permitido: false, motivo: "Esta entrega ya fue aprobada." };
  if (!ESTADOS_DE_ENTREGA.includes(actual)) {
    return { permitido: false, motivo: "Todavía no hay una entrega para aprobar." };
  }
  return { permitido: true, nuevoEstado: "Entrega definitiva" };
}
