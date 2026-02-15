import { describe, it, expect } from 'vitest';
import { generateAIDecisions } from './ai-behavior';
import type { GameState } from '../types';
import { spaceMarines } from '../data/space-marines';
import { tyranids } from '../data/tyranids';
import { createInitialUnitStates } from './phase-sequencer';

function makeGameState(overrides: Partial<GameState> = {}): GameState {
  const playerFaction = spaceMarines;
  const aiFaction = tyranids;
  return {
    turn: 1,
    battleRound: 1,
    phase: 'command',
    turnSide: 'ai',
    activePlayer: 'attacker',
    playerFaction,
    aiFaction,
    playerUnits: createInitialUnitStates(playerFaction.units.map((u) => ({ id: u.id, wounds: u.wounds, modelCount: u.modelCount, coreAbilities: u.coreAbilities }))),
    aiUnits: createInitialUnitStates(aiFaction.units.map((u) => ({ id: u.id, wounds: u.wounds, modelCount: u.modelCount, coreAbilities: u.coreAbilities }))),
    playerVP: 0,
    aiVP: 0,
    playerCP: 0,
    aiCP: 1,
    mission: { id: 1, name: 'Test', description: '', objectiveCount: 3, scoringRules: [], specialRules: [] },
    shadowInTheWarpUsed: false,
    aiDecisions: [],
    gameOver: false,
    turnLog: [],
    deploymentComplete: true,
    ...overrides,
  };
}

describe('generateAIDecisions', () => {
  it('returns decisions for all alive non-reserve units during AI turn', () => {
    const state = makeGameState({ phase: 'movement' });
    const decisions = generateAIDecisions(state);
    // Only alive non-reserve units get decisions (terror is in reserve turn 1)
    const aliveOnTable = state.aiUnits.filter((u) => !u.isDestroyed && !u.inReserve);
    const unitDecisions = decisions.filter((d) => !d.unitId.startsWith('faction-') && !d.unitId.startsWith('reactive-'));
    // Each alive on-table unit + reserve units should have a decision
    expect(unitDecisions.length).toBeGreaterThanOrEqual(aliveOnTable.length);
  });

  it('returns deployment guidance during deployment phase', () => {
    const state = makeGameState({ phase: 'deployment' });
    const decisions = generateAIDecisions(state);
    expect(decisions.length).toBeGreaterThan(0);
    expect(decisions.some((d) => d.action === 'Deploy Army' || d.action === 'In Reserves')).toBe(true);
  });

  it('returns reactive decisions during player turn', () => {
    const state = makeGameState({ turnSide: 'player', phase: 'shooting' });
    const decisions = generateAIDecisions(state);
    expect(decisions.every((d) => d.isReactive === true)).toBe(true);
  });

  it('handles reserves correctly — Deep Strike units in reserve turn 1', () => {
    const state = makeGameState({ phase: 'movement', battleRound: 1 });
    const decisions = generateAIDecisions(state);
    const terrorDecision = decisions.find((d) => d.unitId === 'terror-of-vardenghast');
    expect(terrorDecision).toBeDefined();
    // Should mention reserves
    expect(terrorDecision?.details.some((d) => d.toLowerCase().includes('reserve'))).toBe(true);
  });

  it('handles reserves turn 2+ — Deep Strike arrival', () => {
    const state = makeGameState({ phase: 'movement', battleRound: 2 });
    const decisions = generateAIDecisions(state);
    const terrorDecision = decisions.find((d) => d.unitId === 'terror-of-vardenghast');
    expect(terrorDecision).toBeDefined();
    expect(terrorDecision?.details.some((d) => d.toLowerCase().includes('arrives') || d.toLowerCase().includes('deep strike'))).toBe(true);
  });
});
