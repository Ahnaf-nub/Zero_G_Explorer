import os
from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import json
load_dotenv()

genai.configure(api_key=os.getenv("GEM_API"))

sysIns = ""

with open("sysInfo.txt", "r") as file:
    sysIns = file.read()


generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 64,
  "max_output_tokens": 8192,
  "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
  model_name="gemini-1.5-flash",
  generation_config=generation_config,
  safety_settings = {
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  system_instruction=sysIns
)

chat_session = model.start_chat(
  history=[]
)


def getQuestions(info):
    response = chat_session.send_message(info)
    jsonTxt = response.text
    jsonTxt = jsonTxt.replace("```json", "")
    jsonTxt = jsonTxt.replace("```", "")
    python_obj = json.loads(jsonTxt)

    return python_obj

if( __name__ == "__main__"):
    tst = ""
    with open("test.txt", "r") as file:
        tst = file.read()
    print(getQuestions(tst))
