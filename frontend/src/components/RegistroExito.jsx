import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegistroExito() {
  const navigate = useNavigate();
  const [count, setCount] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => setCount((c) => c - 1), 1000);
    if (count === 0) navigate("/login");
    return () => clearInterval(timer);
  }, [count, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-3xl font-bold text-green-500 mb-4">
          ¡Usuario registrado exitosamente!
        </h2>
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-4">
          🎉 Tu cuenta ha sido creada y verificada correctamente.  
          Ya puedes iniciar sesión y comenzar a usar la aplicación.
        </div>
        <p className="text-gray-500 mb-4">
          Serás redirigido al inicio de sesión en{" "}
          <span className="font-bold text-indigo-500">{count}</span> segundos...
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600"
        >
          🚀 Ir al inicio de sesión
        </button>
      </div>
    </div>
  );
}
