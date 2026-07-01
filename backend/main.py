from fastapi import FastAPI, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# Allow your React app to communicate with this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/scoring")
async def score_audio(
    animal: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Receives the target animal and the recorded audio file.
    """
    # 1. Read the incoming audio file bytes
    audio_bytes = await file.read()
    print(f"Received {len(audio_bytes)} bytes of audio data for target: {animal}")

    # 2. AI Engine Placeholder
    # The audio data is now ready to be processed. 
    # Eventually, we will route this through a PyTorch pipeline—perhaps passing it 
    # to an audio Transformer architecture or generating a spectrogram to run 
    # through a pre-trained ResNet-18 model.
    
    # 3. Dummy Score & Leaderboard for now
    mock_score = random.randint(50, 99)
    
    return {
        "score": mock_score,
        "leaderboard": [
            {"username": "RoosterKing", "score": 98, "isCurrentUser": False},
            {"username": "DogWhisperer", "score": 92, "isCurrentUser": False},
            {"username": "You", "score": mock_score, "isCurrentUser": True},
        ]
    }