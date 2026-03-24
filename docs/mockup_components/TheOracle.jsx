import { useState } from "react";
import { navigate, PATHS } from "./navigate.js";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  .ow{background:#0d0b08;border-radius:12px;overflow:hidden;font-family:'Cinzel',Georgia,serif;color:#c4a96e;min-height:900px;display:grid;grid-template-rows:47px 1fr;}
  .ob{display:grid;grid-template-columns:200px 1fr 280px;height:100%;}
  /* topbar */
  .otb{background:#13100d;border-bottom:1px solid #2a241c;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;}
  .olog{display:flex;align-items:center;gap:10px;}
  .olt{font-family:'Cinzel Decorative',serif;font-size:15px;color:#f0b429;letter-spacing:2px;}
  .ols{font-size:9px;color:#5f5447;letter-spacing:3px;text-transform:uppercase;}
  .onav{display:flex;gap:2px;}
  .onb{background:transparent;border:1px solid transparent;color:#7a6a52;padding:5px 12px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;border-radius:3px;cursor:pointer;}
  .onb.active{border-color:#3d3428;color:#d4941a;background:rgba(212,148,26,0.07);}
  /* sidebar */
  .osd{background:#0f0d0a;border-right:1px solid #1e1710;padding:16px 10px;}
  .osl{font-size:8px;letter-spacing:4px;color:#3d3428;text-transform:uppercase;padding:0 8px;margin:12px 0 5px;}
  .osi{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:3px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#7a6a52;border:1px solid transparent;margin-bottom:2px;cursor:pointer;}
  .osi.active{color:#d4941a;border-color:rgba(212,148,26,0.25);background:rgba(212,148,26,0.08);}
  .osic{font-size:13px;width:18px;text-align:center;}
  /* main */
  .om{padding:20px 24px;overflow:hidden;display:flex;flex-direction:column;gap:16px;}
  .opt{font-size:8px;letter-spacing:5px;color:#5f5447;text-transform:uppercase;border-bottom:1px solid #1e1710;padding-bottom:10px;}
  .osh{font-size:8px;letter-spacing:4px;color:#7a6a52;text-transform:uppercase;display:flex;align-items:center;gap:8px;}
  .osh::before{content:'⟡';color:#d4941a;font-size:10px;}
  /* oracle type selector */
  .otypes{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
  .otype{background:#13100d;border:1px solid #2a241c;border-radius:3px;padding:10px 8px;text-align:center;cursor:pointer;}
  .otype.active{border-color:rgba(212,148,26,0.45);background:rgba(212,148,26,0.07);}
  .otrune{font-size:18px;margin-bottom:4px;color:#5f5447;}
  .otype.active .otrune{color:#d4941a;}
  .otname{font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#5f5447;}
  .otype.active .otname{color:#c4a96e;}
  /* prompt area */
  .oprompt-wrap{background:#0f0d0a;border:1px solid #2a241c;border-radius:4px;padding:14px;}
  .oprompt-label{font-size:8px;letter-spacing:3px;color:#5f5447;text-transform:uppercase;margin-bottom:8px;}
  .oprompt-input{display:flex;gap:8px;align-items:center;}
  .oprompt-box{flex:1;background:#1e1710;border:1px solid #3d3428;border-radius:3px;padding:8px 12px;font-family:'Cinzel',serif;font-size:11px;color:#c4a96e;letter-spacing:1px;font-style:italic;}
  .oask-btn{background:linear-gradient(135deg,rgba(139,26,26,0.75),rgba(192,57,43,0.55));border:1px solid rgba(192,57,43,0.45);color:#c4a96e;padding:8px 16px;font-family:'Cinzel Decorative',serif;font-size:9px;letter-spacing:2px;border-radius:3px;white-space:nowrap;cursor:pointer;}
  /* quick oracle pills */
  .opills{display:flex;gap:6px;flex-wrap:wrap;}
  .opill{background:#1e1710;border:1px solid #2a241c;border-radius:20px;padding:4px 12px;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#7a6a52;cursor:pointer;}
  .opill.sel{border-color:rgba(212,148,26,0.35);color:#d4941a;background:rgba(212,148,26,0.07);}
  /* scroll reveal — the oracle result */
  .oscroll-outer{position:relative;}
  .oscroll{background:#13100d;border:1px solid rgba(212,148,26,0.22);border-radius:4px;padding:20px;position:relative;overflow:hidden;}
  .oscroll::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#d4941a 25%,#c0392b 55%,#d4941a 80%,transparent);}
  .oscroll::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(212,148,26,0.3),transparent);}
  .oscroll-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;}
  .oscroll-type{font-size:8px;letter-spacing:4px;color:#5f5447;text-transform:uppercase;}
  .oscroll-badge{font-size:8px;letter-spacing:2px;color:#8b1a1a;border:1px solid rgba(139,26,26,0.35);padding:2px 8px;border-radius:2px;text-transform:uppercase;}
  .oscroll-title{font-family:'Cinzel Decorative',serif;font-size:17px;color:#f0b429;letter-spacing:1px;margin-bottom:10px;line-height:1.3;}
  .oscroll-body{font-size:12px;color:#c4a96e;line-height:1.8;font-style:italic;border-left:2px solid rgba(212,148,26,0.2);padding-left:12px;margin-bottom:14px;}
  .oscroll-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;}
  .otag{font-size:8px;letter-spacing:2px;text-transform:uppercase;padding:3px 8px;border-radius:2px;}
  .otag.threat{background:rgba(139,26,26,0.18);border:1px solid rgba(192,57,43,0.3);color:#c0392b;}
  .otag.npc{background:rgba(212,148,26,0.1);border:1px solid rgba(212,148,26,0.25);color:#d4941a;}
  .otag.location{background:rgba(122,179,204,0.1);border:1px solid rgba(122,179,204,0.25);color:#7ab3cc;}
  .oscroll-actions{display:flex;gap:8px;}
  .osca{background:#1e1710;border:1px solid #2a241c;border-radius:3px;padding:6px 12px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#7a6a52;cursor:pointer;}
  .osca.primary{border-color:rgba(212,148,26,0.3);color:#d4941a;background:rgba(212,148,26,0.06);}
  .osca.danger{border-color:rgba(139,26,26,0.3);color:#c0392b;background:rgba(139,26,26,0.06);}
  /* right panel — history */
  .ohist{background:#0a0806;border-left:1px solid #1e1710;padding:16px;display:flex;flex-direction:column;gap:0;}
  .ohist-title{font-size:8px;letter-spacing:4px;color:#3d3428;text-transform:uppercase;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #1e1710;}
  .ohist-entry{padding:12px 0;border-bottom:1px solid #1e1710;}
  .ohe-type{font-size:7px;letter-spacing:3px;color:#3d3428;text-transform:uppercase;margin-bottom:4px;}
  .ohe-title{font-size:11px;color:#7a6a52;margin-bottom:4px;line-height:1.4;}
  .ohe-title.recent{color:#c4a96e;}
  .ohe-time{font-size:8px;color:#2a241c;letter-spacing:1px;}
  .ohe-dot{width:6px;height:6px;border-radius:50%;background:#d4941a;display:inline-block;margin-right:6px;box-shadow:0 0 5px rgba(212,148,26,0.6);}
  /* table oracles */
  .otable-wrap{background:#0f0d0a;border:1px solid #1e1710;border-radius:4px;overflow:hidden;}
  .otable-head{display:grid;grid-template-columns:40px 1fr;background:#13100d;border-bottom:1px solid #1e1710;padding:6px 12px;}
  .oth{font-size:7px;letter-spacing:3px;text-transform:uppercase;color:#3d3428;}
  .otable-row{display:grid;grid-template-columns:40px 1fr;padding:6px 12px;border-bottom:1px solid rgba(255,255,255,0.03);}
  .otable-row.active-row{background:rgba(212,148,26,0.07);border-left:2px solid #d4941a;}
  .otr-num{font-size:10px;color:#3d3428;font-family:'Cinzel Decorative',serif;}
  .otr-val{font-size:10px;color:#7a6a52;}
  .otable-row.active-row .otr-num{color:#d4941a;}
  .otable-row.active-row .otr-val{color:#c4a96e;}
`;

const ORACLE_TYPES = [
  { rune: "ᚨ", name: "Ask Oracle", id: "ask" },
  { rune: "ᚲ", name: "Generate Event", id: "event" },
  { rune: "ᚾ", name: "Name & Place", id: "name" },
  { rune: "ᛞ", name: "Twist Fate", id: "twist" },
];

const ODDS_PILLS = ["Yes / No", "Likely Yes", "50 / 50", "Unlikely", "Almost Certain", "Small Chance"];

export default function TheOracle() {
  const [activeOracleType, setActiveOracleType] = useState("ask");
  const [selectedOdds, setSelectedOdds] = useState("Likely Yes");
  const [activeSidebarItem, setActiveSidebarItem] = useState("ask");

  return (
    <>
      <style>{styles}</style>
      <div className="ow">
        {/* Topbar */}
        <div className="otb">
          <div className="olog">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <polygon points="16,2 30,30 2,30" stroke="#d4941a" strokeWidth="1.2" fill="none" opacity="0.6"/>
              <line x1="16" y1="2" x2="16" y2="30" stroke="#d4941a" strokeWidth="0.8"/>
              <line x1="9" y1="15" x2="23" y2="15" stroke="#d4941a" strokeWidth="0.8" opacity="0.7"/>
              <circle cx="16" cy="16" r="2.5" fill="#f0b429" opacity="0.7"/>
            </svg>
            <div>
              <div className="olt">Saga Keeper</div>
              <div className="ols">Ironsworn Companion</div>
            </div>
          </div>
          <div className="onav">
            <div className="onb" onClick={() => navigate(PATHS.ironSheet)}>Iron Sheet</div>
            <div className="onb active">The Oracle</div>
            <div className="onb" onClick={() => navigate(PATHS.theSkald)}>The Skald</div>
            <div className="onb" onClick={() => navigate(PATHS.worldForge)}>World Forge</div>
          </div>
        </div>

        <div className="ob">
          {/* Sidebar */}
          <div className="osd">
            <div className="osl">Oracle Tables</div>
            {[
              ["✦", "Ask the Oracle", "ask"],
              ["⚡", "Action + Theme", "action"],
              ["🌍", "Place Names", "place"],
              ["👤", "NPC Names", "npc"],
              ["☠", "Threats", "threats"],
              ["🗺", "Locations", "locations"],
              ["🌩", "Combat Events", "combat"],
              ["📖", "Plot Twists", "plot"],
            ].map(([icon, label, id]) => (
              <div
                key={id}
                className={`osi ${activeSidebarItem === id ? "active" : ""}`}
                onClick={() => setActiveSidebarItem(id)}
              >
                <span className="osic">{icon}</span>{label}
              </div>
            ))}
            <div className="osl">Character</div>
            {[
              ["🏛", "Backstory", "backstory"],
              ["🤝", "Disposition", "disposition"],
              ["🎯", "Goals", "goals"],
            ].map(([icon, label, id]) => (
              <div
                key={id}
                className={`osi ${activeSidebarItem === id ? "active" : ""}`}
                onClick={() => setActiveSidebarItem(id)}
              >
                <span className="osic">{icon}</span>{label}
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="om">
            <div className="opt">ᚦᛖ ᛟᚱᚨᚲᛚᛖ — The Oracle</div>

            {/* Oracle Type */}
            <div>
              <div className="osh" style={{marginBottom:'10px'}}>Consult the Fates</div>
              <div className="otypes">
                {ORACLE_TYPES.map(t => (
                  <div
                    key={t.id}
                    className={`otype ${activeOracleType === t.id ? "active" : ""}`}
                    onClick={() => setActiveOracleType(t.id)}
                  >
                    <div className="otrune">{t.rune}</div>
                    <div className="otname">{t.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div className="oprompt-wrap">
              <div className="oprompt-label">Your question to the fates</div>
              <div className="oprompt-input">
                <div className="oprompt-box">Does the village elder know of the runestone's location?</div>
                <div className="oask-btn">⚡ Consult</div>
              </div>
              <div style={{marginTop:'10px'}}>
                <div style={{fontSize:'8px',letterSpacing:'3px',color:'#3d3428',textTransform:'uppercase',marginBottom:'6px'}}>Quick Oracles</div>
                <div className="opills">
                  {ODDS_PILLS.map(p => (
                    <div
                      key={p}
                      className={`opill ${selectedOdds === p ? "sel" : ""}`}
                      onClick={() => setSelectedOdds(p)}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scroll Result */}
            <div className="oscroll-outer">
              <div className="oscroll">
                <div className="oscroll-header">
                  <div className="oscroll-type">Oracle · Likely Yes · d100 → 34</div>
                  <div className="oscroll-badge">⚠ Complication</div>
                </div>
                <div className="oscroll-title">Yes — but the truth cuts deeper than expected</div>
                <div className="oscroll-body">
                  The elder Halvard knows of the runestone — he has always known. It was he who ordered it buried beneath the Ashwood barrow after the Thornwood massacre, to keep its power from the warlord Kaer. He will not speak freely. He fears you carry Kaer's blood in your veins, and will demand proof of your intentions before the location passes his lips.
                </div>
                <div className="oscroll-tags">
                  <span className="otag npc">NPC: Halvard</span>
                  <span className="otag threat">Warlord Kaer</span>
                  <span className="otag location">Ashwood Barrow</span>
                </div>
                <div className="oscroll-actions">
                  <div className="osca primary">✦ Add to Log</div>
                  <div className="osca primary">⚔ Create Vow</div>
                  <div className="osca">↺ Reroll</div>
                  <div className="osca danger">✕ Reject</div>
                </div>
              </div>
            </div>

            {/* Oracle Table Preview */}
            <div>
              <div className="osh" style={{marginBottom:'10px'}}>Action Table · d100</div>
              <div className="otable-wrap">
                <div className="otable-head">
                  <div className="oth">Roll</div>
                  <div className="oth">Result</div>
                </div>
                <div className="otable-row"><div className="otr-num">01–05</div><div className="otr-val">Abandon</div></div>
                <div className="otable-row"><div className="otr-num">06–10</div><div className="otr-val">Advance</div></div>
                <div className="otable-row active-row"><div className="otr-num">11–15</div><div className="otr-val">Affect</div></div>
                <div className="otable-row"><div className="otr-num">16–20</div><div className="otr-val">Aid</div></div>
                <div className="otable-row"><div className="otr-num">21–25</div><div className="otr-val">Arrive</div></div>
              </div>
            </div>
          </div>

          {/* History Panel */}
          <div className="ohist">
            <div className="ohist-title">ᚱᛖᚲᛖᚾᛏ ᚱᛖᚢᛖᛚᚨᛏᛁᛟᚾᛊ — Recent Revelations</div>

            <div className="ohist-entry">
              <div className="ohe-type"><span className="ohe-dot"></span>Just now</div>
              <div className="ohe-title recent">"Yes — but the truth cuts deeper than expected"</div>
              <div className="ohe-time">Ask Oracle · Likely Yes · 34</div>
            </div>

            <div className="ohist-entry">
              <div className="ohe-type">Earlier this session</div>
              <div className="ohe-title">"Betray / A champion of the people"</div>
              <div className="ohe-time">Action + Theme · 67 / 12</div>
            </div>

            <div className="ohist-entry">
              <div className="ohe-type">Earlier this session</div>
              <div className="ohe-title">"No — and the consequences are dire"</div>
              <div className="ohe-time">Ask Oracle · Unlikely · 88</div>
            </div>

            <div className="ohist-entry">
              <div className="ohe-type">Earlier this session</div>
              <div className="ohe-title">"Halfhand Kolvir of the Saltmere Clan"</div>
              <div className="ohe-time">NPC Name Generator</div>
            </div>

            <div className="ohist-entry">
              <div className="ohe-type">Previous session</div>
              <div className="ohe-title">"Ruin / Ancient covenant broken"</div>
              <div className="ohe-time">Action + Theme · 44 / 91</div>
            </div>

            <div className="ohist-entry">
              <div className="ohe-type">Previous session</div>
              <div className="ohe-title">"Yes — but at a cost"</div>
              <div className="ohe-time">Ask Oracle · 50/50 · 51</div>
            </div>

            {/* Fate Tip */}
            <div style={{marginTop:'16px',padding:'10px',background:'rgba(122,179,204,0.06)',border:'1px solid rgba(122,179,204,0.15)',borderRadius:'3px'}}>
              <div style={{fontSize:'8px',letterSpacing:'3px',color:'#5f5447',textTransform:'uppercase',marginBottom:'5px'}}>Fate Tip</div>
              <div style={{fontSize:'10px',color:'#7a6a52',lineHeight:'1.6',fontStyle:'italic'}}>"Likely" odds give you 75% chance of yes. Pair with a Strong Hit for narrative momentum.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
