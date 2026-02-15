import type { UnitProfile, UnitState, Phase, AIDecisionResult, UnitRole, GameState } from '../types';

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

function describeMovement(unit: UnitProfile, role: UnitRole, enemies: { profile: UnitProfile }[]): string[] {
  const nearestEnemy = enemies[0]?.profile.name ?? 'nearest enemy';

  switch (role) {
    case 'aggressive':
      return [
        `Move ${unit.name} (${unit.movement}) toward ${nearestEnemy}.`,
        `Aggressive role: Close distance for shooting and charging.`,
        unit.coreAbilities.includes('Deep Strike')
          ? `Can Deep Strike if not yet deployed (set up within 9" of enemy, outside engagement range).`
          : '',
      ].filter(Boolean);

    case 'defensive':
      return [
        `${unit.name} holds position near the closest objective.`,
        `Defensive role: Remain stationary if enemies are in shooting range, otherwise move to nearest objective.`,
      ];

    case 'flanker':
      return [
        `Move ${unit.name} (${unit.movement}) toward the most exposed/weakest enemy unit.`,
        `Flanker role: Seek out vulnerable targets, use speed to get charges off.`,
        unit.coreAbilities.includes('Deep Strike')
          ? `Use Deep Strike to appear behind enemy lines if possible.`
          : '',
        unit.coreAbilities.includes('Infiltrators')
          ? `Already deployed in an advanced position via Infiltrators.`
          : '',
      ].filter(Boolean);

    case 'support':
      return [
        `Keep ${unit.name} within 6" of friendly units.`,
        `Support role: Stay back, provide shooting support. Do not advance aggressively.`,
      ];

    case 'objective':
      return [
        `Move ${unit.name} toward the nearest unclaimed or contested objective.`,
        `Objective role: Prioritize holding objectives over engaging enemies.`,
      ];
  }
}

function describeShooting(unit: UnitProfile, role: UnitRole, enemies: { profile: UnitProfile; state: UnitState }[]): string[] {
  const rangedWeapons = unit.weapons.filter((w) => w.range !== 'Melee');
  if (rangedWeapons.length === 0) {
    return [`${unit.name} has no ranged weapons. Skip shooting.`];
  }

  const weaponList = rangedWeapons.map((w) => `${w.name} (${w.range}, A${w.attacks}, S${w.strength}, AP${w.ap}, D${w.damage})`);

  const targetPriority = getTargetPriority(role, enemies);

  return [
    `${unit.name} shoots with: ${weaponList.join(', ')}.`,
    `Target priority: ${targetPriority}.`,
    ...rangedWeapons
      .filter((w) => w.keywords.length > 0)
      .map((w) => `${w.name} has: [${w.keywords.join(', ')}].`),
  ];
}

function getTargetPriority(role: UnitRole, enemies: { profile: UnitProfile; state: UnitState }[]): string {
  if (enemies.length === 0) return 'No valid targets';

  const wounded = enemies.filter((e) => e.state.modelsRemaining < e.profile.modelCount);
  const nearestName = enemies[0]?.profile.name ?? 'nearest enemy';

  switch (role) {
    case 'aggressive':
      return wounded.length > 0
        ? `Wounded units first (${wounded.map((e) => e.profile.name).join(', ')}), then ${nearestName}`
        : `Nearest enemy: ${nearestName}`;

    case 'defensive':
      return `Nearest threat in range: ${nearestName}`;

    case 'flanker':
      return `Weakest/most exposed unit, then wounded units`;

    case 'support':
      return `Nearest target: ${nearestName}. Prioritize Infantry for disruption.`;

    case 'objective':
      return `Nearest enemy threatening an objective, then ${nearestName}`;
  }
}

function describeCharge(unit: UnitProfile, role: UnitRole): string[] {
  switch (role) {
    case 'aggressive':
      return [
        `${unit.name} CHARGES the nearest enemy unit if within 12".`,
        `Roll 2D6 for charge distance. Must end within Engagement Range.`,
      ];

    case 'flanker':
      return [
        `${unit.name} CHARGES the weakest nearby enemy if within 12".`,
        `Flanker: Prefers charging over holding back.`,
      ];

    case 'defensive':
    case 'support':
      return [
        `${unit.name} does NOT charge.`,
        `${role === 'defensive' ? 'Defensive' : 'Support'} role: Avoid melee unless already engaged.`,
      ];

    case 'objective':
      return [
        `${unit.name} only charges if an enemy is contesting an objective they are holding.`,
        `Objective role: Charge only to protect objectives.`,
      ];
  }
}

function describeFight(unit: UnitProfile, _role: UnitRole): string[] {
  const meleeWeapons = unit.weapons.filter((w) => w.range === 'Melee');
  if (meleeWeapons.length === 0) {
    return [`${unit.name} has no melee weapons. Cannot fight.`];
  }

  const weaponList = meleeWeapons.map((w) => `${w.name} (A${w.attacks}, S${w.strength}, AP${w.ap}, D${w.damage})`);

  const fightFirstNote = unit.coreAbilities.includes('Fights First')
    ? `${unit.name} has FIGHTS FIRST - select to fight before non-charging units.`
    : '';

  return [
    `${unit.name} fights with: ${weaponList.join(', ')}.`,
    `Allocate attacks to the closest enemy unit in Engagement Range.`,
    fightFirstNote,
  ].filter(Boolean);
}

function describeCommand(unit: UnitProfile, _role: UnitRole, state: GameState): string[] {
  const results: string[] = [];

  const unitState = state.aiUnits.find((u) => u.unitId === unit.id);
  if (unitState && unitState.modelsRemaining <= Math.floor(unit.modelCount / 2)) {
    results.push(`${unit.name} is Below Half-strength. Take Battle-shock test (2D6 vs Ld ${unit.leadership}).`);
  }

  return results;
}

function getStratagemSuggestions(
  unit: UnitProfile,
  phase: Phase,
  state: GameState,
  isAITurn: boolean
): string[] {
  const suggestions: string[] = [];
  const faction = state.aiFaction;
  const unitState = state.aiUnits.find((u) => u.unitId === unit.id);
  if (!unitState || unitState.isDestroyed) return suggestions;

  if (state.aiCP <= 0) return suggestions;

  for (const strat of faction.stratagems) {
    if (phase === 'shooting' && strat.name === 'Voracious Assault' && isAITurn) {
      suggestions.push(`Consider VORACIOUS ASSAULT (1CP) on ${unit.name}: Re-roll hits vs closest target.`);
    }
    if (phase === 'fight' && strat.name === 'Voracious Assault' && isAITurn) {
      suggestions.push(`Consider VORACIOUS ASSAULT (1CP) on ${unit.name}: Re-roll hits vs closest target in melee.`);
    }
    if (phase === 'fight' && strat.name === 'Veteran Instincts' && isAITurn && unit.keywords.includes('Terminator')) {
      suggestions.push(`Consider VETERAN INSTINCTS (1CP) on ${unit.name}: Re-roll wound rolls of 1 (all wound rolls vs Monsters/Vehicles).`);
    }
    if (phase === 'shooting' && strat.name === 'Hyper-Reactive' && !isAITurn && unit.keywords.includes('Infantry')) {
      if (unitState.modelsRemaining >= 3) {
        suggestions.push(`Use HYPER-REACTIVE (1CP) on ${unit.name} when targeted: -1 to enemy hit rolls.`);
      }
    }
    if (phase === 'shooting' && strat.name === 'Gene-Wrought Resilience' && !isAITurn) {
      suggestions.push(`Consider GENE-WROUGHT RESILIENCE (1CP) on ${unit.name} if hit by S>T attacks: -1 to wound rolls.`);
    }
    if (phase === 'movement' && strat.name === 'Teeming Broods' && isAITurn && unit.id === 'termagants') {
      if (unitState.modelsRemaining < unit.modelCount || unitState.isDestroyed) {
        suggestions.push(`Use TEEMING BROODS (1CP) on Termagants: Return D6 models (or 2D6 from Strategic Reserves if destroyed).`);
      }
    }
    if (phase === 'command' && strat.name === 'Duty and Honour' && isAITurn) {
      suggestions.push(`Consider DUTY AND HONOUR (1CP) on ${unit.name}: Lock down a controlled objective.`);
    }
  }

  return suggestions;
}

export function generateAIDecisions(state: GameState): AIDecisionResult[] {
  const decisions: AIDecisionResult[] = [];
  const aliveEnemies = getAliveEnemyUnits(state);
  const isAITurn = true;

  const factionAbilityDecisions = generateFactionAbilityDecisions(state);
  decisions.push(...factionAbilityDecisions);

  for (const unitState of state.aiUnits) {
    if (!isAlive(unitState)) continue;

    const unit = findUnit(unitState.unitId, state.aiFaction);
    if (!unit) continue;

    let action = '';
    let details: string[] = [];

    switch (state.phase) {
      case 'command':
        action = 'Command Phase Actions';
        details = describeCommand(unit, unit.role, state);
        if (details.length === 0) {
          details = [`${unit.name}: No special actions this Command phase.`];
        }
        break;

      case 'movement':
        action = `Move (${unit.role} role)`;
        details = describeMovement(unit, unit.role, aliveEnemies);
        break;

      case 'shooting':
        action = 'Shoot';
        details = describeShooting(unit, unit.role, aliveEnemies);
        break;

      case 'charge':
        action = unit.role === 'aggressive' || unit.role === 'flanker' ? 'Charge' : 'Hold';
        details = describeCharge(unit, unit.role);
        break;

      case 'fight':
        action = 'Fight';
        details = describeFight(unit, unit.role);
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

function generateFactionAbilityDecisions(state: GameState): AIDecisionResult[] {
  const decisions: AIDecisionResult[] = [];
  const isTyranids = state.aiFaction.id === 'vardenghast-swarm';
  const isSpaceMarines = state.aiFaction.id === 'strike-force-octavius';

  if (state.phase === 'command') {
    if (isSpaceMarines) {
      const aliveEnemies = getAliveEnemyUnits(state);
      if (aliveEnemies.length > 0) {
        const highestThreat = aliveEnemies.reduce((best, e) =>
          e.profile.toughness > best.profile.toughness ? e : best
        );
        decisions.push({
          unitId: 'faction-ability',
          unitName: 'Oath of Moment',
          action: 'Select Oath Target',
          reasoning: 'Target the highest-toughness enemy for re-roll benefits.',
          details: [
            `Select ${highestThreat.profile.name} as the Oath of Moment target.`,
            `All models with Oath of Moment can re-roll Hit rolls against this target.`,
          ],
        });
      }
    }

    if (isTyranids && !state.shadowInTheWarpUsed) {
      const playerBelowHalf = state.playerUnits.filter(
        (u) => !u.isDestroyed && u.modelsRemaining > 0
      );
      if (playerBelowHalf.length >= 2 && state.turn >= 2) {
        decisions.push({
          unitId: 'faction-ability',
          unitName: 'Shadow in the Warp',
          action: 'Unleash Shadow in the Warp',
          reasoning: 'Multiple enemy units on the field. Good timing to force Battle-shock tests.',
          details: [
            'ALL enemy units must take Battle-shock tests immediately.',
            'This can only be used once per battle.',
            `${playerBelowHalf.length} enemy units will be tested.`,
          ],
        });
      }
    }
  }

  return decisions;
}
