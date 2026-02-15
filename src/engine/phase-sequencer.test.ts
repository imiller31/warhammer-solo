import { describe, it, expect } from 'vitest';
import { gameReducer, createInitialUnitStates, getNextPhase } from './phase-sequencer';
import type { GameState, FactionData, Mission } from '../types';

const fakeFaction: FactionData = {
  id: 'test-faction',
  name: 'Test',
  factionAbilities: [],
  units: [
    {
      id: 'unit-a',
      name: 'Unit A',
      faction: 'space-marines',
      movement: '6"',
      toughness: 4,
      save: '3+',
      wounds: 2,
      leadership: '6+',
      oc: 1,
      modelCount: 5,
      weapons: [],
      abilities: [],
      coreAbilities: [],
      keywords: [],
      role: 'aggressive',
    },
  ],
  stratagems: [],
  enhancements: [],
  secondaryObjectives: [],
};

const fakeMission: Mission = {
  id: 1,
  name: 'Test Mission',
  description: 'Test',
  objectiveCount: 3,
  scoringRules: [],
  specialRules: [],
};

const emptyState: GameState = {
  turn: 0,
  battleRound: 0,
  phase: 'command',
  turnSide: 'player',
  activePlayer: 'attacker',
  playerFaction: fakeFaction,
  aiFaction: fakeFaction,
  playerUnits: [],
  aiUnits: [],
  playerVP: 0,
  aiVP: 0,
  playerCP: 0,
  aiCP: 0,
  mission: fakeMission,
  shadowInTheWarpUsed: false,
  aiDecisions: [],
  gameOver: false,
  turnLog: [],
  deploymentComplete: false,
};

describe('createInitialUnitStates', () => {
  it('creates states for units', () => {
    const states = createInitialUnitStates([
      { id: 'u1', wounds: 3, modelCount: 5, coreAbilities: [] },
      { id: 'u2', wounds: 6, modelCount: 1, coreAbilities: ['Deep Strike'] },
    ]);
    expect(states).toHaveLength(2);
    expect(states[0]?.unitId).toBe('u1');
    expect(states[0]?.currentWounds).toBe(3);
    expect(states[0]?.modelsRemaining).toBe(5);
    expect(states[0]?.inReserve).toBe(false);
    expect(states[1]?.inReserve).toBe(true);
  });
});

describe('getNextPhase', () => {
  it('advances through phases', () => {
    expect(getNextPhase('command')).toBe('movement');
    expect(getNextPhase('movement')).toBe('shooting');
    expect(getNextPhase('shooting')).toBe('charge');
    expect(getNextPhase('charge')).toBe('fight');
    expect(getNextPhase('fight')).toBeNull();
  });

  it('returns null for deployment', () => {
    expect(getNextPhase('deployment')).toBeNull();
  });
});

describe('gameReducer', () => {
  it('START_GAME sets turn 1 deployment phase', () => {
    const state = gameReducer(emptyState, {
      type: 'START_GAME',
      playerFaction: fakeFaction,
      aiFaction: fakeFaction,
      mission: fakeMission,
    });
    expect(state.turn).toBe(1);
    expect(state.battleRound).toBe(1);
    expect(state.phase).toBe('deployment');
    expect(state.playerCP).toBe(0);
    expect(state.aiCP).toBe(0);
    expect(state.gameOver).toBe(false);
  });

  it('COMPLETE_DEPLOYMENT moves to command phase', () => {
    const started = gameReducer(emptyState, {
      type: 'START_GAME',
      playerFaction: fakeFaction,
      aiFaction: fakeFaction,
      mission: fakeMission,
    });
    const deployed = gameReducer(started, { type: 'COMPLETE_DEPLOYMENT' });
    expect(deployed.phase).toBe('command');
    expect(deployed.deploymentComplete).toBe(true);
  });

  it('NEXT_PHASE cycles through phases', () => {
    let state = gameReducer(emptyState, {
      type: 'START_GAME',
      playerFaction: fakeFaction,
      aiFaction: fakeFaction,
      mission: fakeMission,
    });
    state = gameReducer(state, { type: 'COMPLETE_DEPLOYMENT' });
    expect(state.phase).toBe('command');

    state = gameReducer(state, { type: 'NEXT_PHASE' });
    expect(state.phase).toBe('movement');

    state = gameReducer(state, { type: 'NEXT_PHASE' });
    expect(state.phase).toBe('shooting');

    state = gameReducer(state, { type: 'NEXT_PHASE' });
    expect(state.phase).toBe('charge');

    state = gameReducer(state, { type: 'NEXT_PHASE' });
    expect(state.phase).toBe('fight');
  });

  it('NEXT_PHASE after fight switches to AI turn', () => {
    let state = gameReducer(emptyState, {
      type: 'START_GAME',
      playerFaction: fakeFaction,
      aiFaction: fakeFaction,
      mission: fakeMission,
    });
    state = gameReducer(state, { type: 'COMPLETE_DEPLOYMENT' });

    // Advance through all player phases
    for (let i = 0; i < 5; i++) {
      state = gameReducer(state, { type: 'NEXT_PHASE' });
    }
    // After fight, should be AI turn command phase
    expect(state.turnSide).toBe('ai');
    expect(state.phase).toBe('command');
  });

  it('AI turn end advances battle round and grants CP', () => {
    let state = gameReducer(emptyState, {
      type: 'START_GAME',
      playerFaction: fakeFaction,
      aiFaction: fakeFaction,
      mission: fakeMission,
    });
    state = gameReducer(state, { type: 'COMPLETE_DEPLOYMENT' });

    // Player turn: 5 NEXT_PHASE to go through all phases, then AI gets turn
    for (let i = 0; i < 5; i++) {
      state = gameReducer(state, { type: 'NEXT_PHASE' });
    }
    expect(state.turnSide).toBe('ai');

    // AI turn: 5 phases
    for (let i = 0; i < 5; i++) {
      state = gameReducer(state, { type: 'NEXT_PHASE' });
    }
    // Should be round 2, player turn, each side got +1 CP
    expect(state.battleRound).toBe(2);
    expect(state.turnSide).toBe('player');
    expect(state.playerCP).toBe(1);
    expect(state.aiCP).toBe(1);
  });

  it('game ends after turn 5', () => {
    let state = gameReducer(emptyState, {
      type: 'START_GAME',
      playerFaction: fakeFaction,
      aiFaction: fakeFaction,
      mission: fakeMission,
    });
    state = gameReducer(state, { type: 'COMPLETE_DEPLOYMENT' });

    // Simulate 5 full battle rounds (each = player 5 phases + AI 5 phases)
    for (let round = 0; round < 5; round++) {
      // Player phases
      for (let i = 0; i < 5; i++) {
        state = gameReducer(state, { type: 'NEXT_PHASE' });
      }
      // AI phases
      for (let i = 0; i < 5; i++) {
        state = gameReducer(state, { type: 'NEXT_PHASE' });
      }
    }
    expect(state.gameOver).toBe(true);
  });

  it('RESET_GAME returns to initial state', () => {
    const started = gameReducer(emptyState, {
      type: 'START_GAME',
      playerFaction: fakeFaction,
      aiFaction: fakeFaction,
      mission: fakeMission,
    });
    const reset = gameReducer(started, { type: 'RESET_GAME' });
    expect(reset.turn).toBe(0);
    expect(reset.gameOver).toBe(false);
  });
});
