import os
import asyncio
from dotenv import load_dotenv
from py_eureka_client import eureka_client
from fastapi import FastAPI
from app.routes import auth_routes
from app.database import usuarios_collection
from bson import ObjectId

# 1. Cargar variables de entorno
load_dotenv()

# 2. Crear la aplicación UNA SOLA VEZ
app = FastAPI(title="Microservicio de Usuarios")

# 3. Incluir las rutas (Esto es lo que el segundo 'app' estaba borrando)
app.include_router(auth_routes.router)

# --- Endpoints para Nicolas ---
@app.get("/api/usuarios/{usuario_id}/existe")
async def verificar_usuario_existe(usuario_id: str):
    try:
        # Primero intenta buscar por correo
        user = await usuarios_collection.find_one({"correo": usuario_id})
        if user:
            return True
        # Si no, intenta por ObjectId
        user = await usuarios_collection.find_one({"_id": ObjectId(usuario_id)})
        return user is not None
    except:
        return False

@app.get("/api/tutores/{tutor_id}/tiene-materia")
async def verificar_tutor_materia(tutor_id: str, materiaId: str):
    try:
        # Primero intenta buscar por correo
        tutor = await usuarios_collection.find_one({
            "correo": tutor_id,
            "rol": "TUTOR",
            "materias": materiaId
        })
        if tutor:
            return True
        # Si no, intenta por ObjectId
        tutor = await usuarios_collection.find_one({
            "_id": ObjectId(tutor_id),
            "rol": "TUTOR",
            "materias": materiaId
        })
        return tutor is not None
    except:
        return False

# --- Configuración de Eureka ---
EUREKA_SERVER = os.getenv("EUREKA_SERVER", "http://localhost:8761/eureka")
APP_NAME = "usuarios-service"
INSTANCE_PORT = 8000

async def init_eureka():
    try:
        await eureka_client.init_async(
            eureka_server=EUREKA_SERVER,
            app_name=APP_NAME,
            instance_port=INSTANCE_PORT
        )
        print("Registrado con éxito en Eureka")
    except Exception as e:
        print(f"Error conectando a Eureka: {e}")

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(init_eureka())