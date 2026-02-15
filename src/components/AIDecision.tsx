import type { AIDecisionResult, TurnSide } from '../types';

interface AIDecisionProps {
  decisions: AIDecisionResult[];
  phaseName: string;
  turnSide: TurnSide;
}

export function AIDecision({ decisions, phaseName, turnSide }: AIDecisionProps) {
  if (decisions.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-bold text-red-400 mb-2">AI Decisions</h2>
        <p className="text-gray-500 text-sm italic">
          No AI decisions for this phase.
        </p>
      </div>
    );
  }

  const isPlayerTurn = turnSide === 'player';

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
