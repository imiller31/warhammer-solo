// ── Core Game Types ──────────────────────────────────────────────

export type Phase = 'deployment' | 'command' | 'movement' | 'shooting' | 'charge' | 'fight';

export const PHASES: Phase[] = ['command', 'movement', 'shooting', 'charge', 'fight'];

export const PHASE_LABELS: Record<Phase, string> = {
  deployment: 'Deployment Phase',
  command: 'Command Phase',
  movement: 'Movement Phase',
  shooting: 'Shooting Phase',
  charge: 'Charge Phase',
  fight: 'Fight Phase',
};

export type PlayerSide = 'attacker' | 'defender';

export type TurnSide = 'player' | 'ai';

export type UnitRole = 'aggressive' | 'defensive' | 'flanker' | 'support' | 'objective';

// ── Weapon & Unit Data ──────────────────────────────────────────

export interface Weapon {
  name: string;
  range: string;
  attacks: string;
  skill: string;
  strength: number;
  ap: number;
  damage: string;
  keywords: string[];
}

export interface UnitProfile {
  id: string;
  name: string;
  faction: 'space-marines' | 'tyranids';
  movement: string;
  toughness: number;
  save: string;
  wounds: number;
  leadership: string;
  oc: number;
  invulnSave?: string;
  modelCount: number;
  weapons: Weapon[];
  abilities: string[];
  coreAbilities: string[];
  keywords: string[];
  role: UnitRole;
  isLeader?: boolean;
  leaderFor?: string;
  attachedTo?: string;
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
  inReserve: boolean;
}

export interface AIDecisionResult {
  unitId: string;
  unitName: string;
  action: string;
  reasoning: string;
  details: string[];
  isReactive?: boolean;
}

export interface GameState {
  turn: number;
  phase: Phase;
  turnSide: TurnSide;
  battleRound: number;
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
  deploymentComplete: boolean;
}

export type GameAction =
  | { type: 'START_GAME'; playerFaction: FactionData; aiFaction: FactionData; mission: Mission }
  | { type: 'COMPLETE_DEPLOYMENT' }
  | { type: 'NEXT_PHASE' }
  | { type: 'NEXT_TURN' }
  | { type: 'UPDATE_UNIT'; side: PlayerSide; unitId: string; updates: Partial<UnitState> }
  | { type: 'SCORE_VP'; side: PlayerSide; amount: number; reason: string }
  | { type: 'SPEND_CP'; side: PlayerSide; amount: number; reason: string }
  | { type: 'GAIN_CP'; side: PlayerSide; amount: number; reason: string }
  | { type: 'SET_OATH_TARGET'; targetId: string }
  | { type: 'USE_SHADOW_IN_WARP' }
  | { type: 'ADD_LOG'; message: string }
  | { type: 'SET_AI_DECISIONS'; decisions: AIDecisionResult[] }
  | { type: 'END_GAME' };
