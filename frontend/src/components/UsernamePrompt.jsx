import { useState } from 'react';

export default function UsernamePrompt({ onComplete }) {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents the page from refreshing
        if (inputValue.trim()) {
            onComplete(inputValue.trim());
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '30px', borderRadius: '8px', width: '350px' }}>
            <h2>Welcome to Animal Mimic!</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Enter your gamer tag to start playing.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="e.g. RoosterKing99"
                    required
                    style={{
                        padding: '12px',
                        fontSize: '16px',
                        borderRadius: '4px',
                        border: '1px solid #aaa'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '12px',
                        fontSize: '16px',
                        background: '#2e7d32',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Start Playing
                </button>
            </form>
        </div>
    );
}