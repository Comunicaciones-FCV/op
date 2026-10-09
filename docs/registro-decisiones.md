# Solicitudes Comunicacionales FCV — Registro de decisiones y pendientes

Última actualización: 2026-10-09

Este documento separa lo **acordado**, lo **verificado**, lo **pendiente** y las **recomendaciones**. Una recomendación no es un acuerdo hasta que José la apruebe.

---

## 1. Decisiones confirmadas (traspaso del chat anterior)

- La aplicación se construye **desde cero**. No se depende del código del prototipo anterior.
- Dos funciones: (1) agente conversacional de recepción para trabajadores; (2) asistente interno para el equipo de Comunicaciones.
- Monday = plataforma operativa interna. Gmail = envío de correos del proceso.
- El solicitante entra por enlace; **no** necesita cuenta de ChatGPT ni de Monday.
- El trabajador cuenta qué necesita comunicar; **no** elige producto. Si expresa preferencia, se conserva como preferencia, no como decisión.
- El agente debe usar IA real, adaptar preguntas, no inventar datos, no prometer fechas ni prioridades.
- Micrófono **solo transcribe**; el texto se revisa antes de enviarse; no hay envío automático al terminar de grabar. Botón con icono de micrófono.
- Cierre obligatorio: «¿Alguna información más antes de enviar la solicitud?» (Sí / No).
  Flujo: conversación → información adicional → vista previa → correcciones → confirmación explícita → envío.
- Áreas (grupos en Monday, sin anteponer «Área»): Calle, Oficios, Salud, Educación, Discapacidad, Adicciones, Deportes, Administración Central.
- Estados principales vigentes: **Recibida / Agendada / Entregada**. Los cambia el equipo, no la IA.
- Correos: recepción (inmediato), Agendada (solo con rango estimado completado), entrega final (con confirmación manual de entregables).
- Corte de pauta: jueves 18:00 (America/Santiago) → pauta del viernes siguiente; después del corte → pauta de la semana siguiente. Pauta ≠ promesa de entrega.
- Trazabilidad: fecha de llegada, fecha de revisión en pauta, rango estimado (Comunicaciones), fecha de entrega real, y fecha requerida por el solicitante (separada).
- Una solicitud puede tener varios productos (propuesta anterior: subelementos).
- Asistente interno: sugiere 1 producto principal + hasta 2 complementarios; el equipo acepta, modifica o descarta.
- Roles a separar: Solicitante / Equipo de Comunicaciones / Administrador.
- Identidad: logos FCV oficiales sin deformar, tipografía Neuwelt, colores azul, blanco y amarillo (sin hex confirmados).
- Interfaz: menú móvil con × y cierre al tocar fuera; buen uso de la altura; todo lo que parezca interactivo debe funcionar.

## 2. Verificado en esta sesión (2026-10-09)

| Recurso | Resultado |
|---|---|
| Repositorio `comunicaciones-fcv/op` | Accesible. Vacío (sin commits). |
| Tablero Monday 18432590576 | Existe, activo, en «Depto Comunicaciones». **0 elementos.** 8 grupos con los nombres acordados. |
| Columnas del tablero | Ver sección 3 (hay diferencias con lo acordado). |
| Subelementos en el tablero | **No hay columna de subelementos configurada.** La estructura de productos no está implementada. |
| Columna de área | **No existe**; el área solo está representada por el grupo. |
| Prototipo anterior (chatgpt.site) | **No accesible** desde este entorno (bloqueado por la red). No verificado. |
| Gmail | **No hay conector de Gmail** disponible en esta sesión. Nada verificado. |
| Google Drive | Accesible. Se encontraron logos FCV (p. ej. `fcv-logo-horizontal-color-fondo-transparente.png`) y la carpeta «FF Neuwelt» con archivos .ttf. Aún no descargados ni cargados en la app. |
| Cuenta Monday | Plan Pro, 9 miembros activos. |

## 3. Diferencias detectadas en el tablero Monday (requieren decisión)

- Columna **Estado** tiene 4 etiquetas: Recibida, Agendada, **Primera entrega**, **Entrega definitiva**. Lo acordado es Recibida / Agendada / Entregada.
- Existe columna **Aprobación final** (Pendiente / Aprobada) descrita como «se marca cuando la persona solicitante pulsa "Apruebo entrega definitiva"». Ese flujo de aprobación del solicitante **no está** entre las decisiones del traspaso.
- Columnas existentes útiles: Correo del solicitante, Nombre del solicitante, Fecha de llegada (automática), Entrega estimada (rango), Fecha de revisión, Fecha de entrega real, Responsable, Servicio / subárea, Resumen de la solicitud, Fecha de actividad, Archivos y antecedentes, Productos definidos, Enlaces de entrega, Archivos de entrega.
- Faltan columnas para: fecha requerida por el solicitante, horario, lugar, objetivo, público, preferencia de producto, ID de la solicitud en la app (para evitar duplicados).

No se ha modificado nada en Monday.

## 4. Decisiones tomadas en este chat

- 2026-10-09 — Uso esperado: bajo, interno de la Fundación (no masivo).
- 2026-10-09 — Solo el equipo de Comunicaciones tiene acceso a Claude. Los trabajadores solicitantes no tienen cuenta de Claude.
  → Consecuencia: el **agente de recepción** no puede vivir dentro de Claude; debe ser una aplicación propia con conexión a un servicio de IA mediante API (cuenta de prepago con límite de gasto).
- 2026-10-09 — La cuenta de IA se resuelve más adelante, cuando sea necesaria. Mientras tanto se construye sin IA conectada (sin simular un agente).
- 2026-10-09 — **Obligatorios para enviar:** nombre, correo, área, título y «qué necesita comunicar». El resto puede quedar pendiente o no aplicar. Si aparecen otros obligatorios, se conversan.

- 2026-10-09 — Todos los trabajadores tienen correo institucional de Google (@fundacioncristovive.cl).
  → Se ingresa con la cuenta de Google de la Fundación (solo ese dominio). Nombre y correo vienen verificados del ingreso; el agente no los pregunta.
  → Requiere que quien administra el Google de la Fundación autorice la aplicación (pendiente: identificar a esa persona).

- 2026-10-09 — **Sin pantalla «Mis solicitudes».** El solicitante se informa del avance solo por los correos (Recibida, Agendada, Entregada).

- 2026-10-09 — Mensaje de bienvenida del agente aprobado (ver `docs/agente-recepcion.md`).
- 2026-10-09 — La pauta de corresponsales («NOTICIA EN …») orienta al agente cuando se cuenta una actividad realizada. Se agrega el campo opcional **Cuña** (texto, nombre, rol), siempre aportado por la persona.

- 2026-10-09 — **Fotos y archivos se suben directo en el chat.** Al confirmar, se envían a la columna «Archivos y antecedentes» de Monday. Mientras la solicitud es borrador, la app los guarda temporalmente. Los enlaces (p. ej. Drive) siguen siendo aceptados como antecedente.
  → Pendiente: límites de tamaño y cantidad; dónde se guardan temporalmente (depende del alojamiento).

- 2026-10-09 — **Se mantiene la aprobación del solicitante.** Marca el éxito de la orden de producción (columna «Aprobación final» de Monday: Pendiente / Aprobada).
  → Pendiente: si existe una primera versión para comentarios antes de la entrega definitiva (define si son 3 o 4 estados).

## Recursos de marca verificados

- Logo horizontal a color (`public/marca/fcv-logo-horizontal-color-fondo-transparente.png`, 1000×292, descargado de Drive el 2026-10-09). Muestra panes y peces (no corazones); los corazones 💙🤍💛 aparecen en la firma de WhatsApp.
- Colores medidos en ese archivo (no son códigos oficiales confirmados): azul #0F5697, azul oscuro #133C68, amarillo #FAB23F, celeste #8FB7E1.
- Tipografía Neuwelt: carpeta «FF Neuwelt» en Drive (archivos .ttf). Aún no descargada.

## 5. Recomendaciones aún no aprobadas

- Asistente interno de Comunicaciones dentro de Claude (página publicada que consulta a Claude y lee Monday con las credenciales de cada integrante), para no sumar costo de API. Pendiente de confirmar cómo se descuenta el uso y de aprobación de José.

## 6. Pendientes técnicos (sin decidir)

Proveedor y cuenta de IA · presupuesto · hosting · base de datos · framework · proveedor de transcripción · almacenamiento de archivos · mecanismo de sincronización con Monday · acceso a Gmail · autenticación · política de acceso a solicitudes · retención de datos · feriados/excepciones de pauta · lógica de entregas parciales · catálogo de subáreas · integrantes del equipo y permisos · códigos de color.
