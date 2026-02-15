export interface CPLogEntry {
  turn: number;
  phase: string;
  side: 'player' | 'ai';
  amount: number;
  reason: string;
  type: 'gain' | 'spend';
}

export function createCPTracker() {
  const log: CPLogEntry[] = [];

  return {
    recordGain(entry: Omit<CPLogEntry, 'type'>) {
      log.push({ ...entry, type: 'gain' });
    },

    recordSpend(entry: Omit<CPLogEntry, 'type'>) {
      log.push({ ...entry, type: 'spend' });
    },

    getLog(): readonly CPLogEntry[] {
      return log;
    },

    getNetForSide(side: 'player' | 'ai'): number {
      return log
        .filter((e) => e.side === side)
        .reduce((sum, e) => sum + (e.type === 'gain' ? e.amount : -e.amount), 0);
    },
  };
}
