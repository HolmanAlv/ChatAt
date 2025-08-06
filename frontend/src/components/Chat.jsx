import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import websocketService from "../services/websocket";

export default function Chat({ 
  nombre = "Usuario", 
  tipo = "Privado", 
  mensajes = [], 
  recipientId = null,
  groupId = null,
  currentUserId = null 
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [chatInfo, setChatInfo] = useState({
    nombre: nombre,
    tipo: tipo,
    recipientId: recipientId,
    groupId: groupId,
    currentUserId: currentUserId
  });
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get chat info from route state or URL params
  useEffect(() => {
    if (location.state) {
      const { chatName, chatType, recipientId, groupId, currentUserId } = location.state;
      setChatInfo({
        nombre: chatName || nombre,
        tipo: chatType === 'direct' ? 'Privado' : 'Grupo',
        recipientId: recipientId,
        groupId: groupId,
        currentUserId: currentUserId
      });
    } else {
      // Fallback to props
      setChatInfo({
        nombre: nombre,
        tipo: tipo,
        recipientId: recipientId,
        groupId: groupId,
        currentUserId: currentUserId
      });
    }
  }, [location.state, nombre, tipo, recipientId, groupId, currentUserId]);

  // Load messages from backend
  useEffect(() => {
    if (chatInfo.currentUserId && (chatInfo.recipientId || chatInfo.groupId)) {
      loadMessages();
    }
  }, [chatInfo]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      let messagesResponse;
      
      if (chatInfo.recipientId) {
        // Direct chat
        messagesResponse = await fetch(`/messages/conversation/${chatInfo.currentUserId}/${chatInfo.recipientId}`);
      } else if (chatInfo.groupId) {
        // Group chat
        messagesResponse = await fetch(`/messages/group/${chatInfo.groupId}`);
      }
      
      if (messagesResponse && messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        const formattedMessages = messagesData.map(msg => ({
          id: msg.id,
          texto: msg.texto || (msg.contenidos && msg.contenidos[0]?.texto) || '',
          emisor: msg.emisor_id,
          fecha: new Date(msg.fecha_envio).toLocaleTimeString(),
          estado: msg.estado_lectura === 'leído' ? 'Leído' : 'Enviado',
          propietario: msg.emisor_id === chatInfo.currentUserId,
          respuesta_a: msg.reply_to_id
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (chatInfo.currentUserId) {
      websocketService.connect(chatInfo.currentUserId);
      
      // Set up connection status handler
      const handleConnection = (status) => {
        setConnectionStatus(status);
        console.log('WebSocket connection status:', status);
      };
      
      websocketService.onConnection(handleConnection);
      
      // Set up message handlers
      websocketService.onMessage('new_message', handleNewMessage);
      websocketService.onMessage('message_sent', handleMessageSent);
      websocketService.onMessage('typing_indicator', handleTypingIndicator);
      websocketService.onMessage('read_receipt', handleReadReceipt);
      websocketService.onMessage('connection_established', handleConnectionEstablished);
      
      return () => {
        websocketService.offConnection(handleConnection);
        websocketService.disconnect();
      };
    }
  }, [chatInfo.currentUserId]);

  const handleNewMessage = (data) => {
    // Only handle messages for this specific chat
    const isRelevantMessage = (
      (data.recipient_id && data.recipient_id === chatInfo.currentUserId && data.sender_id === chatInfo.recipientId) ||
      (data.group_id && data.group_id === chatInfo.groupId) ||
      (data.sender_id === chatInfo.currentUserId && data.recipient_id === chatInfo.recipientId)
    );

    if (!isRelevantMessage) return;

    const newMessage = {
      id: data.message_id,
      texto: data.message,
      emisor: data.sender_id,
      fecha: new Date(data.timestamp).toLocaleTimeString(),
      estado: "Recibido",
      propietario: data.sender_id === chatInfo.currentUserId,
      respuesta_a: data.reply_to_id
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Send read receipt if message is from another user
    if (data.sender_id !== chatInfo.currentUserId) {
      websocketService.sendReadReceipt(data.message_id, data.sender_id);
    }
  };

  const handleMessageSent = (data) => {
    console.log('Message sent successfully:', data.message_id);
  };

  const handleTypingIndicator = (data) => {
    // Only handle typing indicators for this specific chat
    const isRelevantTyping = (
      (data.recipient_id && data.recipient_id === chatInfo.currentUserId && data.user_id === chatInfo.recipientId) ||
      (data.group_id && data.group_id === chatInfo.groupId)
    );

    if (!isRelevantTyping || data.user_id === chatInfo.currentUserId) return;

    if (data.is_typing) {
      setTypingUsers(prev => new Set(prev).add(data.user_id));
    } else {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.user_id);
        return newSet;
      });
    }
  };

  const handleReadReceipt = (data) => {
    console.log('Read receipt received:', data);
  };

  const handleConnectionEstablished = (data) => {
    console.log('Connection established:', data);
  };

  const enviarMensaje = (e) => {
    e.preventDefault();
    
    if (!nuevoMensaje.trim()) return;
    
    const success = websocketService.sendMessage(
      chatInfo.recipientId, 
      chatInfo.groupId, 
      nuevoMensaje.trim()
    );
    
    if (success) {
      // Add message to local state immediately for optimistic UI
      const optimisticMessage = {
        id: Date.now(), // Temporary ID
        texto: nuevoMensaje.trim(),
        emisor: chatInfo.currentUserId,
        fecha: new Date().toLocaleTimeString(),
        estado: "Enviado",
        propietario: true
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      setNuevoMensaje("");
      
      // Stop typing indicator
      websocketService.sendTypingIndicator(chatInfo.recipientId, chatInfo.groupId, false);
      setIsTyping(false);
    } else {
      console.error('Failed to send message');
    }
  };

  const handleTyping = (e) => {
    setNuevoMensaje(e.target.value);
    
    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      websocketService.sendTypingIndicator(chatInfo.recipientId, chatInfo.groupId, true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      websocketService.sendTypingIndicator(chatInfo.recipientId, chatInfo.groupId, false);
    }, 2000);
  };

  const getTypingIndicator = () => {
    if (typingUsers.size === 0) return null;
    
    const userNames = Array.from(typingUsers).map(id => 
      id === chatInfo.currentUserId ? 'Tú' : `Usuario ${id}`
    );
    
    return (
      <div className="text-sm text-gray-500 italic mb-2">
        {userNames.join(', ')} está{userNames.length > 1 ? 'n' : ''} escribiendo...
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 p-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <span className="ml-3 text-gray-600">Cargando mensajes...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 p-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white shadow-md px-4 py-3 rounded-md mb-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/chats')}
            className="text-purple-600 text-2xl mr-3 hover:text-green-400"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 truncate">{chatInfo.nombre}</h2>
            <p className="text-sm text-gray-500">{chatInfo.tipo}</p>
          </div>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="text-xs text-gray-500">
            {connectionStatus === 'connected' ? 'Conectado' : 
             connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Contenedor mensajes */}
      <div className="bg-white rounded-xl shadow-md p-4 h-[60vh] overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">💬</div>
            <p>No hay mensajes aún</p>
            <p className="text-sm">¡Comienza la conversación!</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`mb-3 p-3 rounded-lg max-w-[85%] break-words ${
                m.propietario
                  ? "bg-green-100 ml-auto text-right"
                  : "bg-gray-100 mr-auto text-left"
              } ${m.propietario ? "border border-green-400" : ""}`}
            >
              {chatInfo.tipo === "Grupo" && !m.propietario && (
                <strong className="text-purple-600 block mb-1">Usuario {m.emisor}</strong>
              )}
              {m.respuesta_a && (
                <div className="bg-gray-50 border-l-4 border-blue-400 p-2 mb-1 text-sm">
                  En respuesta a mensaje #{m.respuesta_a}
                </div>
              )}
              <p>{m.texto}</p>
              <small className="block text-gray-400">{m.fecha}</small>
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {getTypingIndicator()}
        
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulario nuevo mensaje */}
      <form
        onSubmit={enviarMensaje}
        className="flex items-center gap-2 bg-white p-3 rounded-md shadow-md"
      >
        <input
          type="text"
          value={nuevoMensaje}
          onChange={handleTyping}
          placeholder="Escribe tu mensaje..."
          className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
          disabled={connectionStatus !== 'connected'}
        />
        <button
          type="submit"
          disabled={!nuevoMensaje.trim() || connectionStatus !== 'connected'}
          className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}