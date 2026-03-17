// Ironsworn asset catalogue — companions, paths, combat talents, and rituals
// Ironsworn is licensed under Creative Commons Attribution 4.0 International
import type { Asset } from '@saga-keeper/domain'

export const IRONSWORN_ASSETS: Asset[] = [
  // ── Companions ────────────────────────────────────────────────────────────
  {
    id: 'companion-cave-lion',
    name: 'Cave Lion',
    type: 'companion',
    description: 'A powerful and loyal big cat that fights alongside you.',
    abilities: [
      'When your Cave Lion takes a hit, you may suffer -1 health to protect it.',
      'When you Strike or Clash alongside your Cave Lion, add +1.',
      'Your Cave Lion is fierce: when it attacks alone, roll +iron.',
    ],
  },
  {
    id: 'companion-giant-spider',
    name: 'Giant Spider',
    type: 'companion',
    description: 'A large spider that weaves webs and strikes from the shadows.',
    abilities: [
      "When you create a trap using your spider's web, add +2 on your next Face Danger to avoid a foe.",
      'When you Strike or Clash, your spider assists: add +1.',
      'When you Gather Information in a dungeon or ruin, add +1.',
    ],
  },
  {
    id: 'companion-hawk',
    name: 'Hawk',
    type: 'companion',
    description: 'A keen-eyed raptor that scouts ahead and assists in combat.',
    abilities: [
      'When you Gather Information by sending your hawk to scout, add +2.',
      "When you Secure an Advantage using your hawk's vantage, add +1.",
      'When you Strike at range, your hawk stoops: add +1.',
    ],
  },
  {
    id: 'companion-horse',
    name: 'Horse',
    type: 'companion',
    description: 'A steadfast mount that carries you across the Ironlands.',
    abilities: [
      'When you Undertake a Journey, your horse helps you move faster: add +1.',
      'When you Enter the Fray from horseback, add +1.',
      'When you Resupply while mounted, add +1.',
    ],
  },
  {
    id: 'companion-hound',
    name: 'Hound',
    type: 'companion',
    description: 'A fierce hunting dog that tracks foes and guards your camp.',
    abilities: [
      'When you Gather Information by tracking, your hound leads the trail: add +2.',
      'When you Make Camp, your hound watches over you: on a weak hit, take the strong-hit benefit instead.',
      'When you Strike or Clash alongside your hound, add +1.',
    ],
  },
  {
    id: 'companion-kindred',
    name: 'Kindred',
    type: 'companion',
    description: 'A trusted companion — a fellow warrior or ally who fights at your side.',
    abilities: [
      "When you Aid Your Ally using Kindred's expertise, add +2 instead of rolling.",
      'When your Kindred Endures Harm, you may suffer -1 momentum to aid them: they take +1 health.',
      'When you Forge a Bond with someone, if your Kindred vouches for you, take the strong-hit benefit.',
    ],
  },
  {
    id: 'companion-raven',
    name: 'Raven',
    type: 'companion',
    description: 'A clever raven that carries messages and observes from on high.',
    abilities: [
      'When you Compel using your raven as a messenger or spy, add +1.',
      'When you Gather Information in a settlement, your raven listens: add +2.',
      'When you Face Danger against deception or surprise, your raven warns you: add +1.',
    ],
  },
  {
    id: 'companion-sprite',
    name: 'Sprite',
    type: 'companion',
    description: 'A fae spirit bound to you — mischievous, powerful, and unpredictable.',
    abilities: [
      'When you Face Danger involving the mystical or magical, your sprite aids you: add +2.',
      "When you Secure an Advantage using your sprite's illusions or tricks, add +2.",
      'When your sprite acts against your wishes, you suffer -1 momentum but may use Ask the Oracle to discover why.',
    ],
  },

  // ── Paths ─────────────────────────────────────────────────────────────────
  {
    id: 'path-archer',
    name: 'Archer',
    type: 'path',
    description: 'You are a skilled bowman, deadly at range.',
    abilities: [
      'When you Strike or Clash at range, add +1.',
      'When you Secure an Advantage to set up a shot, add +2.',
      'When you Enter the Fray by firing first from concealment, add +2.',
    ],
  },
  {
    id: 'path-berserker',
    name: 'Berserker',
    type: 'path',
    description: 'When cornered, you become a force of barely controlled fury.',
    abilities: [
      'When you Strike with reckless abandon, reroll one challenge die.',
      'When your health is 2 or less, add +2 to Strike and Clash.',
      'When you End the Fight, add +1 to your progress roll.',
    ],
  },
  {
    id: 'path-blademaster',
    name: 'Blademaster',
    type: 'path',
    description: 'You have trained for years with blade in hand.',
    abilities: [
      'When you Strike in close quarters, add +1.',
      'When you Clash, reroll one challenge die.',
      'When you Enter the Fray, you may add +iron regardless of approach.',
    ],
  },
  {
    id: 'path-duelist',
    name: 'Duelist',
    type: 'path',
    description: "You fight with precision and read your opponent's every move.",
    abilities: [
      'When you Draw the Circle, add +2.',
      'When you Strike after studying your foe, you may add +wits.',
      'When you Clash and score a strong hit, mark progress twice.',
    ],
  },
  {
    id: 'path-explorer',
    name: 'Explorer',
    type: 'path',
    description: 'The wilderness holds no secrets from you.',
    abilities: [
      'When you Undertake a Journey, add +1.',
      'When you Make Camp in the wild, take +1 additional benefit on a hit.',
      'When you Gather Information in an unknown region, add +2.',
    ],
  },
  {
    id: 'path-herbalist',
    name: 'Herbalist',
    type: 'path',
    description: "You know the healing properties of the land's plants and herbs.",
    abilities: [
      'When you Heal, add +2.',
      'When you Resupply in a forest or meadow, you may search for herbs: add +2.',
      'When you Make Camp, you may tend to wounds: any companion or ally takes +1 health.',
    ],
  },
  {
    id: 'path-infiltrator',
    name: 'Infiltrator',
    type: 'path',
    description: 'You move through shadow and slip past defenses unseen.',
    abilities: [
      'When you Face Danger using stealth or deception, add +1.',
      'When you Secure an Advantage from hiding, add +2.',
      'When you Enter the Fray from hiding or by ambush, take the strong-hit benefit on a hit.',
    ],
  },
  {
    id: 'path-ironclad',
    name: 'Ironclad',
    type: 'path',
    description: "Your armor is your shield against the world's brutality.",
    abilities: [
      'When you Clash and score a weak hit, reduce the health cost by 1 (minimum 0).',
      'When you Endure Harm, add +1 due to your armor.',
      'When you Enter the Fray facing overwhelming odds, add +1.',
    ],
  },
  {
    id: 'path-long-rider',
    name: 'Long Rider',
    type: 'path',
    description: 'You have spent years in the saddle, ranging across the Ironlands.',
    abilities: [
      'When mounted and you Undertake a Journey, add +2.',
      'When you Enter the Fray on horseback, add +2.',
      'When you Strike while mounted, add +1.',
    ],
  },
  {
    id: 'path-ritualist',
    name: 'Ritualist',
    type: 'path',
    description: 'You channel arcane power through careful ritual.',
    abilities: [
      'When you perform a ritual, add +1 to the initial roll.',
      'When you Secure an Advantage through ritual preparation, add +2.',
      'When you Face Danger involving the mystical, add +1.',
    ],
  },
  {
    id: 'path-skald',
    name: 'Skald',
    type: 'path',
    description: 'You weave tales and songs that inspire and unsettle in equal measure.',
    abilities: [
      'When you Compel through performance or storytelling, add +2.',
      'When you Aid Your Ally with inspiring words, take the strong-hit benefit on a hit.',
      'When you Sojourn and share a tale or song, add +1.',
    ],
  },
  {
    id: 'path-slayer',
    name: 'Slayer',
    type: 'path',
    description: 'You hunt the beasts and horrors that prey on the innocent.',
    abilities: [
      'When you Enter the Fray against a monster or beast, add +2.',
      "When you Gather Information to research a foe's weaknesses, add +2.",
      'When you Strike against a monster, reroll one challenge die.',
    ],
  },

  // ── Combat Talents ────────────────────────────────────────────────────────
  {
    id: 'combat-armored',
    name: 'Armored',
    type: 'combat-talent',
    description: 'Heavy armor gives you an edge against grievous wounds.',
    abilities: [
      'When you Endure Harm in a fight, add +1.',
      'When you Clash, reduce the health cost on a weak hit by 1.',
      'When you suffer a severe blow, you may mark your armor as damaged to ignore -1 health.',
    ],
  },
  {
    id: 'combat-battle-scarred',
    name: 'Battle-Scarred',
    type: 'combat-talent',
    description: 'Your scars speak of battles survived — and battles won.',
    abilities: [
      'When you are brought low (health 2 or less), add +1 to all combat moves.',
      'When you Face Death, add +2.',
      'Your wounds and scars are a mark of your iron will. When you Swear an Iron Vow to achieve vengeance, add +1.',
    ],
  },
  {
    id: 'combat-brawler',
    name: 'Brawler',
    type: 'combat-talent',
    description: 'In close quarters, your fists and elbows are weapons.',
    abilities: [
      'When you Strike unarmed or with an improvised weapon, add +2.',
      'When you Clash in a grapple or brawl, add +1.',
      'When you Secure an Advantage through brute force, add +1.',
    ],
  },
  {
    id: 'combat-cutthroat',
    name: 'Cutthroat',
    type: 'combat-talent',
    description: 'You fight to win, not to look heroic.',
    abilities: [
      'When you Strike from hiding or after a feint, add +2.',
      'When you Enter the Fray by ambush, add +2 and mark progress on the first exchange.',
      'When you Compel an enemy to back down with a blade at their throat, add +2.',
    ],
  },
  {
    id: 'combat-shield-bearer',
    name: 'Shield-Bearer',
    type: 'combat-talent',
    description: 'Your shield is a wall between you and the world.',
    abilities: [
      'When you Clash against a physical attack, add +1.',
      'When you suffer harm while using your shield, reduce the loss by 1.',
      'When you Aid Your Ally by covering them with your shield, add +2.',
    ],
  },

  // ── Rituals ───────────────────────────────────────────────────────────────
  {
    id: 'ritual-bind',
    name: 'Bind',
    type: 'ritual',
    description: 'You speak the old words and bind a spirit or creature to your will.',
    abilities: [
      'When you perform this ritual, roll +wits. On a strong hit, bind a spirit or minor creature to your will for a scene.',
      'On a weak hit, you bind it, but it is resentful — it will seek to twist your commands.',
      'When you use a bound spirit to Gather Information, add +2.',
    ],
  },
  {
    id: 'ritual-communion',
    name: 'Communion',
    type: 'ritual',
    description: 'You commune with the spirits of the dead to learn their secrets.',
    abilities: [
      'When you perform this ritual near the dead, roll +wits. On a strong hit, ask a spirit one question and receive a truthful answer.',
      'On a weak hit, you receive fragmented visions — Ask the Oracle to interpret them.',
      'When you use this ritual to Gather Information about the past, add +2.',
    ],
  },
  {
    id: 'ritual-cursed-flame',
    name: 'Cursed Flame',
    type: 'ritual',
    description: 'You call down mystical fire that burns spirit and body alike.',
    abilities: [
      'When you invoke this flame in combat, roll +wits. On a strong hit, Strike as if you had initiative and mark progress twice.',
      'On a weak hit, the fire strikes true but at a cost — Endure Harm (-1 health).',
      'When you use this flame to destroy something of the Darkness, add +2.',
    ],
  },
  {
    id: 'ritual-shadow-walk',
    name: 'Shadow-Walk',
    type: 'ritual',
    description: 'You step between shadows, crossing distances in a heartbeat.',
    abilities: [
      'When you invoke this power to move unseen, roll +shadow. On a strong hit, reach your destination undetected.',
      'On a weak hit, you arrive, but something notices the passage between worlds.',
      'When you Face Danger using this ritual to escape, add +2.',
    ],
  },
  {
    id: 'ritual-sorcery',
    name: 'Sorcery',
    type: 'ritual',
    description: 'You wield raw arcane force, shaped by years of dangerous practice.',
    abilities: [
      'When you invoke raw power, roll +wits. On a strong hit, achieve a powerful magical effect of your choosing.',
      'On a weak hit, the power flows, but the cost is steep — suffer -1 spirit and the GM introduces a complication.',
      'When you Secure an Advantage through magic, add +2.',
    ],
  },
]
