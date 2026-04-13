from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum

class RolUsuario(str, Enum):
    ESTUDIANTE = "ESTUDIANTE"
    TUTOR = "TUTOR"
    ADMINISTRADOR = "ADMINISTRADOR"

class Usuario(BaseModel):
    nombre: str
    correo: EmailStr
    password_hash: str
    rol: RolUsuario
    carrera: Optional[str] = "Ingeniería de Sistemas"
    semestre: Optional[int] = 5
    # Lista de IDs de materias que el tutor puede dictar
    materias: Optional[List[str]] = []