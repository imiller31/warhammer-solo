interface ScoreBoardProps {
  playerVP: number;
  aiVP: number;
  playerCP: number;
  aiCP: number;
  playerFactionName: string;
  aiFactionName: string;
  onAdjustVP: (side: 'player' | 'ai', delta: number) => void;
  onAdjustCP: (side: 'player' | 'ai', delta: number) => void;
}

export function ScoreBoard({
  playerVP,
  aiVP,
  playerCP,
  aiCP,
  playerFactionName,
  aiFactionName,
  onAdjustVP,
  onAdjustCP,
}: ScoreBoardProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 sm:p-4">
      <h2 className="text-lg font-bold text-amber-400 mb-3">Score</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <h3 className="text-blue-400 font-semibold text-sm truncate">{playerFactionName}</h3>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs text-gray-500 w-6">VP</span>
            <button onClick={() => onAdjustVP('player', -1)} className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 w-7 h-7 sm:w-6 sm:h-6 rounded text-xs font-bold">−</button>
            <span className="text-xl font-bold text-blue-300 w-8 text-center">{playerVP}</span>
            <button onClick={() => onAdjustVP('player', 1)} className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 w-7 h-7 sm:w-6 sm:h-6 rounded text-xs font-bold">+</button>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs text-gray-500 w-6">CP</span>
            <button onClick={() => onAdjustCP('player', -1)} className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 w-7 h-7 sm:w-6 sm:h-6 rounded text-xs font-bold">−</button>
            <span className="text-xl font-bold text-yellow-300 w-8 text-center">{playerCP}</span>
            <button onClick={() => onAdjustCP('player', 1)} className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 w-7 h-7 sm:w-6 sm:h-6 rounded text-xs font-bold">+</button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-red-400 font-semibold text-sm truncate">{aiFactionName}</h3>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs text-gray-500 w-6">VP</span>
            <button onClick={() => onAdjustVP('ai', -1)} className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 w-7 h-7 sm:w-6 sm:h-6 rounded text-xs font-bold">−</button>
            <span className="text-xl font-bold text-red-300 w-8 text-center">{aiVP}</span>
            <button onClick={() => onAdjustVP('ai', 1)} className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 w-7 h-7 sm:w-6 sm:h-6 rounded text-xs font-bold">+</button>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs text-gray-500 w-6">CP</span>
            <button onClick={() => onAdjustCP('ai', -1)} className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 w-7 h-7 sm:w-6 sm:h-6 rounded text-xs font-bold">−</button>
            <span className="text-xl font-bold text-yellow-300 w-8 text-center">{aiCP}</span>
            <button onClick={() => onAdjustCP('ai', 1)} className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 w-7 h-7 sm:w-6 sm:h-6 rounded text-xs font-bold">+</button>
          </div>
        </div>
      </div>
    </div>
  );
}
