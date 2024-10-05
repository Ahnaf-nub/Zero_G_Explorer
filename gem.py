import os
from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import json
load_dotenv()

genai.configure(api_key=os.getenv("GEM_API"))


generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 64,
  "max_output_tokens": 8192,
  "response_mime_type": "text/plain",
}

model = None
chat_session = None

def setModel(sysIns):
  global model, chat_session
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
    if(model == None):
        return {}
    response = chat_session.send_message(info)
    jsonTxt = response.text
    jsonTxt = jsonTxt.replace("```json", "")
    jsonTxt = jsonTxt.replace("```", "")
    python_obj = json.loads(jsonTxt)

    return python_obj