interface GameLogProps {
  entries: string[];
}

export function GameLog({ entries }: GameLogProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <h2 className="text-lg font-bold text-amber-400 mb-2">Battle Log</h2>
      <div className="max-h-48 overflow-y-auto space-y-1 text-sm">
        {entries.length === 0 ? (
          <p className="text-gray-500 italic">No events yet.</p>
        ) : (
          [...entries].reverse().map((entry, i) => (
            <div
              key={i}
              className={`text-gray-400 ${entry.startsWith('---') ? 'text-amber-500 font-semibold border-t border-gray-800 pt-1 mt-1' : ''}`}
            >
              {entry}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
