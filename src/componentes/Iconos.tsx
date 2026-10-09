// Iconos simples en línea (sin dependencias externas).
const base = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const IconoMenu = () => (
  <svg {...base}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
export const IconoCerrar = () => (
  <svg {...base}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const IconoMicrofono = () => (
  <svg {...base}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
  </svg>
);
export const IconoEnviar = () => (
  <svg {...base}><path d="M4 12l16-8-6 16-2-6-8-2z" /></svg>
);
export const IconoAdjuntar = () => (
  <svg {...base}><path d="M20 12l-7.5 7.5a5 5 0 0 1-7-7L13 5a3.5 3.5 0 0 1 5 5l-7.5 7.5a2 2 0 0 1-3-3L14 8" /></svg>
);
