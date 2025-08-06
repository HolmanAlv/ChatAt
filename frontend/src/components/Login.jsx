import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [mensaje, setMensaje] = useState("");
  const [success, setSuccess] = useState(false);
  const [errores, setErrores] = useState({ email: "", password: "" });
  const [form, setForm] = useState({ email: "", password: "" });

  const navigate = useNavigate();

  // Validación simple de email
  const validarEmail = (email) => {
    if (!email.includes("@")) return "El correo debe contener '@'.";
    return "";
  };

  // Validación simple de password
  const validarPassword = (password) => {
    if (!password) return "La contraseña es requerida.";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "email") {
      setErrores((prev) => ({ ...prev, email: validarEmail(value) }));
    }
    if (name === "password") {
      setErrores((prev) => ({ ...prev, password: validarPassword(value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setSuccess(false);

    const emailError = validarEmail(form.email);
    const passwordError = validarPassword(form.password);
    if (emailError || passwordError) {
      setErrores({ email: emailError, password: passwordError });
      return;
    }

    try {
      const resp = await fetch("auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.detail || "Credenciales inválidas");
      }

      const data = await resp.json();
      // Guardar ID del usuario en localStorage
      localStorage.setItem("userId", data.id);
      // Opcional: también puedes guardar el nombre completo si lo usas mucho
      localStorage.setItem("userName", `${data.nombre} ${data.apellido}`);

      setMensaje(`Bienvenido ${data.nombre} ${data.apellido}!`);
      setSuccess(true);

      setTimeout(() => navigate("/menu"), 1000);
    } catch (error) {
      setMensaje(error.message);
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="text-5xl mb-3">🔑</div>
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Iniciar Sesión</h1>
        <p className="text-gray-500 mb-6">
          Accede a tu cuenta para comenzar a chatear
        </p>
        {mensaje && (
          <div
            className={`p-3 rounded-md mb-4 ${
              success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
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
            className={`w-full border rounded-md px-3 py-2 mb-2 focus:outline-none focus:ring focus:ring-indigo-300 ${
              errores.email ? "border-red-500" : ""
            }`}
            required
          />
          {errores.email && (
            <p className="text-red-500 text-sm mb-2">{errores.email}</p>
          )}

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Contraseña"
            className={`w-full border rounded-md px-3 py-2 mb-2 focus:outline-none focus:ring focus:ring-indigo-300 ${
              errores.password ? "border-red-500" : ""
            }`}
            required
          />
          {errores.password && (
            <p className="text-red-500 text-sm mb-2">{errores.password}</p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-3 rounded-md hover:bg-indigo-600 mt-2"
          >
            Entrar
          </button>
        </form>
        <p className="mt-4">
          ¿No tienes cuenta?{" "}
          <a
            href="/register"
            className="text-indigo-500 hover:underline font-semibold"
          >
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}
