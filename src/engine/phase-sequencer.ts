import type { Phase, GameState, GameAction, UnitState } from '../types';
import { PHASES } from '../types';

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

export function getNextPhase(current: Phase): Phase | null {
  const idx = PHASES.indexOf(current);
  if (idx < PHASES.length - 1) return PHASES[idx + 1];
  return null;
}

/**
 * After fight phase ends for a side, switch sides or advance battle round.
 * Flow: Player Command→Movement→Shooting→Charge→Fight → AI Command→...→Fight → next battle round
 */
function advanceAfterFight(state: GameState): GameState {
  if (state.turnSide === 'player') {
    // Switch to AI turn
    return {
      ...state,
      turnSide: 'ai',
      phase: 'command',
      playerUnits: resetPhaseFlags(state.playerUnits),
      aiUnits: resetTurnFlags(state.aiUnits),
      aiDecisions: [],
      turnLog: [...state.turnLog, `--- AI Turn (Battle Round ${state.battleRound}) ---`],
    };
  } else {
    // AI turn done — advance battle round
    const newRound = state.battleRound + 1;
    if (newRound > 5) {
      return { ...state, gameOver: true, turnLog: [...state.turnLog, 'Game Over! 5 battle rounds completed.'] };
    }
    return {
      ...state,
      battleRound: newRound,
      turn: newRound,
      turnSide: 'player',
      phase: 'command',
      playerUnits: resetTurnFlags(state.playerUnits),
      aiUnits: resetTurnFlags(state.aiUnits),
      playerCP: state.playerCP + 1,
      aiCP: state.aiCP + 1,
      aiDecisions: [],
      turnLog: [...state.turnLog, `=== Battle Round ${newRound} ===`, `--- Your Turn (Battle Round ${newRound}) ---`],
    };
  }
}

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
        turnLog: [`Battle begins! Mission: ${action.mission.name}`],
      };

    case 'COMPLETE_DEPLOYMENT':
      return {
        ...state,
        phase: 'command',
        deploymentComplete: true,
        turnLog: [...state.turnLog, '=== Battle Round 1 ===', '--- Your Turn (Battle Round 1) ---'],
      };

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
      // Last phase (fight) — advance to other side or next round
      return advanceAfterFight(state);
    }

    case 'NEXT_TURN': {
      // Legacy — same as advancing after last phase
      return advanceAfterFight(state);
    }

    case 'UPDATE_UNIT': {
      const key = action.side === 'attacker' ? 'playerUnits' : 'aiUnits';
      return {
        ...state,
        [key]: state[key].map((u) =>
          u.unitId === action.unitId ? { ...u, ...action.updates } : u
        ),
      };
    }

    case 'SCORE_VP': {
      const vpKey = action.side === 'attacker' ? 'playerVP' : 'aiVP';
      const newVal = state[vpKey] + action.amount;
      return {
        ...state,
        [vpKey]: Math.max(0, newVal),
        turnLog: [...state.turnLog, `${action.side === 'attacker' ? 'Player' : 'AI'} ${action.amount > 0 ? 'scores' : 'loses'} ${Math.abs(action.amount)}VP: ${action.reason}`],
      };
    }

    case 'SPEND_CP': {
      const cpKey = action.side === 'attacker' ? 'playerCP' : 'aiCP';
      const current = state[cpKey];
      if (current < action.amount) return state;
      return {
        ...state,
        [cpKey]: current - action.amount,
        turnLog: [...state.turnLog, `${action.side === 'attacker' ? 'Player' : 'AI'} spends ${action.amount}CP: ${action.reason}`],
      };
    }

    case 'GAIN_CP': {
      const cpKey = action.side === 'attacker' ? 'playerCP' : 'aiCP';
      return {
        ...state,
        [cpKey]: state[cpKey] + action.amount,
        turnLog: [...state.turnLog, `${action.side === 'attacker' ? 'Player' : 'AI'} gains ${action.amount}CP: ${action.reason}`],
      };
    }

    case 'SET_OATH_TARGET':
      return {
        ...state,
        oathOfMomentTarget: action.targetId,
        turnLog: [...state.turnLog, 'Oath of Moment target set.'],
      };

    case 'USE_SHADOW_IN_WARP':
      return {
        ...state,
        shadowInTheWarpUsed: true,
        turnLog: [...state.turnLog, 'Shadow in the Warp unleashed! All enemy units must take Battle-shock tests.'],
      };

    case 'ADD_LOG':
      return { ...state, turnLog: [...state.turnLog, action.message] };

    case 'SET_AI_DECISIONS':
      return { ...state, aiDecisions: action.decisions };

    case 'END_GAME':
      return { ...state, gameOver: true };

    default:
      return state;
  }
}
