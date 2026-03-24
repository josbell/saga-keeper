import { useState } from "react";
import { navigate, PATHS } from "./navigate.js";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  .sw{background:#0d0b08;border-radius:12px;overflow:hidden;font-family:'Cinzel',Georgia,serif;color:#c4a96e;min-height:960px;display:grid;grid-template-rows:47px 1fr;}
  .sb{display:grid;grid-template-columns:200px 1fr 260px;height:100%;position:relative;}
  /* topbar */
  .stb{background:#13100d;border-bottom:1px solid #2a241c;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;}
  .slog{display:flex;align-items:center;gap:10px;}
  .slt{font-family:'Cinzel Decorative',serif;font-size:15px;color:#f0b429;letter-spacing:2px;}
  .sls{font-size:9px;color:#5f5447;letter-spacing:3px;text-transform:uppercase;}
  .snav{display:flex;gap:2px;}
  .snb{background:transparent;border:1px solid transparent;color:#7a6a52;padding:5px 12px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;border-radius:3px;}
  .snb.active{border-color:#3d3428;color:#d4941a;background:rgba(212,148,26,0.07);}
  /* sidebar */
  .ssd{background:#0f0d0a;border-right:1px solid #1e1710;padding:16px 10px;display:flex;flex-direction:column;}
  .ssl{font-size:8px;letter-spacing:4px;color:#3d3428;text-transform:uppercase;padding:0 8px;margin:12px 0 5px;}
  .ssi{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:3px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#7a6a52;border:1px solid transparent;margin-bottom:2px;}
  .ssi.active{color:#d4941a;border-color:rgba(212,148,26,0.25);background:rgba(212,148,26,0.08);}
  .ssic{font-size:13px;width:18px;text-align:center;}
  .schar{margin:0 0 12px;background:#13100d;border:1px solid #2a241c;border-radius:3px;padding:10px;}
  .schar-name{font-family:'Cinzel Decorative',serif;font-size:12px;color:#f0b429;margin-bottom:2px;}
  .schar-sub{font-size:8px;letter-spacing:2px;color:#5f5447;text-transform:uppercase;margin-bottom:8px;}
  .sbar-row{display:flex;align-items:center;gap:6px;margin-bottom:4px;}
  .sbar-label{font-size:8px;letter-spacing:1px;color:#5f5447;text-transform:uppercase;width:26px;}
  .sbar-track{flex:1;height:6px;background:#1e1710;border-radius:2px;overflow:hidden;}
  .sbar-fill{height:100%;border-radius:2px;}
  .sbar-num{font-size:8px;color:#5f5447;width:14px;text-align:right;}

  /* main chat */
  .sm{display:flex;flex-direction:column;height:100%;position:relative;}
  .sm-header{padding:12px 20px;border-bottom:1px solid #1e1710;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
  .sm-title{font-family:'Cinzel Decorative',serif;font-size:14px;color:#f0b429;letter-spacing:1px;margin-bottom:2px;}
  .sm-sub{font-size:8px;letter-spacing:3px;color:#5f5447;text-transform:uppercase;}
  .sm-ctrls{display:flex;gap:6px;}
  .sm-ctrl{background:#1e1710;border:1px solid #2a241c;border-radius:3px;padding:5px 10px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#7a6a52;}
  .sm-ctrl.lit{border-color:rgba(212,148,26,0.3);color:#d4941a;background:rgba(212,148,26,0.06);}

  /* chat feed */
  .sm-feed{flex:1;padding:16px 20px;display:flex;flex-direction:column;gap:12px;overflow:hidden;}

  /* messages */
  .msg-skald{display:flex;gap:10px;align-items:flex-start;}
  .msg-av{width:30px;height:30px;border-radius:3px;background:#1e1710;border:1px solid rgba(212,148,26,0.2);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;margin-top:2px;}
  .msg-av.player{background:#1a130a;border-color:#2a241c;}
  .msg-label{font-size:7px;letter-spacing:3px;color:#3d3428;text-transform:uppercase;margin-bottom:4px;}
  .msg-label.right{text-align:right;}
  .msg-bubble{border-radius:4px;padding:10px 13px;font-size:11px;line-height:1.8;font-style:italic;}
  .msg-bubble.skald{background:#13100d;border:1px solid #2a241c;border-radius:0 4px 4px 4px;color:#c4a96e;position:relative;}
  .msg-bubble.skald::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,rgba(212,148,26,0.35),transparent);}
  .msg-bubble.player{background:#1a130a;border:1px solid #2a241c;border-radius:4px 0 4px 4px;color:#c4a96e;}
  .msg-player{display:flex;gap:10px;align-items:flex-start;flex-direction:row-reverse;}

  /* move card */
  .move-card{background:#0f0d0a;border:1px solid rgba(212,148,26,0.18);border-radius:4px;padding:10px 13px;margin:0 42px;display:flex;align-items:center;justify-content:space-between;}
  .mc-left{}
  .mc-name{font-size:9px;letter-spacing:3px;color:#d4941a;text-transform:uppercase;margin-bottom:2px;}
  .mc-stat{font-size:8px;letter-spacing:2px;color:#5f5447;text-transform:uppercase;}
  .mc-right{display:flex;gap:5px;align-items:center;}
  .die-s{width:26px;height:26px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:'Cinzel Decorative',serif;font-size:12px;}
  .die-s.act{background:#1e1710;border:1px solid #d4941a;color:#f0b429;}
  .die-s.chal{background:#1e1710;border:1px solid rgba(122,179,204,0.4);color:#7ab3cc;}
  .die-vs{font-size:8px;color:#2a241c;}
  .hit-b{font-size:7px;letter-spacing:2px;text-transform:uppercase;padding:3px 7px;border-radius:2px;}
  .hit-b.strong{background:rgba(212,148,26,0.12);border:1px solid rgba(212,148,26,0.35);color:#f0b429;}
  .hit-b.weak{background:rgba(122,179,204,0.08);border:1px solid rgba(122,179,204,0.3);color:#7ab3cc;}
  .hit-b.miss{background:rgba(139,26,26,0.12);border:1px solid rgba(139,26,26,0.35);color:#c0392b;}

  /* INLINE ORACLE CARD */
  .oracle-inline{margin:0 0 0 40px;border-radius:4px;overflow:hidden;border:1px solid rgba(168,212,232,0.2);background:#0a0d10;}
  .oracle-inline-header{display:flex;align-items:center;justify-content:space-between;padding:7px 12px;background:rgba(122,179,204,0.07);border-bottom:1px solid rgba(122,179,204,0.15);}
  .oi-tag{font-size:7px;letter-spacing:3px;text-transform:uppercase;color:#5a8fa0;display:flex;align-items:center;gap:5px;}
  .oi-tag::before{content:'✦';font-size:8px;}
  .oi-roll{font-size:8px;color:#3a6070;letter-spacing:1px;}
  .oracle-inline-body{padding:10px 13px;}
  .oi-result{font-family:'Cinzel Decorative',serif;font-size:13px;color:#a8d4e8;margin-bottom:5px;line-height:1.3;}
  .oi-narration{font-size:10px;color:#7a6a52;font-style:italic;line-height:1.7;}
  .oi-tags{display:flex;gap:5px;margin-top:7px;}
  .oi-chip{font-size:7px;letter-spacing:1.5px;text-transform:uppercase;padding:2px 7px;border-radius:2px;}
  .oi-chip.npc{background:rgba(212,148,26,0.1);border:1px solid rgba(212,148,26,0.2);color:#d4941a;}
  .oi-chip.loc{background:rgba(122,179,204,0.08);border:1px solid rgba(122,179,204,0.2);color:#7ab3cc;}
  .oi-chip.threat{background:rgba(139,26,26,0.1);border:1px solid rgba(139,26,26,0.2);color:#c0392b;}
  .oi-actions{display:flex;gap:6px;padding:8px 13px;border-top:1px solid rgba(122,179,204,0.08);}
  .oi-btn{font-size:8px;letter-spacing:1.5px;text-transform:uppercase;padding:4px 10px;border-radius:2px;background:#13100d;border:1px solid #1e1710;color:#5f5447;cursor:pointer;}
  .oi-btn.accept{border-color:rgba(122,179,204,0.3);color:#7ab3cc;background:rgba(122,179,204,0.05);}

  /* AUTO-ORACLE CARD */
  .oracle-auto{margin:4px 40px;border-radius:3px;border:1px solid rgba(212,148,26,0.15);background:rgba(212,148,26,0.04);padding:8px 12px;display:flex;gap:10px;align-items:center;}
  .oa-icon{font-size:14px;flex-shrink:0;}
  .oa-label{font-size:7px;letter-spacing:3px;text-transform:uppercase;color:#5f5447;margin-bottom:2px;}
  .oa-val{font-size:11px;color:#d4941a;font-style:italic;}
  .oa-roll{font-size:8px;color:#3d3428;margin-left:auto;letter-spacing:1px;}

  /* narrative suggestion */
  .msg-suggest{background:rgba(139,26,26,0.06);border:1px solid rgba(139,26,26,0.15);border-left:3px solid rgba(192,57,43,0.4);border-radius:0 3px 3px 0;padding:9px 13px;margin:0 42px;font-size:10px;color:#7a6a52;font-style:italic;line-height:1.7;}
  .msg-suggest strong{color:#d4941a;font-style:normal;}

  /* input bar */
  .sm-input-bar{padding:10px 20px 14px;border-top:1px solid #1e1710;flex-shrink:0;}
  .sm-pills-row{display:flex;gap:5px;margin-bottom:7px;align-items:center;flex-wrap:wrap;}
  .sm-pill{background:#1e1710;border:1px solid #2a241c;border-radius:20px;padding:3px 10px;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;color:#5f5447;}
  .sm-pill.hot{border-color:rgba(139,26,26,0.35);color:#c0392b;background:rgba(139,26,26,0.07);}
  .oracle-quick-btn{display:flex;align-items:center;gap:5px;background:rgba(122,179,204,0.07);border:1px solid rgba(122,179,204,0.25);border-radius:20px;padding:3px 12px;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;color:#7ab3cc;margin-left:auto;cursor:pointer;}
  .oracle-quick-btn::before{content:'✦';font-size:9px;}
  .sm-input-row{display:flex;gap:8px;align-items:center;}
  .sm-input{flex:1;background:#13100d;border:1px solid #2a241c;border-radius:3px;padding:9px 13px;font-family:'Cinzel',serif;font-size:11px;color:#7a6a52;letter-spacing:1px;}
  .sm-send{background:linear-gradient(135deg,rgba(139,26,26,0.75),rgba(192,57,43,0.55));border:1px solid rgba(192,57,43,0.45);color:#c4a96e;padding:8px 16px;font-family:'Cinzel Decorative',serif;font-size:9px;letter-spacing:2px;border-radius:3px;cursor:pointer;}

  /* ORACLE POPOVER */
  .oracle-popover{position:absolute;bottom:70px;right:20px;width:300px;background:#0f0d0a;border:1px solid rgba(122,179,204,0.3);border-radius:5px;z-index:10;overflow:hidden;box-shadow:0 0 40px rgba(0,0,0,0.8);}
  .op-header{background:rgba(122,179,204,0.08);border-bottom:1px solid rgba(122,179,204,0.15);padding:10px 14px;display:flex;align-items:center;justify-content:space-between;}
  .op-title{font-family:'Cinzel Decorative',serif;font-size:12px;color:#a8d4e8;letter-spacing:1px;}
  .op-close{font-size:14px;color:#3a6070;cursor:pointer;}
  .op-tabs{display:flex;gap:2px;padding:8px 10px;border-bottom:1px solid #1e1710;}
  .op-tab{padding:4px 10px;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#3a6070;border:1px solid transparent;border-radius:2px;cursor:pointer;}
  .op-tab.active{color:#7ab3cc;border-color:rgba(122,179,204,0.25);background:rgba(122,179,204,0.06);}
  .op-body{padding:12px;}
  .op-odds-label{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#5f5447;margin-bottom:7px;}
  .op-odds{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:12px;}
  .op-odd{padding:6px 8px;background:#13100d;border:1px solid #1e1710;border-radius:3px;font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#5f5447;text-align:center;cursor:pointer;}
  .op-odd.selected{border-color:rgba(122,179,204,0.35);color:#7ab3cc;background:rgba(122,179,204,0.06);}
  .op-question{width:100%;background:#13100d;border:1px solid #2a241c;border-radius:3px;padding:8px 10px;font-family:'Cinzel',serif;font-size:10px;color:#c4a96e;font-style:italic;margin-bottom:10px;}
  .op-consult{width:100%;background:rgba(122,179,204,0.12);border:1px solid rgba(122,179,204,0.3);border-radius:3px;padding:8px;font-family:'Cinzel Decorative',serif;font-size:10px;letter-spacing:2px;color:#a8d4e8;text-align:center;cursor:pointer;}
  .op-divider{height:1px;background:#1e1710;margin:10px 0;}
  .op-recent-label{font-size:7px;letter-spacing:3px;text-transform:uppercase;color:#3d3428;margin-bottom:7px;}
  .op-recent-item{padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.03);font-size:9px;color:#5f5447;font-style:italic;line-height:1.4;}
  .op-recent-meta{font-size:7px;color:#2a241c;letter-spacing:1px;margin-top:1px;}

  /* right panel */
  .srp{background:#0a0806;border-left:1px solid #1e1710;padding:14px;display:flex;flex-direction:column;gap:12px;overflow:hidden;}
  .srp-t{font-size:8px;letter-spacing:4px;color:#3d3428;text-transform:uppercase;padding-bottom:8px;border-bottom:1px solid #1e1710;}
  .scene-block{background:#13100d;border:1px solid #1e1710;border-radius:3px;padding:10px;}
  .sc-label{font-size:7px;letter-spacing:3px;color:#3d3428;text-transform:uppercase;margin-bottom:4px;}
  .sc-name{font-size:11px;color:#c4a96e;margin-bottom:3px;}
  .sc-desc{font-size:9px;color:#5f5447;font-style:italic;line-height:1.6;}
  .sc-tags{display:flex;gap:4px;margin-top:6px;flex-wrap:wrap;}
  .stag{font-size:7px;letter-spacing:1.5px;text-transform:uppercase;padding:2px 6px;border-radius:2px;}
  .stag.npc{background:rgba(212,148,26,0.1);border:1px solid rgba(212,148,26,0.2);color:#d4941a;}
  .stag.loc{background:rgba(122,179,204,0.08);border:1px solid rgba(122,179,204,0.2);color:#7ab3cc;}
  .stag.threat{background:rgba(139,26,26,0.1);border:1px solid rgba(139,26,26,0.2);color:#c0392b;}
  .move-ref{background:#13100d;border:1px solid #1e1710;border-radius:3px;overflow:hidden;}
  .mr-head{padding:7px 10px;border-bottom:1px solid #1e1710;display:flex;align-items:center;justify-content:space-between;}
  .mr-name{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#d4941a;}
  .mr-stat{font-size:7px;letter-spacing:2px;color:#5f5447;text-transform:uppercase;}
  .mr-body{padding:8px 10px;}
  .mo-row{margin-bottom:5px;}
  .mo-label{font-size:7px;letter-spacing:2px;text-transform:uppercase;margin-bottom:1px;}
  .mo-label.sh{color:#f0b429;} .mo-label.wh{color:#7ab3cc;} .mo-label.ms{color:#c0392b;}
  .mo-text{font-size:9px;color:#5f5447;line-height:1.5;font-style:italic;}
  .vow-mini{background:#13100d;border:1px solid rgba(139,26,26,0.2);border-radius:3px;padding:9px;}
  .vm-title{font-size:10px;color:#c4a96e;font-style:italic;margin-bottom:4px;line-height:1.4;}
  .vm-rank{font-size:7px;letter-spacing:2px;color:#8b1a1a;text-transform:uppercase;margin-bottom:5px;}
  .vm-prog{display:flex;gap:2px;}
  .vpb{flex:1;height:7px;border:1px solid rgba(139,26,26,0.2);border-radius:1px;background:rgba(0,0,0,0.3);}
  .vpb.on{background:rgba(139,26,26,0.5);border-color:rgba(192,57,43,0.4);}
`;

export default function SkaldIntegratedOracle() {
  const [showOraclePopover, setShowOraclePopover] = useState(true);
  const [activeOracleTab, setActiveOracleTab] = useState("ask");
  const [selectedOdds, setSelectedOdds] = useState("Almost Certain");
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
            <div className="schar">
              <div className="schar-name">Björn Ashclaw</div>
              <div className="schar-sub">Warden · Dangerous</div>
              <div className="sbar-row"><div className="sbar-label">HP</div><div className="sbar-track"><div className="sbar-fill" style={{background:'#8b1a1a',width:'80%'}}></div></div><div className="sbar-num">4</div></div>
              <div className="sbar-row"><div className="sbar-label">SP</div><div className="sbar-track"><div className="sbar-fill" style={{background:'#4a7a8a',width:'60%'}}></div></div><div className="sbar-num">3</div></div>
              <div className="sbar-row"><div className="sbar-label">MO</div><div className="sbar-track"><div className="sbar-fill" style={{background:'#5a8fa0',width:'67%'}}></div></div><div className="sbar-num">+2</div></div>
            </div>
            <div className="ssl">Sessions</div>
            <div className={`ssi ${activeSidebarItem === "session" ? "active" : ""}`} onClick={() => setActiveSidebarItem("session")}><span className="ssic">🔥</span>Current Session</div>
            <div className={`ssi ${activeSidebarItem === "thornwood" ? "active" : ""}`} onClick={() => setActiveSidebarItem("thornwood")}><span className="ssic">📜</span>The Thornwood March</div>
            <div className={`ssi ${activeSidebarItem === "blood" ? "active" : ""}`} onClick={() => setActiveSidebarItem("blood")}><span className="ssic">📜</span>Blood on the Ice</div>
            <div className="ssl">Story</div>
            <div className={`ssi ${activeSidebarItem === "npcs" ? "active" : ""}`} onClick={() => setActiveSidebarItem("npcs")}><span className="ssic">👥</span>NPCs Met</div>
            <div className={`ssi ${activeSidebarItem === "places" ? "active" : ""}`} onClick={() => setActiveSidebarItem("places")}><span className="ssic">🗺</span>Places Visited</div>
            <div className={`ssi ${activeSidebarItem === "recap" ? "active" : ""}`} onClick={() => setActiveSidebarItem("recap")}><span className="ssic">📖</span>Session Recap</div>
          </div>

          {/* Main chat */}
          <div className="sm">
            <div className="sm-header">
              <div>
                <div className="sm-title">The Skald</div>
                <div className="sm-sub">Oracle consultations happen inline — never leave the story</div>
              </div>
              <div className="sm-ctrls">
                <div className="sm-ctrl lit">⚔ Auto-Roll</div>
                <div className="sm-ctrl lit">✦ Auto-Oracle</div>
                <div className="sm-ctrl">⚙ Tone</div>
              </div>
            </div>

            <div className="sm-feed">
              {/* Skald narrates */}
              <div className="msg-skald">
                <div className="msg-av">🪶</div>
                <div style={{flex:1}}>
                  <div className="msg-label">The Skald · Scene</div>
                  <div className="msg-bubble skald">Halvard studies you for a long moment. The fire snaps. Then he speaks of the barrow — three days east, past the Greywolf ridge. The iron key went north with his daughter Runa when she fled. He doesn't know if she yet lives.</div>
                </div>
              </div>

              {/* Player asks */}
              <div className="msg-player">
                <div className="msg-av player">🪖</div>
                <div style={{flex:1}}>
                  <div className="msg-label right">Björn · Action</div>
                  <div className="msg-bubble player">I ask if anyone in the village has heard word of Runa since she left. Someone must know something.</div>
                </div>
              </div>

              {/* AUTO oracle */}
              <div className="oracle-auto">
                <div className="oa-icon">✦</div>
                <div>
                  <div className="oa-label">Skald consulted oracle · Gather Information</div>
                  <div className="oa-val">Does anyone know of Runa? · Unlikely · d100 → 71</div>
                </div>
                <div className="oa-roll">Miss</div>
              </div>

              {/* Skald narrates oracle result inline */}
              <div className="msg-skald">
                <div className="msg-av">🪶</div>
                <div style={{flex:1}}>
                  <div className="msg-label">The Skald · Outcome</div>
                  <div className="msg-bubble skald">Silence. The villagers look away. One old woman spits into the fire. Whatever Runa knew — or did — has made her name a curse in Keldmere. You will find no help here. <em>Pay the price: your journey north begins without a lead.</em></div>
                </div>
              </div>

              {/* Suggestion */}
              <div className="msg-suggest">
                The Skald suggests: <strong>Undertake a Journey</strong> north toward Greywolf Ridge — or first <strong>Secure an Advantage</strong> by searching Halvard's home for any clue of where Runa fled.
              </div>

              {/* Player manually asks oracle */}
              <div className="msg-player">
                <div className="msg-av player">🪖</div>
                <div style={{flex:1}}>
                  <div className="msg-label right">Björn · Oracle</div>
                  <div className="msg-bubble player">Before I leave — does the old woman who spat know more than she's letting on?</div>
                </div>
              </div>

              {/* INLINE oracle card */}
              <div className="oracle-inline">
                <div className="oracle-inline-header">
                  <div className="oi-tag">Oracle · Ask the Fates · Almost Certain</div>
                  <div className="oi-roll">d100 → 18 · Strong Yes</div>
                </div>
                <div className="oracle-inline-body">
                  <div className="oi-result">Yes — and she is afraid to speak it aloud</div>
                  <div className="oi-narration">The old woman's eyes flick to the door. She knows. She saw Runa leave — and she saw who followed her. She won't speak here, not with Halvard watching. But she lingers near the threshold, her shawl pulled tight.</div>
                  <div className="oi-tags">
                    <span className="oi-chip npc">New NPC: Old Woman</span>
                    <span className="oi-chip threat">Someone followed Runa</span>
                  </div>
                </div>
                <div className="oi-actions">
                  <div className="oi-btn accept">✦ Accept & Add to World</div>
                  <div className="oi-btn">↺ Reroll</div>
                  <div className="oi-btn">✕ Discard</div>
                </div>
              </div>

              {/* Skald continues */}
              <div className="msg-skald">
                <div className="msg-av">🪶</div>
                <div style={{flex:1}}>
                  <div className="msg-label">The Skald · Continuing</div>
                  <div className="msg-bubble skald">She catches your eye and steps outside into the cold. A thread to pull — if you dare.</div>
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="sm-input-bar">
              <div className="sm-pills-row">
                <div className="sm-pill hot">Gather Info</div>
                <div className="sm-pill hot">Undertake Journey</div>
                <div className="sm-pill">Compel</div>
                <div className="sm-pill">Secure Advantage</div>
                <div className="oracle-quick-btn" onClick={() => setShowOraclePopover(v => !v)}>Oracle</div>
              </div>
              <div className="sm-input-row">
                <div className="sm-input">I follow the old woman outside into the snow...</div>
                <div className="sm-send">⚔ Speak</div>
              </div>
            </div>

            {/* Oracle Popover */}
            {showOraclePopover && (
              <div className="oracle-popover">
                <div className="op-header">
                  <div className="op-title">✦ Oracle</div>
                  <div className="op-close" onClick={() => setShowOraclePopover(false)}>✕</div>
                </div>
                <div className="op-tabs">
                  {["Ask Fates","Action+Theme","Names","Tables"].map((t, i) => (
                    <div
                      key={t}
                      className={`op-tab ${activeOracleTab === t ? "active" : ""}`}
                      onClick={() => setActiveOracleTab(t)}
                    >{t}</div>
                  ))}
                </div>
                <div className="op-body">
                  <div className="op-odds-label">Odds</div>
                  <div className="op-odds">
                    {["Small Chance","Unlikely","Almost Certain","50 / 50","Likely","Certain"].map(o => (
                      <div
                        key={o}
                        className={`op-odd ${selectedOdds === o ? "selected" : ""}`}
                        onClick={() => setSelectedOdds(o)}
                      >{o}</div>
                    ))}
                  </div>
                  <div className="op-question">Does the old woman know more than she lets on?</div>
                  <div className="op-consult">⚡ Consult the Fates</div>
                  <div className="op-divider"></div>
                  <div className="op-recent-label">Recent in this session</div>
                  <div className="op-recent-item">
                    "Does anyone know of Runa?" — Miss
                    <div className="op-recent-meta">Auto · Unlikely · 71</div>
                  </div>
                  <div className="op-recent-item">
                    "Yes — she is afraid to speak it aloud"
                    <div className="op-recent-meta">Manual · Almost Certain · 18</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="srp">
            <div className="srp-t">Active Scene</div>
            <div className="scene-block">
              <div className="sc-label">Location</div>
              <div className="sc-name">Keldmere · Elder's Hall</div>
              <div className="sc-desc">Tension after Halvard's revelation. An old woman holds a secret. The cold outside beckons.</div>
              <div className="sc-tags">
                <span className="stag npc">Halvard</span>
                <span className="stag npc">Old Woman</span>
                <span className="stag threat">Unknown Follower</span>
                <span className="stag loc">Greywolf Ridge</span>
              </div>
            </div>

            <div className="srp-t">Oracle Log · This Scene</div>
            <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
              <div style={{background:'#13100d',border:'1px solid rgba(122,179,204,0.12)',borderRadius:'3px',padding:'8px 10px'}}>
                <div style={{fontSize:'7px',letterSpacing:'2px',textTransform:'uppercase',color:'#3a6070',marginBottom:'3px'}}>Auto · Unlikely · 71 · Miss</div>
                <div style={{fontSize:'9px',color:'#5f5447',fontStyle:'italic'}}>"Does anyone know of Runa?"</div>
              </div>
              <div style={{background:'#13100d',border:'1px solid rgba(122,179,204,0.2)',borderRadius:'3px',padding:'8px 10px'}}>
                <div style={{fontSize:'7px',letterSpacing:'2px',textTransform:'uppercase',color:'#5a8fa0',marginBottom:'3px'}}>Manual · Almost Certain · 18 · Strong Yes</div>
                <div style={{fontSize:'9px',color:'#7ab3cc',fontStyle:'italic'}}>"Does the old woman know more?"</div>
              </div>
            </div>

            <div className="srp-t">Move Reference</div>
            <div className="move-ref">
              <div className="mr-head">
                <div className="mr-name">Gather Information</div>
                <div className="mr-stat">+Wits</div>
              </div>
              <div className="mr-body">
                <div className="mo-row"><div className="mo-label sh">Strong Hit</div><div className="mo-text">You discover something helpful. Take +2 momentum.</div></div>
                <div className="mo-row"><div className="mo-label wh">Weak Hit</div><div className="mo-text">You find what you need but complicate things.</div></div>
                <div className="mo-row"><div className="mo-label ms">Miss</div><div className="mo-text">Your investigation reveals nothing useful. Pay the price.</div></div>
              </div>
            </div>

            <div className="srp-t">Tracked Vow</div>
            <div className="vow-mini">
              <div className="vm-title">"Find the lost runestone of Valdris"</div>
              <div className="vm-rank">Dangerous · 6/10</div>
              <div className="vm-prog">
                <div className="vpb on"></div><div className="vpb on"></div><div className="vpb on"></div><div className="vpb on"></div><div className="vpb on"></div>
                <div className="vpb on"></div><div className="vpb"></div><div className="vpb"></div><div className="vpb"></div><div className="vpb"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
