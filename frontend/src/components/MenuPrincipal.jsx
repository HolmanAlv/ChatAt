import { useNavigate } from "react-router-dom";

export default function MenuPrincipal({
  nombre = "Usuario Demo",
  fecha = "2025-07-29",
  chats = [],
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500">
      <div className="relative w-full bg-yellow-50 rounded-b-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] px-8 py-6">
        <span className="text-3xl font-bold text-purple-600">@ChatAt</span>
        <div className="text-4xl font-bold text-gray-900 mt-2">{nombre}</div>
        <div className="text-xl text-gray-500">{fecha}</div>

        <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-b from-yellow-50 to-transparent rounded-b-3xl" />
      </div>

      {/* Lista de chats */}
      <div className="bg-white rounded-2xl shadow-lg max-w-md mx-auto mt-8 overflow-hidden">
        <ul className="divide-y divide-gray-100">
            {chats.length > 0 ? (
            chats.map((chat) => (
                <li
                key={chat.codigo}
                onClick={() =>
                    navigate(
                    `/chat?codigo=${chat.codigo}&nombre=${encodeURIComponent(chat.nombre)}&tipo=${encodeURIComponent(chat.tipo)}`
                    )
                }
                className="flex items-center px-5 py-4 cursor-pointer hover:bg-indigo-50 transition"
                >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-xl font-bold mr-4 shadow">
                    {chat.tipo === "Grupo" ? "👥" : "👤"}
                </div>

                {/* Info del chat */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-gray-900 truncate">{chat.nombre}</p>
                    {chat.hora_ultimo_mensaje && (
                        <span className="text-xs text-gray-500 ml-2">{chat.hora_ultimo_mensaje}</span>
                    )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                    {chat.ultimo_mensaje ? `🕒 ${chat.ultimo_mensaje}` : "Sin mensajes aún"}
                    </p>
                </div>

                {/* Indicador de mensajes nuevos */}
                {chat.nuevos_mensajes > 0 && (
                    <div className="ml-3 bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                    {chat.nuevos_mensajes}
                    </div>
                )}
                </li>
            ))
            ) : (
            <li className="py-6 text-center text-gray-500">No tienes chats aún.</li>
            )}
        </ul>

        {/* Botón de cerrar sesión */}
        <button
            onClick={() => navigate("/logout")}
            className="w-[90%] mx-auto my-6 block bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg text-lg font-semibold hover:from-green-400 hover:to-blue-500 transition"
        >
            Cerrar sesión
        </button>
        </div>

    </div>
  );
}
