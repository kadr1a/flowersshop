# 1.2
# from fastapi import FastAPI
# from fastapi.responses import FileResponse
# app = FastAPI()
# @app.get("/")
# async def get_html():
#     return FileResponse("index.html")

#1.3
# @app.post("/calculate")
# async def calculate_sum(num1: int, num2: int):
#     result = num1 + num2
#     return {"result": result}

#1.4
# from fastapi import FastAPI
# from pydantic import BaseModel
# from models import User
# app = FastAPI()
# my_user = User(name="Твое Имя Фамилия", id=1)
# @app.get("/users")
# async def get_user():
#     return my_user

#1.5
# from fastapi import FastAPI
# from pydantic import BaseModel
# from models import User
# app = FastAPI()
# class UserIn(BaseModel):
#     name: str
#     age: int
# @app.post("/user")
# async def check_adult(user_data: UserIn):
#     is_adult = user_data.age >= 18
#     return {
#         "name": user_data.name,
#         "age": user_data.age,
#         "is_adult": is_adult
#     }

#2.1
# from fastapi import FastAPI
# from pydantic import BaseModel
# app = FastAPI()
# class Feedback(BaseModel):
#     name: str
#     message: str
# feedbacks_db = []
# @app.post("/feedback")
# async def create_feedback(fb: Feedback):
#     feedbacks_db.append(fb)
#     return {"message": f"Feedback received. Thank you, {fb.name}."}
# @app.get("/feedbacks")
# async def get_all_feedbacks():
#     return feedbacks_db

#2.2
from fastapi import FastAPI
from pydantic import BaseModel, Field, field_validator
from typing import List

app = FastAPI()

class Feedback(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="Имя пользователя, от 2 до 50 символов")
    message: str = Field(..., min_length=10, max_length=500, description="Сообщение, от 10 до 500 символов")

    @field_validator('message')
    @classmethod
    def check_forbidden_words(cls, v: str):
        forbidden_words = ["кринж", "рофл", "вайб"]
        lower_message = v.lower()
        for word in forbidden_words:
            if word in lower_message:
                raise ValueError(f"Использование недопустимых слов (например, '{word}')")
        return v

feedbacks_db: List[Feedback] = []

@app.post("/feedback", response_model=dict)
async def create_feedback(fb: Feedback):
    feedbacks_db.append(fb)
    return {"message": f"Спасибо, {fb.name}! Ваш отзыв сохранён."}

@app.get("/feedbacks")
async def get_all_feedbacks():
    return feedbacks_db