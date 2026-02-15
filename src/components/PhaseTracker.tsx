import type { Phase } from '../types';
import { PHASES, PHASE_LABELS } from '../types';

interface PhaseTrackerProps {
  turn: number;
  phase: Phase;
  onNextPhase: () => void;
  onNextTurn: () => void;
  gameOver: boolean;
}

export function PhaseTracker({ turn, phase, onNextPhase, onNextTurn, gameOver }: PhaseTrackerProps) {
  const currentIdx = PHASES.indexOf(phase);
  const isLastPhase = currentIdx === PHASES.length - 1;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-amber-400">
          Turn {turn} / 5
        </h2>
        <span className="text-sm text-gray-400">
          {PHASE_LABELS[phase]}
        </span>
      </div>

      <div className="flex gap-1 mb-4">
        {PHASES.map((p, i) => (
          <div
            key={p}
            className={`flex-1 h-2 rounded-full transition-colors ${
              i < currentIdx
                ? 'bg-amber-600'
                : i === currentIdx
                  ? 'bg-amber-400'
                  : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      <div className="flex gap-1 mb-4 text-xs text-gray-500">
        {PHASES.map((p, i) => (
          <div
            key={p}
            className={`flex-1 text-center truncate ${
              i === currentIdx ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            {PHASE_LABELS[p].replace(' Phase', '')}
          </div>
        ))}
      </div>

      {!gameOver && (
        <div className="flex gap-2">
          {!isLastPhase ? (
            <button
              onClick={onNextPhase}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-black font-bold py-2 px-4 rounded transition-colors"
            >
              Next Phase
            </button>
          ) : (
            <button
              onClick={onNextTurn}
              className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              {turn >= 5 ? 'End Game' : 'Next Turn'}
            </button>
          )}
        </div>
      )}

      {gameOver && (
        <div className="text-center text-amber-400 font-bold text-lg py-2">
          GAME OVER
        </div>
      )}
    </div>
  );
}
