import { useState } from 'react';

interface CoreStratagem {
  name: string;
  cpCost: number;
  timing: string;
  effect: string;
}

const CORE_STRATAGEMS: CoreStratagem[] = [
  { name: 'Command Re-roll', cpCost: 1, timing: 'Any phase', effect: 'Re-roll one Hit roll, one Wound roll, one Damage roll, one saving throw, or one Advance/Charge roll.' },
  { name: 'Insane Bravery', cpCost: 1, timing: 'Command phase (Battle-shock step)', effect: 'One Battle-shocked unit automatically passes its Battle-shock test this phase.' },
  { name: 'Fire Overwatch', cpCost: 1, timing: 'Enemy Movement/Charge phase', effect: 'One unit shoots at an enemy unit that moved within 24" or declared a charge. Hits only on unmodified 6s.' },
  { name: 'Rapid Ingress', cpCost: 1, timing: 'End of enemy Movement phase', effect: 'Set up one Reserves unit on the battlefield following Deep Strike rules (>9" from enemy). Cannot be used Turn 1.' },
  { name: 'Go to Ground', cpCost: 1, timing: 'Enemy Shooting phase (when targeted)', effect: 'One Infantry unit gains Cover and improves its Save by 1 (e.g., 3+ becomes 2+) until end of phase.' },
  { name: 'Heroic Intervention', cpCost: 2, timing: 'Enemy Charge phase (after charger ends move)', effect: 'One unit within 6" of a just-charged enemy can move up to 3" toward the nearest enemy. Must end closer.' },
  { name: 'Counter-Offensive', cpCost: 2, timing: 'Fight phase (after an enemy unit fights)', effect: 'One eligible friendly unit fights next, interrupting the normal alternation.' },
  { name: 'Epic Challenge', cpCost: 1, timing: 'Fight phase (when selecting a CHARACTER to fight)', effect: 'Your Character gets +1 to Wound rolls when targeting an enemy Character this phase.' },
];

export function CoreStratagems() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <h2 className="text-sm font-bold text-amber-400 uppercase">Core Stratagems Reference</h2>
        <span className="text-xs text-gray-500">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="border-t border-gray-700 p-3 space-y-2">
          <p className="text-xs text-gray-500 mb-2">Available to both players. Each can only be used once per phase.</p>
          {CORE_STRATAGEMS.map((s) => (
            <div key={s.name} className="bg-gray-800 rounded p-2">
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold text-gray-200">{s.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-yellow-900/50 text-yellow-300 shrink-0 ml-2">
                  {s.cpCost}CP
                </span>
              </div>
              <div className="text-xs text-amber-400 mt-0.5">{s.timing}</div>
              <div className="text-xs text-gray-400 mt-1">{s.effect}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
