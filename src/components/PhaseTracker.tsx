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

export function PhaseTracker({ turn, phase, turnSide, onNextPhase, gameOver, isDeployment, onCompleteDeployment }: PhaseTrackerProps) {
  const currentIdx = PHASES.indexOf(phase);
  const isLastPhase = currentIdx === PHASES.length - 1;

  if (isDeployment) {
    return (
      <div className="gd-cogitator gd-hash-marks p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-gothic font-bold gd-gold tracking-wider">⚙ Deployment</h2>
            <span className="gd-status-light gd-status-amber"></span>
          </div>
          <span className="gd-holo-readout gd-gold-dim border-[#c9a22740]">SETUP</span>
        </div>
        <p className="text-sm gd-bone opacity-60 mb-4">
          Deploy units according to the AI guidance below. Place your own army, then proceed.
        </p>
        <button
          onClick={onCompleteDeployment}
          className="w-full gd-btn-gold py-2 px-4 rounded transition-all"
        >
          Start Battle Round 1
        </button>
      </div>
    );
  }

  return (
    <div className="gd-cogitator gd-hash-marks p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-gothic font-bold gd-gold tracking-wider">
            Round {turn} / 5
          </h2>
          <span className={`gd-status-light ${turnSide === 'player' ? 'gd-status-green' : 'gd-status-red'}`}></span>
        </div>
        <span className={`gd-holo-readout ${
          turnSide === 'player' ? 'text-[#6a9fd5] border-[#4a6fa540]' : 'text-[#cc4444] border-[#8b000040]'
        }`}>
          {PHASE_LABELS[phase].replace(' Phase', '')}
        </span>
      </div>

      {/* Turn side indicator */}
      <div className={`text-center py-2 mb-3 font-gothic font-bold text-sm tracking-wider transition-all ${
        turnSide === 'player'
          ? 'bg-[#4a6fa5]/20 text-[#6a9fd5] border border-[#4a6fa5]/50'
          : 'bg-[#8b0000]/20 text-[#cc4444] border border-[#8b0000]/50'
      }`}>
        {turnSide === 'player' ? (
          <span className="flex items-center justify-center gap-2">
            <span className="gd-status-light gd-status-green"></span>
            ⚔ YOUR TURN
            <span className="gd-status-light gd-status-green"></span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span className="gd-status-light gd-status-red"></span>
            ☠ AI TURN
            <span className="gd-status-light gd-status-red"></span>
          </span>
        )}
      </div>

      <div className="flex gap-1 mb-4">
        {PHASES.map((p, i) => (
          <div
            key={p}
            className={`flex-1 h-[3px] transition-all ${
              i < currentIdx
                ? 'gd-phase-bar-done'
                : i === currentIdx
                  ? 'gd-phase-bar-active'
                  : 'gd-phase-bar'
            }`}
          />
        ))}
      </div>

      <div className="flex gap-1 mb-4 text-[10px] sm:text-xs">
        {PHASES.map((p, i) => (
          <div
            key={p}
            className={`flex-1 text-center truncate transition-all ${
              i === currentIdx ? 'gd-gold font-semibold' : 'gd-bone opacity-40'
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
              className="flex-1 gd-btn-gold py-2 px-4 rounded transition-all text-sm"
            >
              Next Phase →
            </button>
          ) : (
            <button
              onClick={turnSide === 'player' ? onNextPhase : onNextPhase}
              className={`flex-1 font-bold py-2 px-4 rounded transition-all text-sm ${
                turnSide === 'player'
                  ? 'gd-btn-danger'
                  : 'gd-btn-gold'
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
        <div className="text-center py-4">
          <div className="gd-game-over gd-victory font-gothic font-bold tracking-widest">
            ☠ GAME OVER ☠
          </div>
        </div>
      )}
    </div>
  );
}
