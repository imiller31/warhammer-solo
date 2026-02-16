import { useState } from 'react';
import type { UnitProfile, UnitState } from '../types';

interface UnitCardProps {
  unit: UnitProfile;
  unitState: UnitState;
  onUpdateWounds: (wounds: number) => void;
  onUpdateModels: (models: number) => void;
  onToggleBattleshock: () => void;
  onDestroy: () => void;
  onDeployFromReserve?: () => void;
  side: 'player' | 'ai';
  isOathTarget?: boolean;
}

export function UnitCard({
  unit,
  unitState,
  onUpdateWounds,
  onUpdateModels,
  onToggleBattleshock,
  onDestroy,
  onDeployFromReserve,
  side,
  isOathTarget,
}: UnitCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cardClass = side === 'player' ? 'gd-card-player' : 'gd-card-ai';
  const accentColor = side === 'player' ? 'text-[#4a6fa5]' : 'text-[#a83232]';
  const roleColors: Record<string, string> = {
    aggressive: 'bg-[#8b0000]/30 text-[#cc4444]',
    defensive: 'bg-[#4a6fa5]/20 text-[#6a9fd5]',
    flanker: 'bg-purple-900/30 text-purple-300',
    support: 'bg-emerald-900/30 text-emerald-300',
    objective: 'bg-[#c9a227]/20 text-[#d4af37]',
  };

  if (unitState.isDestroyed) {
    return (
      <div className="gd-panel gd-destroyed rounded-lg p-3">
        <div className="flex justify-between items-center">
          <span className="line-through gd-bone opacity-50 font-gothic">{unit.name}</span>
          <span className="text-xs text-[#cc4444] font-gothic font-bold tracking-wider">DESTROYED</span>
        </div>
      </div>
    );
  }

  if (unitState.inReserve) {
    return (
      <div className={`gd-panel gd-reserve ${cardClass} rounded-lg p-3`}>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className={`font-gothic font-bold ${accentColor}`}>{unit.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-[#4a6fa5]/20 text-[#6a9fd5]">
              IN RESERVES (Deep Strike)
            </span>
          </div>
          <span className="text-xs gd-gold-dim">⏳ Off Table</span>
        </div>
        {onDeployFromReserve && (
          <button
            onClick={onDeployFromReserve}
            className="w-full gd-deploy-btn py-2 px-4 rounded transition-colors text-sm"
          >
            🪂 Deploy from Reserve
          </button>
        )}
        {!onDeployFromReserve && (
          <p className="text-xs gd-bone opacity-40 italic">Arrives turn 2+. Set up &gt;9&quot; from all enemy models.</p>
        )}
      </div>
    );
  }

  return (
    <div className={`gd-panel ${cardClass} rounded-lg overflow-hidden ${isOathTarget ? 'gd-oath-glow' : ''} ${unitState.isBattleshocked ? 'gd-battleshock' : ''}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 text-left hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`font-gothic font-bold ${accentColor}`}>
              {isOathTarget && <span className="text-[#cc4444] mr-1" title="Oath of Moment Target">💀</span>}
              {unit.name}
            </h3>
            <div className="flex gap-2 mt-1 flex-wrap">
              <span className={`gd-badge ${roleColors[unit.role]}`}>
                {unit.role}
              </span>
              {unitState.isBattleshocked && (
                <span className="text-xs px-2 py-0.5 rounded bg-yellow-900/30 text-yellow-300 font-bold">
                  ⚡ BATTLESHOCKED
                </span>
              )}
              {isOathTarget && (
                <span className="text-xs px-2 py-0.5 rounded bg-[#8b0000]/30 text-[#cc4444] font-bold">
                  OATH TARGET
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="gd-bone opacity-60">
              {unit.modelCount > 1
                ? `${unitState.modelsRemaining}/${unit.modelCount} models`
                : `${unitState.currentWounds}/${unit.wounds} W`}
            </div>
            <span className="text-xs gd-bone opacity-30">{expanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#3a3a4a] p-3 space-y-3">
          {/* Stat block */}
          <div className="gd-stat-grid rounded overflow-hidden">
            {[
              ['M', unit.movement],
              ['T', unit.toughness],
              ['Sv', `${unit.save}${unit.invulnSave ? `/${unit.invulnSave}++` : ''}`],
              ['W', unit.wounds],
              ['Ld', unit.leadership],
              ['OC', unit.oc],
            ].map(([label, value]) => (
              <div key={label as string} className="gd-stat-cell">
                <div className="gd-stat-label">{label}</div>
                <div className="gd-stat-value">{value}</div>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-xs gd-gold-dim uppercase mb-1 font-gothic tracking-wider">Weapons</h4>
            {unit.weapons.map((w) => (
              <div key={w.name} className="gd-weapon rounded p-2 mb-1">
                <div className="font-semibold gd-parchment">{w.name}</div>
                <div className="gd-bone opacity-60">
                  {w.range} | A{w.attacks} | {w.range === 'Melee' ? `WS${w.skill}` : `BS${w.skill}`} | S{w.strength} | AP{w.ap} | D{w.damage}
                </div>
                {w.keywords.length > 0 && (
                  <div className="gd-gold mt-0.5">[{w.keywords.join(', ')}]</div>
                )}
              </div>
            ))}
          </div>

          {(unit.abilities.length > 0 || unit.coreAbilities.length > 0) && (
            <div>
              <h4 className="text-xs gd-gold-dim uppercase mb-1 font-gothic tracking-wider">Abilities</h4>
              {unit.coreAbilities.length > 0 && (
                <div className="text-xs text-emerald-400 mb-1">
                  Core: {unit.coreAbilities.join(', ')}
                </div>
              )}
              {unit.abilities.map((a, i) => (
                <div key={i} className="text-xs gd-parchment opacity-80 mb-1">{a}</div>
              ))}
            </div>
          )}

          <div className="border-t border-[#3a3a4a] pt-2 space-y-2">
            <h4 className="text-xs gd-gold-dim uppercase font-gothic tracking-wider">Tracking</h4>
            {unit.modelCount > 1 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs gd-bone opacity-60">Models:</span>
                <button
                  onClick={() => onUpdateModels(Math.max(0, unitState.modelsRemaining - 1))}
                  className="gd-btn w-11 h-11 rounded text-sm font-bold"
                >-</button>
                <span className="text-sm font-mono w-8 text-center gd-parchment">{unitState.modelsRemaining}</span>
                <button
                  onClick={() => onUpdateModels(Math.min(unit.modelCount, unitState.modelsRemaining + 1))}
                  className="gd-btn w-11 h-11 rounded text-sm font-bold"
                >+</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs gd-bone opacity-60">Wounds:</span>
                <button
                  onClick={() => onUpdateWounds(Math.max(0, unitState.currentWounds - 1))}
                  className="gd-btn w-11 h-11 rounded text-sm font-bold"
                >-</button>
                <span className="text-sm font-mono w-8 text-center gd-parchment">{unitState.currentWounds}</span>
                <button
                  onClick={() => onUpdateWounds(Math.min(unit.wounds, unitState.currentWounds + 1))}
                  className="gd-btn w-11 h-11 rounded text-sm font-bold"
                >+</button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={onToggleBattleshock}
                className={`flex-1 text-xs py-2 px-2 rounded border transition-colors ${
                  unitState.isBattleshocked
                    ? 'border-yellow-500 bg-yellow-900/20 text-yellow-300'
                    : 'gd-btn'
                }`}
              >
                {unitState.isBattleshocked ? 'Clear Battleshock' : '⚡ Battleshock'}
              </button>
              <button
                onClick={onDestroy}
                className="flex-1 text-xs py-2 px-2 rounded gd-btn-danger transition-colors"
              >
                ☠ Destroy Unit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
