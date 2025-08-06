import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function MenuPrincipal() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [chats, setChats] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [nombre, setNombre] = useState(localStorage.getItem("userName") || "");
  const [fecha, setFecha] = useState("");

  const miUsuarioId = localStorage.getItem("userId");

  const formatearFecha = (fechaISO) => {
    const fechaObj = new Date(fechaISO);
    return fechaObj.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (!miUsuarioId) return;

    const cargarDatos = async () => {
      try {
        const respUsuario = await fetch(`users/${miUsuarioId}`);
        const dataUsuario = await respUsuario.json();
        setFecha(formatearFecha(dataUsuario.fecha_registro));

        const respAmigos = await fetch(`friends/${miUsuarioId}/all`);
        const amigos = await respAmigos.json();

        const respGrupos = await fetch(`groups?user_id=${miUsuarioId}`);
        const grupos = await respGrupos.json();

        setChats([
          ...amigos.map((a) => ({
            codigo: a.id,
            nombre: `${a.nombre} ${a.apellido}`,
            tipo: "Privado",
            ultimo_mensaje: "",
            hora_ultimo_mensaje: "",
            nuevos_mensajes: 0,
          })),
          ...grupos.map((g) => ({
            codigo: g.id,
            nombre: g.nombre,
            tipo: "Grupo",
            ultimo_mensaje: "",
            hora_ultimo_mensaje: "",
            nuevos_mensajes: 0,
          })),
        ]);

        const respSolicitudes = await fetch(`friends/incoming/${miUsuarioId}`);
        const dataSolicitudes = await respSolicitudes.json();
        setSolicitudes(dataSolicitudes);
      } catch (error) {
        console.error(error);
      }
    };

    cargarDatos();
  }, [miUsuarioId]);

  const buscar = async (valor) => {
    setQuery(valor);
    if (valor.length < 1) {
      setResultados([]);
      return;
    }
    try {
      const resp = await fetch(`users/search?q=${valor}`);
      const data = await resp.json();
      setResultados(data);
    } catch (error) {
      console.error(error);
    }
  };

  const agregarAmigo = async (amigoId) => {
    try {
      const resp = await fetch("friends/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: parseInt(miUsuarioId),
          amigo_id: amigoId,
          estado: "pending",
        }),
      });
      if (!resp.ok) throw new Error("Error al enviar solicitud");
      setMensaje("Solicitud enviada correctamente");
    } catch (error) {
      setMensaje(error.message);
    }
    setTimeout(() => setMensaje(""), 3000);
  };

  const responderSolicitud = async (usuarioId, estado) => {
    try {
      const resp = await fetch(`friends/${usuarioId}/${miUsuarioId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      if (!resp.ok) throw new Error("Error al actualizar solicitud");
      setSolicitudes((prev) =>
        prev.filter((s) => !(s.usuario_id === usuarioId && s.amigo_id === miUsuarioId))
      );
      setMensaje(`Solicitud ${estado === "accepted" ? "aceptada" : "rechazada"}`);
    } catch (error) {
      setMensaje(error.message);
    }
    setTimeout(() => setMensaje(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500">
      {/* Cabecera */}
      <div className="relative w-full bg-yellow-50 rounded-b-3xl shadow px-8 py-6">
        <span className="text-3xl font-bold text-purple-600">@ChatAt</span>
        <div className="text-4xl font-bold text-gray-900 mt-2">{nombre}</div>
        <div className="text-xl text-gray-500">{fecha}</div>
      </div>

      <div className="max-w-md mx-auto mt-6 px-4">
        {mensaje && (
          <div className="p-2 mb-4 rounded-md bg-green-100 text-green-700">
            {mensaje}
          </div>
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => buscar(e.target.value)}
          placeholder="Buscar amigos por nombre o correo"
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring focus:ring-indigo-300"
        />
      </div>

      {/* Solicitudes pendientes */}
      {solicitudes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg max-w-md mx-auto mt-4 overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-700 px-5 py-3 border-b">Solicitudes de amistad</h3>
          <ul className="divide-y divide-gray-100">
            {solicitudes.map((s) => (
              <li key={`${s.usuario_id}-${s.amigo_id}`} className="flex items-center justify-between px-5 py-4">
                <span className="font-medium">
                  Solicitud de usuario #{s.usuario_id}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => responderSolicitud(s.usuario_id, "accepted")}
                    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => responderSolicitud(s.usuario_id, "rejected")}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                  >
                    Rechazar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista de resultados de búsqueda o chats */}
      <div className="bg-white rounded-2xl shadow-lg max-w-md mx-auto mt-4 overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {query.length > 0 ? (
            resultados.length > 0 ? (
              resultados.map((usuario) => (
                <li key={usuario.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {usuario.nombre} {usuario.apellido}
                    </p>
                    <p className="text-sm text-gray-500">{usuario.email}</p>
                  </div>
                  <button
                    onClick={() => agregarAmigo(usuario.id)}
                    className="bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-600"
                  >
                    Agregar
                  </button>
                </li>
              ))
            ) : (
              <li className="py-6 text-center text-gray-500">No se encontraron usuarios</li>
            )
          ) : chats.length > 0 ? (
            chats.map((chat) => (
              <li
                key={`${chat.tipo}-${chat.codigo}`}
                onClick={() =>
                  navigate(
                    `/chat?codigo=${chat.codigo}&nombre=${encodeURIComponent(
                      chat.nombre
                    )}&tipo=${encodeURIComponent(chat.tipo)}`
                  )
                }
                className="flex items-center px-5 py-4 cursor-pointer hover:bg-indigo-50 transition"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-xl font-bold mr-4 shadow">
                  {chat.tipo === "Grupo" ? "👥" : "👤"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-gray-900 truncate">
                      {chat.nombre}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.ultimo_mensaje ? `🕒 ${chat.ultimo_mensaje}` : "Sin mensajes aún"}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <li className="py-6 text-center text-gray-500">No tienes chats aún.</li>
          )}
        </ul>

        <button
          onClick={() => navigate("/")}
          className="w-[90%] mx-auto my-6 block bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg text-lg font-semibold hover:from-green-400 hover:to-blue-500 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
