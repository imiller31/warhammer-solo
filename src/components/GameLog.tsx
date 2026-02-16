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
      case 'player': return 'text-[#66aaff]';
      case 'ai': return 'text-[#cc6666]';
      default: return 'gd-dataslate-dim';
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

  const isRoundEntry = (msg: string) => msg.includes('Round') && (msg.startsWith('===') || msg.startsWith('---'));

  return (
    <div className="gd-dataslate rounded-lg p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-gothic font-bold gd-gold tracking-wider">Battle Log</h2>
          <span className="gd-tactical-header">// SERVITOR FEED</span>
        </div>
        <span className="text-xs gd-dataslate-dim">{expanded ? '▲' : '▼'} {entries.length} entries</span>
      </button>
      {expanded && (
        <div ref={scrollRef} className="mt-2 max-h-64 overflow-y-auto space-y-0.5 text-sm scroll-smooth">
          {entries.length === 0 ? (
            <p className="gd-dataslate-dim italic">&gt; Awaiting input_</p>
          ) : (
            entries.map((entry, i) => {
              const isSeparator = entry.message.startsWith('---') || entry.message.startsWith('===');
              const isRound = isRoundEntry(entry.message);
              return (
                <div
                  key={i}
                  className={`${
                    isRound
                      ? 'gd-dataslate-round'
                      : isSeparator
                        ? 'gd-dataslate-separator font-semibold border-t border-[#2a3a2a] pt-1 mt-1'
                        : categoryColor(entry.category)
                  }`}
                >
                  {!isSeparator && (
                    <>
                      <span className="gd-dataslate-dim text-xs mr-1">{categoryPrefix(entry)}</span>
                      <span className="gd-dataslate-dim opacity-60">&gt; </span>
                    </>
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
