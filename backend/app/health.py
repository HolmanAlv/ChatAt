from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    print("¡La ruta raíz ha sido llamada!")
    return {"status": "ok"}