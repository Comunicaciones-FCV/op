import { NextResponse } from "next/server";
import { z } from "zod";
import { viernesDePauta } from "@/dominio/pauta";
import { borradorDeSolicitud, faltantesParaEnviar } from "@/dominio/solicitud";
import { registrarSolicitud } from "@/servidor/almacen";

const cuerpo = z.object({
  claveIdempotencia: z.string().uuid(),
  borrador: borradorDeSolicitud,
});

export async function POST(req: Request) {
  const datos = cuerpo.safeParse(await req.json().catch(() => null));
  if (!datos.success) {
    return NextResponse.json({ error: "datos_invalidos", detalle: datos.error.issues }, { status: 400 });
  }

  // La validación se repite en el servidor: no basta con desactivar el botón en la pantalla.
  const faltantes = faltantesParaEnviar(datos.data.borrador);
  if (faltantes.length > 0) {
    return NextResponse.json({ error: "faltan_datos", faltantes }, { status: 422 });
  }

  const ahora = new Date();
  const { solicitud, yaExistia } = await registrarSolicitud(
    datos.data.claveIdempotencia,
    datos.data.borrador,
    viernesDePauta(ahora),
    ahora,
  );

  return NextResponse.json(
    {
      numero: solicitud.numero,
      viernesDePauta: solicitud.viernesDePauta,
      yaExistia,
      integraciones: { monday: "no_habilitada", correo: "no_habilitado" },
    },
    { status: yaExistia ? 200 : 201 },
  );
}
