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
    <div className="gd-panel-riveted rounded-lg p-4">
      <h2 className="text-lg font-gothic font-bold gd-gold mb-3 tracking-wider">Dice Roller</h2>

      <div className="flex gap-2 mb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
            className="gd-btn w-11 h-11 rounded text-sm font-bold"
          >-</button>
          <span className="text-sm font-mono w-6 text-center gd-parchment">{diceCount}</span>
          <button
            onClick={() => setDiceCount(Math.min(20, diceCount + 1))}
            className="gd-btn w-11 h-11 rounded text-sm font-bold"
          >+</button>
        </div>

        <span className="gd-bone opacity-40 self-center font-gothic">D</span>

        <div className="flex gap-1">
          {[3, 6].map((s) => (
            <button
              key={s}
              onClick={() => setDiceSides(s)}
              className={`w-11 h-11 rounded text-xs font-bold font-gothic ${
                diceSides === s
                  ? 'gd-btn-gold'
                  : 'gd-btn'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={roll}
          className="flex-1 gd-btn-gold py-1 px-3 rounded transition-colors font-gothic"
        >
          ⚄ Roll
        </button>
      </div>

      {results.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {results.map((r, i) => (
              <div
                key={i}
                className={`w-10 h-10 flex items-center justify-center rounded text-lg ${
                  r === 1
                    ? 'gd-die-fail'
                    : r === diceSides
                      ? 'gd-die-crit'
                      : 'gd-die'
                }`}
              >
                {r}
              </div>
            ))}
          </div>
          {results.length > 1 && (
            <div className="text-sm gd-bone opacity-60">
              Total: <span className="gd-gold font-bold font-gothic">{total}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
