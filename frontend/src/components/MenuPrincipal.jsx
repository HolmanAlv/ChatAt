import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MenuPrincipal({ user, onLogout }) {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [fecha, setFecha] = useState("");
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Datos de ejemplo para amigos y solicitudes pendientes
  const [amigos] = useState([
    { id: 1, nombre: "Ana García", email: "ana@example.com", estado: "accepted" },
    { id: 2, nombre: "Carlos López", email: "carlos@example.com", estado: "accepted" },
    { id: 3, nombre: "María Rodríguez", email: "maria@example.com", estado: "accepted" },
  ]);

  const [solicitudesPendientes] = useState([
    { id: 4, nombre: "Juan Pérez", email: "juan@example.com", estado: "pending" },
    { id: 5, nombre: "Laura Silva", email: "laura@example.com", estado: "pending" },
  ]);

  // Datos de ejemplo para chats recientes
  const [chatsRecientes] = useState([
    { 
      id: 1, 
      nombre: "Ana García", 
      ultimoMensaje: "¡Hola! ¿Cómo estás?", 
      hora: "14:30",
      sinLeer: 2,
      avatar: "👩‍💼"
    },
    { 
      id: 2, 
      nombre: "Carlos López", 
      ultimoMensaje: "Perfecto, nos vemos mañana", 
      hora: "12:15",
      sinLeer: 0,
      avatar: "👨‍💻"
    },
    { 
      id: 3, 
      nombre: "María Rodríguez", 
      ultimoMensaje: "¿Ya revisaste el proyecto?", 
      hora: "10:45",
      sinLeer: 1,
      avatar: "👩‍🎨"
    },
    { 
      id: 4, 
      nombre: "Grupo Trabajo", 
      ultimoMensaje: "Juan: Reunión a las 3pm", 
      hora: "09:20",
      sinLeer: 5,
      avatar: "👥"
    }
  ]);

  // Funciones para manejar solicitudes de amistad
  const aceptarSolicitud = (solicitudId) => {
    console.log(`Solicitud ${solicitudId} aceptada`);
    setMensaje("Solicitud aceptada correctamente");
    setTimeout(() => setMensaje(""), 3000);
  };

  const rechazarSolicitud = (solicitudId) => {
    console.log(`Solicitud ${solicitudId} rechazada`);
    setMensaje("Solicitud rechazada correctamente");
    setTimeout(() => setMensaje(""), 3000);
  };

  const abrirChat = (chatId) => {
    console.log(`Abriendo chat ${chatId}`);
    navigate(`/chat/${chatId}`);
  };

  // Obtener datos del usuario y asignar fecha formateada
  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
      return;
    }
    
    const fetchUsuario = async () => {
      try {
        const resp = await fetch(`users/${user.id}`);
        if (!resp.ok) throw new Error("Error al obtener usuario");
        const data = await resp.json();
        setUsuario(data);
        if (data.fecha_registro) {
          const fechaLocal = new Date(data.fecha_registro).toLocaleDateString();
          setFecha(fechaLocal);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsuario();
  }, [user, navigate]);

  // Cerrar menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

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
          usuario_id: parseInt(user.id),
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

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500">
      {/* Cabecera */}
      <div className="relative w-full bg-yellow-50 rounded-b-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] px-8 py-6">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-3xl font-bold text-purple-600">@ChatAt</span>
            <div className="text-4xl font-bold text-gray-900 mt-2">
              {usuario ? `${usuario.nombre} ${usuario.apellido}` : "Cargando..."}
            </div>
            <div className="text-xl text-gray-500">{fecha}</div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex items-center space-x-3">
            {/* Botón de Grupos */}
            <button
              onClick={() => navigate('/groups')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
            >
              <div className="text-xl">🏠</div>
            </button>
            
            {/* Botón del menú de amigos */}
            <div className="relative menu-container">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 rounded-full shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105"
              >
                <div className="text-xl">👥</div>
              </button>
              
              {/* Menú desplegable */}
              {showMenu && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Amigos y Solicitudes</h3>
                    
                    {/* Sección de amigos */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                        <span className="mr-2">✅</span>
                        Mis Amigos ({amigos.length})
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {amigos.map((amigo) => (
                          <div key={amigo.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{amigo.nombre}</p>
                              <p className="text-xs text-gray-500">{amigo.email}</p>
                            </div>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Amigo</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Sección de solicitudes pendientes */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                        <span className="mr-2">⏳</span>
                        Solicitudes Pendientes ({solicitudesPendientes.length})
                      </h4>
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {solicitudesPendientes.map((solicitud) => (
                          <div key={solicitud.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-800">{solicitud.nombre}</p>
                              <p className="text-xs text-gray-500">{solicitud.email}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => aceptarSolicitud(solicitud.id)}
                                className="flex-1 bg-green-500 text-white text-xs py-1 px-2 rounded-md hover:bg-green-600 transition-colors"
                              >
                                ✅ Aceptar
                              </button>
                              <button
                                onClick={() => rechazarSolicitud(solicitud.id)}
                                className="flex-1 bg-red-500 text-white text-xs py-1 px-2 rounded-md hover:bg-red-600 transition-colors"
                              >
                                ❌ Rechazar
                              </button>
                            </div>
                          </div>
                        ))}
                        {solicitudesPendientes.length === 0 && (
                          <p className="text-xs text-gray-500 text-center py-2">No hay solicitudes pendientes</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-b from-yellow-50 to-transparent rounded-b-3xl" />
      </div>

      {/* Barra de búsqueda desplegable */}
      <div className="max-w-md mx-auto px-4 mt-6">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-4 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          <span className="text-xl">🔍</span>
          <span className="font-semibold">Buscar amigos</span>
          <span className={`transition-transform duration-200 ${showSearch ? 'rotate-180' : ''}`}>▼</span>
        </button>
        
        {showSearch && (
          <div className="mt-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
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
            
            {/* Lista de resultados de búsqueda */}
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {query.length > 0 ? (
                  resultados.length > 0 ? (
                    resultados.map((usuario) => (
                      <li
                        key={usuario.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {usuario.nombre} {usuario.apellido}
                          </p>
                          <p className="text-xs text-gray-500">{usuario.email}</p>
                        </div>
                        <button
                          onClick={() => agregarAmigo(usuario.id)}
                          className="bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-600 text-xs"
                        >
                          Agregar
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="py-4 text-center text-gray-500 text-sm">
                      No se encontraron usuarios
                    </li>
                  )
                ) : (
                  <li className="py-4 text-center text-gray-500 text-sm">
                    Busca usuarios para agregar como amigos
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Preview de Chats Recientes */}
      <div className="max-w-md mx-auto mt-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Chats Recientes</h2>
          <button
            onClick={() => navigate('/chats')}
            className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
          >
            Ver todos
          </button>
        </div>
        
        <div className="space-y-3">
          {chatsRecientes.map((chat) => (
            <div
              key={chat.id}
              onClick={() => abrirChat(chat.id)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{chat.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {chat.nombre}
                    </h3>
                    <span className="text-xs text-gray-500">{chat.hora}</span>
                  </div>
                  <p className="text-xs text-gray-600 truncate mt-1">
                    {chat.ultimoMensaje}
                  </p>
                </div>
                {chat.sinLeer > 0 && (
                  <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {chat.sinLeer > 9 ? '9+' : chat.sinLeer}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón cerrar sesión */}
      <div className="max-w-md mx-auto px-4 mt-6">
        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg text-lg font-semibold hover:from-red-600 hover:to-pink-600 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
