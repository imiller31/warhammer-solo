import type { Phase, GameState, GameAction, UnitState, LogEntry, TurnSide } from '../types';
import { PHASES } from '../types';

/** Creates a log entry with current game context. */
function logEntry(message: string, state: GameState, category: 'player' | 'ai' | 'system' = 'system'): LogEntry {
  return { message, turn: state.battleRound, phase: state.phase, turnSide: state.turnSide, category };
}

/** Creates initial UnitState array from unit profiles. Deep Strike units start in reserve. */
export function createInitialUnitStates(
  units: { id: string; wounds: number; modelCount: number; coreAbilities: string[] }[]
): UnitState[] {
  return units.map((u) => ({
    unitId: u.id,
    currentWounds: u.wounds,
    modelsRemaining: u.modelCount,
    isBattleshocked: false,
    isDestroyed: false,
    hasActedThisPhase: false,
    hasMoved: false,
    hasShot: false,
    hasCharged: false,
    hasFought: false,
    inReserve: u.coreAbilities.includes('Deep Strike'),
  }));
}

function resetPhaseFlags(units: UnitState[]): UnitState[] {
  return units.map((u) => ({ ...u, hasActedThisPhase: false }));
}

function resetTurnFlags(units: UnitState[]): UnitState[] {
  return units.map((u) => ({
    ...u,
    hasActedThisPhase: false,
    hasMoved: false,
    hasShot: false,
    hasCharged: false,
    hasFought: false,
  }));
}

/** Returns the next phase in sequence, or null if at the last phase. */
export function getNextPhase(current: Phase): Phase | null {
  const idx = PHASES.indexOf(current);
  const next = idx >= 0 && idx < PHASES.length - 1 ? PHASES[idx + 1] : undefined;
  return next ?? null;
}

/** Force-arrive any reserves still off the table at end of turn 3 */
function forceArriveReserves(units: UnitState[], turnSide: TurnSide, battleRound: number, logs: LogEntry[], state: GameState): { units: UnitState[]; logs: LogEntry[] } {
  if (battleRound < 3) return { units, logs };
  const newLogs = [...logs];
  const updated = units.map((u) => {
    if (u.inReserve && !u.isDestroyed) {
      if (battleRound > 3) {
        // After turn 3, reserves are destroyed
        newLogs.push(logEntry(`${u.unitId} was still in reserves after turn 3 — DESTROYED!`, state, turnSide === 'player' ? 'player' : 'ai'));
        return { ...u, inReserve: false, isDestroyed: true, modelsRemaining: 0, currentWounds: 0 };
      } else {
        // End of turn 3 — must arrive
        newLogs.push(logEntry(`${u.unitId} MUST arrive from reserves now (end of turn 3)`, state, turnSide === 'player' ? 'player' : 'ai'));
        return { ...u, inReserve: false };
      }
    }
    return u;
  });
  return { units: updated, logs: newLogs };
}

function advanceAfterFight(state: GameState): GameState {
  if (state.turnSide === 'player') {
    return {
      ...state,
      turnSide: 'ai',
      phase: 'command',
      playerUnits: resetPhaseFlags(state.playerUnits),
      aiUnits: resetTurnFlags(state.aiUnits),
      aiDecisions: [],
      turnLog: [...state.turnLog, logEntry(`--- AI Turn (Battle Round ${state.battleRound}) ---`, state, 'system')],
    };
  } else {
    // End of AI turn — check reserves at end of turn 3
    let aiUnits = state.aiUnits;
    let playerUnits = state.playerUnits;
    let extraLogs: LogEntry[] = [];

    if (state.battleRound >= 3) {
      const aiResult = forceArriveReserves(aiUnits, 'ai', state.battleRound, extraLogs, state);
      aiUnits = aiResult.units;
      extraLogs = aiResult.logs;
      const playerResult = forceArriveReserves(playerUnits, 'player', state.battleRound, extraLogs, state);
      playerUnits = playerResult.units;
      extraLogs = playerResult.logs;
    }

    const newRound = state.battleRound + 1;
    if (newRound > 5) {
      return {
        ...state,
        aiUnits,
        playerUnits,
        gameOver: true,
        turnLog: [...state.turnLog, ...extraLogs, logEntry('Game Over! 5 battle rounds completed.', state, 'system')],
      };
    }
    return {
      ...state,
      battleRound: newRound,
      turn: newRound,
      turnSide: 'player',
      phase: 'command',
      playerUnits: resetTurnFlags(playerUnits),
      aiUnits: resetTurnFlags(aiUnits),
      playerCP: state.playerCP + 1,
      aiCP: state.aiCP + 1,
      aiDecisions: [],
      turnLog: [
        ...state.turnLog,
        ...extraLogs,
        logEntry(`=== Battle Round ${newRound} ===`, state, 'system'),
        logEntry(`--- Your Turn (Battle Round ${newRound}) ---`, state, 'system'),
      ],
    };
  }
}

/** Main game state reducer handling all game actions. */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        turn: 1,
        battleRound: 1,
        phase: 'deployment',
        turnSide: 'player',
        activePlayer: 'attacker',
        playerFaction: action.playerFaction,
        aiFaction: action.aiFaction,
        playerUnits: createInitialUnitStates(
          action.playerFaction.units.map((u) => ({
            id: u.id,
            wounds: u.wounds,
            modelCount: u.modelCount,
            coreAbilities: u.coreAbilities,
          }))
        ),
        aiUnits: createInitialUnitStates(
          action.aiFaction.units.map((u) => ({
            id: u.id,
            wounds: u.wounds,
            modelCount: u.modelCount,
            coreAbilities: u.coreAbilities,
          }))
        ),
        playerVP: 0,
        aiVP: 0,
        playerCP: 0,
        aiCP: 0,
        mission: action.mission,
        shadowInTheWarpUsed: false,
        aiDecisions: [],
        gameOver: false,
        deploymentComplete: false,
        turnLog: [{ message: `Battle begins! Mission: ${action.mission.name}`, turn: 1, phase: 'deployment', turnSide: 'player', category: 'system' }],
      };

    case 'COMPLETE_DEPLOYMENT': {
      const base: GameState = {
        ...state,
        phase: 'command',
        deploymentComplete: true,
      };
      return {
        ...base,
        turnLog: [
          ...state.turnLog,
          logEntry('=== Battle Round 1 ===', base, 'system'),
          logEntry('--- Your Turn (Battle Round 1) ---', base, 'system'),
        ],
      };
    }

    case 'NEXT_PHASE': {
      const next = getNextPhase(state.phase);
      if (next) {
        return {
          ...state,
          phase: next,
          playerUnits: resetPhaseFlags(state.playerUnits),
          aiUnits: resetPhaseFlags(state.aiUnits),
          aiDecisions: [],
        };
      }
      return advanceAfterFight(state);
    }

    case 'NEXT_TURN':
      return advanceAfterFight(state);

    case 'UPDATE_UNIT': {
      const key = action.side === 'attacker' ? 'playerUnits' : 'aiUnits';
      return {
        ...state,
        [key]: state[key].map((u) =>
          u.unitId === action.unitId ? { ...u, ...action.updates } : u
        ),
      };
    }

    case 'DEPLOY_FROM_RESERVE': {
      const key = action.side === 'attacker' ? 'playerUnits' : 'aiUnits';
      const unitSide = action.side === 'attacker' ? 'player' : 'ai';
      return {
        ...state,
        [key]: state[key].map((u) =>
          u.unitId === action.unitId ? { ...u, inReserve: false } : u
        ),
        turnLog: [
          ...state.turnLog,
          logEntry(
            `${action.unitId} deployed from reserves! Set up >9" from enemy models.`,
            state,
            unitSide === 'player' ? 'player' : 'ai'
          ),
        ],
      };
    }

    case 'SCORE_VP': {
      const vpKey = action.side === 'attacker' ? 'playerVP' : 'aiVP';
      const newVal = state[vpKey] + action.amount;
      const cat = action.side === 'attacker' ? 'player' : 'ai';
      return {
        ...state,
        [vpKey]: Math.max(0, newVal),
        turnLog: [
          ...state.turnLog,
          logEntry(
            `${action.side === 'attacker' ? 'Player' : 'AI'} ${action.amount > 0 ? 'scores' : 'loses'} ${Math.abs(action.amount)}VP: ${action.reason}`,
            state,
            cat as 'player' | 'ai'
          ),
        ],
      };
    }

    case 'SPEND_CP': {
      const cpKey = action.side === 'attacker' ? 'playerCP' : 'aiCP';
      const current = state[cpKey];
      if (current < action.amount) return state;
      const cat = action.side === 'attacker' ? 'player' : 'ai';
      return {
        ...state,
        [cpKey]: current - action.amount,
        turnLog: [
          ...state.turnLog,
          logEntry(`${action.side === 'attacker' ? 'Player' : 'AI'} spends ${action.amount}CP: ${action.reason}`, state, cat as 'player' | 'ai'),
        ],
      };
    }

    case 'GAIN_CP': {
      const cpKey = action.side === 'attacker' ? 'playerCP' : 'aiCP';
      const cat = action.side === 'attacker' ? 'player' : 'ai';
      return {
        ...state,
        [cpKey]: state[cpKey] + action.amount,
        turnLog: [
          ...state.turnLog,
          logEntry(`${action.side === 'attacker' ? 'Player' : 'AI'} gains ${action.amount}CP: ${action.reason}`, state, cat as 'player' | 'ai'),
        ],
      };
    }

    case 'SET_OATH_TARGET': {
      const targetUnit = state.playerFaction.units.find((u) => u.id === action.targetId);
      const targetName = targetUnit?.name ?? action.targetId;
      return {
        ...state,
        oathOfMomentTarget: action.targetId,
        turnLog: [
          ...state.turnLog,
          logEntry(`Oath of Moment: ${targetName} targeted. Re-roll all hits against them.`, state, 'ai'),
        ],
      };
    }

    case 'USE_SHADOW_IN_WARP':
      return {
        ...state,
        shadowInTheWarpUsed: true,
        turnLog: [
          ...state.turnLog,
          logEntry('Shadow in the Warp unleashed! All enemy units must take Battle-shock tests NOW.', state, 'ai'),
        ],
      };

    case 'ADD_LOG':
      return {
        ...state,
        turnLog: [
          ...state.turnLog,
          logEntry(action.message, state, action.category ?? 'system'),
        ],
      };

    case 'SET_AI_DECISIONS':
      return { ...state, aiDecisions: action.decisions };

    case 'END_GAME':
      return { ...state, gameOver: true };

    case 'RESET_GAME':
      return {
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

    case 'LOAD_GAME':
      return { ...action.state, aiDecisions: [] };

    default:
      return state;
  }
}
