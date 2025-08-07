import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getBackendUrl } from "../config";

export default function Chat() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const codigo = params.get("codigo");
  const nombre = params.get("nombre");
  const tipo = params.get("tipo");
  
  // Configuración del backend
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
              let url = "";
        if (tipo === "Grupo") {
          url = `${BACKEND_URL}/messages?group_id=${codigo}`;
        } else {
          url = `${BACKEND_URL}/messages?user1_id=${miUsuarioId}&user2_id=${codigo}`;
        }
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
      // Si solo hay archivo sin texto, enviar un mensaje con texto vacío
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
        
                 try {
           const contentResp = await fetch(`${BACKEND_URL}/content/`, {
            method: "POST",
            body: formData,
          });
          
          if (!contentResp.ok) {
            const errorText = await contentResp.text();
            console.error("Error al subir archivo:", errorText);
          }
        } catch (error) {
          console.error("Error en la petición:", error);
        }
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
    if (file && file.type.startsWith("image/")) {
      setPreviewArchivo(URL.createObjectURL(file));
    } else {
      setPreviewArchivo(null);
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

      {/* Contenedor mensajes */}
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
              {m.texto && <p>{m.texto}</p>}
              {m.contenidos && m.contenidos.length > 0 && (
                <div className="mt-2">
                  {m.contenidos.map((c, idx) => (
                    <div key={idx} className="mt-2">
                                             {c.tipo_archivo?.startsWith("image/") ? (
                         <div className="flex justify-center">
                           <img
                             src={`${BACKEND_URL}${c.archivo_url}`}
                             alt="adjunto"
                             className="max-w-[400px] max-h-[400px] object-contain rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                             onClick={() => window.open(`${BACKEND_URL}${c.archivo_url}`, '_blank')}
                             onError={(e) => {
                               e.currentTarget.style.display = "none";
                             }}
                           />
                         </div>
                      ) : c.tipo_archivo ? (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <span className="text-2xl">
                            {c.tipo_archivo.startsWith("video/") ? "🎥" :
                             c.tipo_archivo.startsWith("audio/") ? "🎵" :
                             c.tipo_archivo.includes("pdf") ? "📄" :
                             c.tipo_archivo.includes("word") || c.tipo_archivo.includes("document") ? "📝" :
                             c.tipo_archivo.includes("excel") || c.tipo_archivo.includes("spreadsheet") ? "📊" :
                             c.tipo_archivo.includes("zip") || c.tipo_archivo.includes("rar") ? "📦" :
                             "📎"}
                          </span>
                          <div className="flex-1">
                                                         <a
                               href={`${BACKEND_URL}${c.archivo_url}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-blue-600 hover:text-blue-800 font-medium"
                             >
                              {c.texto || "Descargar archivo"}
                            </a>
                            <p className="text-xs text-gray-500 mt-1">
                              {c.tipo_archivo}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-red-500 text-sm">Tipo de archivo no reconocido: {c.tipo_archivo}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <small className="block text-gray-400">
                {new Date(m.fecha_envio).toLocaleString()}
              </small>
            </div>
          ))
        )}
        <div ref={mensajesEndRef} />
      </div>

      {/* Preview de archivo */}
      {previewArchivo && (
        <div className="mb-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-4">
          <img
            src={previewArchivo}
            alt="Vista previa"
            className="h-20 w-20 object-cover rounded-lg shadow"
          />
          <div className="flex-1">
            <p className="text-gray-700 font-medium">{archivo.name}</p>
            <p className="text-xs text-gray-500">
              {(archivo.size / 1024 / 1024).toFixed(2)} MB
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
        <label className="cursor-pointer bg-gray-200 rounded-md px-3 py-2 hover:bg-gray-300 transition-colors">
          <span className="text-lg">📎</span>
          <input
            type="file"
            onChange={(e) => handleArchivoSeleccionado(e.target.files[0])}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
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
