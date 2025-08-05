import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

PGHOST = os.getenv("PGHOST")
PGPORT = os.getenv("PGPORT")
PGDATABASE = os.getenv("PGDATABASE")
PGUSER = os.getenv("PGUSER")
PGPASSWORD = os.getenv("PGPASSWORD")

print(f"Configuración de base de datos:")
print(f"Host: {PGHOST}")
print(f"Port: {PGPORT}")
print(f"Database: {PGDATABASE}")
print(f"User: {PGUSER}")
print(f"Password: {'*' * len(PGPASSWORD) if PGPASSWORD else 'None'}")

DATABASE_URL = f"postgresql://{PGUSER}:{PGPASSWORD}@{PGHOST}:{PGPORT}/{PGDATABASE}"
print(f"\nURL de conexión: {DATABASE_URL}")

try:
    engine = create_engine(DATABASE_URL, echo=True)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        version = result.fetchone()
        print(f"\n✅ Conexión exitosa!")
        print(f"Versión de PostgreSQL: {version[0]}")
        
        # Verificar si la tabla usuario existe
        result = connection.execute(text("SELECT COUNT(*) FROM usuario;"))
        count = result.fetchone()
        print(f"Usuarios en la tabla: {count[0]}")
        
except Exception as e:
    print(f"\n❌ Error de conexión: {e}") 