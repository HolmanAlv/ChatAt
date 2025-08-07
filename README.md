# 📱 Sistema de Mensajería tipo WhatsApp

Este proyecto es una app de mensajería en tiempo real inspirada en WhatsApp. Incluye funcionalidades como:
- Chats privados y grupales
- Envío de mensajes con texto
- Archivos adjuntos (imágenes, videos, audio, PDF, Word, Excel, etc.)
- Vista previa de archivos
- Interfaz moderna y responsiva con React + Tailwind
- Backend robusto con FastAPI + PostgreSQL

---

## ⚙️ Tecnologías utilizadas

**Frontend:**
- React (con Vite)
- TailwindCSS

**Backend:**
- FastAPI (Python)
- SQLAlchemy
- PostgreSQL

---

## 🧪 Cómo ejecutar el proyecto

### 🔧 Requisitos
- Python 3.10+
- Node.js 18+
- PostgreSQL 13+
- Git

---

### 🚀 Backend (FastAPI)

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/tu_usuario/tu_repo.git
   cd tu_repo/backend
Crear entorno virtual

python -m venv venv
source venv/bin/activate  # o .\venv\Scripts\activate en Windows

Instalar dependencias

pip install -r requirements.txt

Configurar base de datos

Crear base de datos PostgreSQL:

    CREATE DATABASE chatapp;

Ajustar la URL en .env o database.py:

    postgresql://usuario:contraseña@localhost/chatapp

Ejecutar script SQL para crear tablas

    psql -U tu_usuario -d chatapp -f Modelo.sql

Iniciar servidor FastAPI

    uvicorn app.main:app --reload

📍 Disponible en: http://localhost:8000

🌐 Frontend (React)

  Ir a carpeta del frontend  

    cd ../frontend

  Instalar dependencias

    npm install

  Configurar backend
  
  En src/config.js:

    export const getBackendUrl = () => "http://localhost:8000";

  Ejecutar

    npm run dev

  📍 Disponible en: http://localhost:3000

🌉 Puertos utilizados
Componente	Puerto
Backend	localhost:8000
Frontend	localhost:3000
PostgreSQL	5432 (por defecto)
📂 Recursos clave

    Modelo.sql: estructura de base de datos

    Chat.jsx: interfaz principal de mensajería

    content/: almacenamiento de archivos

    schemas.py: validación y formato de datos

🧑‍💻 Autor

    Desarrollado por <Localhost Inc./> con fines académicos y de aprendizaje.
