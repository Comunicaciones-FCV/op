// Límites provisorios para archivos subidos en el chat (pendientes de confirmar con José).
export const LIMITE_BYTES_POR_ARCHIVO = 15 * 1024 * 1024;
export const MAXIMO_DE_ARCHIVOS = 10;

const TIPOS = [/^image\/(jpeg|png|webp|heic|heif|gif)$/, /^application\/pdf$/];

export function tipoPermitido(tipoMime: string): boolean {
  return TIPOS.some((t) => t.test(tipoMime));
}
