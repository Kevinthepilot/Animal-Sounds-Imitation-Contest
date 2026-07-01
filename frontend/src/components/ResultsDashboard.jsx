export default function ResultsDashboard({ scoreData, onReset }) {
    // Destructure the new payload from your backend
    const { score, leaderboard } = scoreData;

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', width: '450px' }}>
            <h2>Analysis Complete</h2>

            {/* Current Attempt Score */}
            <p style={{ marginBottom: '-10px', color: '#666' }}>This Attempt:</p>
            <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '15px 0', color: '#2e7d32' }}>
                {score}%
            </div>

            <hr style={{ margin: '20px 0' }} />

            <h3>Leaderboard</h3>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
                {leaderboard && leaderboard.map((entry, index) => (
                    <li
                        key={index}
                        style={{
                            padding: '12px',
                            marginBottom: '10px',
                            border: '1px solid #eee',
                            borderRadius: '6px',
                            borderColor: '#a1a1a1ff'
                        }}
                    >
                        {/* Top Row: Rank, Username, and Total Score */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px' }}>
                            <span>{index + 1}. {entry.username}</span>
                            <span style={{ color: '#2e7d32' }}>Total: {entry.total_score}</span>
                        </div>

                        {/* Bottom Row: Score Breakdown */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                            color: '#555',
                            background: '#f9f9f9',
                            padding: '5px',
                            borderRadius: '4px'
                        }}>
                            <span>🐱 {entry.scores.cat}</span>
                            <span>🐶 {entry.scores.dog}</span>
                            <span>🐷 {entry.scores.pig}</span>
                        </div>
                    </li>
                ))}
            </ul>

        </div>
    );
}