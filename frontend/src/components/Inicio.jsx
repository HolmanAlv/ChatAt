import { useNavigate } from "react-router-dom";

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="text-5xl mb-3">💬</div>
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Bienvenido a ChatAt</h1>
        <p className="text-gray-500 mb-6">Tu app de mensajería moderna y segura</p>
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-indigo-500 text-white py-3 rounded-md mb-4 hover:bg-indigo-600"
        >
          Iniciar Sesión
        </button>
        <button
          onClick={() => navigate("/register")}
          className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600"
        >
          Registrarse
        </button>
      </div>
    </div>
  );
}
