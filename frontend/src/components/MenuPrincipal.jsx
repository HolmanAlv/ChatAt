import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MenuPrincipal() {
  const navigate = useNavigate();
  const miUsuarioId = localStorage.getItem("userId"); // asumimos que ya está guardado

  const [usuario, setUsuario] = useState(null);
  const [fecha, setFecha] = useState("");
  const [chats, setChats] = useState([]);
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // Obtener datos del usuario y asignar fecha formateada
  useEffect(() => {
    if (!miUsuarioId) {
      navigate("/");
      return;
    }
    const fetchUsuario = async () => {
      try {
        const resp = await fetch(`users/${miUsuarioId}`);
        if (!resp.ok) throw new Error("Error al obtener usuario");
        const data = await resp.json();
        setUsuario(data);
        if (data.fecha_registro) {
          const fechaLocal = new Date(data.fecha_registro).toLocaleDateString();
          setFecha(fechaLocal);
        }
        // Datos de chats de ejemplo por ahora
        setChats([
          {
            codigo: "1",
            nombre: "Grupo Demo",
            tipo: "Grupo",
            ultimo_mensaje: "Bienvenido!",
            hora_ultimo_mensaje: "10:30",
            nuevos_mensajes: 2,
          },
          {
            codigo: "2",
            nombre: "Usuario Demo",
            tipo: "Privado",
            ultimo_mensaje: "Hola!",
            hora_ultimo_mensaje: "09:15",
            nuevos_mensajes: 0,
          },
        ]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsuario();
  }, [miUsuarioId, navigate]);

  const buscar = async (valor) => {
    setQuery(valor);
    if (valor.length < 1) {
      setResultados([]);
      return;
    }
    try {
      const resp = await fetch(`users/search?q=${valor}`);
      if (!resp.ok) throw new Error("Error al buscar usuarios");
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
      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.detail || "Error al enviar solicitud");
      }
      setMensaje("Solicitud enviada correctamente");
    } catch (error) {
      setMensaje(error.message);
    }
    setTimeout(() => setMensaje(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500">
      {/* Cabecera */}
      <div className="relative w-full bg-yellow-50 rounded-b-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] px-8 py-6">
        <span className="text-3xl font-bold text-purple-600">@ChatAt</span>
        <div className="text-4xl font-bold text-gray-900 mt-2">
          {usuario ? `${usuario.nombre} ${usuario.apellido}` : "Cargando..."}
        </div>
        <div className="text-xl text-gray-500">{fecha}</div>
        <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-b from-yellow-50 to-transparent rounded-b-3xl" />
      </div>

      {/* Barra de búsqueda */}
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

      {/* Lista de resultados de búsqueda o chats */}
      <div className="bg-white rounded-2xl shadow-lg max-w-md mx-auto mt-4 overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {query.length > 0 ? (
            resultados.length > 0 ? (
              resultados.map((usuario) => (
                <li
                  key={usuario.id}
                  className="flex items-center justify-between px-5 py-4"
                >
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
              <li className="py-6 text-center text-gray-500">
                No se encontraron usuarios
              </li>
            )
          ) : chats.length > 0 ? (
            chats.map((chat) => (
              <li
                key={chat.codigo}
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
                    {chat.hora_ultimo_mensaje && (
                      <span className="text-xs text-gray-500 ml-2">
                        {chat.hora_ultimo_mensaje}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.ultimo_mensaje
                      ? `🕒 ${chat.ultimo_mensaje}`
                      : "Sin mensajes aún"}
                  </p>
                </div>
                {chat.nuevos_mensajes > 0 && (
                  <div className="ml-3 bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                    {chat.nuevos_mensajes}
                  </div>
                )}
              </li>
            ))
          ) : (
            <li className="py-6 text-center text-gray-500">
              No tienes chats aún.
            </li>
          )}
        </ul>

        {/* Botón cerrar sesión */}
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          className="w-[90%] mx-auto my-6 block bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg text-lg font-semibold hover:from-green-400 hover:to-blue-500 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
