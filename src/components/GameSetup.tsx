import { useState } from 'react';
import type { FactionData, Mission } from '../types';
import { spaceMarines } from '../data/space-marines';
import { tyranids } from '../data/tyranids';
import { missions } from '../data/missions';

interface GameSetupProps {
  onStartGame: (playerFaction: FactionData, aiFaction: FactionData, mission: Mission) => void;
}

const factions = [spaceMarines, tyranids];

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [playerFactionId, setPlayerFactionId] = useState(spaceMarines.id);
  const [missionId, setMissionId] = useState(1);

  const playerFaction = factions.find((f) => f.id === playerFactionId) ?? spaceMarines;
  const aiFaction = factions.find((f) => f.id !== playerFactionId) ?? tyranids;
  const defaultMission: Mission = { id: 0, name: '', description: '', objectiveCount: 0, scoringRules: [], specialRules: [] };
  const selectedMission = missions.find((m) => m.id === missionId) ?? defaultMission;

  return (
    <div className="min-h-screen gd-bg flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6 gd-aquila-watermark">
        {/* Title Section */}
        <div className="text-center space-y-2">
          <div className="gd-aquila-divider mb-4">
            <span className="gd-aquila-wing-l"></span>
            <span className="gd-aquila-center"></span>
            <span className="gd-aquila-wing-r"></span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-gothic font-black gd-gold gd-title-glow tracking-[0.2em] uppercase">
            Warhammer 40K
          </h1>
          <h2 className="text-lg gd-bone font-gothic tracking-wider opacity-70">Solo Combat Patrol</h2>
          <div className="gd-aquila-divider">
            <span className="gd-aquila-wing-l"></span>
            <span className="gd-aquila-center"></span>
            <span className="gd-aquila-wing-r"></span>
          </div>
        </div>

        <div className="gd-panel-riveted gd-corners rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm gd-gold-dim mb-2 font-gothic tracking-wider">Your Army</label>
            <div className="grid grid-cols-2 gap-2">
              {factions.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPlayerFactionId(f.id)}
                  className={`gd-faction-card p-3 rounded border text-sm font-gothic font-semibold transition-all ${
                    playerFactionId === f.id
                      ? 'gd-faction-card-selected border-[#4a6fa5] text-[#6a9fd5]'
                      : 'border-[#3a3a4a] gd-bone opacity-60 hover:border-[#5a5a6a]'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div className="gd-section-divider">
            <span className="gd-section-diamond"></span>
          </div>

          <div className="text-center text-sm gd-bone opacity-40">
            vs <span className="text-[#a83232] font-gothic font-semibold">{aiFaction.name}</span> (AI)
          </div>

          <div className="gd-section-divider">
            <span className="gd-section-diamond"></span>
          </div>

          <div>
            <label className="block text-sm gd-gold-dim mb-2 font-gothic tracking-wider">Mission</label>
            <div className="space-y-1">
              {missions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMissionId(m.id)}
                  className={`w-full text-left p-2 rounded border text-sm transition-all ${
                    missionId === m.id
                      ? 'border-[#c9a227] bg-[#c9a227]/10 gd-gold'
                      : 'border-[#3a3a4a] gd-bone opacity-60 hover:border-[#5a5a6a]'
                  }`}
                >
                  <div className="font-gothic font-semibold">{m.name}</div>
                  <div className="text-xs gd-bone opacity-40">{m.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onStartGame(playerFaction, aiFaction, selectedMission)}
          className="w-full gd-btn-begin-battle py-4 px-6 rounded-lg font-gothic tracking-wider"
        >
          ⚔ BEGIN BATTLE ⚔
        </button>
      </div>
    </div>
  );
}
