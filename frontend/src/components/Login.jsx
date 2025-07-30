import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [mensaje, setMensaje] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    try {
      const resp = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (resp.status !== 200) {
        throw new Error("Error al iniciar sesión");
      }

      const data = await resp.json();
      setMensaje(data.mensaje || "¡Inicio de sesión exitoso!");
      setSuccess(true);

      setTimeout(() => {
        navigate("/menu");
      }, 1000); // Puedes ajustar o eliminar el delay
    } catch (error) {
      setMensaje("Error al iniciar sesión.");
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="text-5xl mb-3">🔑</div>
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Iniciar Sesión</h1>
        <p className="text-gray-500 mb-6">Accede a tu cuenta para comenzar a chatear</p>
        {mensaje && (
          <div className={`p-3 rounded-md mb-4 ${success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {mensaje}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Correo Electrónico"
            className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring focus:ring-indigo-300"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Contraseña"
            className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring focus:ring-indigo-300"
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-3 rounded-md hover:bg-indigo-600"
          >
            Entrar
          </button>
        </form>
        <p className="mt-4">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="text-indigo-500 hover:underline font-semibold">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}
