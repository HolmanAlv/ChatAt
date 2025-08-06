import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Friends({ currentUserId }) {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (currentUserId) {
      fetchFriends();
      fetchPendingRequests();
    }
  }, [currentUserId]);

  const fetchFriends = async () => {
    try {
      const response = await fetch(`/friends/user/${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(`/friends/pending/${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        // Filter out current user and existing friends
        const filteredData = data.filter(user => 
          user.id !== currentUserId && 
          !friends.some(friend => friend.id === user.id)
        );
        setSearchResults(filteredData);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const sendFriendRequest = async (friendId) => {
    try {
      const response = await fetch('/friends/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: currentUserId,
          amigo_id: friendId,
          estado: 'pending'
        })
      });

      if (response.ok) {
        setMessage('Solicitud de amistad enviada');
        setSearchResults([]);
        setSearchQuery("");
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Error al enviar solicitud');
      }
    } catch (error) {
      setMessage('Error al enviar solicitud');
    }

    setTimeout(() => setMessage(""), 3000);
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      const response = await fetch(`/friends/${requestId}/accept`, {
        method: 'PUT'
      });

      if (response.ok) {
        setMessage('Solicitud aceptada');
        fetchPendingRequests();
        fetchFriends();
      } else {
        setMessage('Error al aceptar solicitud');
      }
    } catch (error) {
      setMessage('Error al aceptar solicitud');
    }

    setTimeout(() => setMessage(""), 3000);
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      const response = await fetch(`/friends/${requestId}/reject`, {
        method: 'PUT'
      });

      if (response.ok) {
        setMessage('Solicitud rechazada');
        fetchPendingRequests();
      } else {
        setMessage('Error al rechazar solicitud');
      }
    } catch (error) {
      setMessage('Error al rechazar solicitud');
    }

    setTimeout(() => setMessage(""), 3000);
  };

  const startChat = (friend) => {
    navigate('/chat', {
      state: {
        chatId: friend.id,
        chatName: `${friend.nombre} ${friend.apellido}`,
        chatType: 'direct',
        recipientId: friend.id,
        groupId: null,
        currentUserId: currentUserId
      }
    });
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 p-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <span className="ml-3 text-gray-600">Cargando amigos...</span>
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
          <h1 className="text-2xl font-bold text-gray-800">Amigos</h1>
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

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Buscar Usuarios</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Buscar por nombre o email..."
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
        />
        
        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2">
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-semibold">{user.nombre} {user.apellido}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={() => sendFriendRequest(user.id)}
                  className="bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-600 text-sm"
                >
                  Agregar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Solicitudes Pendientes</h2>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                <div>
                  <p className="font-semibold">{request.nombre} {request.apellido}</p>
                  <p className="text-sm text-gray-500">{request.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptFriendRequest(request.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 text-sm"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(request.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Mis Amigos ({friends.length})
          </h2>
        </div>
        
        {friends.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 text-4xl mb-4">👥</div>
            <p className="text-gray-600 mb-2">No tienes amigos aún</p>
            <p className="text-sm text-gray-500">
              Busca usuarios y envíales solicitudes de amistad
            </p>
          </div>
        ) : (
          <div>
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => startChat(friend)}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {friend.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {friend.nombre} {friend.apellido}
                    </p>
                    <p className="text-sm text-gray-500">{friend.email}</p>
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