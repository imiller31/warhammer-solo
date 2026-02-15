// ── Core Game Types ──────────────────────────────────────────────

export type Phase = 'command' | 'movement' | 'shooting' | 'charge' | 'fight';

export const PHASES: Phase[] = ['command', 'movement', 'shooting', 'charge', 'fight'];

export const PHASE_LABELS: Record<Phase, string> = {
  command: 'Command Phase',
  movement: 'Movement Phase',
  shooting: 'Shooting Phase',
  charge: 'Charge Phase',
  fight: 'Fight Phase',
};

export type PlayerSide = 'attacker' | 'defender';

export type UnitRole = 'aggressive' | 'defensive' | 'flanker' | 'support' | 'objective';

// ── Weapon & Unit Data ──────────────────────────────────────────

export interface Weapon {
  name: string;
  range: string;         // e.g. "24\"" or "Melee"
  attacks: string;       // e.g. "2" or "D6"
  skill: string;         // e.g. "3+" or "N/A" (for Torrent)
  strength: number;
  ap: number;            // 0, -1, -2 etc.
  damage: string;        // e.g. "1" or "D3"
  keywords: string[];    // e.g. ["Rapid Fire 2", "Devastating Wounds"]
}

export interface UnitProfile {
  id: string;
  name: string;
  faction: 'space-marines' | 'tyranids';
  movement: string;      // e.g. "5\"" or "12\""
  toughness: number;
  save: string;          // e.g. "2+"
  wounds: number;
  leadership: string;    // e.g. "6+"
  oc: number;
  invulnSave?: string;   // e.g. "4+"
  modelCount: number;
  weapons: Weapon[];
  abilities: string[];
  coreAbilities: string[];
  keywords: string[];
  role: UnitRole;
  isLeader?: boolean;
  leaderFor?: string;    // unit id this model can lead
  attachedTo?: string;   // unit id this model is attached to
}

export interface Stratagem {
  name: string;
  cpCost: number;
  phase: string;
  type: string;
  when: string;
  target: string;
  effect: string;
}

export interface Enhancement {
  name: string;
  effect: string;
  isDefault: boolean;
}

export interface SecondaryObjective {
  name: string;
  effect: string;
  isDefault: boolean;
}

export interface FactionData {
  id: string;
  name: string;
  factionAbilities: { name: string; effect: string }[];
  units: UnitProfile[];
  stratagems: Stratagem[];
  enhancements: Enhancement[];
  secondaryObjectives: SecondaryObjective[];
}

// ── Mission Data ────────────────────────────────────────────────

export interface Mission {
  id: number;
  name: string;
  description: string;
  objectiveCount: number;
  scoringRules: string[];
  specialRules: string[];
}

// ── Game State ──────────────────────────────────────────────────

export interface UnitState {
  unitId: string;
  currentWounds: number;
  modelsRemaining: number;
  isBattleshocked: boolean;
  isDestroyed: boolean;
  hasActedThisPhase: boolean;
  hasMoved: boolean;
  hasShot: boolean;
  hasCharged: boolean;
  hasFought: boolean;
}

export interface AIDecisionResult {
  unitId: string;
  unitName: string;
  action: string;
  reasoning: string;
  details: string[];
}

export interface GameState {
  turn: number;
  phase: Phase;
  activePlayer: PlayerSide;
  playerFaction: FactionData;
  aiFaction: FactionData;
  playerUnits: UnitState[];
  aiUnits: UnitState[];
  playerVP: number;
  aiVP: number;
  playerCP: number;
  aiCP: number;
  mission: Mission;
  oathOfMomentTarget?: string;
  shadowInTheWarpUsed: boolean;
  aiDecisions: AIDecisionResult[];
  gameOver: boolean;
  turnLog: string[];
}

export type GameAction =
  | { type: 'START_GAME'; playerFaction: FactionData; aiFaction: FactionData; mission: Mission }
  | { type: 'NEXT_PHASE' }
  | { type: 'NEXT_TURN' }
  | { type: 'UPDATE_UNIT'; side: PlayerSide; unitId: string; updates: Partial<UnitState> }
  | { type: 'SCORE_VP'; side: PlayerSide; amount: number; reason: string }
  | { type: 'SPEND_CP'; side: PlayerSide; amount: number; reason: string }
  | { type: 'SET_OATH_TARGET'; targetId: string }
  | { type: 'USE_SHADOW_IN_WARP' }
  | { type: 'ADD_LOG'; message: string }
  | { type: 'SET_AI_DECISIONS'; decisions: AIDecisionResult[] }
  | { type: 'END_GAME' };
