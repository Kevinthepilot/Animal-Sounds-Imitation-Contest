import _frozen_importlib_external
from fastapi import FastAPI, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
import os
from model import model, predict_audio, device

app = FastAPI()

# Allow your React app to communicate with this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/scoring")
async def score_audio(
    animal: str = Form(...),
    file: UploadFile = File(...),
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
        
    return {
        "animal": predicted_label
    }

