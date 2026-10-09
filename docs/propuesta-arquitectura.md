# Propuesta de funcionamiento y arquitectura

Estado: **propuesta, no aprobada**. Separa lo acordado de mis recomendaciones.

## 1. Piezas de la aplicación

```
 Trabajador (navegador, sin cuenta)
        │  enlace
        ▼
 ┌──────────────────────────────┐
 │  Aplicación web FCV          │
 │  · Chat de recepción         │──► Servicio de IA (pendiente: cuenta de prepago)
 │  · Vista previa y corrección │
 │  · Confirmación y envío      │
 └──────────────┬───────────────┘
                │ servidor (las claves nunca llegan al navegador)
        ┌───────┴───────────┬───────────────────┐
        ▼                   ▼                   ▼
   Base de datos        Monday              Gmail
   de la aplicación     (tablero del        (correos de
   (conversaciones,     equipo: estados,    Recibida, Agendada
   borradores, envíos   productos, fechas)  y Entregada)
   pendientes)
```

## 2. Qué guarda cada lugar (para no tener dos fuentes contradictorias)

| Dato | Dónde vive | Motivo |
|---|---|---|
| Conversación con el agente | Base de datos de la app | Monday no es para chats; permite retomar y auditar. |
| Borrador de la solicitud | Base de datos de la app | Un borrador no debe aparecer en el tablero del equipo. |
| Solicitud confirmada | **Monday** (y copia de respaldo en la app) | Monday es la plataforma operativa del equipo. |
| Estado (Recibida / Agendada / Entregada) | **Solo Monday** | El equipo lo cambia ahí. La app lo lee, nunca lo decide. |
| Productos, responsables, entregables | **Monday** | Trabajo interno del equipo. |
| Envíos pendientes a Monday o Gmail | Base de datos de la app | Si Monday o Gmail fallan, la solicitud no se pierde y se reintenta. |

## 3. Cómo se evita duplicar o perder solicitudes

- Al confirmar, el navegador envía un **código único** de la solicitud. Si llega dos veces (doble clic, reintento), el servidor reconoce el código y no crea otra.
- La solicitud se guarda primero en la base de datos y queda como «envío pendiente». Luego se crea en Monday. Si falla, la persona ve un mensaje claro y el sistema reintenta; el dato no se pierde.
- El tablero de Monday tendría una columna con ese código para comprobar duplicados.

## 4. Correos

- Los correos se envían desde el servidor, en respuesta a un cambio de estado hecho por el equipo en Monday.
- Mecanismo propuesto: Monday avisa a la app cuando cambia el estado (un *webhook*: un aviso automático de Monday a la app). La app verifica las condiciones (rango completo para Agendada; entregables confirmados para Entregada) antes de enviar.
- Si falta una condición, no se envía y el equipo ve por qué.
- Acceso a Gmail: **pendiente** (requiere autorización de la cuenta de Google de la Fundación).

## 5. IA

- La app tendrá un único «motor de conversación» intercambiable. Mientras no exista la cuenta, la app mostrará claramente que **la IA no está conectada**; no habrá un sustituto con preguntas fijas que aparente ser un agente.
- El agente devolverá, en cada turno, su respuesta y la ficha estructurada actualizada (cada campo como *informado*, *pendiente* o *no aplica*). Así la vista previa refleja lo dicho, sin inventar.

## 6. Recomendaciones técnicas (explicadas)

| Pieza | Recomendación | Por qué | Implicancia |
|---|---|---|---|
| Lenguaje | TypeScript | Un solo lenguaje para pantalla y servidor; detecta errores antes de publicar. | Ya en uso en el código base. |
| Marco web | Next.js | Permite en un mismo proyecto la pantalla y las funciones de servidor que guardan las claves. | Se puede alojar en varios proveedores. |
| Base de datos | Postgres administrado (p. ej. con plan gratuito) | Estándar, confiable, barato para bajo volumen. | **Pendiente**: proveedor. |
| Alojamiento | Por decidir | Depende de costo, cuenta y políticas de la Fundación. | **Pendiente**. |
| Voz | Dictado del navegador (Web Speech API) | Gratis, sin cuenta extra. | Funciona en Chrome, Edge y Safari; **no en Firefox**. El audio lo procesa el proveedor del navegador (Google o Apple). A verificar en dispositivos reales. |

## 7. Ya implementado y probado (sin depender de cuentas)

- `src/dominio/pauta.ts`: regla de corte jueves 18:00 en hora de Chile → viernes de pauta. 10 pruebas, incluidos cambio de horario invierno/verano y diferencia con la hora UTC.
- `src/dominio/estados.ts`: Recibida → Agendada → Entregada; solo Comunicaciones cambia; Agendada exige rango; Entregada exige entregables y confirmación manual.
- `src/dominio/solicitud.ts`: ficha de la solicitud con campos *informado / pendiente / no aplica* y lo mínimo para enviar (clasificación aprobada el 2026-10-09).
