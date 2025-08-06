import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatList({ currentUserId = null }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUserId) {
      fetchChats();
    }
  }, [currentUserId]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      
      // Fetch friends (direct chats)
      const friendsResponse = await fetch(`/friends/user/${currentUserId}`);
      const friendsData = friendsResponse.ok ? await friendsResponse.json() : [];
      
      // Fetch groups
      const groupsResponse = await fetch(`/groups/user/${currentUserId}`);
      const groupsData = groupsResponse.ok ? await groupsResponse.json() : [];
      
      // Get last messages for each chat
      const chatsWithMessages = await Promise.all([
        ...friendsData.map(async (friend) => {
          try {
            const messagesResponse = await fetch(`/messages/conversation/${currentUserId}/${friend.id}`);
            const messages = messagesResponse.ok ? await messagesResponse.json() : [];
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
            
            return {
              id: friend.id,
              name: `${friend.nombre} ${friend.apellido}`,
              type: 'direct',
              recipientId: friend.id,
              groupId: null,
              lastMessage: lastMessage?.texto || null,
              lastMessageTime: lastMessage?.fecha_envio || null,
              unreadCount: 0 // TODO: Implement unread count
            };
          } catch (error) {
            console.error('Error fetching messages for friend:', friend.id, error);
            return {
              id: friend.id,
              name: `${friend.nombre} ${friend.apellido}`,
              type: 'direct',
              recipientId: friend.id,
              groupId: null,
              lastMessage: null,
              lastMessageTime: null,
              unreadCount: 0
            };
          }
        }),
        
        ...groupsData.map(async (group) => {
          try {
            const messagesResponse = await fetch(`/messages/group/${group.id}`);
            const messages = messagesResponse.ok ? await messagesResponse.json() : [];
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
            
            return {
              id: group.id,
              name: group.nombre,
              type: 'group',
              recipientId: null,
              groupId: group.id,
              lastMessage: lastMessage?.texto || null,
              lastMessageTime: lastMessage?.fecha_envio || null,
              unreadCount: 0 // TODO: Implement unread count
            };
          } catch (error) {
            console.error('Error fetching messages for group:', group.id, error);
            return {
              id: group.id,
              name: group.nombre,
              type: 'group',
              recipientId: null,
              groupId: group.id,
              lastMessage: null,
              lastMessageTime: null,
              unreadCount: 0
            };
          }
        })
      ]);
      
      setChats(chatsWithMessages);
      
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Error al cargar los chats');
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (chat) => {
    navigate('/chat', { 
      state: { 
        chatId: chat.id,
        chatName: chat.name,
        chatType: chat.type,
        recipientId: chat.recipientId,
        groupId: chat.groupId,
        currentUserId: currentUserId
      }
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('es-ES', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 p-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <span className="ml-3 text-gray-600">Cargando chats...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 p-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={fetchChats}
              className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
            >
              Reintentar
            </button>
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
          <h1 className="text-2xl font-bold text-gray-800">Mis Chats</h1>
          <button
            onClick={() => navigate('/menu')}
            className="text-purple-600 text-2xl hover:text-green-400"
          >
            ←
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {chats.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 text-4xl mb-4">💬</div>
            <p className="text-gray-600 mb-4">No tienes chats disponibles</p>
            <p className="text-sm text-gray-500 mb-4">
              Agrega amigos o únete a grupos para comenzar a chatear
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/friends')}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
              >
                👥 Amigos
              </button>
              <button
                onClick={() => navigate('/groups')}
                className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600"
              >
                🏠 Grupos
              </button>
            </div>
          </div>
        ) : (
          <div>
            {chats.map((chat) => (
              <div
                key={`${chat.type}-${chat.id}`}
                onClick={() => handleChatClick(chat)}
                className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  {chat.type === 'group' ? '🏠' : chat.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 truncate">{chat.name}</h3>
                    {chat.lastMessageTime && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.type === 'group' ? '🏠 ' : '👤 '}
                    {chat.lastMessage || 'Sin mensajes aún'}
                  </p>
                </div>
                
                {/* Unread count */}
                {chat.unreadCount > 0 && (
                  <div className="ml-3 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {chat.unreadCount}
                  </div>
                )}
                
                {/* Arrow */}
                <div className="text-gray-400 ml-2">
                  →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => navigate('/friends')}
          className="flex-1 bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition-colors"
        >
          👥 Amigos
        </button>
        <button
          onClick={() => navigate('/groups')}
          className="flex-1 bg-purple-500 text-white py-3 rounded-md hover:bg-purple-600 transition-colors"
        >
          🏠 Grupos
        </button>
      </div>
    </div>
  );
} 