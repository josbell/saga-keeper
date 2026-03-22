# Saga Keeper

### Ironsworn Companion App — UI Design Notes & Mockup Commentary

_March 2026 · Version 1.0_

---

## Overview

Saga Keeper is a companion app for Ironsworn, the Norse-mythic solo/duo tabletop RPG. The app supports single and co-op play across five core screens, unified by a dark Viking aesthetic — aged iron, firelight amber, blood red, and Nordic frost. All screens share a persistent top navigation bar and a consistent design language of rune-stamped stat tiles, carved-stone textures, and Cinzel/Cinzel Decorative typography.

The app is designed to eliminate the need to tab away mid-session. Oracle consultations, move resolution, and stat tracking all happen inline or in contextual panels — the story never stops.

---

## Screen Map

```
Great Hall  (home / campaign management)
│
├── The Forge  (character creation — launched from Great Hall)
│
└── In-session navigation
    ├── Iron Sheet   (character tracker)
    ├── The Oracle   (oracle tables & fate consultation)
    ├── The Skald    (AI dungeon master / narrative chat)
    └── World Forge  (atlas / entity relationship map)
```

---

## The Great Hall

**Purpose:** The home / campaign management screen. Sits above all other screens and handles the multi-character, multi-campaign layer of the app.

### Layout

- Header bar with logo and logged-in user avatar/name
- A hero band with tagline and a large decorative background rune
- A stats bar showing lifetime totals: Campaigns, Characters, Vows Sworn, Vows Fulfilled, Sessions Played
- A 2-column campaign grid (spans left two thirds of the body)
- A right column with recent activity feed and a Skald's Reminder card

### Campaign Cards

- Each card shows: campaign status badge (Active / Co-op / Saga Complete / Abandoned), last played date, campaign name and tagline, character portrait(s) with live HP/Spirit/Momentum mini-bars, the leading iron vow with a 10-pip progress track
- Duo campaigns show both characters side by side inside the card
- Completed campaigns are visually dimmed — name and tagline muted — with only a "View Chronicle" action
- A dashed-border "Forge New Campaign" card acts as the entry point to character creation

### Key Interactions

- **Continue Saga** — drops the player directly back into their last session on the Skald screen
- **Enter the Forge** — launches the 6-step character creation flow
- **Recent activity feed** — shows the last actions across all campaigns with color-coded dots (gold = oracle/vow, blue = location/NPC, red = harm/threat)
- **Skald's Reminder** — AI-generated contextual nudge based on current party state across campaigns

---

## The Forge

**Purpose:** A 6-step character creation ritual. Launched from the Great Hall when starting a new campaign. Leads into the Iron Sheet as its output.

### Step Structure

| Step | Name              | Description                                                          |
| ---- | ----------------- | -------------------------------------------------------------------- |
| 1    | Name Your World   | Choose setting (The Ironlands, custom)                               |
| 2    | Name & Background | Character name, background archetype (Warrior, Mystic, Ranger, etc.) |
| 3    | Assign Stats      | Distribute values 3/2/2/1/1 across Edge, Heart, Iron, Shadow, Wits   |
| 4    | Choose Assets     | Pick 3 starting asset cards                                          |
| 5    | Swear Your Vow    | Compose the first iron vow dramatically                              |
| 6    | Enter the World   | Confirmation and handoff to Iron Sheet                               |

### Layout

- **Left sidebar:** progress stepper showing all 6 steps (done / current / locked states), live character preview card that fills in as steps are completed
- **Main area:** step-specific content with clear heading, subtitle, and contextual UI
- **Footer:** Back / step indicator / Next navigation

### Key Design Details

- Stat assignment screen shows available values as chips (3, 2, 2, 1, 1) that dim when placed, and five rune-stamped stat stones waiting to receive them
- The Skald's Counsel box gives AI-powered advice based on the chosen background (e.g. "You chose Warrior — consider placing Iron highest")
- Step states: completed steps show a gold checkmark and the chosen value as subtitle; locked steps are visually dimmed
- The Forge is only accessible from the Great Hall — it is not a persistent nav item, keeping the in-session navigation clean

---

## The Iron Sheet

**Purpose:** The primary character tracker. The screen players spend the most time on during active play. All character state is visible and editable at a glance.

### Layout

- **Character header:** avatar, name (Cinzel Decorative, gold), epithet/rank, active leading vow in a blood-red left-bordered quote block, XP dot track
- **Attributes:** 5 rune-stamped stat stones (Edge, Heart, Iron, Shadow, Wits) in a horizontal grid. Clicking a stone selects it for dice rolling. The rune character appears above the numeric value.
- **Condition meters:** Health (blood red), Spirit (frost blue), Supply (amber) as pip tracks; Momentum as a wide bipolar track spanning -6 to +6
- **Debilities:** 9 chip grid (Wounded, Shaken, Unprepared, etc.) toggled active/inactive
- **Iron Vows:** each vow shows title, rank badge, and a 10-box progress track. Boxes fill red; the final box glows gold when complete.
- **Dice roller:** stat selector dropdown + Roll the Fate button. Result shows action die (d6+stat, gold), two challenge dice (d10, frost blue), and an outcome card (Strong Hit / Weak Hit / Miss)

### Key Design Details

- Stat stones highlight with a gold border when selected — visually connecting the stat to the dice roller at the bottom
- The character header has a two-color top border gradient (gold → blood red → gold) as a signature decorative element repeated across all screens
- Pip tracks are clickable to directly set values — clicking pip N sets the meter to N
- Debility chips show a red glow and background when active, dim stone-grey when inactive

---

## The Oracle

**Purpose:** Standalone oracle consultation screen for deep-dive table browsing, yes/no fate questions, action+theme generation, NPC names, and plot twists. Also maintains the full revelation history across sessions.

### Layout

- **Left sidebar:** oracle table categories (Ask Oracle, Action+Theme, Place Names, NPC Names, Threats, Locations, Combat Events, Plot Twists, Backstory, Disposition, Goals)
- **Main area:** oracle type selector tiles, prompt input with quick-odds pills, scroll result card, and a live oracle table preview
- **Right panel:** revelation history log for the current and previous sessions, plus a contextual Fate Tip

### Oracle Type Tiles

Four rune-stamped tiles, each with a rune character and short label:

| Rune | Type           |
| ---- | -------------- |
| ᚨ    | Ask Oracle     |
| ᚲ    | Generate Event |
| ᚾ    | Name & Place   |
| ᛞ    | Twist Fate     |

### Quick Odds Pills

Six pills — Small Chance, Unlikely, 50/50, Likely, Almost Certain, Certain. One pill is selected at a time; the selected pill drives the probability for the next consultation.

### Scroll Result Card

The most dramatic element: a dark card with the two-color top gradient, showing:

- Oracle type + roll details in the header
- A Cinzel Decorative title
- AI-generated narrative body
- Auto-extracted entity tags (NPC / Location / Threat)
- Action buttons: Add to Log, Create Vow, Reroll, Reject

Auto-extraction of named entities from the oracle narrative into colored chips is a key AI feature — new NPCs and locations are automatically offered for addition to the World Forge.

### Key Design Details

- The Oracle tab is for deep browsing — during active Skald sessions, oracle consultations happen inline without navigating here (see Skald integration notes below)
- Revelation history shows both auto-consults (triggered by Skald) and manual consults, color-coded by type

---

## The Skald

**Purpose:** The AI dungeon master screen. A fireside chat interface where the Skald narrates the world, resolves moves, and drives the story forward. The primary screen for active play.

### Layout

- **Left sidebar:** compact character stat bars (HP/Spirit/Momentum), session history list
- **Main area:** chat feed (shared narrative), input bar with quick-move pills and oracle button
- **Right panel:** active scene summary with entity tags, move reference card for the last-used move, active vow progress trackers, Skald's Warning

### Chat Feed Message Types

| Type                 | Description                                                                          |
| -------------------- | ------------------------------------------------------------------------------------ |
| Skald narration      | Dark card with gold top-rule, italic prose, feather quill avatar                     |
| Player action        | Amber-tinted (Björn) or frost-tinted (Sigrid) bubble, right-aligned                  |
| Move card            | Inline strip: move name, stat, roll, die faces, hit outcome badge (Strong/Weak/Miss) |
| Auto-oracle strip    | Subtle amber bar showing what the Skald auto-consulted, odds, roll, outcome          |
| Inline oracle card   | Frost-blue card with full AI narration, entity tags, Accept/Reroll/Discard actions   |
| Narrative suggestion | Blood-red left-bordered strip where the Skald recommends the player's next move      |
| Partner typing       | Animated frost-blue dots when remote partner is composing                            |
| Turn wait block      | Pauses scene advancement until both co-op players confirm their action               |

### Oracle Integration (No Tab Switching Required)

- **Auto-oracle:** the Skald consults oracle tables automatically during narration; results appear as inline strips. The player sees it happened but takes no action.
- **Manual oracle popover:** a floating panel triggered by the "Oracle" button in the input bar. Tabs for Ask Fates, Action+Theme, Names, Tables. Shows session oracle history at the bottom. Closing returns immediately to the story.
- **Inline oracle cards:** when the player asks a question mid-scene, the result drops into the chat feed with full narration and auto-extracted entity tags.
- The Oracle tab still exists for deep browsing and history review, but is never required during active play.

### Input Bar

- **Quick-move pills:** the most contextually relevant moves appear as pills (e.g. Strike, Clash in combat; Undertake Journey when traveling). Combat moves are highlighted in red.
- **Oracle quick button:** right-aligned frost-blue pill that opens the oracle popover
- Input field border color changes to match the active character in Same PC co-op mode

---

## Co-op & Duo Play

**Purpose:** Ironsworn supports solo and duo play. The app handles both same-PC and remote co-op scenarios without requiring separate apps or external tools.

### Mode Toggle

A banner beneath the top navigation bar shows the current mode and a toggle to switch:

- **Remote mode** shows the campaign share link and live presence indicators
- **Same PC mode** shows the character switcher in the input bar and hides presence indicators

### Same PC Mode

- Character switcher in the input bar shows both characters as cards. The active character is highlighted (gold for player 1, frost blue for player 2). Tapping switches control.
- The input field border color changes to match the active character — a constant visual reminder of whose voice you are speaking in
- No accounts or network required — the two characters share a device

### Remote Mode

- Each player joins via a campaign share link on their own device
- The Skald feed is shared and syncs in real time — both players see the same story
- Each player controls only their own character; move cards and player bubbles are attributed by name and color
- Presence indicators in the top banner show online / away status per character
- **Partner typing indicator:** frost-blue animated dot row appears when the remote partner is composing
- **Turn wait block:** optional setting that pauses the Skald from advancing until both players confirm. An "Act Now" override allows one player to push ahead.
- A **Sync button** in the header reconnects the session after a dropped connection

### Shared vs. Private

| Shared          | Private                                              |
| --------------- | ---------------------------------------------------- |
| Skald chat feed | Each player's private notes                          |
| World Forge     | Character secrets / hidden motivations               |
| Oracle history  | Information one character has that the other doesn't |
| Vow progress    |                                                      |

The right panel in duo mode shows a side-by-side **Party Stats** table (both characters' Health, Spirit, Supply, Momentum, and key stats) plus the shared vow with individual contribution tracking.

### The Great Hall in Duo Mode

- Campaign cards show both characters side by side with individual stat bars
- Either player can hit Continue Saga from their own device to resume the campaign
- The campaign status badge shows "Active · Co-op" for remote campaigns

---

## The World Forge

**Purpose:** The campaign atlas and entity tracker. Records every NPC, location, threat, faction, and creature encountered in the saga, and visualises their relationships as a node graph.

### Layout

- **Left sidebar:** entity categories with counts, view mode switcher (Node Map / List / Relations), tools (AI Generate, Add Entry)
- **Main area:** interactive node map occupying most of the screen, with a card strip of all entries below it
- **Right panel:** selected entry detail card, connections list, AI Suggestion

### Node Map

- Entities are represented as nodes: circles for locations, rectangles for NPCs and threats
- Node shape encodes type; color encodes category: gold for NPCs, frost blue for locations, red for threats, purple for factions
- Connecting lines are dashed; line color loosely reflects the relationship type
- The player character sits at the center with a thicker gold border as the focal node
- The selected node is highlighted with a glow ring
- A legend in the corner explains node shapes
- Below the map, a card strip shows all entities in compact cards; clicking any card selects it and updates the right panel

### Entry Detail Panel

- Entity type badge, name (Cinzel Decorative), subtitle/quote, description
- Key attributes: Disposition, Location, Role, Bond status
- Entity tags linking to related nodes
- Action buttons: AI Expand, Add Vow, Edit
- Connections list: every linked entity shown with a colored dot, name, and relationship description
- AI Suggestion: a contextual tip about how this entity could be developed further in the story

### AI Integration

- **AI Generate NPC** creates a fully detailed NPC — name, background, disposition, goals — seeded from the current campaign context
- **AI Expand** deepens an existing entry with additional backstory, secrets, or connections
- Entity tags auto-extracted from oracle and Skald results are offered for addition to the World Forge without manual entry

---

## Design System

> **Implementation home:** `packages/ui` — a pnpm workspace package consumed by all shells. Currently exports design tokens as TypeScript objects. Base components (`Button`, `Input`, `Textarea`, `Card`, `Badge`, `DiceRoller`, `StatTrack`) and CSS custom property exports are planned (tracked in issue #31). Components will be theme-agnostic — light/dark mode driven by CSS variable overrides at the shell level.

### Color Palette

| Token      | Hex                   | Usage                                       |
| ---------- | --------------------- | ------------------------------------------- |
| Void black | `#0d0b08`             | Primary background                          |
| Ash        | `#13100d`             | Surface background (cards, header)          |
| Ember      | `#1e1710`             | Input fields, inset elements                |
| Iron       | `#2a241c`             | Borders                                     |
| Stone      | `#3d3428`             | Inactive borders, labels                    |
| Bone       | `#7a6a52`             | Secondary text, inactive items              |
| Parchment  | `#c4a96e`             | Primary body text                           |
| Gold       | `#d4941a` / `#f0b429` | Active states, headings, highlights         |
| Blood      | `#8b1a1a` / `#c0392b` | Vows, threats, debilities, miss outcomes    |
| Ice        | `#7ab3cc` / `#a8d4e8` | Spirit meter, oracle, remote/co-op elements |

### Typography

| Font              | Usage                                                                               |
| ----------------- | ----------------------------------------------------------------------------------- |
| Cinzel Decorative | Character names, screen titles, die faces, logo — the most dramatic moments         |
| Cinzel            | Navigation, labels, input text, body — readable at small sizes with runic character |

All-caps + letter-spacing is used for labels (8–9px font, 2–5px letter-spacing) to evoke engraved stone.

### Rune Characters

| Rune | Meaning          | Usage                    |
| ---- | ---------------- | ------------------------ |
| ᛖ    | Edge             | Speed & ranged stat      |
| ᚺ    | Heart            | Courage & bonds stat     |
| ᛁ    | Iron             | Strength & combat stat   |
| ᛊ    | Shadow           | Deception & stealth stat |
| ᚹ    | Wits             | Cunning & survival stat  |
| ᛟ    | Oracle type tile | Ask Oracle               |
| ᚦ    | Section marker   | The Iron Sheet title bar |

### Signature Elements

- **Two-color top border gradient** on hero cards: `transparent → gold → blood red → gold → transparent`
- **⟡ glyph** used as section heading prefix throughout all screens
- **Gold text-shadow** on active stat values and key headings
- **Dashed borders** on empty/placeholder elements (e.g. the New Campaign card)
- **Progress tracks:** rectangular pips that fill with color; the final pip of a completed vow gets a gold gradient

### Layout Principles

- All in-session screens use a **three-column layout:** sidebar (200px) / main content (flexible) / right panel (260–280px)
- The **top navigation bar** persists across all in-session screens
- **Right panels are contextual** — they update based on what is happening in the main area without requiring navigation
- **No modal dialogs** except the oracle popover — everything surfaces inline or in the persistent right panel
- The **Great Hall and The Forge** break the three-column layout — they use full-width designs appropriate to their purpose as home and onboarding screens

---

_Saga Keeper design notes — generated from UI mockup session, March 2026_
