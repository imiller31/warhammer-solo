import { useState, useRef, useEffect } from 'react';
import type { LogEntry } from '../types';

interface GameLogProps {
  entries: LogEntry[];
}

export function GameLog({ entries }: GameLogProps) {
  const [expanded, setExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'player': return 'text-blue-400';
      case 'ai': return 'text-red-400';
      default: return 'text-gray-500';
    }
  };

  const categoryPrefix = (entry: LogEntry) => {
    const roundLabel = entry.turn > 0 ? `R${entry.turn}` : '';
    const phaseShort = entry.phase === 'deployment' ? 'Deploy'
      : entry.phase === 'command' ? 'Cmd'
      : entry.phase === 'movement' ? 'Mv'
      : entry.phase === 'shooting' ? 'Sht'
      : entry.phase === 'charge' ? 'Chg'
      : 'Fgt';
    return roundLabel ? `[${roundLabel} ${phaseShort}]` : '';
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <h2 className="text-lg font-bold text-amber-400">Battle Log</h2>
        <span className="text-gray-500 text-xs">{expanded ? '▲' : '▼'} {entries.length} entries</span>
      </button>
      {expanded && (
        <div ref={scrollRef} className="mt-2 max-h-64 overflow-y-auto space-y-0.5 text-sm scroll-smooth">
          {entries.length === 0 ? (
            <p className="text-gray-500 italic">No events yet.</p>
          ) : (
            entries.map((entry, i) => {
              const isSeparator = entry.message.startsWith('---') || entry.message.startsWith('===');
              return (
                <div
                  key={i}
                  className={`${isSeparator ? 'text-amber-500 font-semibold border-t border-gray-800 pt-1 mt-1' : categoryColor(entry.category)}`}
                >
                  {!isSeparator && (
                    <span className="text-gray-600 text-xs mr-1 font-mono">{categoryPrefix(entry)}</span>
                  )}
                  {entry.message}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
