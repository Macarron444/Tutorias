import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGO_URL = os.getenv("DATABASE_URL")
client = AsyncIOMotorClient(MONGO_URL)
database = client.tutorias_db
usuarios_collection = database.get_collection("usuarios")