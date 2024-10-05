from fastapi import FastAPI, Depends, HTTPException, Request, Form
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
import schedule
import os
import bcrypt

import quiz

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


quiz.update_quiz()
print("\n---\nUpdating\n---\n")

schedule.every().day.at("00:00").do(quiz.update_quiz)

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
            return None
            # raise HTTPException(status_code=401, detail="Invalid token")
        return TokenData(username=username)
    except JWTError:
        print("JWTError")
        return False


# Dependency to get current user based on token
async def get_current_user(request: Request):
    token = request.cookies.get("token")
    if token is None:
        return None
    return verify_token(token)

async def get_full_user_data(request: Request):
    current_user = await get_current_user(request)
    if current_user:
        user_response = supabase.table("users").select("*").eq("username", current_user.username).execute()
        if user_response.data:
            user_data = user_response.data
            return user_data
    return None

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
                return RedirectResponse(url="/home", status_code=302)
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
    response = RedirectResponse(url="/home", status_code=302)
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

@app.get("/register", response_class=HTMLResponse)
async def register_get(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.get("/", response_class=HTMLResponse)
async def root_redirect():
    return RedirectResponse(url="/login", status_code=302)

@app.get("/eonet")
async def fetch_eonet_events():
    try:   
        events_data = await quiz.getEONET()
        for event in events_data['events']:
            event_id = event['id']

            existing_event = supabase.table('eonet').select('event_id').eq('event_id', event_id).execute()
            if existing_event.data:
                print(f"Event with ID {event_id} already exists, skipping...")
                continue 

            data = {
                "event_id": event_id,
                "title": event['title']
            }
            insert_response = supabase.table('eonet').insert(data).execute()

            """if insert_response.error:
                return {"error": "Failed to store data in supabase."}
            else:"""
            return {"message": "Events fetched and stored successfully", "events_count": len(events_data['events']), "data": events_data}
            
    except quiz.requests.RequestException as e:
        return {"status_code":500, "detail":f"Error fetching data from NASA EONET API: {str(e)}"}
    except Exception as e:
        return {"status_code":500, "detail":f"Unexpected error: {str(e)}"}


@app.get("/quiz")
async def get_quiz(request: Request):
    userDat = await get_full_user_data(request)
    usedQIDs = userDat[0]['usedQID']['qID']
    newID, newQuiz = quiz.get_quiz_today(usedQIDs)
    if newID == None:
        return {"message": "No more questions available for today."}
    usedQIDs.append(newID)
    try:
        update_response = supabase.table("users").update({"usedQID": {"qID": usedQIDs}}).eq("username", userDat[0]['username']).execute()
    except Exception as e:
        print("error: Failed to update user data in supabase.")

    return {"id": newID, "question": newQuiz['question'], "options": newQuiz['options']}

@app.get("/quiz/{id:str}/{chosen:int}")
async def check_quiz(request: Request, id: str, chosen: int):
    corr = quiz.check_answer(id, chosen)
    return {"correct": corr}

@app.get("/donki")
async def fetch_donki_events():
    try:
        # Calculate the start date (2 days ago)
        events_data = await quiz.getDONKI()

        for event in events_data:
            event_id = event['messageID']

            # Check if the event with the same event_id already exists
            existing_event = supabase.table('donki').select('event_id').eq('event_id', event_id).execute()
            if existing_event.data:
                print(f"Event with ID {event_id} already exists, skipping...")
                continue

            data = {
                "event_id": event_id,
                "message": event['messageBody']
            }

            # Insert the event into Supabase storage
            insert_response = supabase.table('donki').insert(data).execute()

            return {"message": "Events fetched and stored successfully", "events_count": len(events_data), "data": events_data}

    except quiz.requests.RequestException as e:
        return {"status_code":500, "detail":f"Error fetching data from NASA DONKI API: {str(e)}"}
    except Exception as e:
        return {"status_code":500, "detail":f"Unexpected error: {str(e)}"}

@app.post("/scoreUpdate")
async def update_score(request: Request):
    userDat = await get_full_user_data(request)
    body = await request.json()
    print(body)
    scores = userDat[0]['score']['scores']
    scores.append(body)
    try:
        update_response = supabase.table("users").update({"score": {"scores": scores}}).eq("username", userDat[0]['username']).execute()
        supabase.table("Scores").insert({
            "station": userDat[0]['station'],
            "player": userDat[0]['username'],
            "score": body['score'],
            "info": body
        }).execute()
    except Exception as e:
        print("error: Failed to update user data in supabase score table.")

    return {"message": {"scores": scores}}  # Ensure scores are returned here

@app.get("/score")
async def get_score(request: Request):
    try:
        # Fetch leaderboard data without filtering unique users
        leaderboard_response = supabase.table("Scores")\
            .select("created_at, station, player, score")\
            .order("score", desc=True)\
            .limit(10)\
            .execute()

        # Simply return the leaderboard without filtering
        leaderboard = leaderboard_response.data if leaderboard_response.data else []

        return {
            "leaderboard": leaderboard  # Return top 10 leaderboard entries, even if from the same user
        }
    except Exception as e:
        print(f"Error fetching scores: {e}")
        return {"leaderboard": [], "error": str(e)}


@app.get("/logout")
async def logout():
    response = RedirectResponse(url="/login", status_code=302)
    response.delete_cookie(key="token")
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)