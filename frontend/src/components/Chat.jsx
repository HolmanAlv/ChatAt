import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function Chat() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const codigo = params.get("codigo"); // ID del receptor o del grupo
  const nombre = params.get("nombre");
  const tipo = params.get("tipo"); // "Grupo" o "Privado"

  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [archivo, setArchivo] = useState(null);
  const mensajesEndRef = useRef(null);

  const miUsuarioId = parseInt(localStorage.getItem("userId"));

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Cargar mensajes desde el backend
  const cargarMensajes = async () => {
    try {
      let url = "";
      if (tipo === "Grupo") {
        url = `messages?group_id=${codigo}`;
      } else {
        url = `messages?user1_id=${miUsuarioId}&user2_id=${codigo}`;
      }
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("Error al cargar mensajes");
      const data = await resp.json();
      setMensajes(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarMensajes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  // Enviar mensaje al backend
  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() && !archivo) return;

    try {
      const resp = await fetch("messages/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emisor_id: miUsuarioId,
          receptor_id: tipo === "Grupo" ? null : parseInt(codigo),
          grupo_id: tipo === "Grupo" ? parseInt(codigo) : null,
          texto: nuevoMensaje,
        }),
      });

      if (!resp.ok) throw new Error("Error al enviar mensaje");
      const msg = await resp.json();

      // Adjuntar archivo si existe
      if (archivo) {
        const formData = new FormData();
        formData.append("mensaje_id", msg.id);
        formData.append("file", archivo);

        await fetch("content/", {
          method: "POST",
          body: formData,
        });
      }

      setNuevoMensaje("");
      setArchivo(null);

      await cargarMensajes(); // refrescar lista
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 p-4">
      {/* Header */}
      <div className="flex items-center bg-white shadow-md px-4 py-4 rounded-md mb-4">
        <button
          onClick={() => window.history.back()}
          className="text-purple-600 text-3xl mr-4 hover:text-green-400"
        >
          ←
        </button>
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold text-gray-900">{nombre}</h2>
          <p className="text-sm text-gray-500">
            {tipo === "Grupo" ? "Chat grupal" : "Chat privado"}
          </p>
        </div>
      </div>

      {/* Lista de mensajes */}
      <div className="bg-white rounded-xl shadow-md p-4 h-[60vh] overflow-y-auto mb-4">
        {mensajes.length === 0 ? (
          <p className="text-center text-gray-400">No hay mensajes aún.</p>
        ) : (
          mensajes.map((m) => (
            <div
              key={m.id}
              className={`mb-3 p-3 rounded-lg max-w-[85%] break-words ${
                m.emisor_id === miUsuarioId
                  ? "bg-green-100 ml-auto text-right"
                  : "bg-gray-100 mr-auto text-left"
              }`}
            >
              {tipo === "Grupo" && m.emisor_id !== miUsuarioId && (
                <strong className="text-purple-600 block">
                  {m.emisor_nombre ?? `Usuario ${m.emisor_id}`}
                </strong>
              )}
              <p>{m.texto ?? "Mensaje sin texto"}</p>
              <small className="block text-gray-400">
                {new Date(m.fecha_envio).toLocaleString()}
              </small>
            </div>
          ))
        )}
        <div ref={mensajesEndRef} />
      </div>

      {/* Enviar mensaje */}
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
        <label className="cursor-pointer bg-gray-200 rounded-md px-3 py-2 hover:bg-gray-300">
          📎
          <input
            type="file"
            onChange={(e) => setArchivo(e.target.files[0])}
            className="hidden"
          />
        </label>
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
