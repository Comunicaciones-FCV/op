"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconoCerrar, IconoMenu } from "./Iconos";

export function Encabezado({ onNuevaSolicitud }: { onNuevaSolicitud: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const botonCerrar = useRef<HTMLButtonElement>(null);
  const botonAbrir = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    botonCerrar.current?.focus();
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [abierto]);

  function cerrar() {
    setAbierto(false);
    botonAbrir.current?.focus();
  }

  return (
    <>
      <header className="encabezado">
        <img src="/marca/fcv-logo-horizontal-color-fondo-transparente.png" alt="Fundación Cristo Vive" width={123} height={36} />
        <span className="titulo-app">Solicitudes Comunicacionales</span>
        <button
          ref={botonAbrir}
          className="boton-icono"
          aria-label="Abrir menú"
          aria-expanded={abierto}
          aria-controls="menu-principal"
          onClick={() => setAbierto(true)}
        >
          <IconoMenu />
        </button>
      </header>

      {abierto && (
        <>
          <div className="menu-fondo" data-testid="menu-fondo" onClick={cerrar} />
          <nav id="menu-principal" className="menu-panel" aria-label="Menú principal">
            <button ref={botonCerrar} className="boton-icono cerrar" aria-label="Cerrar menú" onClick={cerrar}>
              <IconoCerrar />
            </button>
            <button
              className="item"
              onClick={() => {
                cerrar();
                onNuevaSolicitud();
              }}
            >
              Nueva solicitud
            </button>
            <Link href="/como-funciona">¿Cómo funciona?</Link>
            <Link href="/">Salir del modo prueba</Link>
          </nav>
        </>
      )}
    </>
  );
}
