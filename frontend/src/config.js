// Configuración del backend
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

// Configuración para diferentes entornos
export const getBackendUrl = () => {
  // En producción, usar la URL del servidor
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_BACKEND_URL || window.location.origin.replace(':3000', ':8000');
  }
  // En desarrollo, usar localhost
  return BACKEND_URL;
};
