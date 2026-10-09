import Link from "next/link";

export default function ComoFunciona() {
  return (
    <main className="contenido">
      <div className="contenido-interior">
        <div className="tarjeta seccion">
          <h2>¿Cómo funciona?</h2>
          <ol>
            <li>Cuentas con tus palabras qué necesitas comunicar. Puedes escribir o dictar con el micrófono.</li>
            <li>El asistente te hace algunas preguntas para completar la información.</li>
            <li>Revisas la solicitud ordenada y corriges lo que haga falta.</li>
            <li>Confirmas el envío. Te llegará un correo de recepción.</li>
            <li>
              El equipo de Comunicaciones revisa las solicitudes en la pauta de los viernes. Lo que se confirma hasta el
              jueves a las 18:00 entra a la pauta de ese viernes; después, a la de la semana siguiente.
            </li>
            <li>Te avisaremos por correo cuando tu solicitud quede agendada y cuando te enviemos lo producido.</li>
          </ol>
          <p className="nota">No necesitas saber qué tipo de pieza se hará: eso lo define el equipo de Comunicaciones.</p>
        </div>
        <div>
          <Link className="boton boton-secundario" href="/solicitud">
            Volver a mi solicitud
          </Link>
        </div>
      </div>
    </main>
  );
}
