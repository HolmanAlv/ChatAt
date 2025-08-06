import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Inicio from "./components/Inicio";
import Login from "./components/Login";
import Register from "./components/Register";
import RegistroExito from "./components/RegistroExito";
import Chat from "./components/Chat";
import ChatList from "./components/ChatList";
import Friends from "./components/Friends";
import Groups from "./components/Groups";
import MenuPrincipal from "./components/MenuPrincipal";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/registro-exito" element={<RegistroExito />} />
        <Route 
          path="/chat" 
          element={
            <Chat 
              nombre={currentUser?.nombre || "Usuario"}
              tipo="Privado"
              mensajes={[]}
              recipientId={null}
              groupId={null}
              currentUserId={currentUser?.id}
            />
          } 
        />
        <Route 
          path="/chats" 
          element={<ChatList currentUserId={currentUser?.id} />} 
        />
        <Route 
          path="/friends" 
          element={<Friends currentUserId={currentUser?.id} />} 
        />
        <Route 
          path="/groups" 
          element={<Groups currentUserId={currentUser?.id} />} 
        />
        <Route 
          path="/menu" 
          element={<MenuPrincipal user={currentUser} onLogout={handleLogout} />} 
        />
      </Routes>
    </Router>
  );
}
