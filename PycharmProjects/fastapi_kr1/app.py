#1.1
from fastapi import FastAPI

my_app = FastAPI()

@my_app.get("/")
async def read_root():
    return {"message": "Авторелоад действительно работает"}