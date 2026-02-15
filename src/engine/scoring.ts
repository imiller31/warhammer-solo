export interface ScoreEntry {
  turn: number;
  phase: string;
  side: 'player' | 'ai';
  amount: number;
  reason: string;
}

export function createScoreTracker() {
  const history: ScoreEntry[] = [];

  return {
    record(entry: ScoreEntry) {
      history.push(entry);
    },

    getHistory(): readonly ScoreEntry[] {
      return history;
    },

    getTotalForSide(side: 'player' | 'ai'): number {
      return history.filter((e) => e.side === side).reduce((sum, e) => sum + e.amount, 0);
    },

    getBreakdownForSide(side: 'player' | 'ai'): Map<string, number> {
      const breakdown = new Map<string, number>();
      for (const entry of history.filter((e) => e.side === side)) {
        breakdown.set(entry.reason, (breakdown.get(entry.reason) ?? 0) + entry.amount);
      }
      return breakdown;
    },
  };
}
