import type { AIDecisionResult, TurnSide, GameState } from '../types';

interface AIDecisionProps {
  decisions: AIDecisionResult[];
  phaseName: string;
  turnSide: TurnSide;
  state: GameState;
  onSetOathTarget?: (targetId: string) => void;
  onUseShadowInTheWarp?: () => void;
}

export function AIDecision({ decisions, phaseName, turnSide, state, onSetOathTarget, onUseShadowInTheWarp }: AIDecisionProps) {
  const isPlayerTurn = turnSide === 'player';
  const isAICommandPhase = turnSide === 'ai' && state.phase === 'command';
  const isSpaceMarinesAI = state.aiFaction.id === 'strike-force-octavius';
  const isTyranidsAI = state.aiFaction.id === 'vardenghast-swarm';

  // Oath of Moment recommendation
  const oathDecision = decisions.find((d) => d.unitId === 'faction-ability' && d.action === 'Select Oath Target');
  const recommendedOathTarget = oathDecision?.details[0]?.match(/Select (.+?) as the Oath/)?.[1];
  const recommendedOathId = isAICommandPhase && isSpaceMarinesAI
    ? state.playerFaction.units.find((u) => u.name === recommendedOathTarget)?.id
    : undefined;

  // Shadow in the Warp recommendation
  const showShadowButton = isAICommandPhase && isTyranidsAI && !state.shadowInTheWarpUsed;
  const shadowRecommended = showShadowButton && state.battleRound >= 2 &&
    state.playerUnits.filter((u) => !u.isDestroyed && u.modelsRemaining > 0).length >= 2;

  if (decisions.length === 0 && !showShadowButton) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-bold text-red-400 mb-2">AI Decisions</h2>
        <p className="text-gray-500 text-sm italic">
          No AI decisions for this phase.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${
      isPlayerTurn
        ? 'border border-yellow-900/50'
        : 'border border-red-900/50'
    }`}>
      <h2 className={`text-lg font-bold mb-3 ${isPlayerTurn ? 'text-yellow-400' : 'text-red-400'}`}>
        {isPlayerTurn
          ? `⚡ AI Reactions — ${phaseName}`
          : `AI Orders — ${phaseName}`
        }
      </h2>

      {/* Oath of Moment confirmation */}
      {recommendedOathId && onSetOathTarget && (
        <div className="mb-3 bg-amber-900/30 border border-amber-700 rounded p-3">
          <div className="text-sm font-bold text-amber-300 mb-1">💀 Oath of Moment</div>
          <p className="text-xs text-gray-300 mb-2">
            Target <span className="text-amber-400 font-semibold">{recommendedOathTarget}</span> — re-roll all hit rolls against this unit.
          </p>
          <button
            onClick={() => onSetOathTarget(recommendedOathId)}
            className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-1.5 px-4 rounded text-sm transition-colors"
          >
            Confirm Oath Target
          </button>
          {state.oathOfMomentTarget && state.oathOfMomentTarget !== recommendedOathId && (
            <span className="text-xs text-gray-500 ml-2">
              (Current: {state.playerFaction.units.find((u) => u.id === state.oathOfMomentTarget)?.name})
            </span>
          )}
        </div>
      )}

      {/* Shadow in the Warp button */}
      {showShadowButton && onUseShadowInTheWarp && (
        <div className={`mb-3 rounded p-3 border ${shadowRecommended ? 'bg-purple-900/30 border-purple-600' : 'bg-gray-800 border-gray-600'}`}>
          <div className="text-sm font-bold text-purple-300 mb-1">🧠 Shadow in the Warp</div>
          <p className="text-xs text-gray-300 mb-2">
            All enemy units take Battle-shock tests NOW. Once per battle.
            {shadowRecommended && <span className="text-purple-400 font-semibold"> ⚡ RECOMMENDED</span>}
          </p>
          <button
            onClick={onUseShadowInTheWarp}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-1.5 px-4 rounded text-sm transition-colors"
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
                ? 'bg-yellow-900/20 border border-yellow-800/50'
                : 'bg-gray-800 border border-gray-700'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
              <h3 className={`font-bold ${d.isReactive ? 'text-yellow-300' : 'text-red-300'}`}>
                {d.unitName}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded self-start ${
                d.isReactive
                  ? 'bg-yellow-900/50 text-yellow-300'
                  : 'bg-red-900/50 text-red-300'
              }`}>
                {d.action}
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">{d.reasoning}</div>
            <ul className="space-y-1">
              {d.details.map((detail, j) => (
                <li key={j} className="text-sm text-gray-300 flex gap-2">
                  <span className={`mt-0.5 shrink-0 ${d.isReactive ? 'text-yellow-500' : 'text-red-500'}`}>›</span>
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
