import torch
import torchaudio
import torchaudio.transforms as T
import torch.nn.functional as F
import torchvision.models as models
import torch.nn as nn

class AudioMobileNet(nn.Module):
    def __init__(self, num_classes=4):
        super(AudioMobileNet, self).__init__()
        # Load pre-trained MobileNetV2
        self.mobilenet = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
        
        # Replace the final classification head for our specific number of classes
        in_features = self.mobilenet.classifier[1].in_features
        self.mobilenet.classifier[1] = nn.Linear(in_features, num_classes)

    def forward(self, x):
        # x arrives as [Batch, 1, Mels, Time]
        # MobileNet expects [Batch, 3, Height, Width]
        x = x.repeat(1, 3, 1, 1)
        return self.mobilenet(x)

def preprocess_audio(file_path, target_duration=7.0, sample_rate=16000):
    """Applies the exact same transformations used during training."""
    # 1. Load Audio
    import soundfile as sf
    import subprocess
    # pyrefly: ignore [missing-import]
    import imageio_ffmpeg
    import os

    # Run FFmpeg conversion directly without pydub/ffprobe
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    wav_path = os.path.join(backend_dir, "audio.wav")
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    subprocess.run(
        [ffmpeg_exe, "-y", "-i", file_path, "-acodec", "pcm_s16le", "-ar", str(sample_rate), wav_path],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    speech, sr = sf.read(wav_path)
    if len(speech.shape) == 1:
        signal = torch.from_numpy(speech).unsqueeze(0).float()
    else:
        signal = torch.from_numpy(speech).t().float()
    
            
    # 2. Convert to mono
    if signal.shape[0] > 1:
        signal = torch.mean(signal, dim=0, keepdim=True)
        
    # 3. Resample
    if sr != sample_rate:
        resampler = T.Resample(orig_freq=sr, new_freq=sample_rate)
        signal = resampler(signal)
        
    # 4. Pad or Truncate to exact length
    target_num_samples = int(target_duration * sample_rate)
    num_samples = signal.shape[1]
    
    if num_samples > target_num_samples:
        signal = signal[:, :target_num_samples]
    elif num_samples < target_num_samples:
        padding_needed = target_num_samples - num_samples
        signal = F.pad(signal, (0, padding_needed))
        
    # 5. Convert to Mel-Spectrogram
    mel_spectrogram = T.MelSpectrogram(
        sample_rate=sample_rate,
        n_fft=1024,
        hop_length=512,
        n_mels=64
    )
    amplitude_to_db = T.AmplitudeToDB()
    
    mel_spec = mel_spectrogram(signal)
    mel_spec_db = amplitude_to_db(mel_spec)
    
    # 6. Add a batch dimension (Shape becomes: [1, 1, Mels, Time])
    mel_spec_db = mel_spec_db.unsqueeze(0)
    
    return mel_spec_db

def predict_audio(file_path, model, device='cpu'):
    """Runs the model on a single audio file and returns predictions for all classes."""
    # Ensure model is in eval mode
    model.eval()
    
    # Map model outputs back to human-readable labels
    idx_to_label = {0: "cat", 1: "dog", 2: "bird", 3: "cow"}
    
    # Process the audio
    input_tensor = preprocess_audio(file_path).to(device)
    
    # Predict
    with torch.no_grad():
        logits = model(input_tensor)
        
        # Convert raw logits to probabilities between 0 and 1
        probabilities = F.softmax(logits, dim=1)
        _, predicted_idx = torch.max(probabilities, dim=1)
        
    predicted_label = idx_to_label[predicted_idx.item()]
    
    # Map all probabilities to their class labels
    # probabilities[0] grabs the first (and only) item in our batch of 1
    all_confidences = {}
    for idx, prob in enumerate(probabilities[0]):
        label = idx_to_label[idx]
        all_confidences[label] = prob.item() * 100
        
    return predicted_label, all_confidences


device = 'cpu'

# 1. Initialize the model architecture
model = AudioMobileNet(num_classes=4)

# 2. Load the saved weights
import os
backend_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(backend_dir, 'best_model.pth')
model.load_state_dict(torch.load(model_path, map_location=device))
model = model.to(device)

if __name__ == '__main__':
    # 3. Predict on a new file
    test_file = os.path.join(backend_dir, "dog_test.mp3") # Replace with your test file path

    label, confidences = predict_audio(test_file, model, device)
    print(f"Primary Prediction: {label.upper()}")
    print("All class confidences:")
    for class_name, conf_score in confidences.items():
        print(f"  - {class_name.capitalize()}: {conf_score:.2f}%")