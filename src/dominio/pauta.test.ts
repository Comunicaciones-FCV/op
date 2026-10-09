import { describe, expect, it } from "vitest";
import { viernesDePauta } from "./pauta";

// Octubre 2026: Chile en horario de verano (UTC-3).
// Jueves 15-10-2026 18:00 en Chile = 21:00 UTC.
describe("viernesDePauta", () => {
  it("lunes antes del corte → viernes de esa semana", () => {
    expect(viernesDePauta(new Date("2026-10-12T13:00:00Z"))).toBe("2026-10-16");
  });

  it("jueves 17:59 → viernes siguiente", () => {
    expect(viernesDePauta(new Date("2026-10-15T20:59:00Z"))).toBe("2026-10-16");
  });

  it("jueves 18:00 en punto todavía entra (hasta el corte, inclusive)", () => {
    expect(viernesDePauta(new Date("2026-10-15T21:00:00Z"))).toBe("2026-10-16");
  });

  it("jueves 18:01 → pauta de la semana siguiente", () => {
    expect(viernesDePauta(new Date("2026-10-15T21:01:00Z"))).toBe("2026-10-23");
  });

  it("viernes en la mañana → viernes de la semana siguiente", () => {
    expect(viernesDePauta(new Date("2026-10-16T12:00:00Z"))).toBe("2026-10-23");
  });

  it("domingo → viernes de la semana que comienza", () => {
    expect(viernesDePauta(new Date("2026-10-18T15:00:00Z"))).toBe("2026-10-23");
  });

  it("usa la hora de Chile y no la UTC: jueves 22:30 UTC aún es jueves 19:30 en Chile", () => {
    expect(viernesDePauta(new Date("2026-10-15T22:30:00Z"))).toBe("2026-10-23");
  });

  it("miércoles 23:30 en Chile ya es jueves en UTC, pero sigue antes del corte", () => {
    expect(viernesDePauta(new Date("2026-10-15T02:30:00Z"))).toBe("2026-10-16");
  });

  it("invierno (UTC-4): jueves 18:00 en Chile = 22:00 UTC", () => {
    expect(viernesDePauta(new Date("2026-06-11T22:00:00Z"))).toBe("2026-06-12");
    expect(viernesDePauta(new Date("2026-06-11T22:00:01Z"))).toBe("2026-06-19");
  });

  it("cambio de mes", () => {
    expect(viernesDePauta(new Date("2026-10-29T22:00:00Z"))).toBe("2026-11-06");
  });
});
