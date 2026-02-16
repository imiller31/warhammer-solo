import { useState, useCallback } from 'react';

export function DiceRoller() {
  const [results, setResults] = useState<number[]>([]);
  const [diceCount, setDiceCount] = useState(1);
  const [diceSides, setDiceSides] = useState(6);

  const roll = useCallback(() => {
    const count = Math.max(1, Math.min(100, diceCount));
    const sides = Math.max(2, Math.min(100, diceSides));
    const newResults: number[] = [];
    for (let i = 0; i < count; i++) {
      newResults.push(Math.floor(Math.random() * sides) + 1);
    }
    setResults(newResults);
  }, [diceCount, diceSides]);

  const total = results.reduce((s, v) => s + v, 0);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <h2 className="text-lg font-bold text-amber-400 mb-3">Dice Roller</h2>

      <div className="flex gap-2 mb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
            className="bg-gray-700 hover:bg-gray-600 w-10 h-10 rounded text-sm font-bold"
          >-</button>
          <span className="text-sm font-mono w-6 text-center">{diceCount}</span>
          <button
            onClick={() => setDiceCount(Math.min(20, diceCount + 1))}
            className="bg-gray-700 hover:bg-gray-600 w-10 h-10 rounded text-sm font-bold"
          >+</button>
        </div>

        <span className="text-gray-500 self-center">D</span>

        <div className="flex gap-1">
          {[3, 6].map((s) => (
            <button
              key={s}
              onClick={() => setDiceSides(s)}
              className={`w-10 h-10 rounded text-xs font-bold ${
                diceSides === s
                  ? 'bg-amber-600 text-black'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={roll}
          className="flex-1 bg-amber-600 hover:bg-amber-500 text-black font-bold py-1 px-3 rounded transition-colors"
        >
          Roll
        </button>
      </div>

      {results.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {results.map((r, i) => (
              <div
                key={i}
                className={`w-9 h-9 flex items-center justify-center rounded font-bold text-lg border ${
                  r === 1
                    ? 'border-red-500 text-red-400 bg-red-900/20'
                    : r === diceSides
                      ? 'border-green-500 text-green-400 bg-green-900/20'
                      : 'border-gray-600 text-gray-200 bg-gray-800'
                }`}
              >
                {r}
              </div>
            ))}
          </div>
          {results.length > 1 && (
            <div className="text-sm text-gray-400">
              Total: <span className="text-amber-400 font-bold">{total}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
