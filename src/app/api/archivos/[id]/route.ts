import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { CARPETA_ARCHIVOS } from "@/servidor/almacen";

const ID = /^[0-9a-f-]{36}$/;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID.test(id)) return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
  try {
    const meta = JSON.parse(await readFile(path.join(CARPETA_ARCHIVOS, `${id}.json`), "utf8"));
    const contenido = await readFile(path.join(CARPETA_ARCHIVOS, id));
    return new NextResponse(contenido, {
      headers: {
        "Content-Type": meta.tipoMime,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(meta.nombre)}`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
  }
}
