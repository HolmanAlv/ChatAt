# ChatAt - Aplicación de Chat en Tiempo Real

ChatAt es una aplicación de mensajería completa con funcionalidades de chat en tiempo real, gestión de amigos y grupos.

## 🚀 Características

### ✅ Funcionalidades Implementadas

- **Autenticación de Usuarios**
  - Registro e inicio de sesión
  - Gestión de perfiles de usuario

- **Gestión de Amigos**
  - Búsqueda de usuarios
  - Envío y aceptación de solicitudes de amistad
  - Lista de amigos

- **Chats Privados**
  - Mensajería en tiempo real entre amigos
  - Indicadores de escritura
  - Confirmaciones de lectura
  - Historial de mensajes

- **Chats de Grupo**
  - Creación de grupos
  - Mensajería grupal en tiempo real
  - Gestión de miembros

- **WebSocket Integration**
  - Conexión en tiempo real
  - Reconexión automática
  - Indicadores de estado de conexión

## 🏗️ Arquitectura

### Backend (FastAPI + PostgreSQL)
- **API REST**: Endpoints para usuarios, amigos, grupos y mensajes
- **WebSocket**: Comunicación en tiempo real
- **Base de Datos**: PostgreSQL con SQLAlchemy
- **Validaciones**: Seguridad y permisos

### Frontend (React + Tailwind CSS)
- **Interfaz Moderna**: Diseño responsive y atractivo
- **Estado Global**: Gestión de estado con React hooks
- **WebSocket Client**: Servicio para comunicación en tiempo real
- **Navegación**: React Router para rutas

## 📦 Instalación

### Prerrequisitos
- Python 3.8+
- Node.js 16+
- PostgreSQL

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 🎯 Uso

### Para Usuarios

1. **Registro/Login**
   - Crear cuenta nueva o iniciar sesión
   - Completar perfil de usuario

2. **Gestionar Amigos**
   - Buscar usuarios por nombre o email
   - Enviar solicitudes de amistad
   - Aceptar/rechazar solicitudes pendientes

3. **Chatear**
   - Ver lista de chats (privados y grupos)
   - Seleccionar chat para comenzar conversación
   - Enviar mensajes en tiempo real

4. **Crear Grupos**
   - Crear nuevos grupos
   - Invitar miembros
   - Chatear en grupo

### Para Desarrolladores

#### Estructura del Proyecto
```
ChatAt/
├── backend/
│   ├── app/
│   │   ├── routers/          # Endpoints API
│   │   ├── models/           # Modelos de BD
│   │   └── main.py          # Aplicación FastAPI
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── services/         # Servicios (WebSocket)
│   │   └── App.js           # Rutas principales
│   └── package.json
└── README.md
```

#### Endpoints Principales

**Autenticación**
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión

**Usuarios**
- `GET /users/{id}` - Obtener usuario
- `GET /users/search` - Buscar usuarios

**Amigos**
- `GET /friends/user/{id}` - Amigos del usuario
- `POST /friends/` - Enviar solicitud
- `PUT /friends/{id}/accept` - Aceptar solicitud

**Grupos**
- `GET /groups/user/{id}` - Grupos del usuario
- `POST /groups/` - Crear grupo

**Mensajes**
- `GET /messages/conversation/{user1}/{user2}` - Chat privado
- `GET /messages/group/{id}` - Chat grupal

**WebSocket**
- `WS /ws/{user_id}` - Conexión WebSocket

## 🔧 Configuración

### Variables de Entorno
```bash
# Backend
DATABASE_URL=postgresql://user:password@localhost/chatat
SECRET_KEY=your-secret-key

# Frontend
REACT_APP_API_URL=http://localhost:8000
```

### Base de Datos
```sql
-- Las tablas se crean automáticamente con SQLAlchemy
-- Usuarios, Amistades, Grupos, Mensajes, Contenido
```

## 🛡️ Seguridad

### Implementado
- ✅ Validación de amistades para chats privados
- ✅ Verificación de membresía para grupos
- ✅ Sanitización de mensajes
- ✅ Rate limiting básico

### Pendiente
- 🔒 Autenticación JWT
- 🔒 Encriptación de mensajes
- 🔒 Validación de contenido avanzada

## 📱 Características de UX

- **Interfaz Intuitiva**: Navegación clara y fácil
- **Feedback Visual**: Indicadores de estado y carga
- **Responsive Design**: Funciona en móviles y desktop
- **Tiempo Real**: Mensajes instantáneos
- **Optimistic UI**: Respuesta inmediata del usuario

## 🚀 Despliegue

### Backend (Docker)
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend (Docker)
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 🔮 Próximas Mejoras

- [ ] Notificaciones push
- [ ] Mensajes de voz
- [ ] Compartir archivos
- [ ] Emojis y reacciones
- [ ] Mensajes temporales
- [ ] Encriptación end-to-end
- [ ] Modo oscuro
- [ ] Búsqueda de mensajes

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades:
1. Revisar logs del sistema
2. Verificar configuración de red
3. Contactar al equipo de desarrollo

---

**ChatAt** - Conectando personas en tiempo real 💬 