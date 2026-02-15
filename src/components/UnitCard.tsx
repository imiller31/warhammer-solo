import { useState } from 'react';
import type { UnitProfile, UnitState } from '../types';

interface UnitCardProps {
  unit: UnitProfile;
  unitState: UnitState;
  onUpdateWounds: (wounds: number) => void;
  onUpdateModels: (models: number) => void;
  onToggleBattleshock: () => void;
  onDestroy: () => void;
  side: 'player' | 'ai';
}

export function UnitCard({
  unit,
  unitState,
  onUpdateWounds,
  onUpdateModels,
  onToggleBattleshock,
  onDestroy,
  side,
}: UnitCardProps) {
  const [expanded, setExpanded] = useState(false);
  const borderColor = side === 'player' ? 'border-blue-600' : 'border-red-600';
  const accentColor = side === 'player' ? 'text-blue-400' : 'text-red-400';
  const roleColors: Record<string, string> = {
    aggressive: 'bg-red-900/50 text-red-300',
    defensive: 'bg-blue-900/50 text-blue-300',
    flanker: 'bg-purple-900/50 text-purple-300',
    support: 'bg-green-900/50 text-green-300',
    objective: 'bg-yellow-900/50 text-yellow-300',
  };

  if (unitState.isDestroyed) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 opacity-50">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 line-through">{unit.name}</span>
          <span className="text-xs text-red-500 font-bold">DESTROYED</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 border ${borderColor} rounded-lg overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 text-left hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`font-bold ${accentColor}`}>{unit.name}</h3>
            <div className="flex gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded ${roleColors[unit.role]}`}>
                {unit.role}
              </span>
              {unitState.isBattleshocked && (
                <span className="text-xs px-2 py-0.5 rounded bg-yellow-900/50 text-yellow-300">
                  BATTLESHOCKED
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="text-gray-400">
              {unit.modelCount > 1
                ? `${unitState.modelsRemaining}/${unit.modelCount} models`
                : `${unitState.currentWounds}/${unit.wounds} W`}
            </div>
            <span className="text-xs text-gray-600">{expanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-700 p-3 space-y-3">
          <div className="grid grid-cols-6 gap-1 text-center text-xs">
            <div><div className="text-gray-500">M</div><div>{unit.movement}</div></div>
            <div><div className="text-gray-500">T</div><div>{unit.toughness}</div></div>
            <div><div className="text-gray-500">Sv</div><div>{unit.save}{unit.invulnSave ? `/${unit.invulnSave}++` : ''}</div></div>
            <div><div className="text-gray-500">W</div><div>{unit.wounds}</div></div>
            <div><div className="text-gray-500">Ld</div><div>{unit.leadership}</div></div>
            <div><div className="text-gray-500">OC</div><div>{unit.oc}</div></div>
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase mb-1">Weapons</h4>
            {unit.weapons.map((w) => (
              <div key={w.name} className="text-xs bg-gray-800 rounded p-2 mb-1">
                <div className="font-semibold text-gray-200">{w.name}</div>
                <div className="text-gray-400">
                  {w.range} | A{w.attacks} | {w.range === 'Melee' ? `WS${w.skill}` : `BS${w.skill}`} | S{w.strength} | AP{w.ap} | D{w.damage}
                </div>
                {w.keywords.length > 0 && (
                  <div className="text-amber-400 mt-0.5">[{w.keywords.join(', ')}]</div>
                )}
              </div>
            ))}
          </div>

          {(unit.abilities.length > 0 || unit.coreAbilities.length > 0) && (
            <div>
              <h4 className="text-xs text-gray-500 uppercase mb-1">Abilities</h4>
              {unit.coreAbilities.length > 0 && (
                <div className="text-xs text-green-400 mb-1">
                  Core: {unit.coreAbilities.join(', ')}
                </div>
              )}
              {unit.abilities.map((a, i) => (
                <div key={i} className="text-xs text-gray-300 mb-1">{a}</div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-700 pt-2 space-y-2">
            <h4 className="text-xs text-gray-500 uppercase">Tracking</h4>
            {unit.modelCount > 1 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Models:</span>
                <button
                  onClick={() => onUpdateModels(Math.max(0, unitState.modelsRemaining - 1))}
                  className="bg-gray-700 hover:bg-gray-600 text-white w-7 h-7 rounded text-sm"
                >-</button>
                <span className="text-sm font-mono w-8 text-center">{unitState.modelsRemaining}</span>
                <button
                  onClick={() => onUpdateModels(Math.min(unit.modelCount, unitState.modelsRemaining + 1))}
                  className="bg-gray-700 hover:bg-gray-600 text-white w-7 h-7 rounded text-sm"
                >+</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Wounds:</span>
                <button
                  onClick={() => onUpdateWounds(Math.max(0, unitState.currentWounds - 1))}
                  className="bg-gray-700 hover:bg-gray-600 text-white w-7 h-7 rounded text-sm"
                >-</button>
                <span className="text-sm font-mono w-8 text-center">{unitState.currentWounds}</span>
                <button
                  onClick={() => onUpdateWounds(Math.min(unit.wounds, unitState.currentWounds + 1))}
                  className="bg-gray-700 hover:bg-gray-600 text-white w-7 h-7 rounded text-sm"
                >+</button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={onToggleBattleshock}
                className={`flex-1 text-xs py-1 px-2 rounded border ${
                  unitState.isBattleshocked
                    ? 'border-yellow-500 bg-yellow-900/30 text-yellow-300'
                    : 'border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                {unitState.isBattleshocked ? 'Clear Battleshock' : 'Battleshock'}
              </button>
              <button
                onClick={onDestroy}
                className="flex-1 text-xs py-1 px-2 rounded border border-red-800 text-red-400 hover:bg-red-900/30"
              >
                Destroy Unit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
