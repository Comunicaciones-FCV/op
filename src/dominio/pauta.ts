// Regla de pauta semanal.
//
// Corte: jueves a las 18:00, hora de Chile (America/Santiago).
// Lo confirmado hasta el corte (inclusive) entra a la pauta del viernes inmediatamente siguiente.
// Lo confirmado después del corte pasa a la pauta del viernes de la semana siguiente.
//
// La hora del servidor no influye: todo se calcula con el calendario de America/Santiago.
// Incorporarse a una pauta NO es una promesa de entrega.
// No hay reglas para feriados ni suspensiones de pauta (pendiente de definir).

export const ZONA_HORARIA = "America/Santiago";
const JUEVES = 4;
const HORA_CORTE = 18;

interface FechaHoraLocal {
  anio: number;
  mes: number; // 1-12
  dia: number;
  diaSemana: number; // 0 = domingo … 6 = sábado
  segundosDelDia: number;
}

const formateador = new Intl.DateTimeFormat("en-US", {
  timeZone: ZONA_HORARIA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  weekday: "short",
});

const DIAS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function fechaHoraEnChile(instante: Date): FechaHoraLocal {
  const partes = Object.fromEntries(
    formateador.formatToParts(instante).map((p) => [p.type, p.value]),
  );
  return {
    anio: Number(partes.year),
    mes: Number(partes.month),
    dia: Number(partes.day),
    diaSemana: DIAS[partes.weekday as string] ?? NaN,
    segundosDelDia:
      Number(partes.hour) * 3600 + Number(partes.minute) * 60 + Number(partes.second),
  };
}

/** Devuelve la fecha (AAAA-MM-DD, calendario de Chile) del viernes de pauta que corresponde. */
export function viernesDePauta(confirmadaEn: Date): string {
  const local = fechaHoraEnChile(confirmadaEn);
  const corteEnSegundos = HORA_CORTE * 3600;
  // Instantes con fracción de segundo después de las 18:00:00 ya pasaron el corte.
  const pasadoElCorte =
    local.segundosDelDia > corteEnSegundos ||
    (local.segundosDelDia === corteEnSegundos && confirmadaEn.getUTCMilliseconds() > 0);

  let diasHastaJueves = (JUEVES - local.diaSemana + 7) % 7;
  if (diasHastaJueves === 0 && pasadoElCorte) diasHastaJueves = 7;

  // Aritmética sobre fechas de calendario (no sobre instantes) para evitar efectos del horario de verano.
  const viernes = new Date(Date.UTC(local.anio, local.mes - 1, local.dia + diasHastaJueves + 1));
  return viernes.toISOString().slice(0, 10);
}
