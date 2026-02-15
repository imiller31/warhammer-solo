import type { FactionData } from '../types';

export const tyranids: FactionData = {
  id: 'vardenghast-swarm',
  name: 'The Vardenghast Swarm',

  factionAbilities: [
    {
      name: 'Synapse',
      effect:
        'While a Tyranids unit is within 6" of one or more friendly Synapse models, that unit is within Synapse Range and takes Battle-shock tests on 3D6 (discarding the highest) instead of 2D6.',
    },
    {
      name: 'Shadow in the Warp',
      effect:
        "Once per battle, in either player's Command phase, if one or more units with this ability are on the battlefield, you can use this ability. Each enemy unit on the battlefield must take a Battle-shock test.",
    },
  ],

  units: [
    {
      id: 'terror-of-vardenghast',
      name: 'Terror of Vardenghast',
      faction: 'tyranids',
      movement: '12"',
      toughness: 5,
      save: '4+',
      wounds: 6,
      leadership: '7+',
      oc: 1,
      modelCount: 1,
      role: 'flanker',
      weapons: [
        {
          name: 'Prime Talons',
          range: 'Melee',
          attacks: '6',
          skill: '2+',
          strength: 6,
          ap: -1,
          damage: '2',
          keywords: [],
        },
      ],
      abilities: [
        "Death Blow: If this model is destroyed by a melee attack and hasn't fought this phase, roll a D6. On a 4+, do not remove it from play; it can fight after the attacking unit has finished making its attacks, and is then removed from play.",
      ],
      coreAbilities: ['Deep Strike'],
      keywords: [
        'Infantry',
        'Character',
        'Fly',
        'Great Devourer',
        'Synapse',
        'Vanguard Invader',
        'Winged Tyranid Prime',
        'Terror of Vardenghast',
      ],
    },
    {
      id: 'psychophage',
      name: 'Psychophage',
      faction: 'tyranids',
      movement: '8"',
      toughness: 9,
      save: '3+',
      wounds: 10,
      leadership: '8+',
      oc: 3,
      modelCount: 1,
      role: 'aggressive',
      weapons: [
        {
          name: 'Psychoclastic Torrent',
          range: '12"',
          attacks: 'D6',
          skill: 'N/A',
          strength: 6,
          ap: -1,
          damage: '1',
          keywords: ['Ignores Cover', 'Torrent'],
        },
        {
          name: 'Talons and Betentacled Maw',
          range: 'Melee',
          attacks: 'D6+1',
          skill: '3+',
          strength: 6,
          ap: -1,
          damage: '2',
          keywords: ['Anti-Psyker 4+', 'Devastating Wounds'],
        },
      ],
      abilities: [
        'Feeding Frenzy: Each time this model makes a melee attack against a unit that is Below Starting Strength, add 1 to the Hit roll. If the target is also Below Half-strength, add 1 to the Wound roll as well.',
      ],
      coreAbilities: ['Deadly Demise 1', 'Feel No Pain 5+'],
      keywords: ['Monster', 'Great Devourer', 'Harvester', 'Psychophage'],
    },
    {
      id: 'termagants',
      name: 'Termagants',
      faction: 'tyranids',
      movement: '6"',
      toughness: 3,
      save: '5+',
      wounds: 1,
      leadership: '8+',
      oc: 2,
      modelCount: 20,
      role: 'objective',
      weapons: [
        {
          name: 'Fleshborer',
          range: '18"',
          attacks: '1',
          skill: '4+',
          strength: 5,
          ap: 0,
          damage: '1',
          keywords: ['Assault'],
        },
        {
          name: 'Chitinous Claws and Teeth',
          range: 'Melee',
          attacks: '1',
          skill: '4+',
          strength: 3,
          ap: 0,
          damage: '1',
          keywords: [],
        },
      ],
      abilities: [
        "Skulking Horrors: Once per turn, when an enemy unit ends a Normal, Advance, or Fall Back move within 9\" of this unit and this unit is not within Engagement Range of one or more enemy units, this unit can make a Normal move of up to D6\".",
        'Patrol Squads: At the start of the Declare Battle Formations step, this unit can be split into two units of 10 models each.',
      ],
      coreAbilities: [],
      keywords: [
        'Infantry',
        'Battleline',
        'Great Devourer',
        'Endless Multitude',
        'Termagants',
      ],
    },
    {
      id: 'barbgaunts',
      name: 'Barbgaunts',
      faction: 'tyranids',
      movement: '6"',
      toughness: 4,
      save: '4+',
      wounds: 2,
      leadership: '8+',
      oc: 1,
      modelCount: 5,
      role: 'support',
      weapons: [
        {
          name: 'Barblauncher',
          range: '24"',
          attacks: 'D6',
          skill: '4+',
          strength: 5,
          ap: 0,
          damage: '1',
          keywords: ['Blast', 'Heavy'],
        },
        {
          name: 'Chitinous Claws and Teeth',
          range: 'Melee',
          attacks: '1',
          skill: '4+',
          strength: 4,
          ap: 0,
          damage: '1',
          keywords: [],
        },
      ],
      abilities: [
        "Disruption Bombardment: In your Shooting phase, after this unit has shot, select one enemy Infantry unit hit by one or more of those attacks. Until the end of your opponent's next turn, that unit is disrupted: subtract 2\" from its Move and subtract 2 from Advance and Charge rolls made for it.",
      ],
      coreAbilities: [],
      keywords: ['Infantry', 'Great Devourer', 'Barbgaunts'],
    },
    {
      id: 'von-ryans-leapers',
      name: "Von Ryan's Leapers",
      faction: 'tyranids',
      movement: '10"',
      toughness: 5,
      save: '4+',
      wounds: 3,
      leadership: '8+',
      oc: 1,
      invulnSave: '6+',
      modelCount: 3,
      role: 'flanker',
      weapons: [
        {
          name: "Leaper's Talons",
          range: 'Melee',
          attacks: '6',
          skill: '3+',
          strength: 5,
          ap: -1,
          damage: '1',
          keywords: [],
        },
      ],
      abilities: [
        'Pouncing Leap: You can target this unit with the Heroic Intervention Stratagem for 0CP, and can do so even if you have already used that Stratagem on a different unit this phase.',
      ],
      coreAbilities: ['Fights First', 'Infiltrators', 'Stealth'],
      keywords: [
        'Infantry',
        'Great Devourer',
        'Vanguard Invader',
        "Von Ryan's Leapers",
      ],
    },
  ],

  stratagems: [
    {
      name: 'Hyper-Reactive',
      cpCost: 1,
      phase: "Opponent's Shooting or Fight phase",
      type: 'Battle Tactic',
      when: 'After enemy unit has selected its targets.',
      target: 'One Tyranids Infantry unit that was selected as the target of one or more of those attacks.',
      effect:
        'Until end of phase, each time an attack targets your unit, subtract 1 from the Hit roll.',
    },
    {
      name: 'Voracious Assault',
      cpCost: 1,
      phase: 'Your Shooting or Fight phase',
      type: 'Battle Tactic',
      when: 'Your Shooting phase or Fight phase.',
      target:
        'One Tyranids unit that has not been selected to shoot or fight this phase.',
      effect:
        'Until end of phase, each time a model in your unit makes an attack that targets the closest eligible target, you can re-roll the Hit roll.',
    },
    {
      name: 'Teeming Broods',
      cpCost: 1,
      phase: 'Your Movement phase',
      type: 'Strategic Ploy',
      when: 'Reinforcements step of your Movement phase.',
      target: 'One Termagants unit (can target even if destroyed).',
      effect:
        'If the unit is not destroyed, return up to D6 destroyed models to the unit. If the unit was destroyed, set up a new identical unit with 2D6 models arriving from Strategic Reserves.',
    },
  ],

  enhancements: [
    {
      name: 'Psychostatic Veil',
      effect:
        'The bearer has the Lone Operative ability and a 4+ invulnerable save. Each time a melee attack targets the bearer, subtract 1 from the Hit roll.',
      isDefault: true,
    },
    {
      name: 'Secretion Goad',
      effect:
        'Once per turn, when a friendly Tyranids unit within 6" is selected to shoot or fight, the bearer can use this ability. Until the end of the phase, improve the AP characteristic of that unit\'s weapons by 1.',
      isDefault: false,
    },
  ],

  secondaryObjectives: [
    {
      name: 'Alpha Xenoform',
      effect:
        'At the end of each phase, score 4VP if the Winged Tyranid Prime destroyed one or more enemy models that phase.',
      isDefault: true,
    },
    {
      name: 'Chitinous Tide',
      effect:
        "At the end of your turn, score 5VP if you control one or more objective markers within 6\" of your opponent's deployment zone.",
      isDefault: false,
    },
  ],
};
