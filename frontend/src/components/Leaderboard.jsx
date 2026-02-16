import './Leaderboard.css'

function Leaderboard({ data }) {
    if (!data || !data.leaderboard || data.leaderboard.length === 0) {
        return null
    }

    const { leaderboard, best_model, task_type, target_column } = data

    // Get column headers from the first row
    const columns = Object.keys(leaderboard[0])

    // Format numbers for display
    const formatValue = (val) => {
        if (typeof val === 'number') {
            return val.toFixed(4)
        }
        return val
    }

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h2>🏆 Model Leaderboard</h2>
                <div className="leaderboard-meta">
                    <span className="meta-badge">
                        {task_type === 'classification' ? '🏷️' : '📈'} {task_type}
                    </span>
                    <span className="meta-badge">🎯 target: {target_column}</span>
                    <span className="meta-badge best">⭐ Best: {best_model}</span>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((row, i) => (
                            <tr key={i} className={row.Model === best_model ? 'best-row' : ''}>
                                {columns.map((col) => (
                                    <td key={col}>{formatValue(row[col])}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Leaderboard
