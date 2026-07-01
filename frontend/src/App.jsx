import { useState } from 'react';
import AnimalSelector from './components/AnimalSelector';
import Recorder from './components/Recorder';
import ResultsDashboard from './components/ResultsDashboard';

export default function App() {
  // Initialize our state variables
  const [appStatus, setAppStatus] = useState('SELECTING');
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [finalAudio, setFinalAudio] = useState(null);

  const [scoreData, setScoreData] = useState({ score: 0, leaderboard: [] });

  // Helper functions to change the state
  const handleAnimalSelect = (animal) => {
    setSelectedAnimal(animal);
    setAppStatus('RECORDING');
  };

  const handleReset = () => {
    setSelectedAnimal(null);
    setAppStatus('SELECTING');
  };

  const handleSubmit = async (audioBlob) => {
    setFinalAudio(audioBlob);
    setAppStatus('PROCESSING');

    try {
      const formData = new FormData();

      formData.append('file', audioBlob, 'recording.webm');
      formData.append('animal', selectedAnimal);

      const response = await fetch('http://localhost:8000/api/scoring', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setScoreData(data);
      setAppStatus('SELECTING');

    } catch (error) {
      console.error("Failed to score audio:", error);
      alert("Error connecting to the AI Engine. Is the backend running?");
      setAppStatus('RECORDING'); // Kick them back so they can try again
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Animal Mimic App</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center' }}>

        {/* Conditional Rendering: Only show the component that matches the current status */}

        {appStatus === 'SELECTING' && (
          <AnimalSelector onSelect={handleAnimalSelect} />
        )}

        {appStatus === 'RECORDING' && (
          <Recorder animal={selectedAnimal} onReset={handleReset} onSubmit={handleSubmit} />
        )}

        {appStatus === 'PROCESSING' && (
          <div style={{ padding: '40px', border: '1px solid #ccc', borderRadius: '8px', width: '350px' }}>
            <h2>Sending to AI Engine...</h2>
            <p>Analyzing your inner {selectedAnimal} 🐾</p>
          </div>
        )}

        <ResultsDashboard scoreData={scoreData} onReset={handleReset} />

      </div>
    </div>
  );
}