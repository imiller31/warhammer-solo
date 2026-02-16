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
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-gothic font-black gd-gold mb-1 tracking-[0.2em] uppercase"
              style={{ textShadow: '0 0 20px rgba(212, 175, 55, 0.3), 0 2px 4px rgba(0,0,0,0.8)' }}>
            Warhammer 40K
          </h1>
          <h2 className="text-lg gd-bone font-gothic tracking-wider opacity-70">Solo Combat Patrol</h2>
        </div>

        <div className="gd-panel-riveted rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm gd-gold-dim mb-2 font-gothic tracking-wider">Your Army</label>
            <div className="grid grid-cols-2 gap-2">
              {factions.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPlayerFactionId(f.id)}
                  className={`p-3 rounded border text-sm font-gothic font-semibold transition-colors ${
                    playerFactionId === f.id
                      ? 'border-[#4a6fa5] bg-[#4a6fa5]/20 text-[#6a9fd5]'
                      : 'border-[#3a3a4a] gd-bone opacity-60 hover:border-[#5a5a6a]'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center text-sm gd-bone opacity-40">
            vs <span className="text-[#a83232] font-gothic font-semibold">{aiFaction.name}</span> (AI)
          </div>

          <div>
            <label className="block text-sm gd-gold-dim mb-2 font-gothic tracking-wider">Mission</label>
            <div className="space-y-1">
              {missions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMissionId(m.id)}
                  className={`w-full text-left p-2 rounded border text-sm transition-colors ${
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
          className="w-full gd-btn-gold py-3 px-6 rounded-lg text-lg transition-colors font-gothic tracking-wider"
        >
          ⚔ Begin Battle
        </button>
      </div>
    </div>
  );
}
