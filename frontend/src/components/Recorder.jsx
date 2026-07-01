import { useState, useRef } from 'react';

// Catch the { animal } prop
export default function Recorder({ animal, onReset, onSubmit }) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            // Every time the mic has a chunk of data, save it
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            // When we stop, bundle the chunks into a single audio file (Blob)
            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setAudioBlob(null);
        } catch (error) {
            console.error("Microphone access denied:", error);
            alert("Please allow microphone access to record your sound.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };


    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', width: '350px' }}>
            <h2>Time to perform!</h2>
            {/* Display the dynamically selected animal */}
            <p>Target: <strong>{animal}</strong></p>

            {/* 1. The Record / Stop Button */}
            {!audioBlob && (
                <button
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording} // For mobile tapping
                    onTouchEnd={stopRecording}
                    style={{
                        padding: '30px',
                        fontSize: '24px',
                        borderRadius: '50%',
                        background: isRecording ? '#cc0000' : '#ff4b4b',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: '20px',
                        transform: isRecording ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.1s'
                    }}
                >
                    {isRecording ? '⏹ Recording...' : '🎤 Hold to Record'}
                </button>
            )}

            {audioBlob && (
                <div style={{ marginTop: '20px' }}>
                    <audio
                        src={URL.createObjectURL(audioBlob)}
                        controls
                        style={{ width: '100%', marginBottom: '15px' }}
                    />

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                            onClick={() => setAudioBlob(null)}
                            style={{ padding: '10px 20px', cursor: 'pointer' }}
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => onSubmit(audioBlob)}
                            style={{ padding: '10px 20px', cursor: 'pointer', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px' }}
                        >
                            Submit Audio
                        </button>
                    </div>
                </div>
            )}

            <hr style={{ margin: '20px 0' }} />
            <button onClick={onReset} style={{ padding: '5px 10px', cursor: 'pointer' }}>
                Back to Selection
            </button>
        </div >
    );
}