import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [mensaje, setMensaje] = useState("");
  const [success, setSuccess] = useState(false);
  const [errores, setErrores] = useState({ email: "", password: "" });
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    image_url: "",
    password: "",
  });

  const navigate = useNavigate();

  // Validación de correo
  const validarEmail = (email) => {
    if (!email.includes("@")) {
      return "El correo debe contener una '@'.";
    }
    return "";
  };

  // Validación de contraseña
  const validarPassword = (password) => {
    const regexPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regexPassword.test(password)) {
      return "La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.";
    }
    return "";
  };

  // Manejo de cambios con validación en tiempo real
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

    // Verificamos errores antes de enviar
    const emailError = validarEmail(form.email);
    const passwordError = validarPassword(form.password);
    if (emailError || passwordError) {
      setErrores({ email: emailError, password: passwordError });
      return;
    }

    try {
      const resp = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (resp.status !== 201) {
        setMensaje("Error al registrar, correo ya registrado");
        setSuccess(false);
        return;
      }

      const data = await resp.json();
      setMensaje(data.mensaje || "¡Usuario registrado exitosamente!");
      setSuccess(true);
      navigate("/registro-exito");
    } catch (error) {
      setMensaje("Error al registrar usuario.");
      setSuccess(false);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          📝 Registro de Usuario
        </h2>

        {mensaje && (
          <div
            className={`p-3 rounded-md mb-4 ${
              success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
            required
          />

          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={form.apellido}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
            required
          />

          <input
            type="text"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 ${
              errores.email ? "border-red-500" : ""
            }`}
            required
          />
          {errores.email && (
            <p className="text-red-500 text-sm">{errores.email}</p>
          )}

          {/* Campo de imagen */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Imagen de perfil
            </label>
            <input
              type="file"
              name="image_url"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setForm({ ...form, image_url: reader.result });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full border rounded-md px-3 py-2"
            />
            {form.image_url && (
              <img
                src={form.image_url}
                alt="Vista previa"
                className="mt-2 h-20 w-20 object-cover rounded-full"
              />
            )}
          </div>

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 ${
              errores.password ? "border-red-500" : ""
            }`}
            required
          />
          {errores.password && (
            <p className="text-red-500 text-sm">{errores.password}</p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-3 rounded-md hover:bg-indigo-600"
          >
            ✅ Registrarse
          </button>
        </form>

        <p className="mt-4 text-center">
          ¿Ya tienes cuenta?{" "}
          <a
            href="/login"
            className="text-indigo-500 hover:underline font-semibold"
          >
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}
