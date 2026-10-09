// Áreas de Fundación Cristo Vive acordadas para la recepción de solicitudes.
// Los nombres coinciden con los grupos del tablero de Monday (sin anteponer «Área»).
export const AREAS = [
  "Calle",
  "Oficios",
  "Salud",
  "Educación",
  "Discapacidad",
  "Adicciones",
  "Deportes",
  "Administración Central",
] as const;

export type Area = (typeof AREAS)[number];

export function esArea(valor: string): valor is Area {
  return (AREAS as readonly string[]).includes(valor);
}
