import { describe, it, expect } from 'vitest';
import { createScoreTracker } from './scoring';
import { createCPTracker } from './cp-tracker';

describe('createScoreTracker', () => {
  it('records and retrieves entries', () => {
    const tracker = createScoreTracker();
    tracker.record({ turn: 1, phase: 'command', side: 'player', amount: 5, reason: 'Objective' });
    tracker.record({ turn: 1, phase: 'command', side: 'ai', amount: 3, reason: 'Objective' });
    expect(tracker.getHistory()).toHaveLength(2);
  });

  it('calculates total for side', () => {
    const tracker = createScoreTracker();
    tracker.record({ turn: 1, phase: 'command', side: 'player', amount: 5, reason: 'A' });
    tracker.record({ turn: 2, phase: 'command', side: 'player', amount: 3, reason: 'B' });
    tracker.record({ turn: 1, phase: 'command', side: 'ai', amount: 10, reason: 'C' });
    expect(tracker.getTotalForSide('player')).toBe(8);
    expect(tracker.getTotalForSide('ai')).toBe(10);
  });

  it('provides breakdown by reason', () => {
    const tracker = createScoreTracker();
    tracker.record({ turn: 1, phase: 'command', side: 'player', amount: 5, reason: 'Obj' });
    tracker.record({ turn: 2, phase: 'command', side: 'player', amount: 3, reason: 'Obj' });
    tracker.record({ turn: 3, phase: 'command', side: 'player', amount: 2, reason: 'Secondary' });
    const breakdown = tracker.getBreakdownForSide('player');
    expect(breakdown.get('Obj')).toBe(8);
    expect(breakdown.get('Secondary')).toBe(2);
  });
});

describe('createCPTracker', () => {
  it('records gains and spends', () => {
    const tracker = createCPTracker();
    tracker.recordGain({ turn: 1, phase: 'command', side: 'player', amount: 1, reason: 'Turn start' });
    tracker.recordSpend({ turn: 1, phase: 'shooting', side: 'player', amount: 1, reason: 'Stratagem' });
    expect(tracker.getLog()).toHaveLength(2);
  });

  it('calculates net CP for side', () => {
    const tracker = createCPTracker();
    tracker.recordGain({ turn: 1, phase: 'command', side: 'player', amount: 1, reason: 'A' });
    tracker.recordGain({ turn: 2, phase: 'command', side: 'player', amount: 1, reason: 'B' });
    tracker.recordSpend({ turn: 1, phase: 'shooting', side: 'player', amount: 1, reason: 'C' });
    expect(tracker.getNetForSide('player')).toBe(1);
    expect(tracker.getNetForSide('ai')).toBe(0);
  });
});
