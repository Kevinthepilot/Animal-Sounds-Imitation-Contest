import { useState, useEffect } from 'react';
import AnimalSelector from './components/AnimalSelector';
import Recorder from './components/Recorder';
import ResultsDashboard from './components/ResultsDashboard';
import UsernamePrompt from './components/UsernamePrompt';

export default function App() {
  // Initialize our state variables
  const [appStatus, setAppStatus] = useState('LOGIN');
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [finalAudio, setFinalAudio] = useState(null);

  const [scoreData, setScoreData] = useState({ score: 0, leaderboard: [] });
  const [username, setUsername] = useState('');

  // Fetch initial leaderboard on mount
  useEffect(() => {
    const fetchInitialLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/leaderboard');
        if (response.ok) {
          const data = await response.json();
          setScoreData(prev => ({ ...prev, leaderboard: data.leaderboard }));
        }
      } catch (error) {
        console.error("Failed to fetch initial leaderboard:", error);
      }
    };
    fetchInitialLeaderboard();
  }, []);

  // Helper functions to change the state
  const handleLogin = (name) => {
    setUsername(name);
    setAppStatus('SELECTING');
  };

  const handleLogout = () => {
    setUsername('');
    setAppStatus('LOGIN');
  };

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
      formData.append('username', username);

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

      {username && appStatus !== 'LOGIN' && (
        <div style={{ marginBottom: '30px', color: '#555' }}>
          Playing as: <strong>{username}</strong>
          <button
            onClick={handleLogout}
            style={{ marginLeft: '10px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
          >
            Change Player
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center' }}>

        {/* Conditional Rendering: Only show the component that matches the current status */}
        {appStatus === 'LOGIN' && (
          <UsernamePrompt onComplete={handleLogin} />
        )}

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