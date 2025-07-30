import { useState } from "react";

export default function Register() {
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMensaje("Función de registro pendiente...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          📝 Registro de Usuario
        </h2>
        {mensaje && (
          <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{mensaje}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <select className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300">
            <option>Seleccione una ubicación</option>
          </select>
          <input
            type="text"
            placeholder="Nombre"
            className="w-full border rounded-md px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Apellido"
            className="w-full border rounded-md px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Usuario"
            className="w-full border rounded-md px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full border rounded-md px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Celular"
            className="w-full border rounded-md px-3 py-2"
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-3 rounded-md hover:bg-indigo-600"
          >
            ✅ Registrarse
          </button>
        </form>
        <p className="mt-4 text-center">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-indigo-500 hover:underline font-semibold">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}
