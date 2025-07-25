from fastapi import FastAPI
from app.database import engine, Base
from app.routers import users, friends, groups, messages, content
from app.routers import auth

app = FastAPI(title="Messaging API")

# Incluir routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(friends.router, prefix="/friends", tags=["friends"])
app.include_router(groups.router, prefix="/groups", tags=["groups"])
app.include_router(messages.router, prefix="/messages", tags=["messages"])
app.include_router(content.router, prefix="/content", tags=["content"])
