from fastapi import FastAPI, HTTPException, Form, Request, Depends, Response
from fastapi_login import LoginManager
from pydantic import BaseModel
from supabase import create_client, Client
from passlib.hash import pbkdf2_sha256
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse
import os

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
SECRET = os.getenv('SECRET')  # Ensure SECRET key is defined in your .env

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Configure Login Manager
manager = LoginManager(SECRET, token_url="/auth/login", use_cookie=True)
manager.cookie_name = "auth"

# User model for registration
class User(BaseModel):
    username: str
    password: str
    space_station: str
    score: int = 0

@app.get("/")
def homeP(request: Request):
    return templates.TemplateResponse("game.html", {"request": request})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, port=8000)