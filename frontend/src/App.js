import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Inicio from "./components/Inicio";
import Login from "./components/Login";
import Register from "./components/Register";
import RegistroExito from "./components/RegistroExito";
import Chat from "./components/Chat";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/registro-exito" element={<RegistroExito />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}
