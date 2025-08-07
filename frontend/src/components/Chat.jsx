import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getBackendUrl } from "../config";

// Componente para previsualizar archivos de texto
const TextPreview = ({ file }) => {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        // Mostrar solo las primeras 200 caracteres
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
    // Crear previsualización para todos los tipos de archivo
    if (file) {
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
                       ) : c.tipo_archivo?.startsWith("video/") ? (
                         <div className="flex justify-center">
                           <video
                             src={`${BACKEND_URL}${c.archivo_url}`}
                             controls
                             className="max-w-[400px] max-h-[400px] rounded-lg shadow-lg"
                             onError={(e) => {
                               e.currentTarget.style.display = "none";
                             }}
                           />
                         </div>
                       ) : c.tipo_archivo?.startsWith("audio/") ? (
                         <div className="flex justify-center">
                           <audio
                             src={`${BACKEND_URL}${c.archivo_url}`}
                             controls
                             className="w-full max-w-[400px]"
                             onError={(e) => {
                               e.currentTarget.style.display = "none";
                             }}
                           />
                         </div>
                                              ) : c.tipo_archivo?.includes("pdf") ? (
                         <div className="flex flex-col items-center">
                           <iframe
                             src={`${BACKEND_URL}${c.archivo_url}`}
                             className="w-full max-w-[400px] h-[500px] rounded-lg shadow-lg border"
                             title="PDF Viewer"
                             onError={(e) => {
                               e.currentTarget.style.display = "none";
                             }}
                           />
                           <a
                             href={`${BACKEND_URL}${c.archivo_url}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="text-blue-600 hover:text-blue-800 font-medium mt-2"
                           >
                             Abrir PDF en nueva pestaña
                           </a>
                         </div>
                       ) : c.tipo_archivo ? (
                         <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                        <span className="text-2xl">
                               {c.tipo_archivo.includes("word") || c.tipo_archivo.includes("document") ? "📝" :
                                c.tipo_archivo.includes("excel") || c.tipo_archivo.includes("spreadsheet") || c.tipo_archivo.includes("csv") ? "📊" :
                                c.tipo_archivo.includes("powerpoint") || c.tipo_archivo.includes("presentation") ? "📽️" :
                                c.tipo_archivo.includes("zip") || c.tipo_archivo.includes("rar") || c.tipo_archivo.includes("7z") ? "📦" :
                                c.tipo_archivo.includes("text") || c.tipo_archivo.includes("txt") ? "📄" :
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
          {archivo.type.startsWith("image/") ? (
            <img
              src={previewArchivo}
              alt="Vista previa"
              className="h-20 w-20 object-cover rounded-lg shadow"
            />
          ) : archivo.type.startsWith("video/") ? (
            <video
              src={previewArchivo}
              className="h-20 w-20 object-cover rounded-lg shadow"
              muted
              onLoadedMetadata={(e) => {
                e.target.currentTime = 1; // Mostrar un frame del video
              }}
            />
          ) : archivo.type.startsWith("audio/") ? (
            <div className="h-20 w-20 bg-gray-100 rounded-lg shadow flex items-center justify-center">
              <span className="text-3xl">🎵</span>
            </div>
                    ) : archivo.type.includes("pdf") ? (
            <div className="h-20 w-20 bg-gray-100 rounded-lg shadow flex items-center justify-center">
              <span className="text-3xl">📄</span>
            </div>
          ) : archivo.type.includes("text") || archivo.type.includes("txt") ? (
            <div className="h-20 w-20 bg-gray-100 rounded-lg shadow flex items-center justify-center">
              <span className="text-3xl">📄</span>
            </div>
          ) : (
            <div className="h-20 w-20 bg-gray-100 rounded-lg shadow flex items-center justify-center">
              <span className="text-3xl">
                {archivo.type.includes("word") || archivo.type.includes("document") ? "📝" :
                 archivo.type.includes("excel") || archivo.type.includes("spreadsheet") || archivo.type.includes("csv") ? "📊" :
                 archivo.type.includes("powerpoint") || archivo.type.includes("presentation") ? "📽️" :
                 archivo.type.includes("zip") || archivo.type.includes("rar") || archivo.type.includes("7z") ? "📦" :
                 "📎"}
              </span>
            </div>
          )}
          <div className="flex-1">
            <p className="text-gray-700 font-medium">{archivo.name}</p>
            <p className="text-xs text-gray-500">
              {(archivo.size / 1024 / 1024).toFixed(2)} MB • {archivo.type}
            </p>
            {/* Mostrar contenido de archivos de texto */}
            {(archivo.type.includes("text") || archivo.type.includes("txt")) && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs max-h-20 overflow-y-auto">
                <p className="text-gray-600">Vista previa del contenido:</p>
                <TextPreview file={archivo} />
              </div>
            )}
            {/* Mostrar previsualización de PDF */}
            {archivo.type.includes("pdf") && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                <p className="text-gray-600">PDF - {archivo.name}</p>
                <p className="text-gray-500">Se mostrará embebido en el chat</p>
              </div>
            )}
            {/* Mostrar información para otros tipos de archivo */}
            {!archivo.type.includes("text") && !archivo.type.includes("txt") && !archivo.type.includes("pdf") && 
             !archivo.type.startsWith("image/") && !archivo.type.startsWith("video/") && !archivo.type.startsWith("audio/") && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                <p className="text-gray-600">{archivo.name}</p>
                <p className="text-gray-500">Archivo para descargar</p>
              </div>
            )}
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
             accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt,.csv,.ppt,.pptx"
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
