from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import requests
import asyncio
import random

load_dotenv()

NASA_API = os.getenv("NASA_API_KEY")

quiz_today = {
    "H873": {
        "question": "What type of CME was detected by STEREO A / SOHO on September 8th, 2024?",
        "options": ["S-type", "C-type", "O-type", "R-type"],
        "answer": 1
    },
    "K937": {
        "question": "What was the estimated speed of the CME detected on September 8th, 2024?",
        "options": ["350 km/s", "626 km/s", "900 km/s", "1200 km/s"],
        "answer": 1
    },
    "L942": {
        "question": "According to preliminary analysis, which NASA mission is expected to experience a glancing blow from the CME detected on September 8th, 2024?",
        "options": ["Parker Solar Probe", "STEREO A", "Lucy", "All of the above"],
        "answer": 3
    },
    "P148": {
        "question": "When is the leading edge of the CME detected on September 8th, 2024 expected to reach Parker Solar Probe?",
        "options": ["September 9th, 2024, 16:59Z", "September 10th, 2024, 16:04Z", "September 11th, 2024, 20:00Z", "September 12th, 2024, 02:00Z"],
        "answer": 0
    },
    "Z319": {
        "question": "What is the estimated range of the maximum Kp index for the CME detected on September 8th, 2024 impacting NASA missions near Earth?",
        "options": ["0-2", "4-6", "7-9", "10-12"],
        "answer": 1
    },
    "U824": {
        "question": "What type of CME was detected by SOHO on October 3rd, 2024, that is expected to impact Mars and STEREO A?",
        "options": ["S-type", "C-type", "O-type", "R-type"],
        "answer": 1
    },
    "Y359": {
        "question": "What was the estimated speed of the CME detected on October 3rd, 2024, that is expected to impact Mars and STEREO A?",
        "options": ["500 km/s", "646 km/s", "800 km/s", "950 km/s"],
        "answer": 1
    },
    "P354": {
        "question": "When is the leading edge of the CME detected on October 3rd, 2024, expected to reach Mars?",
        "options": ["October 5th, 2024, 17:04Z", "October 6th, 2024, 12:02Z", "October 7th, 2024, 17:04Z", "October 8th, 2024, 12:02Z"],
        "answer": 2
    },
    "O764": {
        "question": "What is the estimated range of the maximum Kp index for the CME detected on October 3rd, 2024, that is expected to have a glancing blow at NASA missions near Earth?",
        "options": ["0-2", "2-4", "4-6", "6-8"],
        "answer": 1
    },
    "V943": {
        "question": "What was the intensity of the flare that is associated with the CME detected on October 3rd, 2024, that is expected to impact Mars and STEREO A?",
        "options": ["M5.7", "M6.7", "X9.0", "C8.5"],
        "answer": 1
    },
    "Z319": {
        "question": "What was the peak time of the flare associated with the CME detected on October 3rd, 2024, that is expected to impact Mars and STEREO A?",
        "options": ["2024-10-03T20:18Z", "2024-10-03T20:23Z", "2024-10-03T20:28Z", "2024-10-03T20:33Z"],
        "answer": 2
    },
    "R487": {
        "question": "What type of CME was detected by STEREO A / SOHO on October 3rd, 2024, that is expected to impact Lucy and Solar Orbiter?",
        "options": ["S-type", "C-type", "O-type", "R-type"],
        "answer": 1
    },
    "S124": {
        "question": "What was the estimated speed of the CME detected on October 3rd, 2024, that is expected to impact Lucy and Solar Orbiter?",
        "options": ["550 km/s", "706 km/s", "850 km/s", "900 km/s"],
        "answer": 1
    },
    "Q792": {
        "question": "When is the leading edge of the CME detected on October 3rd, 2024, expected to reach Lucy?",
        "options": ["October 4th, 2024, 07:02Z", "October 5th, 2024, 22:13Z", "October 6th, 2024, 07:44Z", "October 7th, 2024, 10:00Z"],
        "answer": 2
    },
    "T218": {
        "question": "What type of CME was detected by STEREO A / SOHO on October 3rd, 2024, that is expected to impact Juno, Lucy, STEREO A, Mars, and missions near Earth?",
        "options": ["S-type", "C-type", "O-type", "R-type"],
        "answer": 1
    },
    "G532": {
        "question": "What was the estimated speed of the CME detected on October 3rd, 2024, that is expected to impact Juno, Lucy, STEREO A, Mars, and missions near Earth?",
        "options": ["600 km/s", "750 km/s", "822 km/s", "900 km/s"],
        "answer": 2
    },
    "H612": {
        "question": "When is the leading edge of the CME detected on October 3rd, 2024, expected to reach STEREO A?",
        "options": ["October 5th, 2024, 22:13Z", "October 6th, 2024, 03:54Z", "October 7th, 2024, 10:00Z", "October 8th, 2024, 12:02Z"],
        "answer": 0
    },
    "J194": {
        "question": "What is the estimated range of the maximum Kp index for the CME detected on October 3rd, 2024, that is expected to impact Juno, Lucy, STEREO A, Mars, and missions near Earth?",
        "options": ["3-5", "5-7", "7-9", "9-11"],
        "answer": 1
    },
    "K847": {
        "question": "What was the intensity of the flare that is associated with the CME detected on October 3rd, 2024, that is expected to impact Juno, Lucy, STEREO A, Mars, and missions near Earth?",
        "options": ["M6.7", "X9.0", "C8.5", "M5.0"],
        "answer": 1
    },
    "L134": {
        "question": "What was the peak time of the flare associated with the CME detected on October 3rd, 2024, that is expected to impact Juno, Lucy, STEREO A, Mars, and missions near Earth?",
        "options": ["2024-10-03T12:18Z", "2024-10-03T12:23Z", "2024-10-03T12:28Z", "2024-10-03T12:33Z"],
        "answer": 0
    }
}


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
    start_date = (datetime.utcnow() - timedelta(days=2)).strftime('%Y-%m-%d')
    donki_url = f"https://api.nasa.gov/DONKI/notifications?type=all&api_key={NASA_API}"
    response = requests.get(donki_url)
    response.raise_for_status() 
    events_data = response.json()
    return events_data