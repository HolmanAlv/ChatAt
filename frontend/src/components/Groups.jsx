import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Groups({ currentUserId }) {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ nombre: "", descripcion: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (currentUserId) {
      fetchGroups();
    }
  }, [currentUserId]);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`/groups/user/${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    
    if (!newGroup.nombre.trim()) {
      setMessage('El nombre del grupo es requerido');
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const response = await fetch('/groups/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: newGroup.nombre,
          descripcion: newGroup.descripcion,
          creador_id: currentUserId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Grupo creado exitosamente');
        setNewGroup({ nombre: "", descripcion: "" });
        setShowCreateForm(false);
        fetchGroups();
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Error al crear grupo');
      }
    } catch (error) {
      setMessage('Error al crear grupo');
    }

    setTimeout(() => setMessage(""), 3000);
  };

  const startGroupChat = (group) => {
    navigate('/chat', {
      state: {
        chatId: group.id,
        chatName: group.nombre,
        chatType: 'group',
        recipientId: null,
        groupId: group.id,
        currentUserId: currentUserId
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGroup(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 p-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <span className="ml-3 text-gray-600">Cargando grupos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 p-4">
      {/* Header */}
      <div className="bg-white shadow-md px-4 py-3 rounded-md mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Grupos</h1>
          <button
            onClick={() => navigate('/menu')}
            className="text-purple-600 text-2xl hover:text-green-400"
          >
            ←
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {/* Create Group Button */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-4">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl shadow-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105"
        >
          <div className="text-2xl mb-1">🏠</div>
          <div className="font-semibold">Crear Nuevo Grupo</div>
        </button>
      </div>

      {/* Create Group Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Crear Nuevo Grupo</h2>
          <form onSubmit={createGroup}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Grupo *
              </label>
              <input
                type="text"
                name="nombre"
                value={newGroup.nombre}
                onChange={handleInputChange}
                placeholder="Nombre del grupo"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                name="descripcion"
                value={newGroup.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción del grupo"
                rows="3"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600"
              >
                Crear Grupo
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewGroup({ nombre: "", descripcion: "" });
                }}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Groups List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Mis Grupos ({groups.length})
          </h2>
        </div>
        
        {groups.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 text-4xl mb-4">🏠</div>
            <p className="text-gray-600 mb-2">No perteneces a ningún grupo</p>
            <p className="text-sm text-gray-500">
              Crea un nuevo grupo o únete a uno existente
            </p>
          </div>
        ) : (
          <div>
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => startGroupChat(group)}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    🏠
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{group.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {group.descripcion || 'Sin descripción'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Creado por: Usuario {group.creador_id}
                    </p>
                  </div>
                </div>
                <div className="text-gray-400">
                  💬
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 