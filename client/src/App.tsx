import { useEffect, useState } from 'react';
import { useSocket } from './services/useSocket';
import './App.css'; // Import the CSS file

export function App() {
  const {
    connected,
    messages,
    room,
    joinRoom,
    leaveRoom,
    sendMessageToRoom,
    broadcastMessage,
    sendRequest,
  } = useSocket();

  const [newMessage, setNewMessage] = useState<string>('');
  const [roomName, setRoomName] = useState<string>(''); // State for room name input

  useEffect(() => {
    if (connected) {
      joinRoom('general'); // Join a default room when connected
    }
  }, [connected]);

  const handleMessageSend = () => {
    if (newMessage.trim()) {
      sendMessageToRoom(newMessage);
      setNewMessage(''); // Clear message input
    }
  };

  return (
    <div className="chat-container">
      <div className="header">
        <div className="room-name">{room || 'No Room - Only Broadcast Available'}</div>
        {room && <button onClick={() => leaveRoom(room)}>Leave</button>}
      </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${typeof msg === 'string' ? 'sent' : 'received'}`}
          >
            {typeof msg === 'string' ? msg : JSON.stringify(msg)}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleMessageSend}>Send</button>
      </div>

      {/* Room Management Section */}
      <div className="room-management">
        <input
          type="text"
          placeholder="Room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button onClick={() => joinRoom(roomName)}>Join Room</button>
      </div>

      {/* Broadcast Message Section */}
      <div className="broadcast-message">
        <button onClick={() => broadcastMessage(newMessage)}>Broadcast Message</button>
      </div>

      <button onClick={() => sendRequest('Sample data', (response) => console.log('Request callback:', response))}>
        Send Request
      </button>
    </div>
  );
}

export default App;
