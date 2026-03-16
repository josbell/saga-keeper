// Ironsworn oracle tables — standard tables from the Ironsworn SRD
// Ironsworn is licensed under Creative Commons Attribution 4.0 International
import type { OracleTable } from '@saga-keeper/domain'

const RULESET_ID = 'ironsworn-v1'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a 1-per-row d100 table from an ordered array of 100 result strings */
function d100<T extends string>(
  id: string,
  name: string,
  category: string,
  rows: readonly T[],
): OracleTable {
  return {
    id,
    rulesetId: RULESET_ID,
    name,
    category,
    entries: rows.map((result, i) => ({ min: i + 1, max: i + 1, result })),
  }
}

/** Build a ranged table from [min, max, result][] tuples */
function ranged(
  id: string,
  name: string,
  category: string,
  entries: Array<[number, number, string]>,
): OracleTable {
  return {
    id,
    rulesetId: RULESET_ID,
    name,
    category,
    entries: entries.map(([min, max, result]) => ({ min, max, result })),
  }
}

// ── Core tables ───────────────────────────────────────────────────────────────

const ACTION_ROWS = [
  'Abandon', 'Acquire', 'Advance', 'Affect', 'Aid',
  'Arrive', 'Assault', 'Attract', 'Avenge', 'Avoid',
  'Await', 'Begin', 'Betray', 'Bolster', 'Breach',
  'Break', 'Capture', 'Challenge', 'Change', 'Charge',
  'Clash', 'Command', 'Communicate', 'Construct', 'Consume',
  'Create', 'Debate', 'Defeat', 'Defend', 'Deliver',
  'Demand', 'Depart', 'Destroy', 'Distract', 'Eliminate',
  'Endure', 'Escape', 'Examine', 'Fail', 'Find',
  'Flee', 'Follow', 'Fortify', 'Gather', 'Guard',
  'Hide', 'Hold', 'Hunt', 'Impede', 'Initiate',
  'Inspect', 'Invade', 'Investigate', 'Journey', 'Lead',
  'Learn', 'Locate', 'Lose', 'Manipulate', 'Master',
  'Negate', 'Negotiate', 'Observe', 'Obtain', 'Offer',
  'Oppose', 'Overwhelm', 'Persevere', 'Preserve', 'Protect',
  'Pursue', 'Quest', 'Raid', 'Reduce', 'Refuse',
  'Reject', 'Release', 'Remove', 'Rescue', 'Resist',
  'Restore', 'Return', 'Reveal', 'Risk', 'Secure',
  'Seize', 'Serve', 'Share', 'Silence', 'Steal',
  'Strike', 'Summon', 'Support', 'Suppress', 'Surrender',
  'Threaten', 'Transform', 'Uncover', 'Uphold', 'Weaken',
] as const

const THEME_ROWS = [
  'Ability', 'Advantage', 'Alliance', 'Ambush', 'Antagonist',
  'Arrival', 'Artifact', 'Assailed', 'Asset', 'Balance',
  'Barrier', 'Battle', 'Betrayed', 'Bond', 'Champion',
  'Chaos', 'Choice', 'Combat', 'Community', 'Conflict',
  'Connection', 'Corruption', 'Creation', 'Creature', 'Crisis',
  'Danger', 'Darkness', 'Death', 'Decay', 'Defense',
  'Destiny', 'Desolation', 'Discovery', 'Disease', 'Disruption',
  'Doom', 'Doubt', 'Dream', 'Duality', 'Enemy',
  'Escape', 'Failure', 'Faith', 'Fame', 'Family',
  'Fate', 'Fear', 'Ferocity', 'Freedom', 'Future',
  'Greed', 'Grief', 'Growth', 'Guidance', 'Hatred',
  'History', 'Honor', 'Hope', 'Horror', 'Identity',
  'Information', 'Isolation', 'Journey', 'Law', 'Legacy',
  'Legend', 'Loss', 'Love', 'Loyalty', 'Malice',
  'Misery', 'Mystery', 'Nature', 'Opportunity', 'Peace',
  'People', 'Peril', 'Power', 'Protection', 'Purge',
  'Quest', 'Rebirth', 'Reckoning', 'Refuge', 'Renewal',
  'Resource', 'Revenge', 'Ritual', 'Ruin', 'Safety',
  'Sanctuary', 'Secret', 'Strife', 'Survival', 'Threat',
  'Trial', 'Truth', 'Vengeance', 'Vow', 'War',
] as const

// ── NPC tables ────────────────────────────────────────────────────────────────

const NPC_ROLE_TABLE = ranged('npc-role', 'NPC Role', 'npc', [
  [1, 2, 'Criminal'], [3, 4, 'Healer'], [5, 6, 'Farmer'],
  [7, 8, 'Herder'], [9, 10, 'Hunter'], [11, 12, 'Mystic'],
  [13, 15, 'Outcast'], [16, 17, 'Priest'], [18, 19, 'Sailor'],
  [20, 21, 'Scholar'], [22, 23, 'Soldier'], [24, 25, 'Trader'],
  [26, 28, 'Warrior'], [29, 30, 'Artisan'], [31, 32, 'Bard'],
  [33, 35, 'Guard'], [36, 38, 'Laborer'], [39, 40, 'Noble'],
  [41, 42, 'Scoundrel'], [43, 44, 'Servant'], [45, 47, 'Skald'],
  [48, 49, 'Spy'], [50, 52, 'Vagabond'], [53, 55, 'Forager'],
  [56, 58, 'Heretic'], [59, 61, 'Shaman'], [62, 64, 'Elder'],
  [65, 68, 'Wanderer'], [69, 72, 'Fisher'], [73, 75, 'Miner'],
  [76, 78, 'Blacksmith'], [79, 81, 'Sailor'], [82, 84, 'Herbalist'],
  [85, 87, 'Exile'], [88, 90, 'Ferryman'], [91, 93, 'Keeper'],
  [94, 96, 'Warden'], [97, 98, 'Seer'], [99, 100, 'Warlord'],
])

const NPC_GOAL_TABLE = ranged('npc-goal', 'NPC Goal', 'npc', [
  [1, 3, 'Gain riches'], [4, 6, 'Gain knowledge'], [7, 9, 'Gain renown'],
  [10, 12, 'Forge an alliance'], [13, 15, 'Claim a resource'],
  [16, 18, 'Seize power'], [19, 21, 'Protect themselves'],
  [22, 24, 'Protect their people'], [25, 27, 'Protect an artifact or place'],
  [28, 30, 'Complete a task'], [31, 33, 'Fulfill a duty'],
  [34, 36, 'Seek redemption'], [37, 39, 'Seek revenge'],
  [40, 42, 'Seek answers'], [43, 45, 'Seek a person'],
  [46, 48, 'Find a home'], [49, 51, 'Prove themselves'],
  [52, 54, 'Escape their fate'], [55, 57, 'Protect their faith'],
  [58, 60, 'Fulfill a prophecy'], [61, 63, 'Find peace'],
  [64, 66, 'Survive'], [67, 69, 'Maintain order'],
  [70, 72, 'Create something'], [73, 75, 'Destabilize a region'],
  [76, 78, 'Claim a title'], [79, 81, 'Return home'],
  [82, 84, 'Raise an army'], [85, 87, 'Spread faith'],
  [88, 90, 'Sabotage'], [91, 93, 'Guard a secret'],
  [94, 96, 'Resolve a conflict'], [97, 99, 'Exploit a resource'],
  [100, 100, 'Gain allies'],
])

const NPC_DESCRIPTOR_TABLE = ranged('npc-descriptor', 'NPC Descriptor', 'npc', [
  [1, 3, 'Stoic'], [4, 6, 'Timid'], [7, 9, 'Brave'],
  [10, 12, 'Trustworthy'], [13, 15, 'Ambitious'], [16, 18, 'Ruthless'],
  [19, 21, 'Cunning'], [22, 24, 'Gracious'], [25, 27, 'Haunted'],
  [28, 30, 'Passionate'], [31, 33, 'Proud'], [34, 36, 'Cautious'],
  [37, 39, 'Gruff'], [40, 42, 'Cheerful'], [43, 45, 'Vicious'],
  [46, 48, 'Loyal'], [49, 51, 'Naive'], [52, 54, 'Suspicious'],
  [55, 57, 'Optimistic'], [58, 60, 'Blunt'], [61, 63, 'Forthright'],
  [64, 66, 'Deceptive'], [67, 69, 'Cruel'], [70, 72, 'Kind'],
  [73, 75, 'Insightful'], [76, 78, 'Reserved'], [79, 81, 'Powerful'],
  [82, 84, 'Weak'], [85, 87, 'Fierce'], [88, 90, 'Cowardly'],
  [91, 93, 'Generous'], [94, 96, 'Lazy'], [97, 99, 'Wise'],
  [100, 100, 'Mysterious'],
])

// ── Location tables ───────────────────────────────────────────────────────────

const REGION_TABLE = ranged('region', 'Region', 'location', [
  [1, 12, 'Barrier Islands'],
  [13, 24, 'Ragged Coast'],
  [25, 34, 'Deep Wilds'],
  [35, 46, 'Flooded Lands'],
  [47, 56, 'Havens'],
  [57, 70, 'Hinterlands'],
  [71, 80, 'Shattered Wastes'],
  [81, 90, 'Tempest Hills'],
  [91, 99, 'Veiled Mountains'],
  [100, 100, 'Isle of Hallow'],
])

const LOCATION_TABLE = ranged('location', 'Location', 'location', [
  [1, 4, 'Seaside Cave'], [5, 8, 'Ruined Keep'],
  [9, 12, 'Sandy Beach'], [13, 16, 'Wooded Plateau'],
  [17, 20, 'Dense Forest'], [21, 24, 'Flooded Lowlands'],
  [25, 28, 'Hidden Valley'], [29, 32, 'Frozen Wasteland'],
  [33, 36, 'Stony Bluffs'], [37, 40, 'Ancient Ruins'],
  [41, 44, 'River Ford'], [45, 48, 'Sunken Marsh'],
  [49, 52, 'Coastal Cliff'], [53, 56, 'Mountain Pass'],
  [57, 60, 'Tangled Thicket'], [61, 64, 'Forgotten Road'],
  [65, 68, 'Abandoned Settlement'], [69, 72, 'Open Plains'],
  [73, 76, 'Rugged Hills'], [77, 80, 'Sea Cave'],
  [81, 84, 'Crumbling Tower'], [85, 88, 'Haunted Hollow'],
  [89, 92, 'Rocky Shoals'], [93, 96, 'Festering Swamp'],
  [97, 100, 'Volcanic Caldera'],
])

const LOCATION_DESCRIPTOR_TABLE = ranged('location-descriptor', 'Location Descriptor', 'location', [
  [1, 5, 'Ancient'], [6, 10, 'Blighted'], [11, 14, 'Breathtaking'],
  [15, 18, 'Broken'], [19, 22, 'Buried'], [23, 26, 'Cursed'],
  [27, 30, 'Dead'], [31, 34, 'Defended'], [35, 38, 'Flooded'],
  [39, 42, 'Forgotten'], [43, 46, 'Forsaken'], [47, 50, 'Grim'],
  [51, 54, 'Hidden'], [55, 58, 'Haunted'], [59, 62, 'Isolated'],
  [63, 66, 'Mighty'], [67, 70, 'Mysterious'], [71, 74, 'Perilous'],
  [75, 78, 'Ruined'], [79, 82, 'Sacred'], [83, 86, 'Sealed'],
  [87, 90, 'Shrouded'], [91, 94, 'Stolen'], [95, 98, 'Threatened'],
  [99, 100, 'Verdant'],
])

// ── Settlement tables ─────────────────────────────────────────────────────────

const SETTLEMENT_TROUBLE_TABLE = ranged('settlement-trouble', 'Settlement Trouble', 'settlement', [
  [1, 10, 'Sickness or plague'], [11, 20, 'Danger lurks nearby'],
  [21, 30, 'Divided leadership'], [31, 40, 'Outsiders are unwelcome'],
  [41, 50, 'Dwindling resources'], [51, 60, 'Attacked or harassed'],
  [61, 70, 'A betrayal from within'], [71, 80, 'Cursed or haunted'],
  [81, 90, 'Monstrous threat'], [91, 100, 'A dark secret'],
])

// ── Combat tables ─────────────────────────────────────────────────────────────

const COMBAT_ACTION_TABLE = ranged('combat-action', 'Combat Action', 'combat', [
  [1, 3, 'Shoot or throw'], [4, 6, 'Strike a weak point'],
  [7, 9, 'Disarm or take their weapon'], [10, 12, 'Maneuver for position'],
  [13, 16, 'Charge'], [17, 20, 'Advance'],
  [21, 24, 'Flank'], [25, 28, 'Grapple'],
  [29, 32, 'Shove or trip'], [33, 36, 'Feint'],
  [37, 40, 'Blind with light or dirt'], [41, 44, 'Create a distraction'],
  [45, 48, 'Push your advantage'], [49, 52, 'Call for their surrender'],
  [53, 56, 'Make a show of force'], [57, 60, 'Withdraw'],
  [61, 64, 'Regroup'], [65, 68, 'Heal'],
  [69, 72, 'Bolster allies'], [73, 76, 'Gain the higher ground'],
  [77, 80, 'Focus on a single target'], [81, 84, 'Fight dirty'],
  [85, 88, 'Block or parry'], [89, 92, 'Take cover'],
  [93, 96, 'Await an opening'], [97, 100, 'All-out attack'],
])

// ── Pay the Price ─────────────────────────────────────────────────────────────

const PAY_THE_PRICE_TABLE = ranged('pay-the-price', 'Pay the Price', 'fate', [
  [1, 2, 'Roll again and apply that result but make it worse'],
  [3, 5, 'A person or community you trusted loses faith in you, or acts against you'],
  [6, 9, 'A person or community you care about is exposed to danger'],
  [10, 16, 'You are separated from something or someone'],
  [17, 23, 'Your action has an unintended effect'],
  [24, 32, 'Something of value is lost or destroyed'],
  [33, 41, 'The environment or terrain becomes more dangerous or hindering'],
  [42, 50, 'A new danger or foe is revealed'],
  [51, 59, 'It costs you greatly, but you can continue'],
  [60, 68, 'Things get worse'],
  [69, 76, 'You struggle and there is a new complication'],
  [77, 85, 'You are hurt'],
  [86, 90, 'You are in serious trouble'],
  [91, 94, 'A devastating blow'],
  [95, 98, 'Everything falls apart'],
  [99, 100, 'Roll twice and apply both results'],
])

// ── Creature tables ───────────────────────────────────────────────────────────

const CREATURE_BEHAVIOR_TABLE = ranged('creature-behavior', 'Creature Behavior', 'creature', [
  [1, 5, 'Ambush'],
  [6, 15, 'Muster or gather'],
  [16, 25, 'Advance toward you'],
  [26, 35, 'Attack'],
  [36, 45, 'Howl or screech'],
  [46, 55, 'Charge'],
  [56, 65, 'Slink away or retreat'],
  [66, 75, 'Prowl or stalk'],
  [76, 85, 'Roar or intimidate'],
  [86, 90, 'Entrench or defend'],
  [91, 95, 'Feed'],
  [96, 100, 'Rest'],
])

// ── Assembled export ──────────────────────────────────────────────────────────

export const ORACLE_TABLES: OracleTable[] = [
  d100('action', 'Action', 'core', ACTION_ROWS),
  d100('theme', 'Theme', 'core', THEME_ROWS),
  REGION_TABLE,
  LOCATION_TABLE,
  LOCATION_DESCRIPTOR_TABLE,
  SETTLEMENT_TROUBLE_TABLE,
  NPC_ROLE_TABLE,
  NPC_GOAL_TABLE,
  NPC_DESCRIPTOR_TABLE,
  COMBAT_ACTION_TABLE,
  PAY_THE_PRICE_TABLE,
  CREATURE_BEHAVIOR_TABLE,
]
