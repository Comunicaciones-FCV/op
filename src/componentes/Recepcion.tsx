"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AREAS, type Area } from "@/dominio/areas";
import { LIMITE_BYTES_POR_ARCHIVO, MAXIMO_DE_ARCHIVOS, tipoPermitido } from "@/dominio/archivos";
import { type BorradorDeSolicitud, faltantesParaEnviar } from "@/dominio/solicitud";
import { CASO_DE_PRUEBA } from "@/datos/casoPrueba";
import { Encabezado } from "./Encabezado";
import { IconoAdjuntar, IconoEnviar } from "./Iconos";
import { Microfono } from "./Microfono";
import { VistaPrevia } from "./VistaPrevia";

// Persona ficticia del modo prueba. Con el ingreso de Google, estos datos vendrán verificados.
const PERSONA_DE_PRUEBA = { nombre: "Persona de prueba", correo: "prueba@example.org" };

const PREGUNTA_DE_CIERRE = "¿Alguna información más antes de enviar la solicitud?";

type Rol = "agente" | "persona" | "sistema";
interface Mensaje { rol: Rol; texto: string }
type Fase = "conversacion" | "vista_previa" | "resultado";
interface Resultado { numero: number; viernesDePauta: string }

interface Estado {
  mensajes: Mensaje[];
  borrador: BorradorDeSolicitud;
  fase: Fase;
  // El cierre se oculta tras responder «Sí» hasta que la persona agregue algo nuevo.
  esperandoMasInformacion: boolean;
  claveIdempotencia: string | null;
  resultado: Resultado | null;
}

const CLAVE_ALMACENAMIENTO = "fcv-solicitud-borrador-v1";

function estadoInicial(): Estado {
  return {
    mensajes: [
      {
        rol: "agente",
        texto: `Hola, ${PERSONA_DE_PRUEBA.nombre}. Cuéntame con tus palabras qué necesitas comunicar: una actividad, un logro, un aviso o cualquier otra cosa. No necesitas saber qué tipo de pieza se hará; eso lo define el equipo de Comunicaciones. Puedes escribir o usar el micrófono para dictar.`,
      },
    ],
    borrador: {
      nombreSolicitante: PERSONA_DE_PRUEBA.nombre,
      correoSolicitante: PERSONA_DE_PRUEBA.correo,
      adjuntos: [],
    },
    fase: "conversacion",
    esperandoMasInformacion: false,
    claveIdempotencia: null,
    resultado: null,
  };
}

function formatearViernes(fecha: string): string {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })
    .format(new Date(Date.UTC(a!, m! - 1, d!)));
}

export function Recepcion() {
  const [estado, setEstado] = useState<Estado>(estadoInicial);
  const [cargado, setCargado] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const finConversacion = useRef<HTMLDivElement>(null);
  const campoTexto = useRef<HTMLTextAreaElement>(null);
  const selectorArchivos = useRef<HTMLInputElement>(null);
  const enviandoRef = useRef(false);

  // Recupera el borrador si la persona recarga la página (solo en este navegador).
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);
      if (guardado) setEstado(JSON.parse(guardado) as Estado);
    } catch { /* sin almacenamiento disponible: se parte de cero */ }
    setCargado(true);
  }, []);
  useEffect(() => {
    if (!cargado) return;
    try { localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(estado)); } catch { /* opcional */ }
  }, [estado, cargado]);
  useEffect(() => {
    finConversacion.current?.scrollIntoView({ block: "end" });
  }, [estado.mensajes.length, estado.fase]);

  const faltantes = useMemo(() => faltantesParaEnviar(estado.borrador), [estado.borrador]);
  const mostrarCierre = estado.fase === "conversacion" && faltantes.length === 0 && !estado.esperandoMasInformacion;

  const agregar = (...mensajes: Mensaje[]) => setEstado((e) => ({ ...e, mensajes: [...e.mensajes, ...mensajes] }));
  const avisar = (t: string) => agregar({ rol: "sistema", texto: t });

  async function enviarMensaje() {
    const contenido = texto.trim();
    if (!contenido || enviandoMensaje) return;
    setTexto("");
    setEnviandoMensaje(true);
    setEstado((e) => ({ ...e, esperandoMasInformacion: false, mensajes: [...e.mensajes, { rol: "persona", texto: contenido }] }));
    try {
      const r = await fetch("/api/conversacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensajes: [...estado.mensajes, { rol: "persona", texto: contenido }], borrador: estado.borrador }),
      });
      const datos = await r.json().catch(() => ({}));
      if (r.status === 503 && datos.error === "ia_no_conectada") {
        avisar("Prototipo: la IA todavía no está conectada, así que nadie interpretó este mensaje. Quedó guardado en la conversación.");
      } else if (!r.ok) {
        avisar("No se pudo procesar el mensaje. Quedó guardado; puedes seguir escribiendo.");
      }
    } catch {
      avisar("Sin conexión con el servidor. Tu mensaje quedó guardado en la conversación.");
    } finally {
      setEnviandoMensaje(false);
      campoTexto.current?.focus();
    }
  }

  function elegirArea(area: Area) {
    setEstado((e) => ({
      ...e,
      borrador: { ...e.borrador, area },
      mensajes: [...e.mensajes, { rol: "persona", texto: `Área: ${area}` }],
    }));
  }

  async function subirArchivos(archivos: FileList | null) {
    if (!archivos || archivos.length === 0) return;
    const disponibles = MAXIMO_DE_ARCHIVOS - estado.borrador.adjuntos.length;
    const lista = Array.from(archivos).slice(0, Math.max(0, disponibles));
    if (lista.length < archivos.length) avisar(`Puedes adjuntar hasta ${MAXIMO_DE_ARCHIVOS} archivos por solicitud.`);
    setSubiendo(true);
    for (const archivo of lista) {
      if (!tipoPermitido(archivo.type)) { avisar(`«${archivo.name}» no es una imagen ni un PDF.`); continue; }
      if (archivo.size > LIMITE_BYTES_POR_ARCHIVO) { avisar(`«${archivo.name}» supera los 15 MB.`); continue; }
      const formulario = new FormData();
      formulario.append("archivo", archivo);
      try {
        const r = await fetch("/api/archivos", { method: "POST", body: formulario });
        if (!r.ok) throw new Error();
        const a = await r.json();
        setEstado((e) => ({
          ...e,
          borrador: { ...e.borrador, adjuntos: [...e.borrador.adjuntos, { tipo: "archivo", nombre: a.nombre, url: a.url, id: a.id, tipoMime: a.tipoMime }] },
          mensajes: [...e.mensajes, { rol: "persona", texto: `Adjunté: ${a.nombre}` }],
        }));
      } catch {
        avisar(`No se pudo subir «${archivo.name}». Intenta de nuevo.`);
      }
    }
    setSubiendo(false);
    if (selectorArchivos.current) selectorArchivos.current.value = "";
  }

  function quitarAdjunto(url: string) {
    setEstado((e) => ({ ...e, borrador: { ...e.borrador, adjuntos: e.borrador.adjuntos.filter((a) => a.url !== url) } }));
  }

  function cargarCasoDePrueba() {
    setEstado((e) => ({
      ...e,
      esperandoMasInformacion: false,
      borrador: { ...e.borrador, ...CASO_DE_PRUEBA },
      mensajes: [...e.mensajes, { rol: "sistema", texto: "Se cargó un caso FICTICIO de prueba (Deportes) para revisar la vista previa. No lo generó una IA." }],
    }));
  }

  function responderCierre(hayMas: boolean) {
    if (hayMas) {
      setEstado((e) => ({
        ...e,
        esperandoMasInformacion: true,
        mensajes: [...e.mensajes, { rol: "agente", texto: PREGUNTA_DE_CIERRE }, { rol: "persona", texto: "Sí" }, { rol: "agente", texto: "Cuéntame qué más quieres agregar." }],
      }));
      campoTexto.current?.focus();
    } else {
      setErrorEnvio(null);
      setEstado((e) => ({
        ...e,
        fase: "vista_previa",
        claveIdempotencia: e.claveIdempotencia ?? crypto.randomUUID(),
        mensajes: [...e.mensajes, { rol: "agente", texto: PREGUNTA_DE_CIERRE }, { rol: "persona", texto: "No" }],
      }));
    }
  }

  async function confirmar() {
    // Protección contra doble clic: el botón se desactiva y, además, el servidor reconoce la clave.
    if (enviandoRef.current || !estado.claveIdempotencia) return;
    enviandoRef.current = true;
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const r = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claveIdempotencia: estado.claveIdempotencia, borrador: estado.borrador }),
      });
      const datos = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErrorEnvio(
          r.status === 422 ? "Faltan datos para enviar la solicitud." : "No se pudo enviar. Tu solicitud sigue guardada; intenta de nuevo.",
        );
        return;
      }
      setEstado((e) => ({ ...e, fase: "resultado", resultado: { numero: datos.numero, viernesDePauta: datos.viernesDePauta } }));
    } catch {
      setErrorEnvio("Sin conexión con el servidor. Tu solicitud sigue guardada; intenta de nuevo.");
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  }

  function nuevaSolicitud() {
    if (estado.fase !== "resultado" && estado.mensajes.length > 1 &&
        !window.confirm("¿Empezar una nueva solicitud? Se borrará la conversación actual.")) return;
    setEstado(estadoInicial());
    setTexto("");
    setErrorEnvio(null);
  }

  return (
    <div className="pantalla">
      <Encabezado onNuevaSolicitud={nuevaSolicitud} />
      <div className="aviso-prototipo">
        <span>Prototipo: la IA no está conectada y nada se envía a Monday ni por correo.</span>
        {estado.fase === "conversacion" && (
          <button className="enlace-boton" onClick={cargarCasoDePrueba}>Cargar caso de prueba</button>
        )}
      </div>

      {estado.fase === "vista_previa" && (
        <VistaPrevia
          borrador={estado.borrador}
          faltantes={faltantes}
          enviando={enviando}
          error={errorEnvio}
          onCambiar={(b) => setEstado((e) => ({ ...e, borrador: b }))}
          onVolver={() => setEstado((e) => ({ ...e, fase: "conversacion", esperandoMasInformacion: true }))}
          onConfirmar={confirmar}
        />
      )}

      {estado.fase === "resultado" && estado.resultado && (
        <div className="contenido">
          <div className="contenido-interior">
            <div className="tarjeta seccion" role="status">
              <h2 className="exito">Solicitud N° {estado.resultado.numero} recibida</h2>
              <p>
                El equipo de Comunicaciones la revisará en la pauta del <strong>{formatearViernes(estado.resultado.viernesDePauta)}</strong>.
                Esa no es la fecha de entrega: después de la pauta te avisaremos por correo el rango estimado.
              </p>
              <p className="nota">Prototipo: la solicitud quedó guardada solo en este servidor de prueba. No se creó en Monday ni se envió el correo de recepción.</p>
              <button className="boton" onClick={nuevaSolicitud}>Hacer otra solicitud</button>
            </div>
          </div>
        </div>
      )}

      {estado.fase === "conversacion" && (
        <>
          <div className="conversacion" aria-live="polite">
            <div className="conversacion-interior">
              {estado.mensajes.map((m, i) => (
                <div key={i} className={`mensaje ${m.rol}`}>{m.texto}</div>
              ))}

              {!estado.borrador.area && (
                <div className="tarjeta">
                  <div>¿De qué área es la solicitud?</div>
                  <div className="opciones">
                    {AREAS.map((a) => (
                      <button key={a} className="chip" onClick={() => elegirArea(a)}>{a}</button>
                    ))}
                  </div>
                </div>
              )}

              {mostrarCierre && (
                <div className="tarjeta">
                  <div>{PREGUNTA_DE_CIERRE}</div>
                  <div className="opciones">
                    <button className="chip" onClick={() => responderCierre(true)}>Sí</button>
                    <button className="chip" onClick={() => responderCierre(false)}>No</button>
                  </div>
                </div>
              )}
              <div ref={finConversacion} />
            </div>
          </div>

          <div className="barra-escritura">
            <div className="barra-escritura-interior">
              {estado.borrador.adjuntos.length > 0 && (
                <div className="adjuntos">
                  {estado.borrador.adjuntos.map((a) => (
                    <span key={a.url} className="adjunto">
                      {a.tipoMime?.startsWith("image/") && <img src={a.url} alt="" />}
                      <span>{a.nombre}</span>
                      <button aria-label={`Quitar ${a.nombre}`} onClick={() => quitarAdjunto(a.url)}>×</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="fila-escritura">
                <input
                  ref={selectorArchivos}
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  hidden
                  onChange={(e) => subirArchivos(e.target.files)}
                />
                <button
                  type="button"
                  className="boton-icono"
                  aria-label="Adjuntar fotos o archivos"
                  disabled={subiendo}
                  onClick={() => selectorArchivos.current?.click()}
                >
                  <IconoAdjuntar />
                </button>
                <label htmlFor="mensaje" hidden>Mensaje</label>
                <textarea
                  id="mensaje"
                  ref={campoTexto}
                  rows={1}
                  placeholder="Escribe tu mensaje"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void enviarMensaje(); }
                  }}
                />
                <Microfono
                  onTexto={(t) => setTexto((actual) => (actual ? `${actual} ${t}` : t))}
                  onAviso={avisar}
                />
                <button
                  type="button"
                  className="boton-icono"
                  aria-label="Enviar mensaje"
                  disabled={!texto.trim() || enviandoMensaje}
                  onClick={() => void enviarMensaje()}
                >
                  <IconoEnviar />
                </button>
              </div>
              <p className="nota">{subiendo ? "Subiendo archivos…" : "El micrófono solo transcribe: revisa el texto antes de enviarlo."}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
