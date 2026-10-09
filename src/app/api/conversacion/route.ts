import { NextResponse } from "next/server";

// Punto de conexión del agente de recepción.
// La IA todavía no está conectada (falta la cuenta del servicio de IA). Esta ruta lo dice
// explícitamente: no hay respuestas automáticas que aparenten ser un agente.
export async function POST() {
  return NextResponse.json(
    {
      error: "ia_no_conectada",
      mensaje: "La IA todavía no está conectada a la aplicación.",
    },
    { status: 503 },
  );
}
