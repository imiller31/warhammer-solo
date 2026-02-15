import type { Mission } from '../types';

export const missions: Mission[] = [
  {
    id: 1,
    name: 'Clash of Patrols',
    description: 'Secure vital intelligence from crash site data-cores.',
    objectiveCount: 3,
    scoringRules: [
      'Rounds 2-5: Score 5VP per controlled objective at end of Command phase (max 15VP/turn).',
      'Round 5 second player: Score at end of turn instead of Command phase.',
      'Retrieve Intelligence: From round 2, select one controlled objective in Command phase to recover data. Gain 1CP if your Warlord is on the battlefield. Each objective can only be selected once.',
    ],
    specialRules: [
      '3 objectives: center, 12" toward Attacker edge, 12" toward Defender edge.',
    ],
  },
  {
    id: 2,
    name: 'Archeotech Recovery',
    description: 'Retrieve valuable archeotech before power cells degrade.',
    objectiveCount: 5,
    scoringRules: [
      'Rounds 2-5: Score 5VP per controlled objective at end of Command phase.',
      'End of battle: 10VP for controlling the last remaining No Man\'s Land objective.',
      'Irradiated Power Cells: Round 3 start - Defender removes one No Man\'s Land objective. Round 4 start - Attacker removes another.',
    ],
    specialRules: [
      '5 objectives: center + 4 in No Man\'s Land.',
      'Objectives are progressively removed during the game.',
    ],
  },
  {
    id: 3,
    name: 'Forward Outpost',
    description: 'Sabotage enemy observation post under cover of darkness.',
    objectiveCount: 3,
    scoringRules: [
      'Rounds 2-5: 5VP per No Man\'s Land objective controlled.',
      '10VP for controlling objective in opponent\'s deployment zone.',
      'Max 15VP per turn.',
    ],
    specialRules: [
      '3 objectives: center of No Man\'s Land, one in each deployment zone.',
      'Sabotage Enemy Comms: If you control the objective in your opponent\'s deployment zone at end of turn, they cannot use Command Re-roll Stratagem for the rest of the battle.',
    ],
  },
  {
    id: 4,
    name: 'Scorched Earth',
    description: 'Raze key targets and leave nothing but wreckage.',
    objectiveCount: 4,
    scoringRules: [
      '5VP if controlling one or more objectives.',
      '5VP if controlling more objectives than opponent.',
      '10VP if you razed an objective this turn.',
      'Raze and Ruin: From round 2, you can remove a controlled objective from the battlefield (certain restrictions apply).',
    ],
    specialRules: [
      '4 objectives: Attacker cannot raze Objective A, Defender cannot raze Objective B.',
      'No enemy units within 3" of objective to raze it.',
    ],
  },
  {
    id: 5,
    name: 'Sweeping Raid',
    description: 'Drive spearhead through enemy lines without cutting supply lines.',
    objectiveCount: 4,
    scoringRules: [
      'Rounds 2-4: 5VP per controlled objective (max 15VP/turn).',
      'End of battle: Attacker gets 5VP for Objective C, 10VP for Objective D.',
      'End of battle: Defender gets 5VP for Objective B, 10VP for Objective A.',
    ],
    specialRules: [
      '4 objectives arranged linearly from Defender zone (A) to Attacker zone (D).',
      'Supply Lines: At start of Command phase, if controlling objective in own deployment zone, roll D6 — gain 1CP on 4+.',
    ],
  },
  {
    id: 6,
    name: 'Display of Might',
    description: 'Claim symbolic sites to crush enemy fighting spirit.',
    objectiveCount: 4,
    scoringRules: [
      '5VP if controlling one or more objectives.',
      '5VP if controlling two or more objectives.',
      '5VP if one or more symbolic sites (No Man\'s Land objectives) are claimed by your army.',
      '5VP if the same model has claimed a symbolic site for 2+ consecutive turns.',
    ],
    specialRules: [
      '4 objectives: 2 symbolic sites in No Man\'s Land, one in each deployment zone.',
      'Claim Sites: Control a symbolic site + Character within range at end of Command phase to claim it.',
      'Cannot use Insane Bravery unless target unit within 6" of Warlord.',
    ],
  },
];
