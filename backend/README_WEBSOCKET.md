# WebSocket Messaging System

This project implements a real-time messaging system using WebSockets with FastAPI. Users can send messages to each other in real-time, with support for typing indicators, read receipts, and message status updates.

## Features

- **Real-time messaging** between users
- **Typing indicators** - shows when someone is typing
- **Read receipts** - confirms when messages are read
- **Message status** - tracks sent, delivered, and read status
- **Group messaging** support
- **Connection management** - handles multiple connections per user
- **Error handling** - robust error handling and reconnection logic

## API Endpoints

### WebSocket Endpoints

- `GET /ws/{user_id}` - WebSocket connection for real-time messaging
- `GET /ws/online-users` - Get list of currently online users

### REST API Endpoints

- `POST /messages/` - Create a new message
- `GET /messages/` - Get messages between users or in a group
- `PUT /messages/{message_id}/read` - Mark message as read
- `GET /messages/conversations/{user_id}` - Get user conversations

## Message Types

### WebSocket Message Types

1. **Connection Messages**
   ```json
   {
     "type": "connection_established",
     "user_id": 1,
     "timestamp": "2024-01-01T12:00:00"
   }
   ```

2. **Chat Messages**
   ```json
   {
     "type": "message",
     "recipient_id": 2,
     "message": "Hello!",
     "message_type": "text",
     "timestamp": "2024-01-01T12:00:00"
   }
   ```

3. **Typing Indicators**
   ```json
   {
     "type": "typing",
     "recipient_id": 2,
     "is_typing": true,
     "timestamp": "2024-01-01T12:00:00"
   }
   ```

4. **Read Receipts**
   ```json
   {
     "type": "read_receipt",
     "message_id": 123,
     "sender_id": 1,
     "timestamp": "2024-01-01T12:00:00"
   }
   ```

5. **Ping/Pong**
   ```json
   {
     "type": "ping",
     "timestamp": "2024-01-01T12:00:00"
   }
   ```

## Getting Started

### 1. Start the Server

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload
```

The server will be available at `http://localhost:8000`

### 2. Test with Python Client

```bash
# Install websockets library
pip install websockets

# Run the test client
python test_websocket_client.py
```

### 3. Test with Browser Client

1. Open `websocket_test.html` in your browser
2. Enter your User ID (e.g., 1)
3. Click "Connect"
4. Enter recipient ID and message
5. Click "Send Message"

## Usage Examples

### JavaScript Client Example

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8000/ws/1');

// Send a message
ws.send(JSON.stringify({
    type: 'message',
    recipient_id: 2,
    message: 'Hello!',
    message_type: 'text',
    timestamp: new Date().toISOString()
}));

// Send typing indicator
ws.send(JSON.stringify({
    type: 'typing',
    recipient_id: 2,
    is_typing: true,
    timestamp: new Date().toISOString()
}));

// Listen for messages
ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
};
```

### Python Client Example

```python
import asyncio
import websockets
import json

async def chat_client():
    uri = "ws://localhost:8000/ws/1"
    async with websockets.connect(uri) as websocket:
        # Send message
        message = {
            "type": "message",
            "recipient_id": 2,
            "message": "Hello from Python!",
            "message_type": "text",
            "timestamp": "2024-01-01T12:00:00"
        }
        await websocket.send(json.dumps(message))
        
        # Listen for responses
        async for message in websocket:
            data = json.loads(message)
            print(f"Received: {data}")

asyncio.run(chat_client())
```

## Database Integration

The WebSocket system integrates with your existing database models:

- **Messages** are stored in the database when sent via REST API
- **Real-time notifications** are sent via WebSocket
- **Read receipts** update the database and notify senders
- **Message status** is tracked and synchronized

## Architecture

### Connection Manager

The `ConnectionManager` class handles:
- Multiple WebSocket connections per user
- Message routing to correct recipients
- Connection cleanup on disconnect
- Error handling and recovery

### Message Flow

1. **User sends message** via REST API or WebSocket
2. **Message stored** in database (if via REST API)
3. **Real-time notification** sent to recipient via WebSocket
4. **Confirmation** sent back to sender
5. **Read receipt** sent when recipient reads message

## Error Handling

The system includes robust error handling:

- **Connection failures** - automatic cleanup
- **Invalid messages** - graceful error responses
- **User not found** - proper error messages
- **Database errors** - transaction rollback

## Security Considerations

- **User validation** - verify user exists before connection
- **Message validation** - validate message format and content
- **Rate limiting** - consider implementing rate limiting
- **Authentication** - add JWT token validation for production

## Production Deployment

For production deployment:

1. **Add authentication** to WebSocket connections
2. **Implement rate limiting**
3. **Add monitoring and logging**
4. **Use Redis** for connection management across multiple servers
5. **Add SSL/TLS** for secure WebSocket connections
6. **Implement message persistence** for offline users

## Testing

### Manual Testing

1. Start the server
2. Open two browser tabs with `websocket_test.html`
3. Connect as different users
4. Send messages between them
5. Test typing indicators and read receipts

### Automated Testing

```bash
# Run the Python test client
python test_websocket_client.py

# Check server logs for connection and message events
```

## Troubleshooting

### Common Issues

1. **Connection refused** - Make sure server is running on port 8000
2. **User not found** - Ensure user IDs exist in database
3. **Messages not received** - Check recipient is online
4. **Typing indicators not working** - Verify WebSocket connection is active

### Debug Mode

Enable debug logging by setting log level in `app/routers/ws.py`:

```python
logging.basicConfig(level=logging.DEBUG)
```

## API Documentation

Once the server is running, visit:
- `http://localhost:8000/docs` - Interactive API documentation
- `http://localhost:8000/redoc` - Alternative API documentation

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include tests for new features
4. Update documentation
5. Use type hints and docstrings 