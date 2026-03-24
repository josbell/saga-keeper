import { useState } from "react";
import { navigate, PATHS } from "./navigate.js";

const runicFont = "'Cinzel Decorative', serif";
const bodyFont = "'Cinzel', Georgia, serif";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  .ww{background:#0d0b08;border-radius:12px;overflow:hidden;font-family:${bodyFont};color:#c4a96e;min-height:920px;display:grid;grid-template-rows:47px 1fr;}
  .wb{display:grid;grid-template-columns:200px 1fr 270px;height:100%;}
  /* topbar */
  .wtb{background:#13100d;border-bottom:1px solid #2a241c;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;}
  .wlog{display:flex;align-items:center;gap:10px;}
  .wlt{font-family:${runicFont};font-size:15px;color:#f0b429;letter-spacing:2px;}
  .wls{font-size:9px;color:#5f5447;letter-spacing:3px;text-transform:uppercase;}
  .wnav{display:flex;gap:2px;}
  .wnb{background:transparent;border:1px solid transparent;color:#7a6a52;padding:5px 12px;font-family:${bodyFont};font-size:9px;letter-spacing:2px;text-transform:uppercase;border-radius:3px;cursor:pointer;}
  .wnb.active{border-color:#3d3428;color:#d4941a;background:rgba(212,148,26,0.07);}
  /* sidebar */
  .wsd{background:#0f0d0a;border-right:1px solid #1e1710;padding:16px 10px;}
  .wsl{font-size:8px;letter-spacing:4px;color:#3d3428;text-transform:uppercase;padding:0 8px;margin:12px 0 5px;}
  .wsi{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:3px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#7a6a52;border:1px solid transparent;margin-bottom:2px;cursor:default;}
  .wsi.active{color:#d4941a;border-color:rgba(212,148,26,0.25);background:rgba(212,148,26,0.08);}
  .wsic{font-size:13px;width:18px;text-align:center;}
  /* main */
  .wm{display:flex;flex-direction:column;height:100%;overflow:hidden;}
  .wm-header{padding:12px 20px;border-bottom:1px solid #1e1710;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
  .wm-tabs{display:flex;gap:2px;}
  .wm-tab{padding:6px 14px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#5f5447;border:1px solid transparent;border-radius:3px;cursor:default;}
  .wm-tab.active{color:#d4941a;border-color:rgba(212,148,26,0.3);background:rgba(212,148,26,0.07);}
  .wm-actions{display:flex;gap:6px;}
  .wm-act{background:#1e1710;border:1px solid #2a241c;border-radius:3px;padding:5px 10px;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#7a6a52;cursor:default;}
  .wm-act.lit{border-color:rgba(212,148,26,0.3);color:#d4941a;background:rgba(212,148,26,0.06);}
  /* map area */
  .wmap{flex:1;position:relative;background:#0a0806;overflow:hidden;}
  /* SVG map */
  .wmap svg{width:100%;height:100%;}
  /* node list below map */
  .wlist{flex-shrink:0;border-top:1px solid #1e1710;padding:12px 20px;}
  .wlist-title{font-size:8px;letter-spacing:4px;color:#3d3428;text-transform:uppercase;margin-bottom:10px;}
  .wlist-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
  .wnode-card{background:#13100d;border:1px solid #1e1710;border-radius:3px;padding:8px 10px;cursor:default;}
  .wnode-card.active{border-color:rgba(212,148,26,0.4);background:rgba(212,148,26,0.06);}
  .wnode-card.npc-card{border-color:rgba(212,148,26,0.15);}
  .wnode-card.loc-card{border-color:rgba(122,179,204,0.15);}
  .wnode-card.threat-card{border-color:rgba(139,26,26,0.2);}
  .wnc-type{font-size:7px;letter-spacing:2px;text-transform:uppercase;margin-bottom:3px;}
  .wnc-type.npc{color:#d4941a;}
  .wnc-type.loc{color:#7ab3cc;}
  .wnc-type.threat{color:#c0392b;}
  .wnc-type.faction{color:#8a6cc4;}
  .wnc-name{font-size:10px;color:#c4a96e;margin-bottom:2px;line-height:1.3;}
  .wnc-sub{font-size:8px;color:#5f5447;font-style:italic;}
  /* right panel */
  .wrp{background:#0a0806;border-left:1px solid #1e1710;padding:14px;display:flex;flex-direction:column;gap:12px;overflow:hidden;}
  .wrp-title{font-size:8px;letter-spacing:4px;color:#3d3428;text-transform:uppercase;padding-bottom:8px;border-bottom:1px solid #1e1710;}
  /* detail card */
  .det-card{background:#13100d;border:1px solid rgba(212,148,26,0.2);border-radius:4px;overflow:hidden;position:relative;}
  .det-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#d4941a 40%,transparent);}
  .det-header{padding:12px 12px 8px;}
  .det-type{font-size:7px;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;color:#d4941a;}
  .det-name{font-family:${runicFont};font-size:15px;color:#f0b429;line-height:1.2;margin-bottom:4px;}
  .det-sub{font-size:9px;color:#7a6a52;font-style:italic;}
  .det-body{padding:0 12px 12px;}
  .det-divider{height:1px;background:linear-gradient(90deg,rgba(212,148,26,0.2),transparent);margin:8px 0;}
  .det-desc{font-size:10px;color:#c4a96e;line-height:1.7;font-style:italic;margin-bottom:10px;}
  .det-row{display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.03);}
  .det-label{font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#3d3428;}
  .det-val{font-size:9px;color:#7a6a52;}
  .det-val.warn{color:#c0392b;}
  .det-val.good{color:#d4941a;}
  .det-tags{display:flex;gap:4px;flex-wrap:wrap;margin-top:8px;}
  .dtag{font-size:7px;letter-spacing:1.5px;text-transform:uppercase;padding:2px 6px;border-radius:2px;}
  .dtag.npc{background:rgba(212,148,26,0.1);border:1px solid rgba(212,148,26,0.2);color:#d4941a;}
  .dtag.loc{background:rgba(122,179,204,0.08);border:1px solid rgba(122,179,204,0.2);color:#7ab3cc;}
  .dtag.threat{background:rgba(139,26,26,0.1);border:1px solid rgba(139,26,26,0.2);color:#c0392b;}
  .det-actions{padding:10px 12px;border-top:1px solid #1e1710;display:flex;gap:6px;}
  .det-btn{flex:1;background:#1e1710;border:1px solid #2a241c;border-radius:3px;padding:5px 8px;font-family:${bodyFont};font-size:8px;letter-spacing:1.5px;text-transform:uppercase;color:#7a6a52;text-align:center;cursor:default;}
  .det-btn.pri{border-color:rgba(212,148,26,0.3);color:#d4941a;background:rgba(212,148,26,0.05);}
  /* connections */
  .conn-list{display:flex;flex-direction:column;gap:5px;}
  .conn-item{display:flex;align-items:center;gap:8px;padding:7px 10px;background:#13100d;border:1px solid #1e1710;border-radius:3px;}
  .conn-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
  .conn-dot.npc{background:#d4941a;}
  .conn-dot.loc{background:#7ab3cc;}
  .conn-dot.threat{background:#c0392b;}
  .conn-dot.faction{background:#8a6cc4;}
  .conn-name{font-size:10px;color:#7a6a52;flex:1;}
  .conn-rel{font-size:8px;color:#3d3428;font-style:italic;}
`;

const SIDEBAR_ENTITIES = [
  { id: "all",       icon: "🗺", label: "All Entries",  count: null },
  { id: "npcs",      icon: "👤", label: "NPCs",         count: 7 },
  { id: "locations", icon: "🏔", label: "Locations",    count: 5 },
  { id: "threats",   icon: "⚔", label: "Threats",      count: 3 },
  { id: "factions",  icon: "🏛", label: "Factions",     count: 2 },
  { id: "beasts",    icon: "🐺", label: "Beasts",       count: 4 },
];

const SIDEBAR_VIEWS = [
  { id: "nodemap",  icon: "🕸", label: "Node Map" },
  { id: "listview", icon: "📋", label: "List View" },
  { id: "relations",icon: "🔗", label: "Relations" },
];

const SIDEBAR_TOOLS = [
  { id: "aigenerate", icon: "✦", label: "AI Generate" },
  { id: "addentry",   icon: "+", label: "Add Entry" },
];

const MAP_TABS = ["Node Map", "List View", "Relations"];

const NODE_CARDS = [
  { id: "halvard",  cardClass: "npc-card",    typeClass: "npc",    typeLabel: "NPC",      name: "Halvard the Elder", sub: "Keldmere · Suspicious" },
  { id: "ashwood",  cardClass: "loc-card",    typeClass: "loc",    typeLabel: "Location", name: "Ashwood Barrow",    sub: "3 days east · Dangerous" },
  { id: "kaer",     cardClass: "threat-card", typeClass: "threat", typeLabel: "Threat",   name: "Warlord Kaer",      sub: "Unknown location · Active" },
  { id: "runa",     cardClass: "npc-card",    typeClass: "npc",    typeLabel: "NPC",      name: "Runa",              sub: "Halvard's daughter · Fled north" },
];

export default function WorldForge() {
  const [activeSidebarItem, setActiveSidebarItem] = useState("all");
  const [activeMapTab, setActiveMapTab]           = useState("Node Map");
  const [activeNodeCard, setActiveNodeCard]       = useState("halvard");

  return (
    <>
      <style>{styles}</style>
      <div className="ww">
        {/* Topbar */}
        <div className="wtb">
          <div className="wlog">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <polygon points="16,2 30,30 2,30" stroke="#d4941a" strokeWidth="1.2" fill="none" opacity="0.6"/>
              <line x1="16" y1="2" x2="16" y2="30" stroke="#d4941a" strokeWidth="0.8"/>
              <line x1="9" y1="15" x2="23" y2="15" stroke="#d4941a" strokeWidth="0.8" opacity="0.7"/>
              <circle cx="16" cy="16" r="2.5" fill="#f0b429" opacity="0.7"/>
            </svg>
            <div>
              <div className="wlt">Saga Keeper</div>
              <div className="wls">Ironsworn Companion</div>
            </div>
          </div>
          <div className="wnav">
            <div className="wnb" onClick={() => navigate(PATHS.ironSheet)}>Iron Sheet</div>
            <div className="wnb" onClick={() => navigate(PATHS.theOracle)}>The Oracle</div>
            <div className="wnb" onClick={() => navigate(PATHS.theSkald)}>The Skald</div>
            <div className="wnb active">World Forge</div>
          </div>
        </div>

        <div className="wb">
          {/* Sidebar */}
          <div className="wsd">
            <div className="wsl">Entities</div>
            {SIDEBAR_ENTITIES.map(e => (
              <div
                key={e.id}
                className={`wsi${activeSidebarItem === e.id ? " active" : ""}`}
                onClick={() => setActiveSidebarItem(e.id)}
              >
                <span className="wsic">{e.icon}</span>
                {e.label}
                {e.count !== null && (
                  <span style={{marginLeft:"auto", fontSize:"8px", color:"#3d3428"}}>{e.count}</span>
                )}
              </div>
            ))}

            <div className="wsl">Views</div>
            {SIDEBAR_VIEWS.map(v => (
              <div
                key={v.id}
                className={`wsi${activeSidebarItem === v.id ? " active" : ""}`}
                onClick={() => setActiveSidebarItem(v.id)}
              >
                <span className="wsic">{v.icon}</span>
                {v.label}
              </div>
            ))}

            <div className="wsl">Tools</div>
            {SIDEBAR_TOOLS.map(t => (
              <div
                key={t.id}
                className={`wsi${activeSidebarItem === t.id ? " active" : ""}`}
                onClick={() => setActiveSidebarItem(t.id)}
              >
                <span className="wsic">{t.icon}</span>
                {t.label}
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="wm">
            <div className="wm-header">
              <div className="wm-tabs">
                {MAP_TABS.map(tab => (
                  <div
                    key={tab}
                    className={`wm-tab${activeMapTab === tab ? " active" : ""}`}
                    onClick={() => setActiveMapTab(tab)}
                  >
                    {tab}
                  </div>
                ))}
              </div>
              <div className="wm-actions">
                <div className="wm-act lit">✦ AI Generate NPC</div>
                <div className="wm-act lit">+ Add Entry</div>
                <div className="wm-act">Filter</div>
              </div>
            </div>

            {/* Map SVG */}
            <div className="wmap">
              <svg viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg">
                {/* Background subtle grid */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(212,148,26,0.04)" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="680" height="420" fill="url(#grid)"/>

                {/* Connection lines */}
                {/* Halvard → Keldmere */}
                <line x1="220" y1="180" x2="310" y2="240" stroke="rgba(212,148,26,0.2)" strokeWidth="1" strokeDasharray="4,3"/>
                {/* Halvard → Runestone */}
                <line x1="220" y1="180" x2="440" y2="150" stroke="rgba(212,148,26,0.15)" strokeWidth="1" strokeDasharray="4,3"/>
                {/* Halvard → Runa */}
                <line x1="220" y1="180" x2="150" y2="90" stroke="rgba(212,148,26,0.18)" strokeWidth="1" strokeDasharray="4,3"/>
                {/* Keldmere → Ashwood Barrow */}
                <line x1="310" y1="240" x2="440" y2="150" stroke="rgba(122,179,204,0.15)" strokeWidth="1" strokeDasharray="4,3"/>
                {/* Kaer → Thornwood */}
                <line x1="520" y1="280" x2="390" y2="330" stroke="rgba(139,26,26,0.2)" strokeWidth="1" strokeDasharray="4,3"/>
                {/* Kaer → Runestone */}
                <line x1="520" y1="280" x2="440" y2="150" stroke="rgba(139,26,26,0.15)" strokeWidth="1" strokeDasharray="4,3"/>
                {/* Runa → Greywolf Ridge */}
                <line x1="150" y1="90" x2="100" y2="200" stroke="rgba(122,179,204,0.15)" strokeWidth="1" strokeDasharray="4,3"/>
                {/* Björn → Halvard */}
                <line x1="310" y1="150" x2="220" y2="180" stroke="rgba(212,148,26,0.3)" strokeWidth="1.5"/>
                {/* Björn → Keldmere */}
                <line x1="310" y1="150" x2="310" y2="240" stroke="rgba(122,179,204,0.2)" strokeWidth="1"/>

                {/* LOCATIONS (blue tones) */}
                {/* Keldmere Village */}
                <g>
                  <circle cx="310" cy="240" r="22" fill="rgba(122,179,204,0.08)" stroke="rgba(122,179,204,0.35)" strokeWidth="1.2"/>
                  <text x="310" y="236" textAnchor="middle" fontFamily="Cinzel" fontSize="16" fill="#7ab3cc">🏚</text>
                  <text x="310" y="271" textAnchor="middle" fontFamily="Cinzel" fontSize="8" fill="#5a8fa0" letterSpacing="1">Keldmere</text>
                </g>
                {/* Ashwood Barrow — highlighted/selected */}
                <g>
                  <circle cx="440" cy="150" r="26" fill="rgba(212,148,26,0.12)" stroke="#d4941a" strokeWidth="1.5"/>
                  <circle cx="440" cy="150" r="30" fill="none" stroke="rgba(212,148,26,0.15)" strokeWidth="1" strokeDasharray="3,3"/>
                  <text x="440" y="146" textAnchor="middle" fontFamily="Cinzel" fontSize="18" fill="#d4941a">⚰</text>
                  <text x="440" y="183" textAnchor="middle" fontFamily="Cinzel" fontSize="8" fill="#d4941a" letterSpacing="1">Ashwood Barrow</text>
                </g>
                {/* Greywolf Ridge */}
                <g>
                  <circle cx="100" cy="200" r="20" fill="rgba(122,179,204,0.06)" stroke="rgba(122,179,204,0.25)" strokeWidth="1"/>
                  <text x="100" y="196" textAnchor="middle" fontFamily="Cinzel" fontSize="15" fill="#5a8fa0">🏔</text>
                  <text x="100" y="228" textAnchor="middle" fontFamily="Cinzel" fontSize="8" fill="#3a6070" letterSpacing="1">Greywolf Ridge</text>
                </g>
                {/* Thornwood Ruins */}
                <g>
                  <circle cx="390" cy="330" r="19" fill="rgba(139,26,26,0.08)" stroke="rgba(139,26,26,0.3)" strokeWidth="1"/>
                  <text x="390" y="326" textAnchor="middle" fontFamily="Cinzel" fontSize="14" fill="#8b1a1a">🔥</text>
                  <text x="390" y="357" textAnchor="middle" fontFamily="Cinzel" fontSize="8" fill="#6a1010" letterSpacing="1">Thornwood Ruins</text>
                </g>

                {/* NPCs (gold) */}
                {/* Halvard */}
                <g>
                  <rect x="190" y="157" width="60" height="46" rx="4" fill="rgba(212,148,26,0.1)" stroke="rgba(212,148,26,0.4)" strokeWidth="1.2"/>
                  <text x="220" y="176" textAnchor="middle" fontFamily="Cinzel" fontSize="14" fill="#d4941a">👴</text>
                  <text x="220" y="195" textAnchor="middle" fontFamily="Cinzel" fontSize="8" fill="#d4941a" letterSpacing="1">Halvard</text>
                </g>
                {/* Runa */}
                <g>
                  <rect x="120" y="68" width="60" height="44" rx="4" fill="rgba(212,148,26,0.07)" stroke="rgba(212,148,26,0.25)" strokeWidth="1"/>
                  <text x="150" y="86" textAnchor="middle" fontFamily="Cinzel" fontSize="14" fill="#c4a96e">👩</text>
                  <text x="150" y="104" textAnchor="middle" fontFamily="Cinzel" fontSize="8" fill="#c4a96e" letterSpacing="1">Runa</text>
                </g>
                {/* Björn (player) */}
                <g>
                  <rect x="280" y="127" width="60" height="46" rx="4" fill="rgba(212,148,26,0.15)" stroke="#d4941a" strokeWidth="1.8"/>
                  <text x="310" y="147" textAnchor="middle" fontFamily="Cinzel" fontSize="16" fill="#f0b429">🪖</text>
                  <text x="310" y="165" textAnchor="middle" fontFamily="Cinzel" fontSize="8" fill="#f0b429" letterSpacing="1">Björn</text>
                </g>

                {/* THREATS (red) */}
                {/* Warlord Kaer */}
                <g>
                  <rect x="490" y="257" width="60" height="46" rx="4" fill="rgba(139,26,26,0.12)" stroke="rgba(192,57,43,0.45)" strokeWidth="1.2"/>
                  <text x="520" y="276" textAnchor="middle" fontFamily="Cinzel" fontSize="14" fill="#c0392b">💀</text>
                  <text x="520" y="295" textAnchor="middle" fontFamily="Cinzel" fontSize="8" fill="#c0392b" letterSpacing="1">Warlord Kaer</text>
                </g>

                {/* OBJECTS (neutral) */}
                {/* Runestone */}
                <g>
                  <rect x="590" y="68" width="72" height="46" rx="4" fill="rgba(122,179,204,0.06)" stroke="rgba(122,179,204,0.2)" strokeWidth="1"/>
                  <text x="626" y="88" textAnchor="middle" fontFamily="Cinzel" fontSize="14" fill="#7ab3cc">🪨</text>
                  <text x="626" y="106" textAnchor="middle" fontFamily="Cinzel" fontSize="8" fill="#5a8fa0" letterSpacing="1">Runestone</text>
                </g>
                <line x1="590" y1="91" x2="470" y2="150" stroke="rgba(122,179,204,0.12)" strokeWidth="1" strokeDasharray="4,3"/>

                {/* Legend */}
                <g transform="translate(16,16)">
                  <rect width="120" height="78" rx="3" fill="rgba(10,8,6,0.8)" stroke="rgba(212,148,26,0.15)" strokeWidth="0.5"/>
                  <text x="8" y="16" fontFamily="Cinzel" fontSize="7" fill="#3d3428" letterSpacing="2">LEGEND</text>
                  <circle cx="16" cy="30" r="5" fill="none" stroke="rgba(122,179,204,0.4)" strokeWidth="1"/>
                  <text x="26" y="34" fontFamily="Cinzel" fontSize="8" fill="#5a8fa0">Location</text>
                  <rect x="11" y="42" width="10" height="10" rx="2" fill="none" stroke="rgba(212,148,26,0.4)" strokeWidth="1"/>
                  <text x="26" y="51" fontFamily="Cinzel" fontSize="8" fill="#c4a96e">NPC / Player</text>
                  <rect x="11" y="58" width="10" height="10" rx="2" fill="none" stroke="rgba(192,57,43,0.4)" strokeWidth="1"/>
                  <text x="26" y="67" fontFamily="Cinzel" fontSize="8" fill="#c0392b">Threat</text>
                </g>
              </svg>
            </div>

            {/* Node list strip */}
            <div className="wlist">
              <div className="wlist-title">ᚨᛚᛚ ᛖᚾᛏᚱᛁᛖᛊ — All Entries</div>
              <div className="wlist-grid">
                {NODE_CARDS.map(card => (
                  <div
                    key={card.id}
                    className={`wnode-card ${card.cardClass}${activeNodeCard === card.id ? " active" : ""}`}
                    onClick={() => setActiveNodeCard(card.id)}
                  >
                    <div className={`wnc-type ${card.typeClass}`}>{card.typeLabel}</div>
                    <div className="wnc-name">{card.name}</div>
                    <div className="wnc-sub">{card.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel — selected entry detail */}
          <div className="wrp">
            <div className="wrp-title">Selected Entry</div>

            <div className="det-card">
              <div className="det-header">
                <div className="det-type">NPC · Elder</div>
                <div className="det-name">Halvard the Elder</div>
                <div className="det-sub">"He does not rise when you enter."</div>
              </div>
              <div className="det-body">
                <div className="det-divider"></div>
                <div className="det-desc">A bent, sharp-eyed elder of Keldmere. He ordered the runestone buried after the Thornwood massacre. He fears Björn carries Kaer's bloodline and will not speak freely without proof of intent.</div>
                <div className="det-row">
                  <div className="det-label">Disposition</div>
                  <div className="det-val warn">Wary</div>
                </div>
                <div className="det-row">
                  <div className="det-label">Location</div>
                  <div className="det-val">Keldmere · Elder's Hall</div>
                </div>
                <div className="det-row">
                  <div className="det-label">Role</div>
                  <div className="det-val">Information · Gatekeeper</div>
                </div>
                <div className="det-row">
                  <div className="det-label">Bond</div>
                  <div className="det-val good">Established</div>
                </div>
                <div className="det-tags">
                  <span className="dtag npc">Runa (daughter)</span>
                  <span className="dtag loc">Keldmere</span>
                  <span className="dtag loc">Ashwood Barrow</span>
                  <span className="dtag threat">Warlord Kaer</span>
                </div>
              </div>
              <div className="det-actions">
                <div className="det-btn pri">✦ AI Expand</div>
                <div className="det-btn">⚔ Add Vow</div>
                <div className="det-btn">✎ Edit</div>
              </div>
            </div>

            <div className="wrp-title">Connections</div>
            <div className="conn-list">
              <div className="conn-item">
                <div className="conn-dot npc"></div>
                <div className="conn-name">Runa</div>
                <div className="conn-rel">Daughter · Fled north</div>
              </div>
              <div className="conn-item">
                <div className="conn-dot loc"></div>
                <div className="conn-name">Ashwood Barrow</div>
                <div className="conn-rel">Buried the runestone here</div>
              </div>
              <div className="conn-item">
                <div className="conn-dot threat"></div>
                <div className="conn-name">Warlord Kaer</div>
                <div className="conn-rel">Fears his reach</div>
              </div>
              <div className="conn-item">
                <div className="conn-dot loc"></div>
                <div className="conn-name">Keldmere Village</div>
                <div className="conn-rel">Elder · Permanent resident</div>
              </div>
              <div className="conn-item">
                <div className="conn-dot faction" style={{background:"#8a6cc4"}}></div>
                <div className="conn-name">Thornwood Clan</div>
                <div className="conn-rel">Survivor · Witnessed massacre</div>
              </div>
            </div>

            <div style={{background:"rgba(122,179,204,0.05)", border:"1px solid rgba(122,179,204,0.15)", borderRadius:"3px", padding:"10px"}}>
              <div style={{fontSize:"7px", letterSpacing:"3px", color:"#5f5447", textTransform:"uppercase", marginBottom:"5px"}}>AI Suggestion</div>
              <div style={{fontSize:"9px", color:"#7a6a52", lineHeight:"1.6", fontStyle:"italic"}}>Halvard may hold a second secret — consider having the Skald reveal his connection to the Thornwood massacre more deeply if you compel him again on a Strong Hit.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
