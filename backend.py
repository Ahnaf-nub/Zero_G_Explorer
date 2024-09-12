from fastapi import FastAPI, HTTPException, Form, Request
from pydantic import BaseModel
from supabase import create_client, Client
from passlib.context import CryptContext
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

class User(BaseModel):
    username: str
    password: str
    space_station: str
    score: int = 0

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

@app.post("/register")
def register_user(username: str = Form(...), password: str = Form(...), space_station: str = Form(...)):
    user_exists = supabase.table("users").select("*").eq("username", username).execute()
    if user_exists.data:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = hash_password(password)

    response = supabase.table("users").insert({
        "username": username,
        "password": hashed_password,
        "space_station": space_station
    }).execute()

    if response.error:
        raise HTTPException(status_code=500, detail="Error creating user")
    return {"message": "User created successfully"}

@app.post("/login")
def login_user(username: str = Form(...), password: str = Form(...)):
    user = supabase.table("users").select("*").eq("username", username).execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user.data[0]

    if not verify_password(password, user_data['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"message": "Login successful", "username": user_data['username'], "score": user_data['score']}

@app.get("/user/{username}")
def get_user(username: str):
    user = supabase.table("users").select("*").eq("username", username).execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Remove sensitive information (password)
    user_data = user.data[0]
    user_data.pop('password')
    return user_data

@app.post("/update_score/{username}")
def update_score(username: str, score: int):
    user = supabase.table("users").select("*").eq("username", username).execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")

    # Update score
    response = supabase.table("users").update({"score": score}).eq("username", username).execute()

    if response.error:
        raise HTTPException(status_code=500, detail="Error updating score")

    return {"message": "Score updated successfully"}

@app.get("/register")
def show_registration_form(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.get("/login")
def show_login_form(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
