class WebSocketService {
  constructor() {
    this.ws = null;
    this.userId = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.connectionHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(userId) {
    if (this.ws && this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }

    this.userId = userId;
    const wsUrl = `ws://localhost:8000/ws/${userId}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyConnectionHandlers('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.notifyConnectionHandlers('disconnected');
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connect(this.userId);
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyConnectionHandlers('error');
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
      this.isConnected = false;
      this.userId = null;
    }
  }

  sendMessage(recipientId = null, groupId = null, message = '', messageType = 'text', replyToId = null) {
    if (!this.isConnected || !this.ws) {
      console.error('WebSocket not connected');
      return false;
    }

    const data = {
      type: 'message',
      recipient_id: recipientId,
      group_id: groupId,
      message: message,
      message_type: messageType,
      reply_to_id: replyToId,
      timestamp: new Date().toISOString()
    };

    try {
      this.ws.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  sendTypingIndicator(recipientId = null, groupId = null, isTyping = true) {
    if (!this.isConnected || !this.ws) {
      return false;
    }

    const data = {
      type: 'typing',
      recipient_id: recipientId,
      group_id: groupId,
      is_typing: isTyping,
      timestamp: new Date().toISOString()
    };

    try {
      this.ws.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error sending typing indicator:', error);
      return false;
    }
  }

  sendReadReceipt(messageId, senderId) {
    if (!this.isConnected || !this.ws) {
      return false;
    }

    const data = {
      type: 'read_receipt',
      message_id: messageId,
      sender_id: senderId,
      timestamp: new Date().toISOString()
    };

    try {
      this.ws.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error sending read receipt:', error);
      return false;
    }
  }

  handleMessage(data) {
    const messageType = data.type;
    
    if (this.messageHandlers.has(messageType)) {
      this.messageHandlers.get(messageType).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in message handler for ${messageType}:`, error);
        }
      });
    } else {
      console.log('Unhandled message type:', messageType, data);
    }
  }

  onMessage(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType).push(handler);
  }

  onConnection(handler) {
    this.connectionHandlers.set(handler, handler);
  }

  offConnection(handler) {
    this.connectionHandlers.delete(handler);
  }

  notifyConnectionHandlers(status) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(status);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  ping() {
    if (this.isConnected && this.ws) {
      const data = {
        type: 'ping',
        timestamp: new Date().toISOString()
      };
      this.ws.send(JSON.stringify(data));
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      userId: this.userId
    };
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService; 