import { useState } from 'react';

export default function ResultsDashboard({ scoreData, onReset }) {
    // Destructure the payload you defined in your sequence diagram
    const { score, leaderboard } = scoreData;

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', width: '350px' }}>
            <h2>Analysis Complete</h2>

            <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0', color: '#2e7d32' }}>
                {score}%
            </div>
            <p>Confidence Score</p>

            <hr style={{ margin: '20px 0' }} />

            <h3>Leaderboard</h3>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
                {/* Safely map over the leaderboard array if it exists */}
                {leaderboard && leaderboard.map((entry, index) => (
                    <li
                        key={index}
                        style={{
                            padding: '8px 0',
                            borderBottom: '1px solid #eee',
                            // Highlight the user's score if you have a way to identify it
                            fontWeight: entry.isCurrentUser ? 'bold' : 'normal'
                        }}
                    >
                        {index + 1}. {entry.username || 'Anonymous'} - {entry.score}%
                    </li>
                ))}
            </ul>

            <button
                onClick={onReset}
                style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
            >
                Try Again
            </button>
        </div>
    );
}