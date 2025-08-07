import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getBackendUrl } from "../config";

const TextPreview = ({ file }) => {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        setContent(text.substring(0, 200) + (text.length > 200 ? "..." : ""));
      };
      reader.readAsText(file);
    }
  }, [file]);

  return <span className="text-gray-800">{content}</span>;
};

export default function Chat() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const codigo = params.get("codigo");
  const nombre = params.get("nombre");
  const tipo = params.get("tipo");

  const BACKEND_URL = getBackendUrl();

  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [previewArchivo, setPreviewArchivo] = useState(null);
  const mensajesEndRef = useRef(null);

  const miUsuarioId = parseInt(localStorage.getItem("userId"));

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const cargarMensajes = useCallback(async () => {
    try {
      const url =
        tipo === "Grupo"
          ? `${BACKEND_URL}/messages?group_id=${codigo}`
          : `${BACKEND_URL}/messages?user1_id=${miUsuarioId}&user2_id=${codigo}`;

      const resp = await fetch(url);
      if (!resp.ok) throw new Error("Error al cargar mensajes");
      const data = await resp.json();
      setMensajes(data);
    } catch (error) {
      console.error(error);
    }
  }, [tipo, codigo, miUsuarioId, BACKEND_URL]);

  useEffect(() => {
    cargarMensajes();
  }, [cargarMensajes]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() && !archivo) return;

    try {
      const textoMensaje = nuevoMensaje.trim() || (archivo ? "" : null);
      const resp = await fetch(`${BACKEND_URL}/messages/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emisor_id: miUsuarioId,
          receptor_id: tipo === "Grupo" ? null : parseInt(codigo),
          grupo_id: tipo === "Grupo" ? parseInt(codigo) : null,
          texto: textoMensaje,
        }),
      });

      if (!resp.ok) throw new Error("Error al enviar mensaje");
      const msg = await resp.json();

      if (archivo) {
        const formData = new FormData();
        formData.append("mensaje_id", msg.id);
        formData.append("file", archivo);

        await fetch(`${BACKEND_URL}/content/`, {
          method: "POST",
          body: formData,
        });
      }

      setNuevoMensaje("");
      setArchivo(null);
      setPreviewArchivo(null);
      await cargarMensajes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleArchivoSeleccionado = (file) => {
    setArchivo(file);
    setPreviewArchivo(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col p-4">
      {/* Header */}
      {/* Header fijo */}
      <div className="sticky top-0 z-10 flex items-center bg-white bg-opacity-90 backdrop-blur-md shadow-md px-4 py-4 rounded-md mb-4">
        <button
          onClick={() => window.history.back()}
          className="text-purple-600 text-3xl mr-4 hover:text-purple-400 transition"
        >
          ←
        </button>
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900">{nombre}</h2>
          <p className="text-sm text-gray-500">
            {tipo === "Grupo" ? "Chat grupal" : "Chat privado"}
          </p>
        </div>
      </div>

      {/* Contenedor de mensajes */}
      {/* Contenedor de mensajes */}
      <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-5 flex-1 overflow-y-auto mb-5">
        {mensajes.length === 0 ? (
          <p className="text-center text-gray-400">No hay mensajes aún.</p>
        ) : (
          mensajes.map((m) => (
            <div
              key={m.id}
              className={`mb-4 px-4 py-3 rounded-xl max-w-[85%] break-words shadow ${
                m.emisor_id === miUsuarioId
                  ? "bg-green-100 ml-auto text-right"
                  : "bg-gray-100 mr-auto text-left"
              }`}
            >
              {tipo === "Grupo" && m.emisor_id !== miUsuarioId && (
                <p className="text-purple-600 font-semibold mb-1">
                  {m.emisor_nombre ?? `Usuario ${m.emisor_id}`}
                </p>
              )}
              {m.texto && <p className="text-gray-800">{m.texto}</p>}
              {m.contenidos?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {m.contenidos.map((c, idx) => (
                    <div key={idx}>
                      {c.tipo_archivo?.startsWith("image/") ? (
                        <img
                          src={`${BACKEND_URL}${c.archivo_url}`}
                          alt="Imagen"
                          className="rounded-lg shadow-md max-w-[300px] mx-auto cursor-pointer hover:shadow-xl"
                          onClick={() => window.open(`${BACKEND_URL}${c.archivo_url}`, "_blank")}
                        />
                      ) : c.tipo_archivo?.startsWith("video/") ? (
                        <video
                          src={`${BACKEND_URL}${c.archivo_url}`}
                          controls
                          className="rounded-lg max-w-[300px] mx-auto"
                        />
                      ) : c.tipo_archivo?.startsWith("audio/") ? (
                        <audio
                          src={`${BACKEND_URL}${c.archivo_url}`}
                          controls
                          className="w-full"
                        />
                      ) : c.tipo_archivo?.includes("pdf") ? (
                        <div>
                          <iframe
                            src={`${BACKEND_URL}${c.archivo_url}`}
                            className="w-full h-64 rounded shadow"
                          />
                          <a
                            href={`${BACKEND_URL}${c.archivo_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline text-sm mt-1 inline-block"
                          >
                            Abrir PDF
                          </a>
                        </div>
                      ) : (
                        <a
                          href={`${BACKEND_URL}${c.archivo_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Descargar archivo
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <small className="block text-gray-400 mt-2">
                {new Date(m.fecha_envio).toLocaleString()}
              </small>
            </div>
          ))
        )}
        <div ref={mensajesEndRef} />
      </div>

      {/* Preview de archivo */}
      {previewArchivo && archivo && (
        <div className="mb-4 bg-white shadow-md rounded-lg p-4 flex items-center gap-4">
          <div className="w-20 h-20 flex items-center justify-center rounded bg-gray-100">
            {archivo.type.startsWith("image/") ? (
              <img
                src={previewArchivo}
                alt="Vista previa"
                className="w-full h-full object-cover rounded"
              />
            ) : archivo.type.startsWith("video/") ? (
              <video src={previewArchivo} className="w-full h-full object-cover rounded" muted />
            ) : (
              <span className="text-3xl">📎</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-gray-800 font-semibold">{archivo.name}</p>
            <p className="text-sm text-gray-500">
              {(archivo.size / 1024 / 1024).toFixed(2)} MB • {archivo.type}
            </p>
          </div>
          <button
            onClick={() => {
              setArchivo(null);
              setPreviewArchivo(null);
            }}
            className="text-red-500 hover:text-red-700 text-xl"
          >
            ✕
          </button>
        </div>
      )}

      {/* Formulario de mensaje */}
      <form
        onSubmit={enviarMensaje}
        className="sticky bottom-0 z-10 flex items-center gap-2 bg-white p-3 rounded-md shadow-md mt-4"
      >

        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
        />
        <label className="cursor-pointer bg-gray-100 rounded-lg px-3 py-2 hover:bg-gray-200 transition">
          📎
          <input
            type="file"
            onChange={(e) => handleArchivoSeleccionado(e.target.files[0])}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt,.csv,.ppt,.pptx"
          />
        </label>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
