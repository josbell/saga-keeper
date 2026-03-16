// Ironsworn move catalogue — all 32 core moves from the Ironsworn SRD
// Ironsworn is licensed under Creative Commons Attribution 4.0 International
import type { Move } from '@saga-keeper/domain'

export const IRONSWORN_MOVES: Move[] = [
  // ── Adventure ──────────────────────────────────────────────────────────────
  {
    id: 'face-danger',
    name: 'Face Danger',
    category: 'adventure',
    stats: ['edge', 'heart', 'iron', 'shadow', 'wits'],
    description:
      'When you attempt something risky or react to an imminent threat, envision your action and roll. ' +
      'If you act with speed, agility, or precision: +edge. ' +
      'If you act with charm, resolve, or courage: +heart. ' +
      'If you act with strength or force: +iron. ' +
      'If you act with deception or stealth: +shadow. ' +
      'If you act with expertise or care: +wits.',
    trigger: 'Attempt something risky',
  },
  {
    id: 'secure-advantage',
    name: 'Secure an Advantage',
    category: 'adventure',
    stats: ['edge', 'heart', 'iron', 'shadow', 'wits'],
    description:
      'When you assess a situation, make preparations, or attempt to gain leverage, envision your action and roll.',
    trigger: 'Assess or prepare for a challenge',
  },
  {
    id: 'gather-information',
    name: 'Gather Information',
    category: 'adventure',
    stats: ['wits'],
    description:
      'When you search an area, ask questions, conduct research, or follow a track, roll +wits. ' +
      'If you are in the company of another who has relevant knowledge, add +1.',
    trigger: 'Search, investigate, or track',
  },
  {
    id: 'heal',
    name: 'Heal',
    category: 'adventure',
    stats: ['wits', 'iron'],
    description:
      'When you treat injuries or ailments, roll +wits. ' +
      'If you are mending your own wounds, roll +wits or +iron, whichever is lower.',
    trigger: 'Treat wounds or ailments',
  },
  {
    id: 'resupply',
    name: 'Resupply',
    category: 'adventure',
    stats: ['wits'],
    description: 'When you hunt, forage, or scavenge, roll +wits.',
    trigger: 'Hunt, forage, or scavenge',
  },
  {
    id: 'make-camp',
    name: 'Make Camp',
    category: 'adventure',
    stats: ['supply'],
    description: 'When you rest and recover for several hours in the wild, roll +supply.',
    trigger: 'Rest and recover in the wild',
  },
  {
    id: 'undertake-journey',
    name: 'Undertake a Journey',
    category: 'adventure',
    stats: ['wits'],
    description:
      'When you travel across hazardous or unfamiliar lands, roll +wits. ' +
      'If you are setting off on a new journey, make note of the rank of your destination.',
    trigger: 'Travel across dangerous lands',
  },
  {
    id: 'reach-destination',
    name: 'Reach Your Destination',
    category: 'adventure',
    stats: [],
    description:
      'When your journey progress track is full, roll the challenge dice and compare to your progress. ' +
      'Momentum is ignored on this roll.',
    trigger: 'Complete a journey (progress roll)',
  },
  {
    id: 'aid-your-ally',
    name: 'Aid Your Ally',
    category: 'adventure',
    stats: ['edge', 'heart', 'iron', 'shadow', 'wits'],
    description:
      'When you act in direct support of a companion, roll +heart. ' +
      'If you share a bond with them, add +1. ' +
      'On a hit, they may add +2 on their next move.',
    trigger: 'Directly support a companion',
  },

  // ── Combat ─────────────────────────────────────────────────────────────────
  {
    id: 'enter-the-fray',
    name: 'Enter the Fray',
    category: 'combat',
    stats: ['heart', 'edge'],
    description:
      'When you initiate combat or are forced into a fight, envision your action and roll. ' +
      '+edge if you are moving first or striking from hiding. ' +
      '+heart if you are facing your foe head-on or rallying your companions.',
    trigger: 'Initiate or be drawn into combat',
  },
  {
    id: 'strike',
    name: 'Strike',
    category: 'combat',
    stats: ['iron', 'edge'],
    description:
      'When you have initiative and attack in close quarters, roll +iron. ' +
      'When you attack at range, roll +edge.',
    trigger: 'Attack while you have initiative',
  },
  {
    id: 'clash',
    name: 'Clash',
    category: 'combat',
    stats: ['iron', 'edge'],
    description:
      'When your foe has initiative and you fight back, roll +iron. ' +
      'Against an attack at range, roll +edge.',
    trigger: 'Fight back without initiative',
  },
  {
    id: 'turn-the-tide',
    name: 'Turn the Tide',
    category: 'combat',
    stats: [],
    description:
      'Once per fight, when you risk it all, you may steal initiative from your foe to make a move at +1 (not a progress move). ' +
      'When you do, take +1 momentum on a hit.',
    trigger: 'Steal initiative (once per fight)',
  },
  {
    id: 'end-the-fight',
    name: 'End the Fight',
    category: 'combat',
    stats: [],
    description:
      'When your combat progress track is full, roll the challenge dice and compare to your progress. ' +
      'Momentum is ignored on this roll.',
    trigger: 'Finish a fight (progress roll)',
  },
  {
    id: 'battle',
    name: 'Battle',
    category: 'combat',
    stats: ['iron', 'edge', 'heart', 'shadow', 'wits'],
    description:
      'When you fight a battle and it happens in a blur, envision your objective and roll. ' +
      '+edge if fighting at range or using subterfuge. ' +
      '+iron if fighting with strength or in close quarters. ' +
      '+heart if fighting to protect others. ' +
      '+shadow if fighting using tricks. ' +
      '+wits if fighting by using the terrain.',
    trigger: 'Fight an abstracted battle',
  },
  {
    id: 'face-death',
    name: 'Face Death',
    category: 'combat',
    stats: ['heart'],
    description:
      'When you are brought to the brink of death and glimpse the world beyond, roll +heart.',
    trigger: 'Brought to the brink of death',
  },
  {
    id: 'face-desolation',
    name: 'Face Desolation',
    category: 'combat',
    stats: ['heart'],
    description:
      'When you are brought to the brink of desolation, roll +heart.',
    trigger: 'Brought to the brink of desolation',
  },
  {
    id: 'out-of-supply',
    name: 'Out of Supply',
    category: 'combat',
    stats: [],
    description:
      'When your supply is exhausted (reduced to 0), mark unprepared. ' +
      'When you suffer -supply while unprepared, you must instead Endure Harm or Endure Stress.',
    trigger: 'Supply reduced to 0',
  },
  {
    id: 'face-a-setback',
    name: 'Face a Setback',
    category: 'combat',
    stats: [],
    description:
      'When your momentum is at its minimum (-6) and you suffer additional -momentum, ' +
      'choose one: Endure Harm, Endure Stress, or Companion Endures Harm.',
    trigger: 'Momentum at minimum (-6)',
  },

  // ── Relationship ──────────────────────────────────────────────────────────
  {
    id: 'compel',
    name: 'Compel',
    category: 'relationship',
    stats: ['heart', 'iron', 'shadow'],
    description:
      'When you attempt to persuade, pacify, barter, or bribe someone, envision your approach and roll. ' +
      '+heart if you charm, reason, or negotiate. ' +
      '+iron if you threaten or use force. ' +
      '+shadow if you lie or manipulate.',
    trigger: 'Persuade, threaten, or manipulate someone',
  },
  {
    id: 'sojourn',
    name: 'Sojourn',
    category: 'relationship',
    stats: ['heart'],
    description:
      'When you spend time in a community seeking assistance, roll +heart. ' +
      'If you share a bond with them, add +1.',
    trigger: 'Seek help in a community',
  },
  {
    id: 'draw-the-circle',
    name: 'Draw the Circle',
    category: 'relationship',
    stats: ['heart', 'iron'],
    description:
      'When you challenge someone to a formal duel or accept one, roll +heart. ' +
      'If you are the challenger, add +1. ' +
      'If you choose to enact the custom of the rite of iron, roll +iron.',
    trigger: 'Issue or accept a formal duel',
  },
  {
    id: 'forge-a-bond',
    name: 'Forge a Bond',
    category: 'relationship',
    stats: ['heart'],
    description:
      'When you spend significant time with a person or community, stand together to face hardships, ' +
      'and begin to feel a shared bond, roll +heart.',
    trigger: 'Establish a lasting bond',
  },
  {
    id: 'test-your-bond',
    name: 'Test Your Bond',
    category: 'relationship',
    stats: ['heart'],
    description:
      'When your bond is tested through conflict, betrayal, or circumstance, roll +heart.',
    trigger: 'Bond is under strain',
  },
  {
    id: 'write-your-epilogue',
    name: 'Write Your Epilogue',
    category: 'relationship',
    stats: [],
    description:
      'When you retire from your life as Ironsworn, roll the challenge dice and compare to your bonds progress. ' +
      'Momentum is ignored on this roll.',
    trigger: 'Retire (legacy progress roll)',
  },

  // ── Quest ──────────────────────────────────────────────────────────────────
  {
    id: 'swear-iron-vow',
    name: 'Swear an Iron Vow',
    category: 'quest',
    stats: ['heart'],
    description:
      'When you swear upon iron to complete a quest, write your vow and give the quest a rank. ' +
      'Then, roll +heart. If you make this vow to a person or community with whom you share a bond, add +1.',
    trigger: 'Commit to a new vow',
  },
  {
    id: 'reach-milestone',
    name: 'Reach a Milestone',
    category: 'quest',
    stats: [],
    description:
      'When you make significant progress in your quest by overcoming a critical obstacle, ' +
      'completing a perilous journey, solving a complex mystery, defeating a powerful threat, ' +
      'gaining vital support, or acquiring a crucial item, you may mark progress.',
    trigger: 'Advance a vow progress track',
  },
  {
    id: 'fulfill-your-vow',
    name: 'Fulfill Your Vow',
    category: 'quest',
    stats: [],
    description:
      'When you achieve what you believe to be the fulfillment of your vow, ' +
      'roll the challenge dice and compare to your progress. Momentum is ignored on this roll.',
    trigger: 'Complete a vow (progress roll)',
  },
  {
    id: 'forsake-your-vow',
    name: 'Forsake Your Vow',
    category: 'quest',
    stats: [],
    description:
      'When you renounce your quest, betray your promise, or the goal is lost to you, ' +
      'clear the vow and Endure Stress (-1 spirit). ' +
      'If the vow was made to someone with whom you share a bond, Test Your Bond afterward.',
    trigger: 'Abandon a vow',
  },
  {
    id: 'advance',
    name: 'Advance',
    category: 'quest',
    stats: [],
    description:
      'When you focus on your skills or abilities and spend 3 experience, ' +
      'you may add a new asset or upgrade an existing asset.',
    trigger: 'Spend 3 experience to improve',
  },

  // ── Fate ───────────────────────────────────────────────────────────────────
  {
    id: 'pay-the-price',
    name: 'Pay the Price',
    category: 'fate',
    stats: [],
    description:
      'When you suffer the outcome of a move, choose one: ' +
      'Make the most obvious negative outcome happen. ' +
      'Envision two possible negative outcomes and Ask the Oracle using the yes/no table. ' +
      'Roll on the Pay the Price oracle table and apply the result.',
    trigger: 'Suffer the consequences of a miss',
  },
  {
    id: 'ask-the-oracle',
    name: 'Ask the Oracle',
    category: 'fate',
    stats: [],
    description:
      'When you seek to resolve questions, discover details in the world, determine how other characters respond, ' +
      'or trigger encounters or events, you may use an oracle.',
    trigger: 'Consult the oracle for answers',
  },
]
