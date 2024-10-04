from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import requests
import asyncio
import random

load_dotenv()

NASA_API = os.getenv("NASA_API_KEY")


quiz_today = {
    "01":  {
        "question": "What is the capital of France?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "answer": 0
    },
    "02": {
        "question": "What is the capital of India?",
        "options": ["Paris", "London", "New Delhi", "Madrid"],
        "answer": 2
    },
    "03": {
        "question": "What is the capital of Germany?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "answer": 2
    },
    "04": {
        "question": "What is the capital of Spain?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "answer": 3
    },
    "05": {
        "question": "What is the capital of USA?",
        "options": ["Paris", "Washington DC", "Berlin", "Madrid"],
        "answer": 1
    },
    "06": {
        "question": "What is the capital of UK?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "answer": 1
    },
    "07": {
        "question": "What is the capital of Australia?",
        "options": ["Paris", "London", "Berlin", "Canberra"],
        "answer": 3
    },
    "08": {
        "question": "What is the capital of Japan?",
        "options": ["Paris", "London", "Tokyo", "Madrid"],
        "answer": 2
    },
    "09": {
        "question": "What is the capital of China?",
        "options": ["Paris", "Beijing", "Berlin", "Madrid"],
        "answer": 1
    },
    "10": {
        "question": "What is the capital of Russia?",
        "options": ["Paris", "London", "Berlin", "Moscow"],
        "answer": 3
    },
    "11": {
        "question": "What is the capital of Brazil?",
        "options": ["Paris", "London", "Berlin", "Brasilia"],
        "answer": 3
    },
    "12": {
        "question": "What is the capital of Canada?",
        "options": ["Paris", "London", "Berlin", "Ottawa"],
        "answer": 3
    },
    "13": {
        "question": "What is the capital of Italy?",
        "options": ["Paris", "London", "Rome", "Madrid"],
        "answer": 2
    },
    "14": {
        "question": "What is the capital of South Africa?",
        "options": ["Paris", "London", "Berlin", "Pretoria"],
        "answer": 3
    },
    "15": {
        "question": "What is the capital of Argentina?",
        "options": ["Paris", "London", "Berlin", "Buenos Aires"],
        "answer": 3
    },
    "16": {
        "question": "What is the capital of Mexico?",
        "options": ["Paris", "London", "Berlin", "Mexico City"],
        "answer": 3
    },
    "17": {
        "question": "What is the capital of Egypt?",
        "options": ["Paris", "London", "Berlin", "Cairo"],
        "answer": 3
    },
    "18": {
        "question": "What is the capital of Turkey?",
        "options": ["Paris", "London", "Berlin", "Ankara"],
        "answer": 3
    },
    "19": {
        "question": "What is the capital of Saudi Arabia?",
        "options": ["Paris", "London", "Berlin", "Riyadh"],
        "answer": 3
    },
    "20": {
        "question": "What is the capital of Pakistan?",
        "options": ["Paris", "London", "Berlin", "Islamabad"],
        "answer": 3
    }
}


def get_quiz_today(listQ):
    qID = []
    for key in quiz_today.keys():
        if(not key in listQ):
            qID.append(key)

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
    start_date = (datetime.utcnow() - timedelta(days=2)).strftime('%Y-%m-%d')
    donki_url = f"https://api.nasa.gov/DONKI/notifications?type=all&api_key={NASA_API}"
    response = requests.get(donki_url)
    response.raise_for_status() 
    events_data = response.json()
    return events_data