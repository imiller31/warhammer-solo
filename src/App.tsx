import { useReducer, useCallback, useEffect } from 'react';
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

const emptyState: GameState = {
  turn: 0,
  phase: 'command',
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
};

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, emptyState);
  const gameStarted = state.turn > 0;

  const handleStartGame = useCallback((playerFaction: FactionData, aiFaction: FactionData, mission: Mission) => {
    dispatch({ type: 'START_GAME', playerFaction, aiFaction, mission });
  }, []);

  useEffect(() => {
    if (gameStarted && !state.gameOver && state.aiDecisions.length === 0) {
      const decisions = generateAIDecisions(state);
      dispatch({ type: 'SET_AI_DECISIONS', decisions });
    }
  }, [state.turn, state.phase, gameStarted, state.gameOver, state.aiDecisions.length, state]);

  const handleNextPhase = useCallback(() => {
    dispatch({ type: 'NEXT_PHASE' });
  }, []);

  const handleNextTurn = useCallback(() => {
    if (state.turn >= 5) {
      dispatch({ type: 'END_GAME' });
    } else {
      dispatch({ type: 'NEXT_TURN' });
    }
  }, [state.turn]);

  if (!gameStarted) {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-amber-400">WH40K Solo</h1>
            <span className="text-xs text-gray-500">{state.mission.name}</span>
          </div>
          <div className="text-sm text-gray-400">
            {state.playerFaction.name} <span className="text-gray-600">vs</span> {state.aiFaction.name}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PhaseTracker
            turn={state.turn}
            phase={state.phase}
            onNextPhase={handleNextPhase}
            onNextTurn={handleNextTurn}
            gameOver={state.gameOver}
          />
          <ScoreBoard
            playerVP={state.playerVP}
            aiVP={state.aiVP}
            playerCP={state.playerCP}
            aiCP={state.aiCP}
            playerFactionName={state.playerFaction.name}
            aiFactionName={state.aiFaction.name}
            onAdjustVP={(side, delta) => {
              if (delta > 0) dispatch({ type: 'SCORE_VP', side: side === 'player' ? 'attacker' : 'defender', amount: delta, reason: 'Manual adjustment' });
            }}
            onAdjustCP={(side, delta) => {
              if (delta > 0) {
                dispatch({ type: 'ADD_LOG', message: `${side === 'player' ? 'Player' : 'AI'} gains 1 CP (manual)` });
              } else if (delta < 0) {
                dispatch({ type: 'SPEND_CP', side: side === 'player' ? 'attacker' : 'defender', amount: 1, reason: 'Manual spend' });
              }
            }}
          />
        </div>

        <AIDecision
          decisions={state.aiDecisions}
          phaseName={PHASE_LABELS[state.phase]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-bold text-blue-400 uppercase mb-2">
              Your Army — {state.playerFaction.name}
            </h2>
            <div className="space-y-2">
              {state.playerFaction.units.map((unit) => {
                const unitState = state.playerUnits.find((u) => u.unitId === unit.id)!;
                return (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    unitState={unitState}
                    side="player"
                    onUpdateWounds={(w) => dispatch({ type: 'UPDATE_UNIT', side: 'attacker', unitId: unit.id, updates: { currentWounds: w, isDestroyed: w <= 0 } })}
                    onUpdateModels={(m) => dispatch({ type: 'UPDATE_UNIT', side: 'attacker', unitId: unit.id, updates: { modelsRemaining: m, isDestroyed: m <= 0 } })}
                    onToggleBattleshock={() => dispatch({ type: 'UPDATE_UNIT', side: 'attacker', unitId: unit.id, updates: { isBattleshocked: !unitState.isBattleshocked } })}
                    onDestroy={() => dispatch({ type: 'UPDATE_UNIT', side: 'attacker', unitId: unit.id, updates: { isDestroyed: true, modelsRemaining: 0, currentWounds: 0 } })}
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
                const unitState = state.aiUnits.find((u) => u.unitId === unit.id)!;
                return (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    unitState={unitState}
                    side="ai"
                    onUpdateWounds={(w) => dispatch({ type: 'UPDATE_UNIT', side: 'defender', unitId: unit.id, updates: { currentWounds: w, isDestroyed: w <= 0 } })}
                    onUpdateModels={(m) => dispatch({ type: 'UPDATE_UNIT', side: 'defender', unitId: unit.id, updates: { modelsRemaining: m, isDestroyed: m <= 0 } })}
                    onToggleBattleshock={() => dispatch({ type: 'UPDATE_UNIT', side: 'defender', unitId: unit.id, updates: { isBattleshocked: !unitState.isBattleshocked } })}
                    onDestroy={() => dispatch({ type: 'UPDATE_UNIT', side: 'defender', unitId: unit.id, updates: { isDestroyed: true, modelsRemaining: 0, currentWounds: 0 } })}
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
