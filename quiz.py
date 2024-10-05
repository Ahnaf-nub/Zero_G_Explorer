from datetime import datetime, timedelta
import time
from dotenv import load_dotenv
import os
import requests
import threading
import random
import json
import gem

load_dotenv()

NASA_API = os.getenv("NASA_API_KEY")

quiz_today = {}

with open('Quizzes.json', 'r') as file:
    quiz_today = json.load(file)

def get_quiz_today(listQ):
    qID = []
    for key in quiz_today.keys():
        if(not key in listQ):
            qID.append(key)
    if(len(qID) == 0):
        return None, None
    chosenID = random.choice(qID)
    return chosenID, quiz_today[chosenID]

def check_answer(qID, answer):
    corr = quiz_today[qID]["answer"] == answer
    return corr

async def getEONET():
    start_date = (datetime.utcnow() - timedelta(days=1)).strftime('%Y-%m-%d')
    eonet_url = f"https://eonet.gsfc.nasa.gov/api/v3/events?start={start_date}&api_key={NASA_API}"
    response = requests.get(eonet_url)
    response.raise_for_status() 
    events_data = response.json()
    return events_data


async def getDONKI():
    donki_url = f"https://api.nasa.gov/DONKI/notifications?type=all&api_key={NASA_API}"
    response = requests.get(donki_url)
    response.raise_for_status() 
    events_data = response.json()
    return events_data


def setQuizzes():
    print("Setting quizzes")
    start_date = (datetime.utcnow() - timedelta(days=7)).strftime('%Y-%m-%d')
    donki_url = f"https://api.nasa.gov/DONKI/notifications?startDate={start_date}&type=all&api_key={NASA_API}"
    response = requests.get(donki_url)
    response.raise_for_status() 
    donky = response.json()

    donky = donky[:min(6, len(donky))]

    quizQ = gem.getQuestions(f"{donky}")
    
    prefix = f"{int(time.time())}"

    quizQ = {f"{prefix}_{key}": value for key, value in quizQ.items()}

    with open('Quizzes.json', 'w') as file:
        json.dump(quizQ, file, indent=4)
    
    print("Quizzes set")
    return None

def update_quiz():
    thread = threading.Thread(target=setQuizzes)
    thread.start()