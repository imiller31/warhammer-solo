# CLAUDE.md - Project Guide

## Project: Warhammer 40k Solo Combat Patrol AI

### What This Is
A web app where a human plays Warhammer 40k Combat Patrol against an LLM-powered AI opponent. The AI controls one army, the human controls the other. Game state is tracked programmatically.

### Architecture

```
┌─────────────────────────────────────┐
│         React Frontend (Vite)       │
│  - Battlefield grid (44x30 inches)  │
│  - Unit cards & status              │
│  - Phase tracker / action buttons   │
│  - Dice roll display                │
│  - Chat/explanation panel           │
└──────────────┬──────────────────────┘
               │ REST/WebSocket
┌──────────────▼──────────────────────┐
│         Express Backend             │
│  - Game state engine                │
│  - Rules engine (phases, combat)    │
│  - Dice roller with modifiers       │
│  - LLM integration for AI turns     │
└─────────────────────────────────────┘
```

### Game State Model

```typescript
interface GameState {
  turn: number;              // 1-5
  phase: Phase;              // command | movement | shooting | charge | fight
  activePlayer: 'attacker' | 'defender';
  
  armies: {
    attacker: Army;
    defender: Army;
  };
  
  battlefield: {
    width: 44;   // inches
    height: 30;  // inches
    objectives: Objective[];
    terrain: TerrainFeature[];
  };
  
  cp: { attacker: number; defender: number };
  vp: { attacker: number; defender: number };
  oathOfMomentTarget?: string;  // SM faction ability
  shadowInTheWarpUsed: boolean; // Tyranid faction ability
  
  mission: Mission;
  securedObjectives: Record<string, 'attacker' | 'defender' | null>;
}

interface Unit {
  id: string;
  name: string;
  faction: 'space_marines' | 'tyranids';
  models: Model[];
  position: { x: number; y: number };
  hasMoved: boolean;
  hasShot: boolean;
  hasFought: boolean;
  hasCharged: boolean;
  battleShocked: boolean;
  attachedLeader?: string;
  keywords: string[];
}

interface Model {
  id: string;
  name: string;
  m: number; oc: number; t: number; sv: number; w: number; ld: number;
  currentWounds: number;
  rangedWeapons: Weapon[];
  meleeWeapons: Weapon[];
  abilities: string[];
  invulnSave?: number;
  feelNoPain?: number;
}
```

### Data Files Needed
Create JSON data files for:
1. `data/space-marines.json` - Strike Force Octavius units, weapons, abilities, stratagems, enhancements
2. `data/tyranids.json` - Vardenghast Swarm units, weapons, abilities, stratagems, enhancements  
3. `data/missions.json` - All 6 Combat Patrol missions
4. `data/core-rules.json` - Core stratagems, weapon abilities reference

### Key Rules to Implement
- **Phases:** Command → Movement → Shooting → Charge → Fight (per player turn)
- **Oath of Moment:** SM picks enemy unit at start of Command phase, re-roll hits vs that target
- **Synapse:** Tyranid units within 6" of Synapse models take battleshock on 3D6
- **Shadow in the Warp:** Once per battle, all enemy units take battleshock test
- **Engagement Range:** 1" horizontal, 5" vertical
- **Objective Control:** Sum of OC values of non-battleshocked models within 3"
- **Securing:** Battleline units lock objectives under your control

### LLM AI Prompt Design
The AI receives:
1. Current game state (JSON)
2. Available actions for this phase
3. Rules context for the current phase
4. Its army's stratagems and abilities

It returns structured JSON:
```json
{
  "action": "move",
  "unitId": "termagants_1",
  "target": { "x": 22, "y": 15 },
  "reasoning": "Moving Termagants to contest the central objective while staying within Synapse range of the Terror of Vardenghast."
}
```

### Phase 1 (MVP)
- [ ] Project scaffolding (Vite + Express)
- [ ] Data files for both combat patrols
- [ ] Game state engine with phase sequencer
- [ ] Dice rolling with all modifiers
- [ ] Basic grid battlefield display
- [ ] Human player can move, shoot, charge, fight
- [ ] LLM makes decisions for AI army
- [ ] VP scoring for "Clash of Patrols" mission

### Phase 2
- [ ] All 6 missions
- [ ] Stratagems (both core and faction)
- [ ] Terrain and cover
- [ ] Deep Strike / Reserves
- [ ] Patrol Squads splitting
- [ ] Enhancement selection

### Phase 3
- [ ] Coaching mode (AI explains what you should consider)
- [ ] Undo/replay
- [ ] Game log export
- [ ] More faction pairings

### Reference
- See `RESEARCH.md` for prior art and links
- See `data/` for game data (create from wahapedia scrapes)
- Combat Patrol rules: https://wahapedia.ru/wh40k10ed_cp/the-rules/combat-patrol/
- SM datasheets: https://wahapedia.ru/wh40k10ed_cp/factions/strike-force-octavius/
- Tyranid datasheets: https://wahapedia.ru/wh40k10ed_cp/factions/the-vardenghast-swarm/
