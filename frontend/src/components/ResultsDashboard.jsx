export default function ResultsDashboard() {
    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', width: '350px' }}>
            <h2>Analysis Complete</h2>

            <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0', color: '#2e7d32' }}>
                88%
            </div>
            <p>Confidence Score</p>

            <hr style={{ margin: '20px 0' }} />

            <h3>Leaderboard</h3>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
                <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>1. User_902 - 95%</li>
                <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>2. User_441 - 92%</li>
                <li style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>3. You - 88%</li>
            </ul>
        </div>
    );
}