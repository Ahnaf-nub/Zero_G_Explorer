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

def startup(data):
    global quiz_today
    gem.setModel(data["sysPrompt"])
    quiz_today = data["quizToday"]

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


def setQuizzes(callback):
    print("Setting quizzes")
    
    start_date = (datetime.utcnow() - timedelta(days=14)).strftime('%Y-%m-%d')
    donki_url = f"https://api.nasa.gov/DONKI/notifications?startDate={start_date}&type=all&api_key={NASA_API}"
    response = requests.get(donki_url)
    response.raise_for_status() 
    donky = response.json()

    donky = donky[:min(10, len(donky))]

    quizQ = gem.getQuestions(f"{donky}")
    
    prefix = f"{int(time.time())}"

    quizQ = {f"{prefix}_{key}": value for key, value in quizQ.items()}

    callback(quizQ)
    
    print("Quizzes set")
    return None

def update_quiz(callback, last = "2000-01-01T00:00:00"):

    d1 = datetime.strptime(last, '%Y-%m-%dT%H:%M:%S')
    d2 = datetime.now()
    diff = (d2 - d1).total_seconds() / 3600
    print(diff)
    if(diff > 24):
        thread = threading.Thread(target=setQuizzes, args=(callback,))
        thread.start()