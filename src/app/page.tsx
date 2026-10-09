import Link from "next/link";

export default function Ingreso() {
  return (
    <main className="ingreso">
      <div className="tarjeta">
        <img
          src="/marca/fcv-logo-horizontal-color-fondo-transparente.png"
          alt="Fundación Cristo Vive"
          width={1000}
          height={292}
        />
        <h1>Solicitudes Comunicacionales FCV</h1>
        <p>Cuéntale al equipo de Comunicaciones qué necesitas comunicar. Te ayudamos a ordenar la información.</p>

        <button className="boton" disabled aria-describedby="google-pendiente" style={{ width: "100%" }}>
          Entrar con Google
        </button>
        <p id="google-pendiente" className="nota">
          Aún no disponible: falta que la administración de Google de la Fundación autorice la aplicación.
        </p>

        <hr style={{ border: 0, borderTop: "1px solid var(--borde)", margin: "20px 0" }} />
        <p className="nota" style={{ marginBottom: 10 }}>
          Prototipo para revisión. Entra con una persona ficticia de prueba.
        </p>
        <Link className="boton boton-secundario" href="/solicitud" style={{ width: "100%" }}>
          Entrar en modo prueba
        </Link>
      </div>
    </main>
  );
}
