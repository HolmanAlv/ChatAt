import { useState } from "react";

export default function Chat({ nombre = "Usuario", tipo = "Privado", mensajes = [] }) {
  const [nuevoMensaje, setNuevoMensaje] = useState("");

  const enviarMensaje = (e) => {
    e.preventDefault();
    console.log("Mensaje enviado:", nuevoMensaje);
    setNuevoMensaje("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 p-4">
      {/* Header */}
      <div className="flex items-center bg-white shadow-md px-4 py-3 rounded-md mb-4">
        <button
          onClick={() => console.log("volver a chats")}
          className="text-purple-600 text-2xl mr-3 hover:text-green-400"
        >
          ←
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800 truncate">{nombre}</h2>
          <p className="text-sm text-gray-500">{tipo}</p>
        </div>
      </div>

      {/* Contenedor mensajes */}
      <div className="bg-white rounded-xl shadow-md p-4 h-[60vh] overflow-y-auto mb-4">
        {mensajes.map((m) => (
          <div
            key={m.id}
            className={`mb-3 p-3 rounded-lg max-w-[85%] break-words ${
              m.estado === "Enviado"
                ? "bg-green-100 ml-auto text-right"
                : "bg-gray-100 mr-auto text-left"
            } ${m.propietario ? "border border-green-400" : ""}`}
          >
            {tipo === "Grupo" && <strong className="text-purple-600">{m.emisor}</strong>}
            {m.respuesta_a && (
              <div className="bg-gray-50 border-l-4 border-blue-400 p-2 mb-1 text-sm">
                En respuesta a mensaje #{m.respuesta_a}
              </div>
            )}
            <p>{m.texto}</p>
            <small className="block text-gray-400">{m.fecha}</small>
          </div>
        ))}
      </div>

      {/* Formulario nuevo mensaje */}
      <form
        onSubmit={enviarMensaje}
        className="flex items-center gap-2 bg-white p-3 rounded-md shadow-md"
      >
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
        />
        <button
          type="submit"
          className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}