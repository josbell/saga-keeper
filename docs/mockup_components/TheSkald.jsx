import { useState } from "react";
import { navigate, PATHS } from "./navigate.js";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  .sw{background:#0d0b08;border-radius:12px;overflow:hidden;font-family:'Cinzel',Georgia,serif;color:#c4a96e;min-height:920px;display:grid;grid-template-rows:47px 1fr;}
  .sb{display:grid;grid-template-columns:200px 1fr 260px;height:100%;}
  /* topbar */
  .stb{background:#13100d;border-bottom:1px solid #2a241c;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;}
  .slog{display:flex;align-items:center;gap:10px;}
  .slt{font-family:'Cinzel Decorative',serif;font-size:15px;color:#f0b429;letter-spacing:2px;}
  .sls{font-size:9px;color:#5f5447;letter-spacing:3px;text-transform:uppercase;}
  .snav{display:flex;gap:2px;}
  .snb{background:transparent;border:1px solid transparent;color:#7a6a52;padding:5px 12px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;border-radius:3px;cursor:pointer;}
  .snb.active{border-color:#3d3428;color:#d4941a;background:rgba(212,148,26,0.07);}
  /* sidebar */
  .ssd{background:#0f0d0a;border-right:1px solid #1e1710;padding:16px 10px;display:flex;flex-direction:column;}
  .ssl{font-size:8px;letter-spacing:4px;color:#3d3428;text-transform:uppercase;padding:0 8px;margin:12px 0 5px;}
  .ssi{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:3px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#7a6a52;border:1px solid transparent;margin-bottom:2px;}
  .ssi.active{color:#d4941a;border-color:rgba(212,148,26,0.25);background:rgba(212,148,26,0.08);}
  .ssic{font-size:13px;width:18px;text-align:center;}
  /* char mini card */
  .schar{margin:0 0 12px;background:#13100d;border:1px solid #2a241c;border-radius:3px;padding:10px;}
  .schar-name{font-family:'Cinzel Decorative',serif;font-size:12px;color:#f0b429;margin-bottom:2px;}
  .schar-sub{font-size:8px;letter-spacing:2px;color:#5f5447;text-transform:uppercase;margin-bottom:8px;}
  .schar-bars{display:flex;flex-direction:column;gap:4px;}
  .sbar-row{display:flex;align-items:center;gap:6px;}
  .sbar-label{font-size:8px;letter-spacing:1px;color:#5f5447;text-transform:uppercase;width:26px;}
  .sbar-track{flex:1;height:6px;background:#1e1710;border-radius:2px;overflow:hidden;}
  .sbar-fill{height:100%;border-radius:2px;}
  .sbar-fill.hp{background:#8b1a1a;width:80%;}
  .sbar-fill.sp{background:#4a7a8a;width:60%;}
  .sbar-fill.mo{background:#5a8fa0;width:67%;}
  .sbar-num{font-size:8px;color:#5f5447;width:14px;text-align:right;}
  /* main chat area */
  .sm{display:flex;flex-direction:column;height:100%;}
  .sm-header{padding:14px 20px 10px;border-bottom:1px solid #1e1710;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
  .sm-title-block{}
  .sm-title{font-family:'Cinzel Decorative',serif;font-size:14px;color:#f0b429;letter-spacing:1px;margin-bottom:2px;}
  .sm-sub{font-size:8px;letter-spacing:3px;color:#5f5447;text-transform:uppercase;}
  .sm-controls{display:flex;gap:6px;}
  .sm-ctrl{background:#1e1710;border:1px solid #2a241c;border-radius:3px;padding:5px 10px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#7a6a52;}
  .sm-ctrl.lit{border-color:rgba(212,148,26,0.3);color:#d4941a;background:rgba(212,148,26,0.06);}
  /* chat scroll */
  .sm-feed{flex:1;padding:16px 20px;display:flex;flex-direction:column;gap:14px;overflow:hidden;}
  /* skald message */
  .msg-skald{display:flex;gap:10px;align-items:flex-start;}
  .msg-avatar{width:32px;height:32px;border-radius:3px;background:#1e1710;border:1px solid rgba(212,148,26,0.25);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;margin-top:2px;}
  .msg-skald-body{flex:1;}
  .msg-label{font-size:7px;letter-spacing:3px;color:#3d3428;text-transform:uppercase;margin-bottom:5px;}
  .msg-bubble-skald{background:#13100d;border:1px solid #2a241c;border-radius:0 4px 4px 4px;padding:12px 14px;font-size:11px;color:#c4a96e;line-height:1.8;font-style:italic;position:relative;}
  .msg-bubble-skald::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,rgba(212,148,26,0.4),transparent);}
  /* player message */
  .msg-player{display:flex;gap:10px;align-items:flex-start;flex-direction:row-reverse;}
  .msg-bubble-player{background:#1a130a;border:1px solid #2a241c;border-radius:4px 0 4px 4px;padding:10px 14px;font-size:11px;color:#c4a96e;line-height:1.7;}
  /* move card */
  .msg-move{background:#0f0d0a;border:1px solid rgba(212,148,26,0.18);border-radius:4px;padding:10px 14px;margin-top:8px;display:flex;align-items:center;justify-content:space-between;}
  .msg-move-left{}
  .msg-move-name{font-size:9px;letter-spacing:3px;color:#d4941a;text-transform:uppercase;margin-bottom:3px;}
  .msg-move-stat{font-size:8px;letter-spacing:2px;color:#5f5447;text-transform:uppercase;}
  .msg-move-right{display:flex;gap:6px;align-items:center;}
  .die-sm{width:28px;height:28px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:'Cinzel Decorative',serif;font-size:13px;}
  .die-sm.act{background:#1e1710;border:1px solid #d4941a;color:#f0b429;}
  .die-sm.chal{background:#1e1710;border:1px solid rgba(122,179,204,0.4);color:#7ab3cc;}
  .die-vs{font-size:9px;color:#2a241c;font-family:'Cinzel',serif;}
  .hit-badge{font-size:8px;letter-spacing:2px;text-transform:uppercase;padding:3px 8px;border-radius:2px;}
  .hit-badge.strong{background:rgba(212,148,26,0.12);border:1px solid rgba(212,148,26,0.35);color:#f0b429;}
  .hit-badge.weak{background:rgba(122,179,204,0.08);border:1px solid rgba(122,179,204,0.3);color:#7ab3cc;}
  .hit-badge.miss{background:rgba(139,26,26,0.12);border:1px solid rgba(139,26,26,0.35);color:#c0392b;}
  /* narration special */
  .msg-narrate{background:rgba(212,148,26,0.04);border:1px solid rgba(212,148,26,0.12);border-left:3px solid rgba(212,148,26,0.4);border-radius:0 4px 4px 0;padding:12px 14px;font-size:11px;color:#c4a96e;line-height:1.8;font-style:italic;}
  /* typing indicator */
  .msg-typing{display:flex;gap:10px;align-items:center;}
  .typing-dots{display:flex;gap:4px;padding:8px 14px;background:#13100d;border:1px solid #2a241c;border-radius:0 4px 4px 4px;}
  .tdot{width:5px;height:5px;border-radius:50%;background:#3d3428;}
  .tdot.lit{background:#d4941a;}
  /* input bar */
  .sm-input-bar{padding:12px 20px;border-top:1px solid #1e1710;flex-shrink:0;}
  .sm-move-pills{display:flex;gap:5px;margin-bottom:8px;flex-wrap:wrap;}
  .sm-mpill{background:#1e1710;border:1px solid #2a241c;border-radius:20px;padding:3px 10px;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;color:#5f5447;}
  .sm-mpill.hot{border-color:rgba(139,26,26,0.35);color:#c0392b;background:rgba(139,26,26,0.07);}
  .sm-input-row{display:flex;gap:8px;align-items:center;}
  .sm-input{flex:1;background:#13100d;border:1px solid #2a241c;border-radius:3px;padding:9px 14px;font-family:'Cinzel',serif;font-size:11px;color:#7a6a52;letter-spacing:1px;}
  .sm-send{background:linear-gradient(135deg,rgba(139,26,26,0.75),rgba(192,57,43,0.55));border:1px solid rgba(192,57,43,0.45);color:#c4a96e;padding:8px 16px;font-family:'Cinzel Decorative',serif;font-size:9px;letter-spacing:2px;border-radius:3px;}
  /* right panel */
  .srp{background:#0a0806;border-left:1px solid #1e1710;padding:14px;display:flex;flex-direction:column;gap:14px;overflow:hidden;}
  .srp-section-title{font-size:8px;letter-spacing:4px;color:#3d3428;text-transform:uppercase;padding-bottom:8px;border-bottom:1px solid #1e1710;}
  /* move reference */
  .move-ref{background:#13100d;border:1px solid #1e1710;border-radius:3px;overflow:hidden;}
  .move-ref-head{padding:8px 10px;border-bottom:1px solid #1e1710;display:flex;align-items:center;justify-content:space-between;}
  .move-ref-name{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#d4941a;}
  .move-ref-stat{font-size:8px;letter-spacing:2px;color:#5f5447;text-transform:uppercase;}
  .move-ref-body{padding:8px 10px;}
  .move-outcome{margin-bottom:5px;}
  .mo-label{font-size:8px;letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;}
  .mo-label.sh{color:#f0b429;}
  .mo-label.wh{color:#7ab3cc;}
  .mo-label.ms{color:#c0392b;}
  .mo-text{font-size:9px;color:#5f5447;line-height:1.6;font-style:italic;}
  /* vow tracker mini */
  .vow-mini{background:#13100d;border:1px solid rgba(139,26,26,0.2);border-radius:3px;padding:10px;}
  .vow-mini-title{font-size:10px;color:#c4a96e;font-style:italic;margin-bottom:6px;line-height:1.4;}
  .vow-mini-rank{font-size:7px;letter-spacing:2px;color:#8b1a1a;text-transform:uppercase;margin-bottom:6px;}
  .vow-prog{display:flex;gap:3px;}
  .vpb{flex:1;height:8px;border:1px solid rgba(139,26,26,0.25);border-radius:1px;background:rgba(0,0,0,0.3);}
  .vpb.on{background:rgba(139,26,26,0.55);border-color:rgba(192,57,43,0.45);}
  /* scene block */
  .scene-block{background:#13100d;border:1px solid #2a241c;border-radius:3px;padding:10px;}
  .scene-label{font-size:7px;letter-spacing:3px;color:#3d3428;text-transform:uppercase;margin-bottom:5px;}
  .scene-name{font-size:11px;color:#c4a96e;margin-bottom:4px;}
  .scene-desc{font-size:9px;color:#5f5447;line-height:1.6;font-style:italic;}
  .scene-tags{display:flex;gap:4px;margin-top:6px;flex-wrap:wrap;}
  .stag{font-size:7px;letter-spacing:1.5px;text-transform:uppercase;padding:2px 6px;border-radius:2px;}
  .stag.npc{background:rgba(212,148,26,0.1);border:1px solid rgba(212,148,26,0.2);color:#d4941a;}
  .stag.loc{background:rgba(122,179,204,0.08);border:1px solid rgba(122,179,204,0.2);color:#7ab3cc;}
  .stag.threat{background:rgba(139,26,26,0.12);border:1px solid rgba(139,26,26,0.25);color:#c0392b;}
`;

export default function TheSkald() {
  const [activeSidebarItem, setActiveSidebarItem] = useState("session");

  return (
    <>
      <style>{styles}</style>
      <div className="sw">
        {/* Topbar */}
        <div className="stb">
          <div className="slog">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <polygon points="16,2 30,30 2,30" stroke="#d4941a" strokeWidth="1.2" fill="none" opacity="0.6"/>
              <line x1="16" y1="2" x2="16" y2="30" stroke="#d4941a" strokeWidth="0.8"/>
              <line x1="9" y1="15" x2="23" y2="15" stroke="#d4941a" strokeWidth="0.8" opacity="0.7"/>
              <circle cx="16" cy="16" r="2.5" fill="#f0b429" opacity="0.7"/>
            </svg>
            <div>
              <div className="slt">Saga Keeper</div>
              <div className="sls">Ironsworn Companion</div>
            </div>
          </div>
          <div className="snav">
            <div className="snb" onClick={() => navigate(PATHS.ironSheet)}>Iron Sheet</div>
            <div className="snb" onClick={() => navigate(PATHS.theOracle)}>The Oracle</div>
            <div className="snb active">The Skald</div>
            <div className="snb" onClick={() => navigate(PATHS.worldForge)}>World Forge</div>
          </div>
        </div>

        <div className="sb">
          {/* Sidebar */}
          <div className="ssd">
            {/* Char mini */}
            <div className="schar">
              <div className="schar-name">Björn Ashclaw</div>
              <div className="schar-sub">Warden · Dangerous</div>
              <div className="schar-bars">
                <div className="sbar-row"><div className="sbar-label">HP</div><div className="sbar-track"><div className="sbar-fill hp"></div></div><div className="sbar-num">4</div></div>
                <div className="sbar-row"><div className="sbar-label">SP</div><div className="sbar-track"><div className="sbar-fill sp"></div></div><div className="sbar-num">3</div></div>
                <div className="sbar-row"><div className="sbar-label">MO</div><div className="sbar-track"><div className="sbar-fill mo"></div></div><div className="sbar-num">+2</div></div>
              </div>
            </div>

            <div className="ssl">Sessions</div>
            <div className={`ssi ${activeSidebarItem === "session" ? "active" : ""}`} onClick={() => setActiveSidebarItem("session")}><span className="ssic">🔥</span>Current Session</div>
            <div className={`ssi ${activeSidebarItem === "thornwood" ? "active" : ""}`} onClick={() => setActiveSidebarItem("thornwood")}><span className="ssic">📜</span>The Thornwood March</div>
            <div className={`ssi ${activeSidebarItem === "blood" ? "active" : ""}`} onClick={() => setActiveSidebarItem("blood")}><span className="ssic">📜</span>Blood on the Ice</div>
            <div className={`ssi ${activeSidebarItem === "elder" ? "active" : ""}`} onClick={() => setActiveSidebarItem("elder")}><span className="ssic">📜</span>The Elder's Silence</div>

            <div className="ssl">Story</div>
            <div className={`ssi ${activeSidebarItem === "npcs" ? "active" : ""}`} onClick={() => setActiveSidebarItem("npcs")}><span className="ssic">👥</span>NPCs Met</div>
            <div className={`ssi ${activeSidebarItem === "places" ? "active" : ""}`} onClick={() => setActiveSidebarItem("places")}><span className="ssic">🗺</span>Places Visited</div>
            <div className={`ssi ${activeSidebarItem === "enemies" ? "active" : ""}`} onClick={() => setActiveSidebarItem("enemies")}><span className="ssic">⚔</span>Enemies Slain</div>
            <div className={`ssi ${activeSidebarItem === "recap" ? "active" : ""}`} onClick={() => setActiveSidebarItem("recap")}><span className="ssic">📖</span>Session Recap</div>
          </div>

          {/* Main chat */}
          <div className="sm">
            <div className="sm-header">
              <div className="sm-title-block">
                <div className="sm-title">The Skald</div>
                <div className="sm-sub">ᚦᛖ ᚠᛁᚱᛖᛊᛁᛞᛖ ᛊᛏᛟᚱᚤᛏᛖᛚᛚᛖᚱ — Narrate your saga</div>
              </div>
              <div className="sm-controls">
                <div className="sm-ctrl lit">⚔ Auto-Roll Moves</div>
                <div className="sm-ctrl">📖 Recap Session</div>
                <div className="sm-ctrl">⚙ Tone</div>
              </div>
            </div>

            {/* Feed */}
            <div className="sm-feed">
              {/* Skald narrates scene */}
              <div className="msg-skald">
                <div className="msg-avatar">🪶</div>
                <div className="msg-skald-body">
                  <div className="msg-label">The Skald · Scene Open</div>
                  <div className="msg-bubble-skald">
                    The village of Keldmere crouches beneath a grey sky, its longhouses half-buried in ash-grey snow. You find Halvard the Elder beside the central fire — an old man bent like driftwood, his eyes sharp as flint. He does not rise when you enter. The other villagers go quiet. Whatever you came here to ask, he already suspects it.
                  </div>
                </div>
              </div>

              {/* Player action */}
              <div className="msg-player">
                <div className="msg-avatar" style={{background:'#1a130a',borderColor:'#2a241c'}}>🪖</div>
                <div>
                  <div className="msg-label" style={{textAlign:'right'}}>Björn · Player Action</div>
                  <div className="msg-bubble-player">I approach the elder slowly, hands visible, and speak plainly. "Old man. I know you buried the runestone of Valdris. I need to know where. Lives depend on it — including yours."</div>
                </div>
              </div>

              {/* Move card */}
              <div style={{padding:'0 42px'}}>
                <div className="msg-move">
                  <div className="msg-move-left">
                    <div className="msg-move-name">Compel</div>
                    <div className="msg-move-stat">Stat: Heart (3) · Roll: 3 + 3 = 6</div>
                  </div>
                  <div className="msg-move-right">
                    <div className="die-sm act">6</div>
                    <div className="die-vs">vs</div>
                    <div className="die-sm chal">4</div>
                    <div className="die-sm chal">9</div>
                    <div className="hit-badge weak">Weak Hit</div>
                  </div>
                </div>
              </div>

              {/* Skald narrates outcome */}
              <div className="msg-skald">
                <div className="msg-avatar">🪶</div>
                <div className="msg-skald-body">
                  <div className="msg-label">The Skald · Weak Hit Outcome</div>
                  <div className="msg-bubble-skald">
                    Halvard's jaw tightens. The fire crackles. After a long silence, he speaks: <em>"The barrow lies three days east, past the Greywolf ridge. But you'll not enter without the iron key — and I gave that to my daughter Runa when she fled north."</em> He tells you what you need — but now you have a new problem. His daughter, and a journey not yet begun.
                  </div>
                  <div className="msg-narrate" style={{marginTop:'8px'}}>
                    The Skald suggests: <strong style={{color:'#d4941a',fontStyle:'normal'}}>Swear a new vow</strong> to find Runa — or <strong style={{color:'#d4941a',fontStyle:'normal'}}>Undertake a Journey</strong> north immediately. Your momentum is +2; a strong start is within reach.
                  </div>
                </div>
              </div>

              {/* Typing indicator */}
              <div className="msg-typing">
                <div className="msg-avatar">🪶</div>
                <div className="typing-dots">
                  <div className="tdot lit"></div>
                  <div className="tdot lit"></div>
                  <div className="tdot"></div>
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="sm-input-bar">
              <div className="sm-move-pills">
                <div style={{fontSize:'7px',letterSpacing:'3px',color:'#2a241c',textTransform:'uppercase',display:'flex',alignItems:'center'}}>Quick Move:</div>
                <div className="sm-mpill hot">Strike</div>
                <div className="sm-mpill hot">Endure Harm</div>
                <div className="sm-mpill">Undertake Journey</div>
                <div className="sm-mpill">Swear Vow</div>
                <div className="sm-mpill">Make Camp</div>
                <div className="sm-mpill">+ More</div>
              </div>
              <div className="sm-input-row">
                <div className="sm-input">I swear an iron vow to find Runa before the next moon...</div>
                <div className="sm-send">⚔ Speak</div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="srp">
            <div className="srp-section-title">Active Scene</div>
            <div className="scene-block">
              <div className="scene-label">Location</div>
              <div className="scene-name">Keldmere Village · Elder's Hall</div>
              <div className="scene-desc">A dying settlement. The elder holds secrets. Tension is high — the villagers watch from the shadows.</div>
              <div className="scene-tags">
                <span className="stag npc">Halvard</span>
                <span className="stag loc">Ashwood Barrow</span>
                <span className="stag threat">Warlord Kaer</span>
              </div>
            </div>

            <div className="srp-section-title">Move Reference</div>
            <div className="move-ref">
              <div className="move-ref-head">
                <div className="move-ref-name">Compel</div>
                <div className="move-ref-stat">+Heart / +Iron / +Shadow</div>
              </div>
              <div className="move-ref-body">
                <div className="move-outcome">
                  <div className="mo-label sh">Strong Hit</div>
                  <div className="mo-text">They do what you ask and may ask for something in return. If you agree, mark progress on your bond.</div>
                </div>
                <div className="move-outcome">
                  <div className="mo-label wh">Weak Hit</div>
                  <div className="mo-text">They do it, but you must first fulfill a condition or face a complication.</div>
                </div>
                <div className="move-outcome">
                  <div className="mo-label ms">Miss</div>
                  <div className="mo-text">They refuse or are hostile. Pay the price.</div>
                </div>
              </div>
            </div>

            <div className="srp-section-title">Tracked Vows</div>
            <div className="vow-mini">
              <div className="vow-mini-title">"Find the lost runestone of Valdris"</div>
              <div className="vow-mini-rank">Dangerous · Progress 6/10</div>
              <div className="vow-prog">
                <div className="vpb on"></div><div className="vpb on"></div><div className="vpb on"></div><div className="vpb on"></div><div className="vpb on"></div>
                <div className="vpb on"></div><div className="vpb"></div><div className="vpb"></div><div className="vpb"></div><div className="vpb"></div>
              </div>
            </div>
            <div className="vow-mini" style={{marginTop:'6px'}}>
              <div className="vow-mini-title">"Avenge the slaughter of Clan Thornwood"</div>
              <div className="vow-mini-rank">Epic · Progress 3/10</div>
              <div className="vow-prog">
                <div className="vpb on"></div><div className="vpb on"></div><div className="vpb on"></div>
                <div className="vpb"></div><div className="vpb"></div><div className="vpb"></div><div className="vpb"></div><div className="vpb"></div><div className="vpb"></div><div className="vpb"></div>
              </div>
            </div>

            <div style={{background:'rgba(139,26,26,0.07)',border:'1px solid rgba(139,26,26,0.2)',borderRadius:'3px',padding:'10px'}}>
              <div style={{fontSize:'7px',letterSpacing:'3px',color:'#5f5447',textTransform:'uppercase',marginBottom:'5px'}}>Skald's Warning</div>
              <div style={{fontSize:'9px',color:'#7a6a52',lineHeight:'1.6',fontStyle:'italic'}}>Your Spirit is at 3. A harsh journey north could push you into Shaken. Consider making camp before departing.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
