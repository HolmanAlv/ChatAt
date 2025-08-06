from fastapi import FastAPI
from app.database import engine, Base
from app.routers import users, friends, groups, messages, content, ws
from app.routers import auth
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os




"""
Ejecutar ubicado en backend/:
uvicorn app.main:app --reload
"""

app = FastAPI(title="Messaging API")
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.path.exists("static"):
    os.makedirs("static")

app.mount("/static", StaticFiles(directory="static"), name="static")


# Incluir routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(friends.router, prefix="/friends", tags=["friends"])
app.include_router(groups.router, prefix="/groups", tags=["groups"])
app.include_router(messages.router, prefix="/messages", tags=["messages"])
app.include_router(content.router, prefix="/content", tags=["content"])
app.include_router(ws.router, prefix="/ws", tags=["websocket"])
