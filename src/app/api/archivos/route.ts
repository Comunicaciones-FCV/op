import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { CARPETA_ARCHIVOS } from "@/servidor/almacen";
import { LIMITE_BYTES_POR_ARCHIVO, tipoPermitido } from "@/dominio/archivos";

// Guarda temporalmente un archivo subido en el chat mientras la solicitud es borrador.
export async function POST(req: Request) {
  const formulario = await req.formData().catch(() => null);
  const archivo = formulario?.get("archivo");
  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: "sin_archivo" }, { status: 400 });
  }
  if (!tipoPermitido(archivo.type)) {
    return NextResponse.json({ error: "tipo_no_permitido" }, { status: 415 });
  }
  if (archivo.size > LIMITE_BYTES_POR_ARCHIVO) {
    return NextResponse.json({ error: "archivo_muy_grande" }, { status: 413 });
  }

  const id = randomUUID();
  await mkdir(CARPETA_ARCHIVOS, { recursive: true });
  await writeFile(path.join(CARPETA_ARCHIVOS, id), Buffer.from(await archivo.arrayBuffer()));
  await writeFile(
    path.join(CARPETA_ARCHIVOS, `${id}.json`),
    JSON.stringify({ nombre: archivo.name, tipoMime: archivo.type }),
  );

  return NextResponse.json(
    { id, nombre: archivo.name, tipoMime: archivo.type, url: `/api/archivos/${id}` },
    { status: 201 },
  );
}
