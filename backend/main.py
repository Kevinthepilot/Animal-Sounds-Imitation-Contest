import _frozen_importlib_external
from fastapi import FastAPI, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os
import random
from model import model, predict_audio, device

app = FastAPI()

# Allow your React app to communicate with this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Setting up database

@app.on_event("startup")
def on_startup():
    init_db()

DB_FILE = "leaderboard.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            score_cat INTEGER DEFAULT 0,
            score_dog INTEGER DEFAULT 0,
            score_bird INTEGER DEFAULT 0,
            score_cow INTEGER DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

    print("Database initialized")

def fetch_leaderboard():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    query = f'''
        SELECT username, score_cat, score_dog, score_bird, score_cow, (score_cat + score_dog + score_bird + score_cow) AS total_score
        FROM scores 
        WHERE total_score > 0 
        ORDER BY total_score DESC 
        LIMIT 10
    '''
    cursor.execute(query)
    top_scores = cursor.fetchall()
    conn.close()

    leaderboard_data = []
    for row in top_scores:
        username, s_cat, s_dog, s_bird, s_cow, total = row
        leaderboard_data.append({
            "username": username,
            "total_score": total,
            "scores": {
                "cat": s_cat,
                "dog": s_dog,
                "bird": s_bird,
                "cow": s_cow
            },
        })
        
    return leaderboard_data

@app.get("/api/leaderboard")
def get_initial_leaderboard():
    return {"leaderboard": fetch_leaderboard()}

@app.post("/api/scoring")
async def score_audio(
    animal: str = Form(...),
    file: UploadFile = File(...),
    username: str = Form(...)
):
    """
    Receives the target animal and the recorded audio file.
    """
    # 1. Read the incoming audio file bytes
    audio_bytes = await file.read()
    print(f"Received {len(audio_bytes)} bytes of audio data for target: {animal}")

    audio_filename = f"audio.webm"
    
    with open(audio_filename, "wb") as f:
        f.write(audio_bytes)
    print(f"Saved audio to: {audio_filename}")

    # 3. Run the model to process
    predicted_label, confidences = predict_audio(audio_filename, model)
    print(f"Prediction: {predicted_label}, Confidences: {confidences}")

    # Calculate actual score
    target_animal_lower = animal.lower()
    score = int(confidences[target_animal_lower])
        
    target_column = f"score_{target_animal_lower}"
    current_user = username

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    upsert_sql = f'''
        INSERT INTO scores (username, {target_column}) 
        VALUES (?, ?)
        ON CONFLICT(username) DO UPDATE SET 
        {target_column} = MAX({target_column}, excluded.{target_column})
    '''
    
    cursor.execute(upsert_sql, (current_user, score))
    conn.commit()
    conn.close()

    leaderboard_data = fetch_leaderboard()

    return {
        "score": score,
        "leaderboard": leaderboard_data
    }
