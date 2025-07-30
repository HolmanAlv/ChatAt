import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Inicio from "./components/Inicio";
import Login from "./components/Login";
import Register from "./components/Register";
import RegistroExito from "./components/RegistroExito";
import Chat from "./components/Chat";
import MenuPrincipal from "./components/MenuPrincipal";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/registro-exito" element={<RegistroExito />} />
        <Route path="/chat" element={<Chat />} />
        {/* <Route path="/menu" element={<MenuPrincipal />} /> */}
        <Route
  path="/menu"
  element={
    <MenuPrincipal
      nombre="Carlos López"
      fecha="29/07/2025"
      chats={[
        {
          codigo: 1,
          nombre: "Grupo de Trabajo",
          tipo: "Grupo",
          ultimo_mensaje: "Revisar entrega final",
          hora_ultimo_mensaje: "09:30",
          nuevos_mensajes: 3,
        },
        {
          codigo: 2,
          nombre: "Sofía Martínez",
          tipo: "Privado",
          ultimo_mensaje: "¿Listo para la reunión?",
          hora_ultimo_mensaje: "08:15",
          nuevos_mensajes: 1,
        },
        {
          codigo: 3,
          nombre: "Equipo Desarrollo",
          tipo: "Grupo",
          ultimo_mensaje: "Push al repositorio hecho",
          hora_ultimo_mensaje: "Ayer",
          nuevos_mensajes: 0,
        },
      ]}
    />
  }
/>

      </Routes>
    </Router>
  );
}
