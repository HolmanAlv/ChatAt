# 📱 ChatAt

Aplicación de mensajería en tiempo real, al estilo WhatsApp, con chats privados y grupales, amistades y envío de archivos. Es un proyecto académico en equipo de 2025.

## ⚙️ Stack

- **Backend:** FastAPI, SQLAlchemy y PostgreSQL 15. Los mensajes llegan en tiempo real por WebSocket y las contraseñas se guardan con hash bcrypt.
- **Frontend:** React 19 (Create React App) con React Router y TailwindCSS, servido con nginx.
- **Infra:** Docker Compose (backend, frontend y base de datos con el esquema inicial cargado).

## ✨ Funcionalidades

- Registro e inicio de sesión.
- Búsqueda de usuarios y solicitudes de amistad (enviar, aceptar, rechazar).
- Chats privados y grupales; grupos con enlace de invitación (token) y gestión de miembros.
- Adjuntos (imágenes, video, audio, PDF, Word, Excel…) con vista previa.
- Entrega en tiempo real: al enviar un mensaje, el backend lo empuja por WebSocket a los destinatarios conectados.

## 🚀 Cómo correrlo

```bash
cp .env.example .env
docker compose up --build
```

| Componente | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API y Swagger | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

Sin Docker (requiere Python 3.10+, Node.js 18+ y PostgreSQL con `database/init.sql` cargado; `PGHOST=localhost` en `.env`):

```bash
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
cd frontend && npm install && npm start
```

## 📂 Estructura

```
backend/app/routers/   auth, users, friends, groups, messages, content, ws
backend/app/models/    modelos SQLAlchemy
backend/app/schemas/   validación y formato de datos
database/init.sql      esquema de PostgreSQL
frontend/src/          componentes React (Login, Register, MenuPrincipal, Chat)
```

## 🧑‍💻 Autor

Desarrollado por <Localhost Inc./> con fines académicos y de aprendizaje.
