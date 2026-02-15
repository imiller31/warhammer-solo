import type { AIDecisionResult } from '../types';

interface AIDecisionProps {
  decisions: AIDecisionResult[];
  phaseName: string;
}

export function AIDecision({ decisions, phaseName }: AIDecisionProps) {
  if (decisions.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-bold text-red-400 mb-2">AI Decisions</h2>
        <p className="text-gray-500 text-sm italic">
          No AI decisions for this phase. Advance to generate.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-red-900/50 rounded-lg p-4">
      <h2 className="text-lg font-bold text-red-400 mb-3">
        AI Orders — {phaseName}
      </h2>
      <div className="space-y-3">
        {decisions.map((d, i) => (
          <div
            key={`${d.unitId}-${i}`}
            className="bg-gray-800 border border-gray-700 rounded p-3"
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-red-300">{d.unitName}</h3>
              <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded">
                {d.action}
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">{d.reasoning}</div>
            <ul className="space-y-1">
              {d.details.map((detail, j) => (
                <li key={j} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-red-500 mt-0.5 shrink-0">›</span>
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
