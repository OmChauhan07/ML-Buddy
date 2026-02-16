function Leaderboard({ data }) {
    if (!data || !data.leaderboard || data.leaderboard.length === 0) {
        return null
    }

    const { leaderboard, best_model, task_type, target_column } = data
    const columns = Object.keys(leaderboard[0])

    const formatValue = (val) => {
        if (typeof val === 'number') return val.toFixed(4)
        return val
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 px-4">
            {/* Header */}
            <div className="mb-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">
                    🏆 Model Leaderboard
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 text-xs rounded-full border border-white/10 bg-white/5 text-gray-400">
                        {task_type === 'classification' ? '🏷️' : '📈'} {task_type}
                    </span>
                    <span className="px-3 py-1 text-xs rounded-full border border-white/10 bg-white/5 text-gray-400">
                        🎯 target: {target_column}
                    </span>
                    <span className="px-3 py-1 text-xs rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
                        ⭐ Best: {best_model}
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col}
                                    className="px-3 py-3 text-left font-semibold text-gray-300 bg-white/5 border-b border-white/10 whitespace-nowrap"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((row, i) => {
                            const isBest = row.Model === best_model
                            return (
                                <tr
                                    key={i}
                                    className={`
                    hover:bg-white/5 transition-colors
                    ${isBest ? 'bg-amber-500/10' : ''}
                  `}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col}
                                            className={`
                        px-3 py-2.5 border-b border-white/5 whitespace-nowrap
                        ${isBest ? 'text-amber-300 font-medium' : 'text-gray-400'}
                      `}
                                        >
                                            {formatValue(row[col])}
                                        </td>
                                    ))}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Leaderboard
