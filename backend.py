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

# Helper function to hash password using pbkdf2_sha256
def hash_password(password: str) -> str:
    return pbkdf2_sha256.hash(password)

# Helper function to verify password using pbkdf2_sha256
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pbkdf2_sha256.verify(plain_password, hashed_password)


# Load user from database (Supabase)
@manager.user_loader()
def load_user(username: str):
    user_data = supabase.table("users").select("*").eq("username", username).execute()
    if user_data.data:
        return user_data.data[0]  # Return the first result if user exists
    return None

def get_userC(request):
    tokn = request.cookies.get("auth")
    if(not tokn):
        return False
    try:
        user = manager.get_user(tokn)
        return user
    except:
        return False

# Handle user registration
@app.post("/auth/register")
def register_user(username: str = Form(...), password: str = Form(...), space_station: str = Form(...)):
    user_exists = supabase.table("users").select("*").eq("username", username).execute()
    if user_exists.data:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Hash the password
    hashed_password = hash_password(password)
    print(f"Registering user: {username}")
    print(f"Plain password: {password}")  # Print the plain password
    print(f"Hashed password: {hashed_password}")  # Print the hashed password

    # Insert the user into Supabase
    response = supabase.table("users").insert({
        "username": username,
        "password": hashed_password,
        "space_station": space_station
    }).execute()

    if response.error:
        raise HTTPException(status_code=500, detail="Error creating user")
    
    return RedirectResponse(url="/login", status_code=302)  # Redirect to login after successful registration


# Handle user login
@app.post("/auth/login")
def login_user(response: Response, username: str = Form(...), password: str = Form(...)):
    print(f"Attempting login for user: {username}")
    
    # Load user from Supabase
    user = load_user(username)
    if not user:
        print("User not found in the database.")
        raise HTTPException(status_code=404, detail="User not found")

    print(f"Stored hashed password for {username}: {user['password']}")
    print(f"Entered plain password: {password}")

    # Generate and set the authentication cookie
    access_token = manager.create_access_token(data={"sub": username})
    manager.set_cookie(response, access_token)

    print("Login successful!")
    return RedirectResponse(url="/", status_code=302)

# Home page (protected by login)
@app.get("/")
def home_page(request: Request):
    user = get_userC(request)
    if not user:
        return RedirectResponse(url="/login")  # Redirect to register if user not authenticated

    return templates.TemplateResponse("game.html", {"request": request, "username": user['username']})


# Display registration form
@app.get("/register")
def show_registration_form(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})


# Display login form
@app.get("/login")
def show_login_form(request: Request):
    user = get_userC(request)
    if user:
        return RedirectResponse(url="/")  # Redirect to game if user is already logged in
    return templates.TemplateResponse("login.html", {"request": request})


# Logout endpoint
@app.get("/logout")
def logout_user(response: Response):
    manager.set_cookie(response, "")  # Clear the cookie by setting an empty value
    return RedirectResponse(url="/login")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
