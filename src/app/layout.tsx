import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solicitudes Comunicacionales FCV",
  description: "Cuéntale al equipo de Comunicaciones de Fundación Cristo Vive qué necesitas comunicar.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // En el celular, la pantalla se ajusta cuando aparece el teclado.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL">
      <body>{children}</body>
    </html>
  );
}
