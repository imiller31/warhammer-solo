import type { AIDecisionResult, TurnSide, GameState } from '../types';

interface AIDecisionProps {
  decisions: AIDecisionResult[];
  phaseName: string;
  turnSide: TurnSide;
  state: GameState;
  onSetOathTarget?: (targetId: string) => void;
  onUseShadowInTheWarp?: () => void;
}

const ACTION_ICONS: Record<string, string> = {
  'Move': '🏃',
  'Advance': '🏃',
  'Shoot': '🔫',
  'Fight': '⚔',
  'Charge': '⚡',
  'Hold': '🛡',
  'Fall Back': '↩',
  'Overwatch': '🎯',
  'Deploy': '🪂',
  'Select Oath Target': '💀',
};

function getActionIcon(action: string): string {
  for (const [key, icon] of Object.entries(ACTION_ICONS)) {
    if (action.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return '⬧';
}

export function AIDecision({ decisions, phaseName, turnSide, state, onSetOathTarget, onUseShadowInTheWarp }: AIDecisionProps) {
  const isPlayerTurn = turnSide === 'player';
  const isAICommandPhase = turnSide === 'ai' && state.phase === 'command';
  const isSpaceMarinesAI = state.aiFaction.id === 'strike-force-octavius';
  const isTyranidsAI = state.aiFaction.id === 'vardenghast-swarm';

  const oathDecision = decisions.find((d) => d.unitId === 'faction-ability' && d.action === 'Select Oath Target');
  const recommendedOathTarget = oathDecision?.details[0]?.match(/Select (.+?) as the Oath/)?.[1];
  const recommendedOathId = isAICommandPhase && isSpaceMarinesAI
    ? state.playerFaction.units.find((u) => u.name === recommendedOathTarget)?.id
    : undefined;

  const showShadowButton = isAICommandPhase && isTyranidsAI && !state.shadowInTheWarpUsed;
  const shadowRecommended = showShadowButton && state.battleRound >= 2 &&
    state.playerUnits.filter((u) => !u.isDestroyed && u.modelsRemaining > 0).length >= 2;

  if (decisions.length === 0 && !showShadowButton) {
    return (
      <div className="gd-panel gd-tactical-frame rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-lg font-gothic font-bold text-[#a83232] tracking-wider">AI Decisions</h2>
          <span className="gd-tactical-header">// NO ORDERS</span>
        </div>
        <p className="gd-bone opacity-40 text-sm italic font-mono">
          &gt; No AI decisions for this phase.
        </p>
      </div>
    );
  }

  return (
    <div className={`gd-panel gd-tactical-frame gd-corners rounded-lg p-4 ${
      isPlayerTurn ? 'gd-alert-reactive' : 'gd-alert-frame'
    }`}>
      <div className="flex items-center gap-3 mb-1">
        <h2 className={`text-lg font-gothic font-bold tracking-wider ${isPlayerTurn ? 'gd-gold' : 'text-[#a83232]'}`}>
          {isPlayerTurn
            ? `⚡ AI Reactions — ${phaseName}`
            : `☠ AI Orders — ${phaseName}`
          }
        </h2>
      </div>
      <div className="gd-tactical-header mb-3">
        {isPlayerTurn ? '// REACTIVE ADVISORY — THREAT DETECTED' : '// TACTICAL ADVISORY — EXECUTING ORDERS'}
      </div>

      {/* Oath of Moment confirmation */}
      {recommendedOathId && onSetOathTarget && (
        <div className="mb-3 bg-[#8b0000]/15 border border-[#a83232]/50 rounded p-3" style={{ boxShadow: '0 0 12px rgba(139, 0, 0, 0.2)' }}>
          <div className="text-sm font-gothic font-bold gd-gold mb-1">💀 Oath of Moment</div>
          <p className="text-xs gd-parchment mb-2">
            Target <span className="gd-gold font-semibold">{recommendedOathTarget}</span> — re-roll all hit rolls against this unit.
          </p>
          <button
            onClick={() => onSetOathTarget(recommendedOathId)}
            className="gd-btn-gold py-1.5 px-4 rounded text-sm transition-all"
          >
            Confirm Oath Target
          </button>
          {state.oathOfMomentTarget && state.oathOfMomentTarget !== recommendedOathId && (
            <span className="text-xs gd-bone opacity-40 ml-2">
              (Current: {state.playerFaction.units.find((u) => u.id === state.oathOfMomentTarget)?.name})
            </span>
          )}
        </div>
      )}

      {/* Shadow in the Warp button */}
      {showShadowButton && onUseShadowInTheWarp && (
        <div className={`mb-3 rounded p-3 border ${shadowRecommended ? 'bg-purple-900/20 border-purple-600/50' : 'bg-[#1a1a2e] border-[#3a3a4a]'}`}>
          <div className="text-sm font-gothic font-bold text-purple-300 mb-1">🧠 Shadow in the Warp</div>
          <p className="text-xs gd-parchment mb-2">
            All enemy units take Battle-shock tests NOW. Once per battle.
            {shadowRecommended && <span className="text-purple-400 font-semibold"> ⚡ RECOMMENDED</span>}
          </p>
          <button
            onClick={onUseShadowInTheWarp}
            className="bg-purple-800 hover:bg-purple-700 border border-purple-500 text-purple-100 font-bold py-1.5 px-4 rounded text-sm transition-all"
          >
            Use Shadow in the Warp
          </button>
        </div>
      )}

      <div className="space-y-3">
        {decisions.map((d, i) => (
          <div
            key={`${d.unitId}-${i}`}
            className={`rounded p-3 ${
              d.isReactive
                ? 'bg-[#c9a227]/10 border border-[#c9a227]/30'
                : 'bg-[#12121e] border border-[#3a3a4a]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
              <h3 className={`font-gothic font-bold ${d.isReactive ? 'gd-gold' : 'text-[#cc4444]'}`}>
                <span className="mr-1">{getActionIcon(d.action)}</span>
                {d.unitName}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded self-start font-gothic ${
                d.isReactive
                  ? 'bg-[#c9a227]/20 gd-gold'
                  : 'bg-[#8b0000]/20 text-[#cc4444]'
              }`}>
                {d.action}
              </span>
            </div>
            <div className="text-xs gd-bone opacity-40 mb-2 font-mono">&gt; {d.reasoning}</div>
            <ul className="space-y-1">
              {d.details.map((detail, j) => (
                <li key={j} className="text-sm gd-parchment flex gap-2">
                  <span className={`mt-0.5 shrink-0 ${d.isReactive ? 'gd-gold' : 'text-[#cc4444]'}`}>›</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
