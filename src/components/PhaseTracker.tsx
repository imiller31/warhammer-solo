import type { Phase, TurnSide } from '../types';
import { PHASES, PHASE_LABELS } from '../types';

interface PhaseTrackerProps {
  turn: number;
  phase: Phase;
  turnSide: TurnSide;
  onNextPhase: () => void;
  onNextTurn: () => void;
  gameOver: boolean;
  isDeployment: boolean;
  onCompleteDeployment: () => void;
}

export function PhaseTracker({ turn, phase, turnSide, onNextPhase, onNextTurn: _onNextTurn, gameOver, isDeployment, onCompleteDeployment }: PhaseTrackerProps) {
  const currentIdx = PHASES.indexOf(phase);
  const isLastPhase = currentIdx === PHASES.length - 1;

  if (isDeployment) {
    return (
      <div className="bg-gray-900 border border-amber-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-amber-400">Deployment</h2>
          <span className="text-sm text-amber-300">Set up your armies</span>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Deploy units according to the AI guidance below. Place your own army, then proceed.
        </p>
        <button
          onClick={onCompleteDeployment}
          className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-2 px-4 rounded transition-colors"
        >
          Start Battle Round 1
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-amber-400">
          Round {turn} / 5
        </h2>
        <span className="text-sm text-gray-400">
          {PHASE_LABELS[phase]}
        </span>
      </div>

      {/* Turn side indicator */}
      <div className={`text-center py-2 mb-3 rounded font-bold text-sm ${
        turnSide === 'player'
          ? 'bg-blue-900/40 text-blue-300 border border-blue-700'
          : 'bg-red-900/40 text-red-300 border border-red-700'
      }`}>
        {turnSide === 'player' ? '🟦 YOUR TURN' : '🟥 AI TURN'}
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

      <div className="flex gap-1 mb-4 text-[10px] sm:text-xs text-gray-500">
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
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-black font-bold py-2 px-4 rounded transition-colors text-sm"
            >
              Next Phase →
            </button>
          ) : (
            <button
              onClick={turnSide === 'player' ? onNextPhase : onNextPhase}
              className={`flex-1 font-bold py-2 px-4 rounded transition-colors text-sm ${
                turnSide === 'player'
                  ? 'bg-red-700 hover:bg-red-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-black'
              }`}
            >
              {turnSide === 'player'
                ? 'End Your Turn → AI Turn'
                : turn >= 5 ? 'End Game' : `End AI Turn → Round ${turn + 1}`}
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
