# Solicitudes Comunicacionales FCV

Aplicación para recibir y gestionar las solicitudes al equipo de Comunicaciones de Fundación Cristo Vive.

- Decisiones y pendientes: `docs/registro-decisiones.md`
- Propuesta de arquitectura: `docs/propuesta-arquitectura.md`
- Instrucciones del agente de recepción: `docs/agente-recepcion.md`

## Estado actual: prototipo

| Parte | Estado |
|---|---|
| Recorrido del solicitante (conversación, cierre, vista previa, corrección, confirmación, resultado) | Implementado y probado en navegador |
| Regla de pauta (jueves 18:00, hora de Chile), estados y validaciones | Implementado y probado |
| Subida de fotos y PDF | Implementado (almacenamiento local de prueba) |
| Micrófono (dictado del navegador) | Implementado; falta probar en dispositivos reales |
| IA del agente | **No conectada** (falta la cuenta del servicio de IA) |
| Ingreso con Google | **No habilitado** (falta autorización de Google de la Fundación) |
| Monday y Gmail | **No conectados** |

## Ejecutar en local

```bash
npm install
npm run build && npm run start -- -p 3100
```

La tipografía Neuwelt tiene licencia y no está en este repositorio público: copiar `Neuwelt-Regular.ttf` y `Neuwelt-Bold.ttf` desde la carpeta «FF Neuwelt» de Drive a `public/fuentes/`. Sin ellas, se usa la fuente del sistema.

## Pruebas

```bash
npm test                                   # reglas (pauta, estados, ficha)
node pruebas/recorrido.mjs http://localhost:3100   # recorrido completo en Chromium (escritorio y celular)
```
