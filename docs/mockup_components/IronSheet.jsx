import { useState } from "react";
import { navigate, PATHS } from "./navigate.js";

const runicFont = "'MedievalSharp', 'Cinzel Decorative', serif";
const bodyFont = "'Cinzel', 'Palatino Linotype', serif";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@400;700;900&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --void: #0a0806;
    --ash: #13100d;
    --ember: #1e1710;
    --iron: #2a241c;
    --stone: #3d3428;
    --bone: #8a7a62;
    --parchment: #c4a96e;
    --gold: #d4941a;
    --gold-bright: #f0b429;
    --blood: #8b1a1a;
    --blood-bright: #c0392b;
    --ice: #7ab3cc;
    --frost: #a8d4e8;
    --rune-glow: #d4941a;
  }

  body {
    background: var(--void);
    color: var(--parchment);
    font-family: ${bodyFont};
    min-height: 100vh;
    overflow-x: hidden;
  }

  .app {
    min-height: 100vh;
    background: 
      radial-gradient(ellipse at 20% 50%, rgba(139, 26, 26, 0.08) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(212, 148, 26, 0.06) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 80%, rgba(122, 179, 204, 0.04) 0%, transparent 50%),
      var(--void);
  }

  /* Noise texture overlay */
  .app::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
    opacity: 0.4;
  }

  .layout {
    display: grid;
    grid-template-columns: 260px 1fr;
    grid-template-rows: auto 1fr;
    min-height: 100vh;
    position: relative;
    z-index: 1;
  }

  /* ── HEADER ── */
  .header {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 32px;
    border-bottom: 1px solid rgba(212, 148, 26, 0.2);
    background: linear-gradient(180deg, rgba(30,23,16,0.95) 0%, rgba(10,8,6,0.8) 100%);
    backdrop-filter: blur(8px);
  }

  .header-logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-rune {
    width: 42px;
    height: 42px;
    filter: drop-shadow(0 0 8px rgba(212,148,26,0.6));
  }

  .logo-title {
    font-family: ${runicFont};
    font-size: 22px;
    font-weight: 900;
    color: var(--gold-bright);
    letter-spacing: 3px;
    text-shadow: 0 0 20px rgba(212,148,26,0.5);
    text-transform: uppercase;
  }

  .logo-sub {
    font-size: 10px;
    letter-spacing: 4px;
    color: var(--bone);
    text-transform: uppercase;
    margin-top: 1px;
  }

  .header-nav {
    display: flex;
    gap: 4px;
  }

  .nav-btn {
    background: transparent;
    border: 1px solid transparent;
    color: var(--bone);
    padding: 8px 16px;
    font-family: ${bodyFont};
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 2px;
  }

  .nav-btn:hover, .nav-btn.active {
    border-color: rgba(212,148,26,0.4);
    color: var(--gold);
    background: rgba(212,148,26,0.08);
    text-shadow: 0 0 12px rgba(212,148,26,0.4);
  }

  /* ── SIDEBAR ── */
  .sidebar {
    border-right: 1px solid rgba(212, 148, 26, 0.15);
    background: rgba(19,16,13,0.7);
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sidebar-section {
    margin-bottom: 16px;
  }

  .sidebar-label {
    font-size: 9px;
    letter-spacing: 4px;
    color: var(--stone);
    text-transform: uppercase;
    padding: 0 8px;
    margin-bottom: 6px;
  }

  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
    font-size: 12px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--bone);
  }

  .sidebar-item:hover {
    background: rgba(212,148,26,0.07);
    border-color: rgba(212,148,26,0.2);
    color: var(--parchment);
  }

  .sidebar-item.active {
    background: rgba(212,148,26,0.12);
    border-color: rgba(212,148,26,0.35);
    color: var(--gold);
  }

  .sidebar-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
  }

  /* ── MAIN CONTENT ── */
  .main {
    padding: 32px;
    overflow-y: auto;
  }

  .page-title {
    font-family: ${runicFont};
    font-size: 11px;
    letter-spacing: 6px;
    color: var(--bone);
    text-transform: uppercase;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .page-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(212,148,26,0.3), transparent);
  }

  /* ── CHARACTER HEADER ── */
  .char-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 24px;
    align-items: start;
    margin-bottom: 32px;
    padding: 24px;
    background: rgba(30,23,16,0.6);
    border: 1px solid rgba(212,148,26,0.2);
    border-radius: 4px;
    position: relative;
    overflow: hidden;
  }

  .char-header::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), var(--blood), var(--gold), transparent);
  }

  .char-avatar {
    width: 88px;
    height: 88px;
    border-radius: 3px;
    border: 2px solid rgba(212,148,26,0.4);
    background: var(--iron);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 42px;
    box-shadow: 0 0 20px rgba(212,148,26,0.15), inset 0 0 20px rgba(0,0,0,0.5);
    flex-shrink: 0;
  }

  .char-info { flex: 1; }

  .char-name {
    font-family: ${runicFont};
    font-size: 30px;
    font-weight: 900;
    color: var(--gold-bright);
    text-shadow: 0 0 30px rgba(212,148,26,0.4);
    letter-spacing: 2px;
    line-height: 1;
    margin-bottom: 6px;
  }

  .char-epithet {
    font-size: 12px;
    letter-spacing: 3px;
    color: var(--bone);
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .char-vow {
    font-size: 13px;
    color: var(--parchment);
    font-style: italic;
    padding: 8px 12px;
    background: rgba(139,26,26,0.15);
    border-left: 2px solid var(--blood);
    border-radius: 0 2px 2px 0;
    max-width: 400px;
  }

  .char-rank {
    text-align: right;
  }

  .rank-label {
    font-size: 9px;
    letter-spacing: 3px;
    color: var(--stone);
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .rank-badge {
    font-family: ${runicFont};
    font-size: 16px;
    color: var(--gold);
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .xp-dots {
    display: flex;
    gap: 4px;
    margin-top: 8px;
    justify-content: flex-end;
  }

  .xp-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(212,148,26,0.4);
    background: transparent;
    transition: all 0.3s;
    cursor: pointer;
  }

  .xp-dot.filled {
    background: var(--gold);
    border-color: var(--gold-bright);
    box-shadow: 0 0 6px rgba(212,148,26,0.6);
  }

  /* ── STATS GRID ── */
  .stats-section {
    margin-bottom: 28px;
  }

  .section-heading {
    font-size: 9px;
    letter-spacing: 5px;
    color: var(--bone);
    text-transform: uppercase;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-heading::before {
    content: '⟡';
    color: var(--gold);
    font-size: 12px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }

  .stat-stone {
    background: rgba(30,23,16,0.8);
    border: 1px solid rgba(212,148,26,0.2);
    border-radius: 3px;
    padding: 16px 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s;
    position: relative;
    overflow: hidden;
  }

  .stat-stone::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(212,148,26,0.08) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.25s;
  }

  .stat-stone:hover {
    border-color: rgba(212,148,26,0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(212,148,26,0.1);
  }

  .stat-stone:hover::before { opacity: 1; }

  .stat-stone.highlighted {
    border-color: rgba(212,148,26,0.6);
    background: rgba(212,148,26,0.08);
  }

  .stat-rune {
    font-size: 20px;
    margin-bottom: 6px;
    filter: drop-shadow(0 0 4px rgba(212,148,26,0.3));
  }

  .stat-name {
    font-size: 9px;
    letter-spacing: 3px;
    color: var(--bone);
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .stat-value {
    font-family: ${runicFont};
    font-size: 32px;
    font-weight: 900;
    color: var(--gold-bright);
    text-shadow: 0 0 20px rgba(212,148,26,0.5);
    line-height: 1;
  }

  /* ── CONDITION METERS ── */
  .meters-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 28px;
  }

  .meter-card {
    background: rgba(19,16,13,0.8);
    border: 1px solid rgba(212,148,26,0.15);
    border-radius: 4px;
    padding: 16px;
  }

  .meter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .meter-name {
    font-size: 10px;
    letter-spacing: 3px;
    color: var(--bone);
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .meter-value-display {
    font-family: ${runicFont};
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
  }

  .meter-track {
    display: flex;
    gap: 5px;
  }

  .meter-pip {
    flex: 1;
    height: 22px;
    border-radius: 2px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(0,0,0,0.3);
    transition: all 0.2s;
    cursor: pointer;
    position: relative;
  }

  .meter-pip.filled-health {
    background: linear-gradient(180deg, rgba(139,26,26,0.9) 0%, rgba(90,15,15,0.9) 100%);
    border-color: rgba(192,57,43,0.5);
    box-shadow: 0 0 6px rgba(139,26,26,0.4);
  }

  .meter-pip.filled-spirit {
    background: linear-gradient(180deg, rgba(122,179,204,0.8) 0%, rgba(80,130,160,0.8) 100%);
    border-color: rgba(168,212,232,0.5);
    box-shadow: 0 0 6px rgba(122,179,204,0.3);
  }

  .meter-pip.filled-supply {
    background: linear-gradient(180deg, rgba(212,148,26,0.7) 0%, rgba(160,110,15,0.7) 100%);
    border-color: rgba(240,180,41,0.4);
    box-shadow: 0 0 6px rgba(212,148,26,0.3);
  }

  .meter-pip.filled-momentum {
    background: linear-gradient(180deg, rgba(168,212,232,0.6) 0%, rgba(122,179,204,0.6) 100%);
    border-color: rgba(168,212,232,0.4);
  }

  /* Momentum special styling */
  .momentum-card {
    border-color: rgba(122,179,204,0.25);
  }

  .momentum-track {
    display: flex;
    gap: 3px;
    align-items: center;
  }

  .momentum-pip {
    flex: 1;
    height: 28px;
    border-radius: 2px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(0,0,0,0.3);
    cursor: pointer;
    transition: all 0.2s;
    font-size: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
  }

  .momentum-pip.negative {
    border-color: rgba(139,26,26,0.3);
  }

  .momentum-pip.filled-momentum {
    background: linear-gradient(180deg, rgba(122,179,204,0.7) 0%, rgba(80,130,160,0.7) 100%);
    border-color: rgba(168,212,232,0.5);
    box-shadow: 0 0 6px rgba(122,179,204,0.3);
  }

  .momentum-pip.filled-negative {
    background: linear-gradient(180deg, rgba(139,26,26,0.8) 0%, rgba(90,15,15,0.8) 100%);
    border-color: rgba(192,57,43,0.4);
  }

  /* ── VOWS ── */
  .vows-section { margin-bottom: 28px; }

  .vow-card {
    background: rgba(19,16,13,0.8);
    border: 1px solid rgba(139,26,26,0.25);
    border-radius: 4px;
    padding: 14px 16px;
    margin-bottom: 8px;
    transition: all 0.2s;
  }

  .vow-card:hover {
    border-color: rgba(139,26,26,0.5);
  }

  .vow-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
  }

  .vow-title {
    font-size: 13px;
    color: var(--parchment);
    font-style: italic;
  }

  .vow-rank {
    font-size: 9px;
    letter-spacing: 2px;
    color: var(--blood-bright);
    text-transform: uppercase;
    border: 1px solid rgba(192,57,43,0.3);
    padding: 2px 8px;
    border-radius: 2px;
  }

  .progress-track {
    display: flex;
    gap: 4px;
  }

  .progress-box {
    flex: 1;
    height: 12px;
    border: 1px solid rgba(139,26,26,0.3);
    border-radius: 1px;
    background: rgba(0,0,0,0.3);
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
    overflow: hidden;
  }

  .progress-box.filled {
    background: rgba(139,26,26,0.6);
    border-color: rgba(192,57,43,0.5);
  }

  .progress-box.full {
    background: linear-gradient(90deg, rgba(192,57,43,0.9), rgba(212,148,26,0.7));
    border-color: var(--gold);
    box-shadow: 0 0 6px rgba(212,148,26,0.3);
  }

  /* ── DICE ROLLER ── */
  .dice-section {
    background: rgba(19,16,13,0.9);
    border: 1px solid rgba(212,148,26,0.2);
    border-radius: 4px;
    padding: 20px;
    position: relative;
    overflow: hidden;
  }

  .dice-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 100%, rgba(212,148,26,0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  .dice-controls {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .stat-select {
    background: rgba(30,23,16,0.9);
    border: 1px solid rgba(212,148,26,0.3);
    color: var(--gold);
    padding: 8px 14px;
    font-family: ${bodyFont};
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    border-radius: 3px;
    cursor: pointer;
    outline: none;
  }

  .roll-btn {
    background: linear-gradient(135deg, rgba(139,26,26,0.8), rgba(192,57,43,0.6));
    border: 1px solid rgba(192,57,43,0.5);
    color: var(--parchment);
    padding: 10px 24px;
    font-family: ${runicFont};
    font-size: 12px;
    letter-spacing: 3px;
    text-transform: uppercase;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 12px rgba(139,26,26,0.3);
  }

  .roll-btn:hover {
    background: linear-gradient(135deg, rgba(192,57,43,0.9), rgba(139,26,26,0.8));
    box-shadow: 0 4px 20px rgba(192,57,43,0.4);
    transform: translateY(-1px);
  }

  .roll-btn:active { transform: translateY(0); }

  .dice-result {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }

  .die {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .die-label {
    font-size: 8px;
    letter-spacing: 2px;
    color: var(--stone);
    text-transform: uppercase;
  }

  .die-face {
    width: 52px;
    height: 52px;
    background: rgba(30,23,16,0.9);
    border: 2px solid rgba(212,148,26,0.3);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${runicFont};
    font-size: 26px;
    font-weight: 900;
    transition: all 0.3s;
  }

  .die-face.action { 
    border-color: var(--gold);
    color: var(--gold-bright);
    box-shadow: 0 0 16px rgba(212,148,26,0.3);
  }

  .die-face.challenge {
    border-color: rgba(122,179,204,0.5);
    color: var(--ice);
    box-shadow: 0 0 12px rgba(122,179,204,0.2);
  }

  .result-outcome {
    flex: 1;
    padding: 12px 16px;
    border-radius: 3px;
    min-width: 200px;
  }

  .outcome-strong {
    background: rgba(212,148,26,0.12);
    border: 1px solid rgba(212,148,26,0.4);
  }

  .outcome-weak {
    background: rgba(122,179,204,0.08);
    border: 1px solid rgba(122,179,204,0.3);
  }

  .outcome-miss {
    background: rgba(139,26,26,0.12);
    border: 1px solid rgba(139,26,26,0.4);
  }

  .outcome-label {
    font-family: ${runicFont};
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .strong .outcome-label { color: var(--gold-bright); }
  .weak .outcome-label { color: var(--ice); }
  .miss .outcome-label { color: var(--blood-bright); }

  .outcome-desc {
    font-size: 12px;
    color: var(--bone);
    font-style: italic;
  }

  .divider {
    font-family: ${runicFont};
    color: rgba(212,148,26,0.2);
    text-align: center;
    font-size: 18px;
    letter-spacing: 4px;
    margin: 0 4px;
  }

  /* Debilities */
  .debilities-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 28px;
  }

  .debility-chip {
    padding: 6px 10px;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 2px;
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--stone);
    background: rgba(0,0,0,0.2);
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .debility-chip.active {
    background: rgba(139,26,26,0.25);
    border-color: rgba(192,57,43,0.5);
    color: var(--blood-bright);
    text-shadow: 0 0 8px rgba(192,57,43,0.3);
  }

  @keyframes rollShake {
    0%, 100% { transform: translateY(0) rotate(0); }
    20% { transform: translateY(-3px) rotate(-5deg); }
    40% { transform: translateY(2px) rotate(5deg); }
    60% { transform: translateY(-2px) rotate(-3deg); }
    80% { transform: translateY(1px) rotate(2deg); }
  }

  .die-face.rolling {
    animation: rollShake 0.4s ease-out;
  }
`;

const STATS = [
  { key: "edge", label: "Edge", rune: "ᛖ", desc: "Speed & ranged" },
  { key: "heart", label: "Heart", rune: "ᚺ", desc: "Courage & bonds" },
  { key: "iron", label: "Iron", rune: "ᛁ", desc: "Strength & combat" },
  { key: "shadow", label: "Shadow", rune: "ᛊ", desc: "Deception & stealth" },
  { key: "wits", label: "Wits", rune: "ᚹ", desc: "Cunning & survival" },
];

const DEBILITIES = [
  "Wounded", "Shaken", "Unprepared",
  "Encumbered", "Maimed", "Corrupted",
  "Cursed", "Tormented", "Burdened",
];

const VOWS = [
  { title: "Avenge the slaughter of Clan Thornwood", rank: "Epic", progress: 3 },
  { title: "Find the lost runestone of Valdris", rank: "Dangerous", progress: 6 },
  { title: "Escort Sigrid to the coast", rank: "Troublesome", progress: 9 },
];

function MeterTrack({ value, max, onChange, type }) {
  return (
    <div className="meter-track">
      {Array.from({ length: max + 1 }).map((_, i) => (
        <div
          key={i}
          className={`meter-pip ${i < value ? `filled-${type}` : ""}`}
          onClick={() => onChange(i === value ? i - 1 : i)}
        />
      ))}
    </div>
  );
}

function MomentumTrack({ value, onChange }) {
  const pips = Array.from({ length: 13 }, (_, i) => i - 6); // -6 to +6
  return (
    <div className="momentum-track">
      {pips.map((v) => (
        <div
          key={v}
          className={`momentum-pip ${v < 0 ? "negative" : ""} ${
            v < 0 && value <= v
              ? "filled-negative"
              : v >= 0 && value >= v && value >= 0
              ? "filled-momentum"
              : ""
          }`}
          onClick={() => onChange(v)}
          title={v.toString()}
        />
      ))}
    </div>
  );
}

export default function IronSheet() {
  const [activeTab, setActiveTab] = useState("iron-sheet");
  const [stats, setStats] = useState({ edge: 2, heart: 3, iron: 2, shadow: 1, wits: 2 });
  const [health, setHealth] = useState(4);
  const [spirit, setSpirit] = useState(3);
  const [supply, setSupply] = useState(2);
  const [momentum, setMomentum] = useState(2);
  const [debilities, setDebilities] = useState([]);
  const [vows, setVows] = useState(VOWS);
  const [selectedStat, setSelectedStat] = useState("iron");
  const [rollResult, setRollResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [xp, setXp] = useState(3);

  const toggleDebility = (d) =>
    setDebilities((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const rollDice = () => {
    if (rolling) return;
    setRolling(true);
    setTimeout(() => {
      const statVal = stats[selectedStat];
      const action = Math.floor(Math.random() * 6) + 1 + statVal;
      const c1 = Math.floor(Math.random() * 10) + 1;
      const c2 = Math.floor(Math.random() * 10) + 1;
      let outcome;
      if (action > c1 && action > c2) outcome = "strong";
      else if (action > Math.min(c1, c2)) outcome = "weak";
      else outcome = "miss";
      setRollResult({ action: Math.min(action, 10), c1, c2, outcome, statVal });
      setRolling(false);
    }, 420);
  };

  const outcomeText = {
    strong: { label: "Strong Hit", desc: "You succeed. Mark progress or take +1 momentum." },
    weak: { label: "Weak Hit", desc: "You succeed with cost. Choose your burden." },
    miss: { label: "Miss", desc: "The fates turn against you. Pay the price." },
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="layout">
          {/* Header */}
          <header className="header">
            <div className="header-logo">
              <svg className="logo-rune" viewBox="0 0 42 42" fill="none">
                <polygon points="21,2 40,40 2,40" stroke="#d4941a" strokeWidth="1.5" fill="none" opacity="0.6"/>
                <line x1="21" y1="2" x2="21" y2="40" stroke="#d4941a" strokeWidth="1" opacity="0.8"/>
                <line x1="12" y1="18" x2="30" y2="18" stroke="#d4941a" strokeWidth="1" opacity="0.6"/>
                <circle cx="21" cy="21" r="4" fill="#d4941a" opacity="0.3"/>
                <circle cx="21" cy="21" r="2" fill="#f0b429" opacity="0.8"/>
              </svg>
              <div>
                <div className="logo-title">Saga Keeper</div>
                <div className="logo-sub">Ironsworn Companion</div>
              </div>
            </div>
            <nav className="header-nav">
              {[
                [PATHS.ironSheet,  "Iron Sheet"],
                [PATHS.theOracle,  "The Oracle"],
                [PATHS.theSkald,   "The Skald"],
                [PATHS.worldForge, "World Forge"],
              ].map(([path, label]) => (
                <button
                  key={path}
                  className={`nav-btn ${path === PATHS.ironSheet && activeTab === "iron-sheet" ? "active" : ""}`}
                  onClick={() => path === PATHS.ironSheet ? setActiveTab("iron-sheet") : navigate(path)}
                >
                  {label}
                </button>
              ))}
            </nav>
          </header>

          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-section">
              <div className="sidebar-label">Chronicle</div>
              {[
                ["⚔️", "Active Vows", "vows"],
                ["🛡️", "Assets", "assets"],
                ["🗺️", "Bonds", "bonds"],
                ["📜", "Session Log", "log"],
              ].map(([icon, label, id]) => (
                <div
                  key={id}
                  className={`sidebar-item ${activeTab === id ? "active" : ""}`}
                  onClick={() => setActiveTab(id)}
                >
                  <span className="sidebar-icon">{icon}</span>
                  {label}
                </div>
              ))}
            </div>
            <div className="sidebar-section">
              <div className="sidebar-label">Reference</div>
              {[
                ["🎲", "Moves", "moves"],
                ["🌍", "Oracles", "oracles"],
                ["⚡", "Bestiary", "bestiary"],
              ].map(([icon, label, id]) => (
                <div key={id} className="sidebar-item" onClick={() => setActiveTab(id)}>
                  <span className="sidebar-icon">{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </aside>

          {/* Main */}
          <main className="main">
            <div className="page-title">ᚦᛖ ᛁᚱᛟᚾ ᛊᚺᛖᛖᛏ — The Iron Sheet</div>

            {/* Character Header */}
            <div className="char-header">
              <div className="char-avatar">🪖</div>
              <div className="char-info">
                <div className="char-name">Björn Ashclaw</div>
                <div className="char-epithet">Warden of the Broken Coast · Rank: Dangerous</div>
                <div className="char-vow">
                  "I will see the blood-debt paid before the year-fire burns out."
                </div>
              </div>
              <div className="char-rank">
                <div className="rank-label">Experience</div>
                <div className="rank-badge">Seasoned</div>
                <div className="xp-dots">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`xp-dot ${i < xp ? "filled" : ""}`}
                      onClick={() => setXp(i < xp ? i : i + 1)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="stats-section">
              <div className="section-heading">Attributes</div>
              <div className="stats-grid">
                {STATS.map((s) => (
                  <div
                    key={s.key}
                    className={`stat-stone ${selectedStat === s.key ? "highlighted" : ""}`}
                    onClick={() => setSelectedStat(s.key)}
                    title={s.desc}
                  >
                    <div className="stat-rune">{s.rune}</div>
                    <div className="stat-name">{s.label}</div>
                    <div className="stat-value">{stats[s.key]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Condition Meters */}
            <div className="section-heading">Condition</div>
            <div className="meters-grid">
              {[
                { label: "Health", icon: "🩸", value: health, max: 5, type: "health", set: setHealth },
                { label: "Spirit", icon: "❄️", value: spirit, max: 5, type: "spirit", set: setSpirit },
                { label: "Supply", icon: "🪵", value: supply, max: 5, type: "supply", set: setSupply },
              ].map((m) => (
                <div key={m.label} className="meter-card">
                  <div className="meter-header">
                    <div className="meter-name">{m.icon} {m.label}</div>
                    <div
                      className="meter-value-display"
                      style={{ color: m.type === "health" ? "#c0392b" : m.type === "spirit" ? "#7ab3cc" : "#d4941a" }}
                    >
                      {m.value}
                    </div>
                  </div>
                  <MeterTrack value={m.value} max={m.max} type={m.type} onChange={m.set} />
                </div>
              ))}

              <div className="meter-card momentum-card">
                <div className="meter-header">
                  <div className="meter-name">🌊 Momentum</div>
                  <div className="meter-value-display" style={{ color: "#7ab3cc" }}>
                    {momentum > 0 ? `+${momentum}` : momentum}
                  </div>
                </div>
                <MomentumTrack value={momentum} onChange={setMomentum} />
              </div>
            </div>

            {/* Debilities */}
            <div className="section-heading">Debilities</div>
            <div className="debilities-grid" style={{ marginBottom: 28 }}>
              {DEBILITIES.map((d) => (
                <div
                  key={d}
                  className={`debility-chip ${debilities.includes(d) ? "active" : ""}`}
                  onClick={() => toggleDebility(d)}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Vows */}
            <div className="section-heading">Iron Vows</div>
            <div className="vows-section">
              {vows.map((vow, vi) => (
                <div key={vi} className="vow-card">
                  <div className="vow-top">
                    <div className="vow-title">"{vow.title}"</div>
                    <div className="vow-rank">{vow.rank}</div>
                  </div>
                  <div className="progress-track">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`progress-box ${i < vow.progress ? i === 9 ? "full" : "filled" : ""}`}
                        onClick={() =>
                          setVows((prev) =>
                            prev.map((v, j) =>
                              j === vi
                                ? { ...v, progress: i < v.progress ? i : i + 1 }
                                : v
                            )
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Dice Roller */}
            <div className="section-heading">Roll the Bones</div>
            <div className="dice-section">
              <div className="dice-controls">
                <select
                  className="stat-select"
                  value={selectedStat}
                  onChange={(e) => setSelectedStat(e.target.value)}
                >
                  {STATS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label} ({stats[s.key]})
                    </option>
                  ))}
                </select>
                <button className="roll-btn" onClick={rollDice}>
                  ⚔ Roll the Fate
                </button>
              </div>

              {rollResult && (
                <div className="dice-result">
                  <div className="die">
                    <div className="die-label">Action d6 +{rollResult.statVal}</div>
                    <div className={`die-face action ${rolling ? "rolling" : ""}`}>
                      {rollResult.action}
                    </div>
                  </div>
                  <div className="divider">vs</div>
                  <div className="die">
                    <div className="die-label">Challenge d10</div>
                    <div className={`die-face challenge ${rolling ? "rolling" : ""}`}>
                      {rollResult.c1}
                    </div>
                  </div>
                  <div className="die">
                    <div className="die-label">Challenge d10</div>
                    <div className={`die-face challenge ${rolling ? "rolling" : ""}`}>
                      {rollResult.c2}
                    </div>
                  </div>
                  <div className={`result-outcome outcome-${rollResult.outcome} ${rollResult.outcome}`}>
                    <div className="outcome-label">
                      {outcomeText[rollResult.outcome].label}
                    </div>
                    <div className="outcome-desc">
                      {outcomeText[rollResult.outcome].desc}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
