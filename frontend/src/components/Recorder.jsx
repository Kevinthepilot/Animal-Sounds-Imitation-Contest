// Catch the { animal } prop
export default function Recorder({ animal, onReset }) {
    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', width: '350px' }}>
            <h2>Time to perform!</h2>
            {/* Display the dynamically selected animal */}
            <p>Target: <strong>{animal}</strong></p>

            <button
                style={{
                    padding: '30px',
                    fontSize: '24px',
                    borderRadius: '50%',
                    background: '#ff4b4b',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '20px'
                }}
            >
                🎤 Record
            </button>

            <p style={{ marginTop: '15px', color: '#666' }}>Waiting for audio...</p>

            <button style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }} onClick={() => onReset()}>
                Try Again
            </button>
        </div >
    );
}