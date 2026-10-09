"use client";

import { useState } from "react";
import { AREAS, type Area } from "@/dominio/areas";
import type { BorradorDeSolicitud, Faltante, ValorDeCampo } from "@/dominio/solicitud";

type CampoValor =
  | "subarea" | "queComunicar" | "objetivo" | "publico" | "fechaActividad" | "horario" | "lugar"
  | "antecedentes" | "contacto" | "fechaRequerida" | "preferenciaDeProducto" | "informacionAdicional";

const SECCIONES: { titulo: string; campos: [CampoValor, string][] }[] = [
  { titulo: "El encargo", campos: [["queComunicar", "Qué necesitas comunicar"], ["objetivo", "Para qué"], ["publico", "A quiénes quieres llegar"]] },
  { titulo: "La actividad", campos: [["fechaActividad", "Fecha"], ["horario", "Horario"], ["lugar", "Lugar"]] },
  { titulo: "Plazos", campos: [["fechaRequerida", "Cuándo necesitas contar con la comunicación o los materiales"]] },
  {
    titulo: "Antecedentes",
    campos: [
      ["antecedentes", "Antecedentes y contexto"],
      ["contacto", "Contacto"],
      ["preferenciaDeProducto", "Formato que te gustaría (lo define Comunicaciones)"],
      ["informacionAdicional", "Información adicional"],
    ],
  },
];

function Valor({ valor }: { valor?: ValorDeCampo }) {
  if (!valor) return <span className="etiqueta sin-info">Sin información</span>;
  if (valor.estado === "pendiente") return <span className="etiqueta pendiente">Pendiente</span>;
  if (valor.estado === "no_aplica") return <span className="etiqueta no-aplica">No aplica</span>;
  return <span className="campo-valor">{valor.valor}</span>;
}

function EditorDeValor({ inicial, onGuardar, onCancelar }: {
  inicial?: ValorDeCampo; onGuardar: (v: ValorDeCampo | undefined) => void; onCancelar: () => void;
}) {
  const [estado, setEstado] = useState<ValorDeCampo["estado"]>(inicial?.estado ?? "informado");
  const [texto, setTexto] = useState(inicial?.estado === "informado" ? inicial.valor : "");
  return (
    <div className="editor">
      <div className="radios" role="radiogroup">
        {([["informado", "Tengo el dato"], ["pendiente", "Pendiente"], ["no_aplica", "No aplica"]] as const).map(([v, etiqueta]) => (
          <label key={v}>
            <input type="radio" checked={estado === v} onChange={() => setEstado(v)} /> {etiqueta}
          </label>
        ))}
      </div>
      {estado === "informado" && <textarea rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} />}
      <div className="acciones">
        <button className="boton boton-secundario" onClick={onCancelar}>Cancelar</button>
        <button
          className="boton"
          disabled={estado === "informado" && !texto.trim()}
          onClick={() =>
            onGuardar(estado === "informado" ? { estado, valor: texto.trim() } : estado === "pendiente" ? { estado } : { estado })
          }
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

export function VistaPrevia({ borrador, faltantes, enviando, error, onCambiar, onVolver, onConfirmar }: {
  borrador: BorradorDeSolicitud;
  faltantes: Faltante[];
  enviando: boolean;
  error: string | null;
  onCambiar: (b: BorradorDeSolicitud) => void;
  onVolver: () => void;
  onConfirmar: () => void;
}) {
  const [editando, setEditando] = useState<string | null>(null);
  const [titulo, setTitulo] = useState(borrador.titulo ?? "");
  const [cuna, setCuna] = useState(borrador.cuna ?? { texto: "", nombre: "", rol: "" });

  const botonCorregir = (clave: string) => (
    <button className="enlace-boton" onClick={() => setEditando(editando === clave ? null : clave)}>
      {editando === clave ? "Cerrar" : "Corregir"}
    </button>
  );

  return (
    <div className="contenido">
      <div className="contenido-interior">
        <div>
          <h1 style={{ fontSize: 22, margin: "0 0 4px", color: "var(--azul-oscuro)" }}>Revisa tu solicitud</h1>
          <p className="nota" style={{ margin: 0 }}>
            Todavía no se ha enviado. Corrige lo que necesites y luego confirma el envío.
          </p>
        </div>

        <section className="tarjeta seccion">
          <h2>Quién solicita</h2>
          <div className="campo">
            <div className="campo-nombre">Nombre y correo</div>
            <div>{borrador.nombreSolicitante} · {borrador.correoSolicitante}</div>
          </div>
          <div className="campo">
            <div className="campo-cabecera">
              <span className="campo-nombre">Área</span>
              {botonCorregir("area")}
            </div>
            {editando === "area" ? (
              <div className="editor">
                <select
                  aria-label="Área"
                  value={borrador.area ?? ""}
                  onChange={(e) => {
                    onCambiar({ ...borrador, area: (e.target.value || undefined) as Area | undefined });
                    setEditando(null);
                  }}
                >
                  <option value="">Elige un área</option>
                  {AREAS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
            ) : borrador.area ? <span>{borrador.area}</span> : <span className="etiqueta sin-info">Sin información</span>}
          </div>
          <div className="campo">
            <div className="campo-cabecera">
              <span className="campo-nombre">Servicio o subárea</span>
              {botonCorregir("subarea")}
            </div>
            {editando === "subarea" ? (
              <EditorDeValor inicial={borrador.subarea} onCancelar={() => setEditando(null)}
                onGuardar={(v) => { onCambiar({ ...borrador, subarea: v }); setEditando(null); }} />
            ) : <Valor valor={borrador.subarea} />}
          </div>
        </section>

        <section className="tarjeta seccion">
          <h2>Título</h2>
          <div className="campo">
            <div className="campo-cabecera">
              <span className="campo-nombre">Propuesto a partir de la conversación</span>
              {botonCorregir("titulo")}
            </div>
            {editando === "titulo" ? (
              <div className="editor">
                <input aria-label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                <div className="acciones">
                  <button className="boton" disabled={!titulo.trim()}
                    onClick={() => { onCambiar({ ...borrador, titulo: titulo.trim() }); setEditando(null); }}>
                    Guardar
                  </button>
                </div>
              </div>
            ) : borrador.titulo ? <strong>{borrador.titulo}</strong> : <span className="etiqueta sin-info">Sin información</span>}
          </div>
        </section>

        {SECCIONES.map((s) => (
          <section key={s.titulo} className="tarjeta seccion">
            <h2>{s.titulo}</h2>
            {s.campos.map(([campo, etiqueta]) => (
              <div className="campo" key={campo}>
                <div className="campo-cabecera">
                  <span className="campo-nombre">{etiqueta}</span>
                  {botonCorregir(campo)}
                </div>
                {editando === campo ? (
                  <EditorDeValor inicial={borrador[campo]} onCancelar={() => setEditando(null)}
                    onGuardar={(v) => { onCambiar({ ...borrador, [campo]: v }); setEditando(null); }} />
                ) : <Valor valor={borrador[campo]} />}
              </div>
            ))}
            {s.titulo === "Antecedentes" && (
              <>
                <div className="campo">
                  <div className="campo-cabecera">
                    <span className="campo-nombre">Cuña (frase de alguien del equipo, con nombre y rol)</span>
                    {botonCorregir("cuna")}
                  </div>
                  {editando === "cuna" ? (
                    <div className="editor">
                      <textarea rows={2} aria-label="Frase" placeholder="Frase" value={cuna.texto}
                        onChange={(e) => setCuna({ ...cuna, texto: e.target.value })} />
                      <input aria-label="Nombre" placeholder="Nombre" value={cuna.nombre ?? ""}
                        onChange={(e) => setCuna({ ...cuna, nombre: e.target.value })} />
                      <input aria-label="Rol" placeholder="Rol" value={cuna.rol ?? ""}
                        onChange={(e) => setCuna({ ...cuna, rol: e.target.value })} />
                      <div className="acciones">
                        <button className="boton boton-secundario"
                          onClick={() => { onCambiar({ ...borrador, cuna: undefined }); setCuna({ texto: "", nombre: "", rol: "" }); setEditando(null); }}>
                          Quitar
                        </button>
                        <button className="boton" disabled={!cuna.texto.trim()}
                          onClick={() => { onCambiar({ ...borrador, cuna: { texto: cuna.texto.trim(), nombre: cuna.nombre?.trim() || undefined, rol: cuna.rol?.trim() || undefined } }); setEditando(null); }}>
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : borrador.cuna ? (
                    <span className="campo-valor">
                      «{borrador.cuna.texto}» {borrador.cuna.nombre || borrador.cuna.rol ? `(${[borrador.cuna.nombre, borrador.cuna.rol].filter(Boolean).join(" / ")})` : ""}
                    </span>
                  ) : <span className="etiqueta sin-info">Sin información</span>}
                </div>
                <div className="campo">
                  <div className="campo-nombre">Archivos y enlaces</div>
                  {borrador.adjuntos.length === 0 ? (
                    <span className="etiqueta sin-info">Sin archivos</span>
                  ) : (
                    <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                      {borrador.adjuntos.map((a) => (
                        <li key={a.url}><a href={a.url} target="_blank" rel="noreferrer">{a.nombre}</a></li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </section>
        ))}

        {faltantes.length > 0 && (
          <div className="faltantes" role="alert">
            <strong>Para enviar falta:</strong>
            <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
              {faltantes.map((f) => <li key={f.campo}>{f.motivo}</li>)}
            </ul>
          </div>
        )}
        {error && <div className="faltantes" role="alert">{error}</div>}

        <div className="acciones" style={{ paddingBottom: 24 }}>
          <button className="boton boton-secundario" onClick={onVolver} disabled={enviando}>Volver a la conversación</button>
          <button className="boton" onClick={onConfirmar} disabled={enviando || faltantes.length > 0}>
            {enviando ? "Enviando…" : "Confirmar y enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
