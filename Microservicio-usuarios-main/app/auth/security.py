import os
from dotenv import load_dotenv
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from fastapi.security import APIKeyHeader, OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status

# SECRET_KEY = "tu_clave_super_secreta_12345" # Luego lo sacaremos del .env
# ALGORITHM = "HS256"
# Cargar las variables del archivo .env
load_dotenv()
# Ahora leemos los valores desde el entorno
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def crear_token_acceso(data: dict):
    para_token = data.copy()
    expiracion = datetime.utcnow() + timedelta(minutes=60)
    para_token.update({"exp": expiracion})
    return jwt.encode(para_token, SECRET_KEY, algorithm=ALGORITHM)

# Configuración de BCrypt (mismo estándar que usa Java Spring)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def obtener_hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verificar_password(password_plano: str, password_hash: str) -> bool:
    return pwd_context.verify(password_plano, password_hash)

# Esto le dice a Swagger que busque un botón de "Authorize" (el candado)
oauth2_scheme = APIKeyHeader(name="Authorization")

def obtener_usuario_actual(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar el token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decodificamos el token usando nuestra SECRET_KEY
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        correo: str = payload.get("sub")
        rol: str = payload.get("rol")
        if correo is None:
            raise credentials_exception
        return {"correo": correo, "rol": rol}
    except JWTError:
        raise credentials_exception