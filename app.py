from fastapi import FastAPI, Depends, HTTPException, Request, Form
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
import os
import bcrypt

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


# Pydantic model for user input
class TokenData(BaseModel):
    username: str = None


# Create JWT token
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt


# Verify JWT token
def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return TokenData(username=username)
    except JWTError:
        print("JWTError")
        return False
        raise HTTPException(status_code=401, detail="Invalid token")


# Dependency to get current user based on token
async def get_current_user(request: Request):
    token = request.cookies.get("token")
    if token is None:
        print("Hello1")
        return None
    return verify_token(token)


# Hash a password
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


# Verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


# Login route (for GET and POST requests)
@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    # Check if the user is already logged in
    token = request.cookies.get("token")
    if token:
        try:
            print("Token from login page")
            tokenValid = verify_token(token)  # If token is valid, redirect to game/home page
            if(tokenValid):
                return RedirectResponse(url="/game", status_code=302)
        except JWTError:
            pass  # If token is invalid, show the login form
    return templates.TemplateResponse("login.html", {"request": request})


# Login POST handler
@app.post("/login", response_class=HTMLResponse)
async def login(request: Request, username: str = Form(...), password: str = Form(...)):
    query = supabase.table("users").select("*").eq("username", username)
    
    user_response = None

    try:
        user_response = query.single().execute()
    except Exception as e:
        return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid username or password"})

    # Check if the user was found
    if not user_response.data:
        return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid username or password"})

    user_data = user_response.data

    # Verify password
    if not verify_password(password, user_data["password_hash"]):
        return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid username or password"})

    # Create JWT token after successful login
    access_token = create_access_token(data={"sub": username}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    response = RedirectResponse(url="/game", status_code=302)
    response.set_cookie(key="token", value=access_token)
    return response


# Register POST handler
@app.post("/register", response_class=HTMLResponse)
async def register_post(request: Request, username: str = Form(...), password: str = Form(...), space_station: str = Form(...)):
    # Check if the username already exists
    user_response = supabase.table("users").select("*").eq("username", username).execute()
    # Check if the user already exists
    if user_response.data:
        return templates.TemplateResponse("register.html", {"request": request, "error": "Username already taken"})

    # Hash the password
    password_hash = hash_password(password)
    # Save the user in the database
    insert_response = supabase.table("users").insert({
        "username": username, 
        "password_hash": password_hash, 
        "space_station": space_station
    }).execute()
    print(insert_response)
    # Handle possible errors during user insertion
    if not insert_response:
        return templates.TemplateResponse("register.html", {"request": request, "error": "Registration failed. Please try again."})
    print("Hello4")
    # Redirect to login page after successful registration
    return RedirectResponse(url="/login", status_code=302)

# Home page route (Protected)
@app.get("/home", response_class=HTMLResponse)
async def home_page(request: Request, current_user: TokenData = Depends(get_current_user)):
    if(current_user):
        return templates.TemplateResponse("home.html", {"request": request, "username": current_user.username})
    return RedirectResponse(url="/login", status_code=302)

# Game page route (Protected)
@app.get("/game", response_class=HTMLResponse)
async def game_page(request: Request, current_user: TokenData = Depends(get_current_user)):
    if(current_user):
        return templates.TemplateResponse("game.html", {"request": request, "username": current_user.username})
    return RedirectResponse(url="/login", status_code=302)


# Register page (Public, no authentication needed)
@app.get("/register", response_class=HTMLResponse)
async def register_get(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

# Root URL redirects to the login page
@app.get("/", response_class=HTMLResponse)
async def root_redirect():
    return RedirectResponse(url="/login", status_code=302)


@app.get("/logout")
async def logout():
    response = RedirectResponse(url="/login", status_code=302)
    response.delete_cookie(key="token")
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)