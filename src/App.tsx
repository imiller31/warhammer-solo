import { useReducer, useCallback, useEffect, useState, lazy, Suspense } from 'react';
import type { FactionData, Mission, GameState } from './types';
import { PHASE_LABELS } from './types';
import { gameReducer } from './engine/phase-sequencer';
import { generateAIDecisions } from './engine/ai-behavior';
import { PhaseTracker } from './components/PhaseTracker';
import { UnitCard } from './components/UnitCard';
import { AIDecision } from './components/AIDecision';
import { ScoreBoard } from './components/ScoreBoard';
import { DiceRoller } from './components/DiceRoller';
import { GameSetup } from './components/GameSetup';
import { GameLog } from './components/GameLog';
import { loadSavedGame, saveGame, clearSave } from './lib/storage';

const CoreStratagems = lazy(() => import('./components/CoreStratagems').then(m => ({ default: m.CoreStratagems })));

const emptyState: GameState = {
  turn: 0,
  battleRound: 0,
  phase: 'command',
  turnSide: 'player',
  activePlayer: 'attacker',
  playerFaction: { id: '', name: '', factionAbilities: [], units: [], stratagems: [], enhancements: [], secondaryObjectives: [] },
  aiFaction: { id: '', name: '', factionAbilities: [], units: [], stratagems: [], enhancements: [], secondaryObjectives: [] },
  playerUnits: [],
  aiUnits: [],
  playerVP: 0,
  aiVP: 0,
  playerCP: 0,
  aiCP: 0,
  mission: { id: 0, name: '', description: '', objectiveCount: 0, scoringRules: [], specialRules: [] },
  shadowInTheWarpUsed: false,
  aiDecisions: [],
  gameOver: false,
  turnLog: [],
  deploymentComplete: false,
};

export default function App() {
  const [savedGame] = useState<GameState | null>(() => loadSavedGame());
  const [showResume, setShowResume] = useState(!!savedGame);
  const [state, dispatch] = useReducer(gameReducer, emptyState);
  const gameStarted = state.turn > 0;

  // Auto-save on every state change
  useEffect(() => {
    if (gameStarted) {
      saveGame(state);
    }
  }, [state, gameStarted]);

  const handleStartGame = useCallback((playerFaction: FactionData, aiFaction: FactionData, mission: Mission) => {
    setShowResume(false);
    dispatch({ type: 'START_GAME', playerFaction, aiFaction, mission });
  }, []);

  const handleResumeGame = useCallback(() => {
    if (savedGame) {
      dispatch({ type: 'LOAD_GAME', state: savedGame });
    }
    setShowResume(false);
  }, [savedGame]);

  const handleResetGame = useCallback(() => {
    clearSave();
    dispatch({ type: 'RESET_GAME' });
    setShowResume(false);
  }, []);

  useEffect(() => {
    if (gameStarted && !state.gameOver && state.aiDecisions.length === 0) {
      const decisions = generateAIDecisions(state);
      dispatch({ type: 'SET_AI_DECISIONS', decisions });
    }
  }, [state.turn, state.phase, state.turnSide, gameStarted, state.gameOver, state.aiDecisions.length, state]);

  const handleNextPhase = useCallback(() => {
    dispatch({ type: 'NEXT_PHASE' });
  }, []);

  const handleNextTurn = useCallback(() => {
    if (state.turn >= 5 && state.turnSide === 'ai') {
      dispatch({ type: 'END_GAME' });
    } else {
      dispatch({ type: 'NEXT_TURN' });
    }
  }, [state.turn, state.turnSide]);

  const handleCompleteDeployment = useCallback(() => {
    dispatch({ type: 'COMPLETE_DEPLOYMENT' });
  }, []);

  // Show resume prompt
  if (!gameStarted && showResume && savedGame) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-6 text-center">
          <h1 className="text-3xl font-bold text-amber-400">WARHAMMER 40K</h1>
          <h2 className="text-lg text-gray-400">Solo Combat Patrol</h2>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-4">
            <p className="text-gray-300">Saved game found!</p>
            <p className="text-sm text-gray-500">
              Round {savedGame.battleRound}/5 — {savedGame.playerFaction.name} vs {savedGame.aiFaction.name}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleResumeGame}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Continue Game
              </button>
              <button
                onClick={() => { clearSave(); setShowResume(false); }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-3 px-4 rounded-lg transition-colors"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  const isDeployment = state.phase === 'deployment';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="bg-gray-900 border-b border-gray-800 px-3 sm:px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-amber-400">WH40K Solo</h1>
            <span className="text-xs text-gray-500">{state.mission.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs sm:text-sm text-gray-400 text-right">
              <span className="text-blue-400">{state.playerFaction.name}</span>
              {' '}vs{' '}
              <span className="text-red-400">{state.aiFaction.name}</span>
            </div>
            <button
              onClick={handleResetGame}
              className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-400 transition-colors"
              title="Reset Game"
            >
              ✕ Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-3 sm:p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PhaseTracker
            turn={state.battleRound}
            phase={state.phase}
            turnSide={state.turnSide}
            onNextPhase={handleNextPhase}
            onNextTurn={handleNextTurn}
            gameOver={state.gameOver}
            isDeployment={isDeployment}
            onCompleteDeployment={handleCompleteDeployment}
          />
          <ScoreBoard
            playerVP={state.playerVP}
            aiVP={state.aiVP}
            playerCP={state.playerCP}
            aiCP={state.aiCP}
            playerFactionName={state.playerFaction.name}
            aiFactionName={state.aiFaction.name}
            onAdjustVP={(side, delta) => {
              dispatch({
                type: 'SCORE_VP',
                side: side === 'player' ? 'attacker' : 'defender',
                amount: delta,
                reason: 'Manual adjustment',
              });
            }}
            onAdjustCP={(side, delta) => {
              if (delta > 0) {
                dispatch({ type: 'GAIN_CP', side: side === 'player' ? 'attacker' : 'defender', amount: delta, reason: 'Manual' });
              } else if (delta < 0) {
                dispatch({ type: 'SPEND_CP', side: side === 'player' ? 'attacker' : 'defender', amount: 1, reason: 'Manual spend' });
              }
            }}
          />
        </div>

        <AIDecision
          decisions={state.aiDecisions}
          phaseName={PHASE_LABELS[state.phase]}
          turnSide={state.turnSide}
          state={state}
          onSetOathTarget={(targetId) => dispatch({ type: 'SET_OATH_TARGET', targetId })}
          onUseShadowInTheWarp={() => dispatch({ type: 'USE_SHADOW_IN_WARP' })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-bold text-blue-400 uppercase mb-2">
              Your Army — {state.playerFaction.name}
            </h2>
            <div className="space-y-2">
              {state.playerFaction.units.map((unit) => {
                const unitState = state.playerUnits.find((u) => u.unitId === unit.id);
                if (!unitState) return null;
                return (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    unitState={unitState}
                    side="player"
                    isOathTarget={state.oathOfMomentTarget === unit.id}
                    onUpdateWounds={(w) => dispatch({ type: 'UPDATE_UNIT', side: 'attacker', unitId: unit.id, updates: { currentWounds: Math.max(0, Math.min(unit.wounds, w)), isDestroyed: w <= 0 } })}
                    onUpdateModels={(m) => dispatch({ type: 'UPDATE_UNIT', side: 'attacker', unitId: unit.id, updates: { modelsRemaining: Math.max(0, Math.min(unit.modelCount, m)), isDestroyed: m <= 0 } })}
                    onToggleBattleshock={() => dispatch({ type: 'UPDATE_UNIT', side: 'attacker', unitId: unit.id, updates: { isBattleshocked: !unitState.isBattleshocked } })}
                    onDestroy={() => dispatch({ type: 'UPDATE_UNIT', side: 'attacker', unitId: unit.id, updates: { isDestroyed: true, modelsRemaining: 0, currentWounds: 0 } })}
                    onDeployFromReserve={unitState.inReserve && state.battleRound >= 2 ? () => dispatch({ type: 'DEPLOY_FROM_RESERVE', side: 'attacker', unitId: unit.id }) : undefined}
                  />
                );
              })}
            </div>

            {state.playerFaction.stratagems.length > 0 && (
              <div className="mt-4 bg-gray-900 border border-gray-700 rounded-lg p-3">
                <h3 className="text-sm font-bold text-blue-400 mb-2">Stratagems</h3>
                {state.playerFaction.stratagems.map((s) => (
                  <div key={s.name} className="mb-2 text-xs">
                    <div className="text-gray-200 font-semibold">{s.name} ({s.cpCost}CP) — {s.type}</div>
                    <div className="text-gray-500">{s.when}</div>
                    <div className="text-gray-400">{s.effect}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-bold text-red-400 uppercase mb-2">
              AI Army — {state.aiFaction.name}
            </h2>
            <div className="space-y-2">
              {state.aiFaction.units.map((unit) => {
                const unitState = state.aiUnits.find((u) => u.unitId === unit.id);
                if (!unitState) return null;
                return (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    unitState={unitState}
                    side="ai"
                    onUpdateWounds={(w) => dispatch({ type: 'UPDATE_UNIT', side: 'defender', unitId: unit.id, updates: { currentWounds: Math.max(0, Math.min(unit.wounds, w)), isDestroyed: w <= 0 } })}
                    onUpdateModels={(m) => dispatch({ type: 'UPDATE_UNIT', side: 'defender', unitId: unit.id, updates: { modelsRemaining: Math.max(0, Math.min(unit.modelCount, m)), isDestroyed: m <= 0 } })}
                    onToggleBattleshock={() => dispatch({ type: 'UPDATE_UNIT', side: 'defender', unitId: unit.id, updates: { isBattleshocked: !unitState.isBattleshocked } })}
                    onDestroy={() => dispatch({ type: 'UPDATE_UNIT', side: 'defender', unitId: unit.id, updates: { isDestroyed: true, modelsRemaining: 0, currentWounds: 0 } })}
                    onDeployFromReserve={unitState.inReserve && state.battleRound >= 2 ? () => dispatch({ type: 'DEPLOY_FROM_RESERVE', side: 'defender', unitId: unit.id }) : undefined}
                  />
                );
              })}
            </div>

            {state.aiFaction.stratagems.length > 0 && (
              <div className="mt-4 bg-gray-900 border border-gray-700 rounded-lg p-3">
                <h3 className="text-sm font-bold text-red-400 mb-2">AI Stratagems</h3>
                {state.aiFaction.stratagems.map((s) => (
                  <div key={s.name} className="mb-2 text-xs">
                    <div className="text-gray-200 font-semibold">{s.name} ({s.cpCost}CP) — {s.type}</div>
                    <div className="text-gray-500">{s.when}</div>
                    <div className="text-gray-400">{s.effect}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Suspense fallback={<div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-500 text-sm">Loading stratagems…</div>}>
          <CoreStratagems />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DiceRoller />
          <GameLog entries={state.turnLog} />
        </div>

        {state.mission.scoringRules.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-bold text-amber-400 mb-2">Mission: {state.mission.name}</h2>
            <p className="text-sm text-gray-400 mb-3">{state.mission.description}</p>
            <div className="space-y-1">
              {state.mission.scoringRules.map((rule, i) => (
                <div key={i} className="text-xs text-gray-300 flex gap-2">
                  <span className="text-amber-500 shrink-0">•</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
            {state.mission.specialRules.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700 space-y-1">
                {state.mission.specialRules.map((rule, i) => (
                  <div key={i} className="text-xs text-gray-500 flex gap-2">
                    <span className="text-gray-600 shrink-0">*</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
