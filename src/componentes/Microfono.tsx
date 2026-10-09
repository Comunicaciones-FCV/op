"use client";

// Dictado por voz con el reconocimiento del navegador (Web Speech API).
// Solo transcribe: el texto se agrega al campo de escritura y la persona decide si lo envía.
// Disponible en Chrome, Edge y Safari. Firefox no lo ofrece. El audio lo procesa el proveedor
// del navegador (Google o Apple).
import { useEffect, useRef, useState } from "react";
import { IconoMicrofono } from "./Iconos";

interface ResultadoVoz { isFinal: boolean; 0: { transcript: string } }
interface EventoVoz { resultIndex: number; results: ArrayLike<ResultadoVoz> }
interface Reconocedor {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((e: EventoVoz) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void;
}
type ConstructorReconocedor = new () => Reconocedor;

function obtenerReconocedor(): ConstructorReconocedor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: ConstructorReconocedor; webkitSpeechRecognition?: ConstructorReconocedor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function Microfono({ onTexto, onAviso }: { onTexto: (texto: string) => void; onAviso: (texto: string) => void }) {
  const [escuchando, setEscuchando] = useState(false);
  const [disponible, setDisponible] = useState(true);
  const reconocedor = useRef<Reconocedor | null>(null);

  useEffect(() => setDisponible(obtenerReconocedor() !== null), []);
  useEffect(() => () => reconocedor.current?.stop(), []);

  function alternar() {
    if (escuchando) {
      reconocedor.current?.stop();
      return;
    }
    const Constructor = obtenerReconocedor();
    if (!Constructor) {
      onAviso("Este navegador no permite dictar por voz. Puedes usar Chrome, Edge o Safari, o escribir tu mensaje.");
      return;
    }
    const r = new Constructor();
    r.lang = "es-CL";
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const resultado = e.results[i];
        if (resultado?.isFinal) onTexto(resultado[0].transcript.trim());
      }
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        onAviso("No hay permiso para usar el micrófono. Revisa los permisos del navegador para este sitio.");
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        onAviso("No se pudo transcribir el audio. Puedes intentarlo de nuevo o escribir tu mensaje.");
      }
    };
    r.onend = () => setEscuchando(false);
    reconocedor.current = r;
    r.start();
    setEscuchando(true);
  }

  return (
    <button
      type="button"
      className="boton-icono"
      aria-label={escuchando ? "Detener dictado" : "Dictar con el micrófono"}
      aria-pressed={escuchando}
      title={disponible ? undefined : "Este navegador no permite dictar por voz"}
      onClick={alternar}
    >
      <IconoMicrofono />
    </button>
  );
}
