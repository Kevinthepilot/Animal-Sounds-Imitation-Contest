import { useState } from 'react';
import AnimalSelector from './components/AnimalSelector';
import Recorder from './components/Recorder';
import ResultsDashboard from './components/ResultsDashboard';

export default function App() {
  // Initialize our state variables
  const [appStatus, setAppStatus] = useState('SELECTING');
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  // Helper functions to change the state
  const handleAnimalSelect = (animal) => {
    setSelectedAnimal(animal);
    setAppStatus('RECORDING');
  };

  const handleReset = () => {
    setSelectedAnimal(null);
    setAppStatus('SELECTING');
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
          <Recorder animal={selectedAnimal} onReset={handleReset} />
        )}

        <ResultsDashboard onReset={handleReset} />

      </div>
    </div>
  );
}