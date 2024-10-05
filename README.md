# 🚀 **ZeroG-Explorer**: Space-based Fun and Learning for Astronauts

**Developed by Team Hardware-Synapse for the NASA Space Apps Challenge**

Try it out at: **https://https://zerogexplorer.vercel.app**
---

## 🌌 **Project Overview**
**ZeroG-Explorer** is a unique game designed to keep astronauts physically active and mentally sharp in microgravity. Players wear a gyroscope-equipped vest that controls their in-game avatar, allowing them to navigate through space by adjusting their orientation and using a thrust button. While floating through checkpoints and completing tasks, players also answer space-related quizzes, with real-time data pulled from NASA’s API.

The game tracks individual scores and ranks them on a global leaderboard. Space stations are also ranked based on the collective scores of their participants, fostering friendly competition and a sense of community between astronauts.

---

## 🎮 **Features**

### 1. **Physical Control with Gyroscope Integration**
- **Gyroscope-Equipped Vest**: Players wear a vest with a gyroscope, allowing their in-game avatar to mimic their real-world orientation and movement.
- **Thrust Mechanism**: Players use a thrust button to propel themselves forward, requiring careful control of both orientation and thrust to navigate checkpoints and complete tasks.

### 2. **Challenging Checkpoints and Tasks**
- Players must complete various tasks and navigate through space checkpoints.

### 3. **Space Knowledge Quizzes**
- **NASA API Integration**: Quizzes test players' knowledge of recent space events, using real-time data from NASA’s API.
- **Bonuses and Penalties**: Correct answers reward players with boosts (e.g., increased thrust power), while incorrect answers may apply temporary penalties.

### 4. **Leaderboard System**
- **Individual Leaderboard**: Tracks each player’s score based on their performance in navigating checkpoints, tasks, and quiz results.
- **Space Station Leaderboard**: A collective ranking system that highlights which space station has the highest overall scores, fostering competition and teamwork.

#### **No Real-time Multiplayer**
- **Asynchronous Play**: Due to the high latency between the astronauts stationed in different space stations, the game is not real-time multiplayer. Instead, players score individually, and the leaderboard reflects their rankings over time, allowing astronauts to compete at their own pace.

---

## 🛠 **Hardware Used**
- **ESP32**
- **MPU6050**

## 💻 **Software Used**
- Python for backend
  - FastApi for API integration and authentication
  - Supabase as Database
  - NASA API and Gemini API for quiz questions
- JavaScript for Frontend
  - p5.js
  - matter.js

---

## 🌠 **Why ZeroG-Explorer?**

1. **Physical Exercise in Microgravity**: Promotes movement to help counteract the effects of prolonged exposure to microgravity, such as muscle atrophy and bone density loss.
   
2. **Mental Engagement**: Space quizzes keep astronauts mentally sharp and up-to-date with the latest developments in space exploration.

3. **Building Team Spirit**: The leaderboard system encourages astronauts from different space stations to engage in friendly competition, fostering connection across long distances in space.

---

## 👩‍💻 **Installation and Setup**

**Make sure you have Python (>3.9) installed**

1. Clone the repository:
   ```bash
   git clone https://github.com/Ahnaf-nub/Zero_G_Explorer.git
   ```

2. Activate virtual environment and install the necessary dependencies:
   ```bash
   cd Zero_G_Explorer
   ```
   ```
   pip install virtualenv
   python3 -m venv .venv
   .venv\Scripts\activate
   ```
   ```
   pip install -r requirements.txt
   ```
3. Create a file to keep the environment variables name ` .env `
   Keep your API keys and other secrets following this template:
   ```
   SUPABASE_URL= YOUR_SUPABASE_URL
   SUPABASE_KEY= YOUR_SUPABASE_KEY
   NASA_API_KEY= "DEMO_KEY"
   JWT_SECRET= ANY_SECRET_KEY
   ALGORITHM="HS256"
   ACCESS_TOKEN_EXPIRE_MINUTES=43200
   GEM_API= GEMINI_API_KEY
   ```
4. Run the game locally:
   ```bash
   python3 app.py
   ```

---


## 👥 **Team Hardware-Synapse**
**Team Members**:
- Mir Muhammad Abidul Haq Ahnaf
- Iqbal Samin Prithul
- Abu Nafis Mohammod Noor Rohan

---

We hope **ZeroG-Explorer** brings both fun and learning to astronauts while helping them stay connected in the vastness of space! 🌍🚀

---
