interface ScoreBoardProps {
  playerVP: number;
  aiVP: number;
  playerCP: number;
  aiCP: number;
  playerFactionName: string;
  aiFactionName: string;
  onAdjustVP: (side: 'player' | 'ai', delta: number) => void;
  onAdjustCP: (side: 'player' | 'ai', delta: number) => void;
}

export function ScoreBoard({
  playerVP,
  aiVP,
  playerCP,
  aiCP,
  playerFactionName,
  aiFactionName,
  onAdjustVP,
  onAdjustCP,
}: ScoreBoardProps) {
  return (
    <div className="gd-panel-riveted gd-corners rounded-lg p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg font-gothic font-bold gd-gold tracking-wider">War Tally</h2>
        <div className="gd-chevrons">
          <span className="gd-chevron"></span>
          <span className="gd-chevron"></span>
          <span className="gd-chevron"></span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Player Side */}
        <div className="space-y-2 p-2 rounded border border-transparent gd-player-glow">
          <h3 className="text-[#4a6fa5] font-gothic font-semibold text-sm truncate">{playerFactionName}</h3>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs gd-bone opacity-40 w-6 font-gothic">VP</span>
            <button onClick={() => onAdjustVP('player', -1)} className="gd-btn w-11 h-11 rounded text-xs font-bold">−</button>
            <span className="gd-vp-large gd-brass-counter w-10 text-center" style={{ color: '#6a9fd5' }}>{playerVP}</span>
            <button onClick={() => onAdjustVP('player', 1)} className="gd-btn w-11 h-11 rounded text-xs font-bold">+</button>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs gd-bone opacity-40 w-6 font-gothic">CP</span>
            <button onClick={() => onAdjustCP('player', -1)} className="gd-btn w-11 h-11 rounded text-xs font-bold">−</button>
            <span className="gd-cp-counter" style={{ color: '#6a9fd5', borderColor: '#4a6fa580' }}>{playerCP}</span>
            <button onClick={() => onAdjustCP('player', 1)} className="gd-btn w-11 h-11 rounded text-xs font-bold">+</button>
          </div>
        </div>

        {/* AI Side */}
        <div className="space-y-2 p-2 rounded border border-transparent gd-ai-glow">
          <h3 className="text-[#a83232] font-gothic font-semibold text-sm truncate">{aiFactionName}</h3>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs gd-bone opacity-40 w-6 font-gothic">VP</span>
            <button onClick={() => onAdjustVP('ai', -1)} className="gd-btn w-11 h-11 rounded text-xs font-bold">−</button>
            <span className="gd-vp-large gd-brass-counter w-10 text-center" style={{ color: '#cc4444' }}>{aiVP}</span>
            <button onClick={() => onAdjustVP('ai', 1)} className="gd-btn w-11 h-11 rounded text-xs font-bold">+</button>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs gd-bone opacity-40 w-6 font-gothic">CP</span>
            <button onClick={() => onAdjustCP('ai', -1)} className="gd-btn w-11 h-11 rounded text-xs font-bold">−</button>
            <span className="gd-cp-counter" style={{ color: '#cc4444', borderColor: '#8b000080' }}>{aiCP}</span>
            <button onClick={() => onAdjustCP('ai', 1)} className="gd-btn w-11 h-11 rounded text-xs font-bold">+</button>
          </div>
        </div>
      </div>
    </div>
  );
}
