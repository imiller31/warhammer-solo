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

  const playerFaction = factions.find((f) => f.id === playerFactionId)!;
  const aiFaction = factions.find((f) => f.id !== playerFactionId)!;
  const selectedMission = missions.find((m) => m.id === missionId)!;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-amber-400 mb-1">
            WARHAMMER 40K
          </h1>
          <h2 className="text-lg text-gray-400">Solo Combat Patrol</h2>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Your Army</label>
            <div className="grid grid-cols-2 gap-2">
              {factions.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPlayerFactionId(f.id)}
                  className={`p-3 rounded border text-sm font-semibold transition-colors ${
                    playerFactionId === f.id
                      ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            vs <span className="text-red-400 font-semibold">{aiFaction.name}</span> (AI)
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Mission</label>
            <div className="space-y-1">
              {missions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMissionId(m.id)}
                  className={`w-full text-left p-2 rounded border text-sm transition-colors ${
                    missionId === m.id
                      ? 'border-amber-500 bg-amber-900/20 text-amber-300'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onStartGame(playerFaction, aiFaction, selectedMission)}
          className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 px-6 rounded-lg text-lg transition-colors"
        >
          Begin Battle
        </button>
      </div>
    </div>
  );
}
