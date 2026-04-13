from fastapi import APIRouter, HTTPException, status, Depends
from app.database import usuarios_collection
from app.models.user_model import Usuario
from app.auth.security import (
    obtener_hash_password, 
    verificar_password, 
    crear_token_acceso, 
    obtener_usuario_actual
)
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Autenticación"])

# --- ESQUEMAS PARA PETICIONES ---
class LoginRequest(BaseModel):
    correo: str
    password: str

# Nuevo esquema para recibir la lista de materias
class MateriasUpdate(BaseModel):
    materias: List[str]

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def registrar_usuario(usuario: Usuario):
    existe = await usuarios_collection.find_one({"correo": usuario.correo})
    if existe:
        raise HTTPException(status_code=400, detail="El correo ya existe")

    hashed = obtener_hash_password(usuario.password_hash)
    nuevo_user = usuario.dict()
    nuevo_user["password_hash"] = hashed

    resultado = await usuarios_collection.insert_one(nuevo_user)
    return {"mensaje": "Usuario creado", "id": str(resultado.inserted_id)}


#Endpoint de Login
from pydantic import BaseModel

class LoginRequest(BaseModel):
    correo: str
    password: str


@router.post("/login")
async def login(datos: LoginRequest): # Cambiamos 'dict' por 'LoginRequest'
    user = await usuarios_collection.find_one({"correo": datos.correo})
    
    if not user or not verificar_password(datos.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    token = crear_token_acceso(data={"sub": user["correo"], "rol": user["rol"]})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"nombre": user["nombre"], "rol": user["rol"]}
    }


@router.get("/me")
async def ver_mi_perfil(usuario_token: dict = Depends(obtener_usuario_actual)):
    """
    Retorna el perfil completo del usuario dueño del Token.
    """
    # El 'sub' del token contiene el correo
    user = await usuarios_collection.find_one({"correo": usuario_token["correo"]})
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Retornamos la info completa (quitando el password_hash por seguridad)
    return {
        "id": str(user["_id"]),
        "nombre": user.get("nombre", "Sin Nombre"),
        "correo": user.get("correo", ""),
        "rol": user.get("rol", "ESTUDIANTE"),
        "carrera": user.get("carrera", "Ingeniería de Sistemas"),
        "semestre": user.get("semestre", 5),
        "materias": user.get("materias", []) # Si no tiene el campo, devuelve []
    }

@router.put("/actualizar-materias")
async def actualizar_materias(
    datos: MateriasUpdate, 
    usuario_token: dict = Depends(obtener_usuario_actual)
):
    """
    Permite a un Tutor actualizar su lista de materias. Requiere JWT.
    """
    # 1. Validación de Seguridad: Solo los TUTORES pueden tener materias
    if usuario_token.get("rol") != "TUTOR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Solo los usuarios con rol TUTOR pueden gestionar materias"
        )

    # 2. Actualización en la base de datos
    resultado = await usuarios_collection.update_one(
        {"correo": usuario_token["correo"]},
        {"$set": {"materias": datos.materias}}
    )

    if resultado.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {
        "mensaje": "Lista de materias actualizada exitosamente",
        "materias_actuales": datos.materias
    }