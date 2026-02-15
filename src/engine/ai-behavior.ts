import type { UnitProfile, UnitState, Phase, AIDecisionResult, UnitRole, GameState } from '../types';

// ── Helpers ──────────────────────────────────────────────────────

function findUnit(id: string, faction: { units: UnitProfile[] }): UnitProfile | undefined {
  return faction.units.find((u) => u.id === id);
}

function isAlive(unitState: UnitState): boolean {
  return !unitState.isDestroyed && unitState.modelsRemaining > 0;
}

function getAliveEnemyUnits(state: GameState): { profile: UnitProfile; state: UnitState }[] {
  return state.playerUnits
    .filter(isAlive)
    .map((us) => {
      const profile = findUnit(us.unitId, state.playerFaction);
      return profile ? { profile, state: us } : null;
    })
    .filter((x): x is { profile: UnitProfile; state: UnitState } => x !== null);
}

function isBelowStartingStrength(unitState: UnitState, profile: UnitProfile): boolean {
  return profile.modelCount > 1
    ? unitState.modelsRemaining < profile.modelCount
    : unitState.currentWounds < profile.wounds;
}

function isBelowHalfStrength(unitState: UnitState, profile: UnitProfile): boolean {
  return profile.modelCount > 1
    ? unitState.modelsRemaining <= Math.floor(profile.modelCount / 2)
    : unitState.currentWounds <= Math.floor(profile.wounds / 2);
}

// ── Deployment Guidance ──────────────────────────────────────────

export function generateDeploymentGuidance(state: GameState): AIDecisionResult[] {
  const decisions: AIDecisionResult[] = [];
  const isTyranids = state.aiFaction.id === 'vardenghast-swarm';
  const isSpaceMarines = state.aiFaction.id === 'strike-force-octavius';

  if (isTyranids) {
    decisions.push({
      unitId: 'deployment-overview',
      unitName: 'Tyranid Deployment Plan',
      action: 'Deploy Army',
      reasoning: 'Vardenghast Swarm deployment strategy',
      details: [
        '🔴 Terror of Vardenghast: DEEP STRIKE RESERVES — do NOT deploy on table. Arrives turn 2+ to assassinate.',
        '🟢 Termagants (20 models): Deploy on or near objectives. Split into 2×10 if desired (Patrol Squads). Screen your backline.',
        '🟢 Barbgaunts: Deploy with line of sight to likely enemy approaches. Stay back — they shoot at 24" range.',
        '🟢 Psychophage: Deploy centrally, ready to advance toward enemy. T9 can absorb fire.',
        '🟡 Von Ryan\'s Leapers: INFILTRATORS — deploy anywhere >9" from enemy deployment zone and enemy models. Place aggressively on a flank or near an objective.',
      ],
    });
  }

  if (isSpaceMarines) {
    decisions.push({
      unitId: 'deployment-overview',
      unitName: 'Space Marine Deployment Plan',
      action: 'Deploy Army',
      reasoning: 'Strike Force Octavius deployment strategy',
      details: [
        '🔴 Captain Octavius: DEEP STRIKE RESERVES — attached to Terminator Squad. Arrives turn 2+.',
        '🔴 Librarian Tantus: DEEP STRIKE RESERVES — attached to Terminator Squad. Veil of Time grants Sustained Hits 1.',
        '🔴 Terminator Squad: DEEP STRIKE RESERVES — arrives turn 2+ with both leaders attached. Place aggressively within 9" of priority target.',
        '🟢 Infernus Squad: Deploy on an objective. Pyreblasters are 12" range Torrent — hold ground and flame anything that approaches.',
      ],
    });
  }

  // Mark reserve units
  for (const unit of state.aiFaction.units) {
    const us = state.aiUnits.find((u) => u.unitId === unit.id);
    if (us?.inReserve) {
      decisions.push({
        unitId: unit.id,
        unitName: unit.name,
        action: 'In Reserves',
        reasoning: 'Deep Strike — will arrive turn 2+',
        details: [`${unit.name} starts in Deep Strike reserves. Set aside off the table.`],
      });
    }
  }

  return decisions;
}

// ── Faction-Specific AI Logic ────────────────────────────────────

function getTyranidMovement(unit: UnitProfile, unitState: UnitState, state: GameState, enemies: { profile: UnitProfile; state: UnitState }[]): string[] {
  const details: string[] = [];

  // Reserve handling for any unit
  if (unitState.inReserve) {
    if (state.battleRound < 2) {
      details.push(`${unit.name} remains in Deep Strike reserves. Wait until turn 2+ to arrive.`);
      return details;
    }
    if (state.battleRound >= 3) {
      details.push(`⚠️ ${unit.name} MUST arrive this turn! (Turn 3 — reserves destroyed if not deployed by end of turn)`);
    } else {
      details.push(`${unit.name} arrives from Deep Strike!`);
    }
    details.push(`Set up anywhere on the battlefield more than 9" from all enemy models.`);
  }

  switch (unit.id) {
    case 'terror-of-vardenghast': {
      if (unitState.inReserve) {
        if (state.battleRound < 2) {
          details.push(`${unit.name} remains in Deep Strike reserves. Wait until turn 2+ to arrive.`);
        } else {
          const characters = enemies.filter((e) => e.profile.keywords.includes('Character'));
          const weakUnits = enemies.filter((e) => isBelowHalfStrength(e.state, e.profile));
          const target = characters[0] ?? weakUnits[0] ?? enemies[0];
          details.push(`${unit.name} arrives from Deep Strike!`);
          details.push(`Place within 9" of ${target?.profile.name ?? 'nearest enemy'}, outside Engagement Range.`);
          details.push(`Priority: Assassinate characters and weak units.`);
        }
      } else {
        const characters = enemies.filter((e) => e.profile.keywords.includes('Character'));
        const target = characters[0] ?? enemies[0];
        details.push(`Move ${unit.name} (12") toward ${target?.profile.name ?? 'nearest enemy'}.`);
        details.push(`Flanker/Assassin: Close distance to charge and kill characters.`);
      }
      break;
    }
    case 'von-ryans-leapers': {
      details.push(`Move Von Ryan's Leapers (10") aggressively toward nearest enemy.`);
      details.push(`Infiltrators: Already in an advanced position. Fights First = charge aggressively.`);
      details.push(`Goal: Get into charge range. They excel in melee.`);
      break;
    }
    case 'termagants': {
      details.push(`Move Termagants toward the nearest unclaimed or contested objective.`);
      details.push(`Objective role: Screen and hold. Keep 20-model blob on objectives for OC advantage.`);
      details.push(`⚡ REMINDER — Skulking Horrors: If an enemy ends a move within 9" of this unit, Termagants can react-move D6". Use this to maintain distance or reposition onto objectives.`);
      break;
    }
    case 'barbgaunts': {
      details.push(`Barbgaunts hold position or move minimally for line of sight.`);
      details.push(`Support role: Stay back and shoot. 24" range on Barblaunchers covers most of the board.`);
      details.push(`Do NOT advance (Heavy keyword — would suffer -1 to hit).`);
      break;
    }
    case 'psychophage': {
      const belowStrength = enemies.filter((e) => isBelowStartingStrength(e.state, e.profile));
      const target = belowStrength[0] ?? enemies[0];
      details.push(`Move Psychophage (8") toward ${target?.profile.name ?? 'nearest enemy'}.`);
      details.push(`Aggressive: Close for Psychoclastic Torrent (12" Torrent) and charge.`);
      if (belowStrength.length > 0) {
        details.push(`🎯 Feeding Frenzy: Prioritize ${belowStrength.map((e) => e.profile.name).join(', ')} (below starting strength — bonus to hit/wound in melee).`);
      }
      break;
    }
    default:
      details.push(...describeGenericMovement(unit, unit.role, enemies));
  }

  return details;
}

function getTyranidShooting(unit: UnitProfile, unitState: UnitState, _state: GameState, enemies: { profile: UnitProfile; state: UnitState }[]): string[] {
  const details: string[] = [];
  const rangedWeapons = unit.weapons.filter((w) => w.range !== 'Melee');

  if (unitState.inReserve) {
    return [`${unit.name} is in reserves — cannot shoot.`];
  }

  if (rangedWeapons.length === 0) {
    return [`${unit.name} has no ranged weapons. Skip shooting.`];
  }

  switch (unit.id) {
    case 'barbgaunts': {
      const infantry = enemies.filter((e) => e.profile.keywords.includes('Infantry'));
      const target = infantry[0] ?? enemies[0];
      details.push(`Barbgaunts shoot Barblaunchers at ${target?.profile.name ?? 'nearest enemy'}.`);
      details.push(`🎯 ALWAYS target Infantry to trigger Disruption Bombardment.`);
      if (target) {
        details.push(`After shooting, if hit: ${target.profile.name} gets -2" Move, -2 to Advance/Charge rolls until end of your next turn.`);
      }
      break;
    }
    case 'psychophage': {
      details.push(`Psychophage fires Psychoclastic Torrent (12", D6 attacks, Torrent — auto-hits).`);
      details.push(`Target nearest enemy. Ignores Cover.`);
      break;
    }
    case 'termagants': {
      details.push(`Termagants shoot Fleshborers (18", Assault) at nearest enemy.`);
      details.push(`Assault keyword: Can shoot even if Advanced this turn.`);
      break;
    }
    default: {
      const weaponList = rangedWeapons.map((w) => `${w.name} (${w.range}, A${w.attacks}, S${w.strength})`);
      details.push(`${unit.name} shoots with: ${weaponList.join(', ')}.`);
      details.push(`Target: nearest enemy in range.`);
    }
  }

  return details;
}

function getTyranidCharge(unit: UnitProfile, unitState: UnitState, enemies: { profile: UnitProfile; state: UnitState }[]): string[] {
  if (unitState.inReserve) return [`${unit.name} is in reserves — cannot charge.`];

  switch (unit.id) {
    case 'terror-of-vardenghast': {
      const characters = enemies.filter((e) => e.profile.keywords.includes('Character'));
      const target = characters[0] ?? enemies[0];
      return [
        `${unit.name} CHARGES ${target?.profile.name ?? 'nearest enemy'}!`,
        `Priority: Characters and weak units. 6A at S6 AP-1 D2.`,
        `Death Blow: If killed in melee, on 4+ fights back before removal.`,
      ];
    }
    case 'von-ryans-leapers':
      return [
        `Von Ryan's Leapers CHARGE the nearest enemy!`,
        `Fights First: Will strike before non-charging enemy units in Fight phase.`,
        `18 attacks at WS3+ S5 AP-1 — devastating on the charge.`,
      ];
    case 'psychophage': {
      const belowStrength = enemies.filter((e) => isBelowStartingStrength(e.state, e.profile));
      const target = belowStrength[0] ?? enemies[0];
      return [
        `Psychophage CHARGES ${target?.profile.name ?? 'nearest enemy'}!`,
        `Feeding Frenzy: +1 to hit vs below-strength, +1 to wound vs below half-strength.`,
      ];
    }
    case 'termagants':
      return [`Termagants do NOT charge. Hold objectives and screen.`];
    case 'barbgaunts':
      return [`Barbgaunts do NOT charge. Support role — stay back and shoot.`];
    default:
      return describeGenericCharge(unit, unit.role);
  }
}

function getSpaceMarineMovement(unit: UnitProfile, unitState: UnitState, state: GameState, enemies: { profile: UnitProfile; state: UnitState }[]): string[] {
  const details: string[] = [];

  // Reserve handling
  if (unitState.inReserve) {
    if (state.battleRound < 2) {
      details.push(`${unit.name} remains in Deep Strike reserves. Wait until turn 2+ to arrive.`);
      return details;
    }
    if (state.battleRound >= 3) {
      details.push(`⚠️ ${unit.name} MUST arrive this turn! (Turn 3 — reserves destroyed if not deployed by end of turn)`);
    } else {
      details.push(`${unit.name} arrives from Deep Strike!`);
    }
    details.push(`Set up anywhere on the battlefield more than 9" from all enemy models.`);
  }

  switch (unit.id) {
    case 'captain-octavius':
    case 'librarian-tantus':
      // These are attached to Terminators — handled there
      details.push(`${unit.name} is attached to Terminator Squad — moves with them.`);
      break;
    case 'terminator-squad': {
      if (unitState.inReserve) {
        if (state.battleRound < 2) {
          details.push(`Terminator Squad (with Octavius + Tantus) remains in Deep Strike reserves.`);
        } else {
          // Find most threatening target via Oath of Moment logic
          const target = getMostThreateningEnemy(enemies);
          details.push(`Terminator Squad arrives from Deep Strike with Captain Octavius and Librarian Tantus!`);
          details.push(`Place within 9" of ${target?.profile.name ?? 'nearest enemy'}, outside Engagement Range.`);
          details.push(`Veil of Time active: All weapons gain Sustained Hits 1.`);
          details.push(`Unstoppable Valour: Re-roll charge rolls.`);
        }
      } else {
        details.push(`Move Terminators (5") toward nearest enemy or objective.`);
        details.push(`Aggressive: Close distance for shooting (24" storm bolters + assault cannon) then charge.`);
      }
      break;
    }
    case 'infernus-squad': {
      details.push(`Infernus Squad holds position on nearest objective.`);
      details.push(`Defensive: Pyreblasters are 12" Torrent — wait for enemies to come to you.`);
      details.push(`Only move to claim an uncontested objective if safe to do so.`);
      break;
    }
    default:
      details.push(...describeGenericMovement(unit, unit.role, enemies));
  }

  return details;
}

function getSpaceMarineShooting(unit: UnitProfile, unitState: UnitState, state: GameState, enemies: { profile: UnitProfile; state: UnitState }[]): string[] {
  if (unitState.inReserve) return [`${unit.name} is in reserves — cannot shoot.`];

  const details: string[] = [];
  switch (unit.id) {
    case 'captain-octavius':
    case 'librarian-tantus':
      details.push(`${unit.name} shoots as part of Terminator Squad.`);
      break;
    case 'terminator-squad': {
      const oathTarget = state.oathOfMomentTarget
        ? enemies.find((e) => e.profile.id === state.oathOfMomentTarget)
        : null;
      const target = oathTarget ?? enemies[0];
      details.push(`Terminators shoot at ${target?.profile.name ?? 'nearest enemy'}.`);
      details.push(`Weapons: Storm Bolters (Rapid Fire 2 within 12"), Assault Cannon (6 shots, Dev Wounds).`);
      details.push(`Tantus: Smite (D6 shots, S5/6, Psychic).`);
      details.push(`Veil of Time: All attacks gain Sustained Hits 1.`);
      if (oathTarget) {
        details.push(`🎯 Oath of Moment target: Re-roll all hit rolls against ${oathTarget.profile.name}.`);
        details.push(`Fury of the First: +1 to hit rolls vs Oath target.`);
      }
      break;
    }
    case 'infernus-squad': {
      details.push(`Infernus Squad fires Pyreblasters at nearest enemy within 12".`);
      details.push(`Torrent: Auto-hits. Ignores Cover. D6 attacks per model.`);
      details.push(`Devastating against hordes within range.`);
      break;
    }
    default: {
      const ranged = unit.weapons.filter((w) => w.range !== 'Melee');
      details.push(`${unit.name} shoots: ${ranged.map((w) => w.name).join(', ')}`);
    }
  }
  return details;
}

function getSpaceMarineCharge(unit: UnitProfile, unitState: UnitState, _enemies: { profile: UnitProfile; state: UnitState }[]): string[] {
  if (unitState.inReserve) return [`${unit.name} is in reserves — cannot charge.`];

  switch (unit.id) {
    case 'captain-octavius':
    case 'librarian-tantus':
      return [`${unit.name} charges with Terminator Squad.`];
    case 'terminator-squad':
      return [
        `Terminator Squad CHARGES nearest enemy!`,
        `Unstoppable Valour: Re-roll charge rolls (Captain Octavius ability).`,
        `Power Fists (S8 AP-2 D2) and Power Weapons for melee.`,
      ];
    case 'infernus-squad':
      return [
        `Infernus Squad does NOT charge.`,
        `Defensive role: Stay on objectives. Only engage if already in Engagement Range.`,
      ];
    default:
      return describeGenericCharge(unit, unit.role);
  }
}

function getMostThreateningEnemy(enemies: { profile: UnitProfile; state: UnitState }[]): { profile: UnitProfile; state: UnitState } | undefined {
  if (enemies.length === 0) return undefined;
  // Estimate threat by total weapon damage output
  return enemies.reduce((best, e) => {
    const score = estimateDamageOutput(e.profile, e.state);
    const bestScore = estimateDamageOutput(best.profile, best.state);
    return score > bestScore ? e : best;
  });
}

function estimateDamageOutput(profile: UnitProfile, unitState: UnitState): number {
  let total = 0;
  for (const w of profile.weapons) {
    const attacks = parseFloat(w.attacks) || 3; // D6 ≈ 3.5
    const damage = parseFloat(w.damage) || 2;
    total += attacks * damage;
  }
  // Scale by models remaining
  const modelRatio = profile.modelCount > 1 ? unitState.modelsRemaining / profile.modelCount : 1;
  return total * modelRatio;
}

// ── Generic fallbacks ────────────────────────────────────────────

function describeGenericMovement(unit: UnitProfile, role: UnitRole, enemies: { profile: UnitProfile }[]): string[] {
  const nearest = enemies[0]?.profile.name ?? 'nearest enemy';
  switch (role) {
    case 'aggressive': return [`Move ${unit.name} (${unit.movement}) toward ${nearest}.`];
    case 'defensive': return [`${unit.name} holds position near closest objective.`];
    case 'flanker': return [`Move ${unit.name} (${unit.movement}) toward weakest enemy.`];
    case 'support': return [`Keep ${unit.name} within 6" of friendly units.`];
    case 'objective': return [`Move ${unit.name} toward nearest unclaimed objective.`];
  }
}

function describeGenericCharge(unit: UnitProfile, role: UnitRole): string[] {
  if (role === 'aggressive' || role === 'flanker') {
    return [`${unit.name} CHARGES nearest enemy within 12".`];
  }
  return [`${unit.name} does NOT charge. ${role} role.`];
}

function describeFight(unit: UnitProfile, state: GameState, enemies: { profile: UnitProfile; state: UnitState }[]): string[] {
  const meleeWeapons = unit.weapons.filter((w) => w.range === 'Melee');
  if (meleeWeapons.length === 0) return [`${unit.name} has no melee weapons.`];

  const details: string[] = [];
  const weaponList = meleeWeapons.map((w) => `${w.name} (A${w.attacks}, S${w.strength}, AP${w.ap}, D${w.damage})`);
  details.push(`${unit.name} fights with: ${weaponList.join(', ')}.`);

  if (unit.coreAbilities.includes('Fights First')) {
    details.push(`⚡ FIGHTS FIRST — select to fight before non-charging enemy units.`);
  }

  // Faction-specific fight notes
  if (unit.id === 'psychophage') {
    const belowStrength = enemies.filter((e) => isBelowStartingStrength(e.state, e.profile));
    if (belowStrength.length > 0) {
      details.push(`🎯 Feeding Frenzy: +1 to hit vs ${belowStrength.map((e) => e.profile.name).join(', ')} (below starting strength).`);
      const belowHalf = belowStrength.filter((e) => isBelowHalfStrength(e.state, e.profile));
      if (belowHalf.length > 0) {
        details.push(`🎯 Also +1 to wound vs ${belowHalf.map((e) => e.profile.name).join(', ')} (below half-strength).`);
      }
    }
  }

  if (unit.id === 'terror-of-vardenghast') {
    details.push(`Death Blow: If destroyed in melee before fighting, on 4+ it fights back then is removed.`);
  }

  // Oath of Moment in melee
  if (state.oathOfMomentTarget && (state.aiFaction.id === 'strike-force-octavius')) {
    const oathTarget = enemies.find((e) => e.profile.id === state.oathOfMomentTarget);
    if (oathTarget) {
      details.push(`🎯 Re-roll all hit rolls vs Oath target (${oathTarget.profile.name}).`);
    }
  }

  return details;
}

function describeCommand(unit: UnitProfile, state: GameState): string[] {
  const results: string[] = [];
  const unitState = state.aiUnits.find((u) => u.unitId === unit.id);
  if (unitState && isBelowHalfStrength(unitState, unit)) {
    results.push(`${unit.name} is Below Half-strength. Take Battle-shock test (2D6 vs Ld ${unit.leadership}).`);
  }
  return results;
}

// ── Stratagem Logic (faction-aware) ──────────────────────────────

function getStratagemSuggestions(unit: UnitProfile, phase: Phase, state: GameState, isAITurn: boolean): string[] {
  const suggestions: string[] = [];
  const unitState = state.aiUnits.find((u) => u.unitId === unit.id);
  if (!unitState || unitState.isDestroyed || state.aiCP <= 0) return suggestions;

  const isTyranids = state.aiFaction.id === 'vardenghast-swarm';

  // Teeming Broods auto-use
  if (isTyranids && phase === 'movement' && isAITurn && unit.id === 'termagants') {
    if (unitState.modelsRemaining < 10) {
      suggestions.push(`🔴 AUTO-USE: TEEMING BROODS (1CP) — Termagants below 10 models (${unitState.modelsRemaining} remaining). Return D6 models.`);
    } else if (unitState.isDestroyed) {
      suggestions.push(`🔴 AUTO-USE: TEEMING BROODS (1CP) — Termagants destroyed. Set up 2D6 models from Strategic Reserves.`);
    }
  }

  // Voracious Assault
  if ((phase === 'shooting' || phase === 'fight') && isAITurn) {
    if (state.aiFaction.stratagems.some((s) => s.name === 'Voracious Assault')) {
      if (unit.role === 'aggressive' || unit.role === 'flanker') {
        suggestions.push(`Consider VORACIOUS ASSAULT (1CP) on ${unit.name}: Re-roll hits vs closest target.`);
      }
    }
  }

  // Veteran Instincts
  if (phase === 'fight' && isAITurn && unit.keywords.includes('Terminator')) {
    if (state.aiFaction.stratagems.some((s) => s.name === 'Veteran Instincts')) {
      suggestions.push(`Consider VETERAN INSTINCTS (1CP) on ${unit.name}: Re-roll wound rolls of 1 (all wounds vs Monsters/Vehicles).`);
    }
  }

  // Duty and Honour
  if (phase === 'command' && isAITurn) {
    if (state.aiFaction.stratagems.some((s) => s.name === 'Duty and Honour')) {
      suggestions.push(`Consider DUTY AND HONOUR (1CP) on ${unit.name}: Lock an objective.`);
    }
  }

  return suggestions;
}

// ── Reactive AI Actions (during player turn) ─────────────────────

export function generateReactiveAIDecisions(state: GameState): AIDecisionResult[] {
  const decisions: AIDecisionResult[] = [];
  const isTyranids = state.aiFaction.id === 'vardenghast-swarm';
  const isSpaceMarines = state.aiFaction.id === 'strike-force-octavius';

  if (state.phase === 'shooting') {
    // Hyper-Reactive (Tyranids)
    if (isTyranids && state.aiCP >= 1) {
      const infantry = state.aiFaction.units.filter((u) => {
        const us = state.aiUnits.find((s) => s.unitId === u.id);
        return us && isAlive(us) && u.keywords.includes('Infantry') && us.modelsRemaining >= 3;
      });
      if (infantry.length > 0) {
        decisions.push({
          unitId: 'reactive-hyper-reactive',
          unitName: '⚡ Reactive: Hyper-Reactive',
          action: 'When Shot At',
          reasoning: 'Use on the most valuable Infantry unit targeted',
          details: [
            `When an enemy shoots at AI Infantry, consider HYPER-REACTIVE (1CP).`,
            `Effect: -1 to enemy Hit rolls for the rest of the phase.`,
            `Best on: ${infantry.map((u) => u.name).join(', ')}.`,
          ],
          isReactive: true,
        });
      }
    }

    // Gene-Wrought Resilience (Space Marines)
    if (isSpaceMarines && state.aiCP >= 1) {
      decisions.push({
        unitId: 'reactive-gene-wrought',
        unitName: '⚡ Reactive: Gene-Wrought Resilience',
        action: 'When Shot At (high S)',
        reasoning: 'Use when attacked by weapons with S > T',
        details: [
          `When an enemy shoots at an AI unit with S > unit's T, consider GENE-WROUGHT RESILIENCE (1CP).`,
          `Effect: -1 to enemy Wound rolls for the rest of the phase.`,
        ],
        isReactive: true,
      });
    }
  }

  if (state.phase === 'charge') {
    // Fire Overwatch
    decisions.push({
      unitId: 'reactive-overwatch',
      unitName: '⚡ Reactive: Fire Overwatch',
      action: 'When Charged',
      reasoning: 'Shoot at charging unit (hits on 6s only)',
      details: [
        `When an enemy unit declares a charge against an AI unit, the AI can Fire Overwatch (1CP).`,
        `All ranged weapons fire at the charging unit (hitting on unmodified 6s only).`,
        `Best for units with high volume of fire (Termagants, Barbgaunts, Terminators).`,
      ],
      isReactive: true,
    });

    // Heroic Intervention from Leapers (free via Pouncing Leap)
    if (isTyranids) {
      const leapers = state.aiFaction.units.find((u) => u.id === 'von-ryans-leapers');
      const leapersState = state.aiUnits.find((u) => u.unitId === 'von-ryans-leapers');
      if (leapers && leapersState && isAlive(leapersState)) {
        decisions.push({
          unitId: 'reactive-heroic-intervention',
          unitName: "⚡ Reactive: Von Ryan's Leapers",
          action: 'Heroic Intervention (FREE)',
          reasoning: 'Pouncing Leap: Free Heroic Intervention, even if already used on another unit',
          details: [
            `If an enemy unit ends a charge within 6" of Von Ryan's Leapers, they can Heroic Intervene for 0CP!`,
            `Pouncing Leap makes this free AND can be used even if another unit already intervened.`,
            `Move up to 3" toward nearest enemy. Fights First means they strike before non-chargers.`,
          ],
          isReactive: true,
        });
      }
    }
  }

  if (state.phase === 'movement' && isTyranids) {
    // Skulking Horrors reminder
    const termagants = state.aiUnits.find((u) => u.unitId === 'termagants');
    if (termagants && isAlive(termagants)) {
      decisions.push({
        unitId: 'reactive-skulking',
        unitName: '⚡ Reactive: Termagants',
        action: 'Skulking Horrors',
        reasoning: 'Reactive move when enemy ends move within 9"',
        details: [
          `When any enemy unit ends a Normal, Advance, or Fall Back move within 9" of Termagants:`,
          `Termagants can make a Normal move of up to D6" (if not in Engagement Range).`,
          `Use to reposition onto objectives or away from threats.`,
        ],
        isReactive: true,
      });
    }
  }

  return decisions;
}

// ── Main AI Decision Generator ───────────────────────────────────

export function generateAIDecisions(state: GameState): AIDecisionResult[] {
  if (state.phase === 'deployment') {
    return generateDeploymentGuidance(state);
  }

  const decisions: AIDecisionResult[] = [];
  const aliveEnemies = getAliveEnemyUnits(state);
  const isAITurn = state.turnSide === 'ai';

  // During player turn, show reactive actions
  if (!isAITurn) {
    return generateReactiveAIDecisions(state);
  }

  // Faction abilities
  decisions.push(...generateFactionAbilityDecisions(state, aliveEnemies));

  const isTyranids = state.aiFaction.id === 'vardenghast-swarm';
  const isSpaceMarines = state.aiFaction.id === 'strike-force-octavius';

  for (const unitState of state.aiUnits) {
    if (!isAlive(unitState)) continue;
    const unit = findUnit(unitState.unitId, state.aiFaction);
    if (!unit) continue;

    // Skip leaders that are attached (handled with their bodyguard)
    if (isSpaceMarines && (unit.id === 'captain-octavius' || unit.id === 'librarian-tantus')) {
      if (state.phase !== 'command') continue; // Only show in command phase
    }

    let action = '';
    let details: string[] = [];

    switch (state.phase) {
      case 'command':
        action = 'Command Phase';
        details = describeCommand(unit, state);
        if (details.length === 0) details = [`${unit.name}: No special actions.`];
        break;

      case 'movement':
        action = `Move (${unit.role})`;
        details = isTyranids
          ? getTyranidMovement(unit, unitState, state, aliveEnemies)
          : isSpaceMarines
            ? getSpaceMarineMovement(unit, unitState, state, aliveEnemies)
            : describeGenericMovement(unit, unit.role, aliveEnemies);
        break;

      case 'shooting':
        action = 'Shoot';
        details = isTyranids
          ? getTyranidShooting(unit, unitState, state, aliveEnemies)
          : isSpaceMarines
            ? getSpaceMarineShooting(unit, unitState, state, aliveEnemies)
            : [`${unit.name} shoots at nearest enemy.`];
        break;

      case 'charge':
        action = 'Charge';
        details = isTyranids
          ? getTyranidCharge(unit, unitState, aliveEnemies)
          : isSpaceMarines
            ? getSpaceMarineCharge(unit, unitState, aliveEnemies)
            : describeGenericCharge(unit, unit.role);
        break;

      case 'fight':
        action = 'Fight';
        details = describeFight(unit, state, aliveEnemies);
        break;
    }

    const stratagems = getStratagemSuggestions(unit, state.phase, state, isAITurn);
    details.push(...stratagems);

    decisions.push({
      unitId: unit.id,
      unitName: unit.name,
      action,
      reasoning: `${unit.role.charAt(0).toUpperCase() + unit.role.slice(1)} role`,
      details,
    });
  }

  return decisions;
}

function generateFactionAbilityDecisions(state: GameState, enemies: { profile: UnitProfile; state: UnitState }[]): AIDecisionResult[] {
  const decisions: AIDecisionResult[] = [];
  const isTyranids = state.aiFaction.id === 'vardenghast-swarm';
  const isSpaceMarines = state.aiFaction.id === 'strike-force-octavius';

  if (state.phase === 'command') {
    if (isSpaceMarines && enemies.length > 0) {
      // Oath of Moment: target most threatening (highest damage output)
      const mostThreatening = getMostThreateningEnemy(enemies);
      if (mostThreatening) {
        decisions.push({
          unitId: 'faction-ability',
          unitName: 'Oath of Moment',
          action: 'Select Oath Target',
          reasoning: 'Target highest damage output enemy (not just toughness)',
          details: [
            `Select ${mostThreatening.profile.name} as the Oath of Moment target.`,
            `Reason: Highest estimated damage output — eliminate the biggest threat first.`,
            `All models re-roll Hit rolls against this target. Terminators get +1 to hit (Fury of the First).`,
          ],
        });
      }
    }

    if (isTyranids && !state.shadowInTheWarpUsed) {
      const alivePlayerUnits = state.playerUnits.filter((u) => !u.isDestroyed && u.modelsRemaining > 0);
      if (alivePlayerUnits.length >= 2 && state.battleRound >= 2) {
        decisions.push({
          unitId: 'faction-ability',
          unitName: 'Shadow in the Warp',
          action: 'Unleash Shadow in the Warp',
          reasoning: 'Multiple enemy units alive, turn 2+ — good timing',
          details: [
            'ALL enemy units must take Battle-shock tests immediately.',
            'Once per battle only.',
            `${alivePlayerUnits.length} enemy units will be tested.`,
          ],
        });
      }
    }
  }

  return decisions;
}
