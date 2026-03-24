import { useState } from "react";
import { navigate, PATHS } from "./navigate.js";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  .root{background:#0d0b08;border-radius:12px;overflow:hidden;font-family:'Cinzel',Georgia,serif;color:#c4a96e;min-height:980px;display:flex;flex-direction:column;}

  /* topbar */
  .tb{background:#13100d;border-bottom:1px solid #2a241c;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;flex-shrink:0;}
  .tlogo{display:flex;align-items:center;gap:10px;}
  .tlt{font-family:'Cinzel Decorative',serif;font-size:15px;color:#f0b429;letter-spacing:2px;}
  .tls{font-size:9px;color:#5f5447;letter-spacing:3px;text-transform:uppercase;}
  .tnav{display:flex;gap:2px;}
  .tnb{background:transparent;border:1px solid transparent;color:#7a6a52;padding:5px 12px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;border-radius:3px;cursor:pointer;}
  .tnb.active{border-color:#3d3428;color:#d4941a;background:rgba(212,148,26,0.07);}

  /* mode toggle banner */
  .mode-banner{background:#13100d;border-bottom:1px solid #2a241c;padding:8px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
  .mode-toggle{display:flex;gap:3px;background:#0a0806;border:1px solid #1e1710;border-radius:4px;padding:3px;}
  .mt-btn{padding:5px 16px;border-radius:3px;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#5f5447;border:1px solid transparent;cursor:pointer;}
  .mt-btn.active{background:#1e1710;border-color:rgba(212,148,26,0.25);color:#d4941a;}
  .mode-info{font-size:9px;color:#5f5447;font-style:italic;display:flex;align-items:center;gap:8px;}

  /* presence pills */
  .presence{display:flex;gap:6px;align-items:center;}
  .presence-pill{display:flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;}
  .presence-pill.online{background:rgba(212,148,26,0.08);border:1px solid rgba(212,148,26,0.25);color:#d4941a;}
  .presence-pill.remote-online{background:rgba(122,179,204,0.08);border:1px solid rgba(122,179,204,0.25);color:#7ab3cc;}
  .presence-pill.remote-away{background:rgba(60,52,40,0.3);border:1px solid #2a241c;color:#5f5447;}
  .presence-dot{width:6px;height:6px;border-radius:50%;}
  .presence-dot.gold{background:#d4941a;box-shadow:0 0 5px rgba(212,148,26,0.5);}
  .presence-dot.blue{background:#7ab3cc;box-shadow:0 0 5px rgba(122,179,204,0.4);}
  .presence-dot.dim{background:#3d3428;}

  /* body */
  .body{display:grid;grid-template-columns:200px 1fr 260px;flex:1;min-height:0;}

  /* sidebar */
  .sd{background:#0f0d0a;border-right:1px solid #1e1710;padding:12px 10px;display:flex;flex-direction:column;gap:8px;}
  /* dual char cards */
  .char-card{border:1px solid #2a241c;border-radius:3px;padding:8px 10px;cursor:default;}
  .char-card.me{background:rgba(212,148,26,0.06);border-color:rgba(212,148,26,0.3);}
  .char-card.partner{background:rgba(122,179,204,0.04);border-color:rgba(122,179,204,0.2);}
  .cc-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;}
  .cc-name{font-family:'Cinzel Decorative',serif;font-size:11px;}
  .cc-name.gold{color:#f0b429;}
  .cc-name.blue{color:#a8d4e8;}
  .cc-you{font-size:7px;letter-spacing:2px;text-transform:uppercase;padding:2px 6px;border-radius:2px;}
  .cc-you.me{background:rgba(212,148,26,0.1);border:1px solid rgba(212,148,26,0.25);color:#d4941a;}
  .cc-you.partner{background:rgba(122,179,204,0.08);border:1px solid rgba(122,179,204,0.2);color:#7ab3cc;}
  .cc-rank{font-size:7px;letter-spacing:2px;text-transform:uppercase;color:#5f5447;margin-bottom:6px;}
  .cc-bars{display:flex;flex-direction:column;gap:3px;}
  .cb-row{display:flex;align-items:center;gap:5px;}
  .cb-label{font-size:7px;color:#3d3428;text-transform:uppercase;width:22px;letter-spacing:1px;}
  .cb-track{flex:1;height:5px;background:#1e1710;border-radius:2px;overflow:hidden;}
  .cb-fill{height:100%;border-radius:2px;}
  .cb-num{font-size:7px;color:#3d3428;width:12px;text-align:right;}

  .ssl{font-size:8px;letter-spacing:4px;color:#3d3428;text-transform:uppercase;padding:0 6px;margin-top:4px;}
  .ssi{display:flex;align-items:center;gap:7px;padding:7px 8px;border-radius:3px;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#5f5447;margin-bottom:1px;}
  .ssi.active{color:#d4941a;border:1px solid rgba(212,148,26,0.2);background:rgba(212,148,26,0.06);}

  /* main chat */
  .main{display:flex;flex-direction:column;height:100%;min-height:0;}
  .mh{padding:10px 18px;border-bottom:1px solid #1e1710;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
  .mh-title{font-family:'Cinzel Decorative',serif;font-size:13px;color:#f0b429;letter-spacing:1px;margin-bottom:1px;}
  .mh-sub{font-size:8px;letter-spacing:3px;color:#5f5447;text-transform:uppercase;}
  .mh-ctrls{display:flex;gap:5px;}
  .mh-ctrl{background:#1e1710;border:1px solid #2a241c;border-radius:3px;padding:4px 9px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#7a6a52;}
  .mh-ctrl.lit{border-color:rgba(212,148,26,0.3);color:#d4941a;background:rgba(212,148,26,0.06);}

  /* feed */
  .feed{flex:1;padding:14px 18px;display:flex;flex-direction:column;gap:10px;overflow:hidden;min-height:0;}

  /* messages */
  .msg{display:flex;gap:8px;align-items:flex-start;}
  .msg.right{flex-direction:row-reverse;}
  .mav{width:28px;height:28px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;margin-top:2px;}
  .mav.skald{background:#1e1710;border:1px solid rgba(212,148,26,0.2);}
  .mav.bjorn{background:#1e1710;border:1px solid rgba(212,148,26,0.35);}
  .mav.sigrid{background:#0a1014;border:1px solid rgba(122,179,204,0.35);}
  .mlabel{font-size:7px;letter-spacing:2px;color:#3d3428;text-transform:uppercase;margin-bottom:3px;}
  .mlabel.right{text-align:right;}
  .mlabel .char-tag{padding:1px 5px;border-radius:2px;font-size:7px;letter-spacing:1px;}
  .mlabel .char-tag.bjorn{background:rgba(212,148,26,0.1);color:#d4941a;}
  .mlabel .char-tag.sigrid{background:rgba(122,179,204,0.08);color:#7ab3cc;}
  .mbubble{border-radius:4px;padding:9px 12px;font-size:11px;line-height:1.75;font-style:italic;}
  .mbubble.skald{background:#13100d;border:1px solid #2a241c;border-radius:0 4px 4px;color:#c4a96e;position:relative;}
  .mbubble.skald::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,rgba(212,148,26,0.3),transparent);}
  .mbubble.bjorn{background:#1a140a;border:1px solid rgba(212,148,26,0.15);border-radius:4px 0 4px 4px;color:#c4a96e;}
  .mbubble.sigrid{background:#0a1014;border:1px solid rgba(122,179,204,0.15);border-radius:4px 0 4px 4px;color:#c4a96e;}

  /* move card */
  .move-card{background:#0f0d0a;border-radius:4px;padding:9px 12px;margin:0 36px;display:flex;align-items:center;justify-content:space-between;}
  .move-card.bjorn{border:1px solid rgba(212,148,26,0.2);}
  .move-card.sigrid{border:1px solid rgba(122,179,204,0.18);}
  .mc-name{font-size:9px;letter-spacing:3px;text-transform:uppercase;margin-bottom:2px;}
  .mc-name.bjorn{color:#d4941a;}
  .mc-name.sigrid{color:#7ab3cc;}
  .mc-stat{font-size:7px;letter-spacing:2px;text-transform:uppercase;color:#5f5447;}
  .mc-right{display:flex;gap:4px;align-items:center;}
  .die-s{width:24px;height:24px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:'Cinzel Decorative',serif;font-size:11px;}
  .die-s.act-gold{background:#1e1710;border:1px solid #d4941a;color:#f0b429;}
  .die-s.act-blue{background:#0a1014;border:1px solid #7ab3cc;color:#a8d4e8;}
  .die-s.chal{background:#1e1710;border:1px solid rgba(100,100,120,0.4);color:#7a7a8a;}
  .die-vs{font-size:7px;color:#2a241c;}
  .hit-b{font-size:7px;letter-spacing:1.5px;text-transform:uppercase;padding:2px 6px;border-radius:2px;}
  .hit-b.strong{background:rgba(212,148,26,0.12);border:1px solid rgba(212,148,26,0.35);color:#f0b429;}
  .hit-b.weak{background:rgba(122,179,204,0.08);border:1px solid rgba(122,179,204,0.3);color:#7ab3cc;}
  .hit-b.miss{background:rgba(139,26,26,0.12);border:1px solid rgba(139,26,26,0.35);color:#c0392b;}

  /* oracle auto */
  .oracle-auto{margin:0 0 0 36px;border-radius:3px;border:1px solid rgba(122,179,204,0.15);background:rgba(122,179,204,0.04);padding:7px 11px;display:flex;gap:8px;align-items:center;}
  .oa-label{font-size:7px;letter-spacing:2px;text-transform:uppercase;color:#3a6070;margin-bottom:2px;}
  .oa-val{font-size:9px;color:#5a8fa0;font-style:italic;}
  .oa-roll{font-size:8px;color:#3a6070;margin-left:auto;letter-spacing:1px;}

  /* suggest */
  .suggest{background:rgba(139,26,26,0.05);border-left:2px solid rgba(192,57,43,0.35);border-radius:0 3px 3px 0;padding:7px 12px;margin:0 36px;font-size:10px;color:#7a6a52;font-style:italic;line-height:1.7;}
  .suggest strong{color:#d4941a;font-style:normal;}

  /* REMOTE: pending turn block */
  .turn-wait{margin:4px 36px;background:#0a0806;border:1px solid rgba(122,179,204,0.2);border-radius:3px;padding:9px 12px;display:flex;align-items:center;justify-content:space-between;}
  .tw-left{display:flex;align-items:center;gap:8px;}
  .tw-dot{width:8px;height:8px;border-radius:50%;background:#7ab3cc;flex-shrink:0;}
  .tw-text{font-size:9px;color:#5a8fa0;letter-spacing:1px;font-style:italic;}
  .tw-btn{background:rgba(122,179,204,0.08);border:1px solid rgba(122,179,204,0.25);border-radius:3px;padding:4px 10px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#7ab3cc;}

  /* partner typing */
  .partner-typing{display:flex;gap:8px;align-items:center;margin:0 0 4px;}
  .typing-dots{display:flex;gap:3px;padding:6px 10px;background:#0a1014;border:1px solid rgba(122,179,204,0.15);border-radius:0 4px 4px 4px;}
  .tdot{width:4px;height:4px;border-radius:50%;}
  .tdot.blue{background:#7ab3cc;}
  .tdot.dim{background:#1e2830;}

  /* input area */
  .input-bar{padding:10px 18px 14px;border-top:1px solid #1e1710;flex-shrink:0;}
  .pills-row{display:flex;gap:5px;margin-bottom:7px;flex-wrap:wrap;align-items:center;}
  .pill{background:#1e1710;border:1px solid #2a241c;border-radius:20px;padding:3px 9px;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;color:#5f5447;}
  .pill.hot{border-color:rgba(139,26,26,0.35);color:#c0392b;background:rgba(139,26,26,0.06);}
  .oracle-btn{display:flex;align-items:center;gap:4px;background:rgba(122,179,204,0.06);border:1px solid rgba(122,179,204,0.22);border-radius:20px;padding:3px 10px;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;color:#7ab3cc;margin-left:auto;}
  .input-row{display:flex;gap:7px;align-items:center;}
  .inp{flex:1;border-radius:3px;padding:8px 12px;font-family:'Cinzel',serif;font-size:11px;letter-spacing:1px;}
  .inp.bjorn-inp{background:#13100d;border:1px solid rgba(212,148,26,0.25);color:#c4a96e;}
  .inp.sigrid-inp{background:#0a1014;border:1px solid rgba(122,179,204,0.2);color:#c4a96e;}
  .send-btn{border:1px solid rgba(192,57,43,0.45);border-radius:3px;padding:7px 14px;font-family:'Cinzel Decorative',serif;font-size:9px;letter-spacing:2px;color:#c4a96e;background:linear-gradient(135deg,rgba(139,26,26,0.75),rgba(192,57,43,0.55));}

  /* section labels */
  .section-divider{display:flex;align-items:center;gap:8px;margin:2px 0;}
  .sd-label{font-size:7px;letter-spacing:4px;text-transform:uppercase;color:#2a241c;white-space:nowrap;}
  .sd-line{flex:1;height:1px;background:#1e1710;}

  /* right panel */
  .rp{background:#0a0806;border-left:1px solid #1e1710;padding:12px;display:flex;flex-direction:column;gap:10px;overflow:hidden;}
  .rp-t{font-size:8px;letter-spacing:4px;color:#3d3428;text-transform:uppercase;padding-bottom:7px;border-bottom:1px solid #1e1710;}
  /* dual stat compare */
  .stat-compare{background:#13100d;border:1px solid #1e1710;border-radius:3px;overflow:hidden;}
  .sc-head{display:grid;grid-template-columns:60px 1fr 1fr;padding:5px 8px;border-bottom:1px solid #1e1710;gap:4px;}
  .sc-col{font-size:7px;letter-spacing:2px;text-transform:uppercase;text-align:center;}
  .sc-col.bjorn-col{color:#d4941a;}
  .sc-col.sigrid-col{color:#7ab3cc;}
  .sc-row{display:grid;grid-template-columns:60px 1fr 1fr;padding:4px 8px;border-bottom:1px solid rgba(255,255,255,0.03);gap:4px;align-items:center;}
  .sc-stat{font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#3d3428;}
  .sc-val{font-family:'Cinzel Decorative',serif;font-size:14px;text-align:center;}
  .sc-val.gold{color:#d4941a;}
  .sc-val.blue{color:#7ab3cc;}
  .sc-val.low{color:#8b1a1a;}
  /* shared vow */
  .shared-vow{background:#13100d;border:1px solid rgba(212,148,26,0.15);border-radius:3px;padding:9px;}
  .sv-label{font-size:7px;letter-spacing:3px;text-transform:uppercase;color:#5f5447;margin-bottom:4px;}
  .sv-title{font-size:10px;color:#c4a96e;font-style:italic;margin-bottom:5px;line-height:1.4;}
  .sv-prog{display:flex;gap:2px;margin-bottom:4px;}
  .svpb{flex:1;height:7px;border:1px solid rgba(139,26,26,0.2);border-radius:1px;background:rgba(0,0,0,0.3);}
  .svpb.on{background:rgba(139,26,26,0.5);border-color:rgba(192,57,43,0.4);}
  .sv-contrib{font-size:8px;color:#3d3428;font-style:italic;}
  /* session notes */
  .priv-note{background:#13100d;border-radius:3px;padding:8px 10px;}
  .priv-note.bjorn-note{border:1px solid rgba(212,148,26,0.15);}
  .priv-note.sigrid-note{border:1px solid rgba(122,179,204,0.12);}
  .pn-label{font-size:7px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;}
  .pn-label.gold{color:#5f5447;}
  .pn-label.blue{color:#3a6070;}
  .pn-text{font-size:9px;color:#5f5447;font-style:italic;line-height:1.6;}
`;

export default function SkaldDuoMode() {
  const [mode, setMode] = useState("remote");
  const [activeSidebarItem, setActiveSidebarItem] = useState("session");

  return (
    <>
      <style>{styles}</style>
      <div className="root">
        {/* Topbar */}
        <div className="tb">
          <div className="tlogo">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
              <polygon points="16,2 30,30 2,30" stroke="#d4941a" strokeWidth="1.2" fill="none" opacity="0.6"/>
              <line x1="16" y1="2" x2="16" y2="30" stroke="#d4941a" strokeWidth="0.8"/>
              <line x1="9" y1="15" x2="23" y2="15" stroke="#d4941a" strokeWidth="0.8" opacity="0.7"/>
              <circle cx="16" cy="16" r="2.5" fill="#f0b429" opacity="0.7"/>
            </svg>
            <div>
              <div className="tlt">Saga Keeper</div>
              <div className="tls">Songs of the Frozen Shore · Co-op</div>
            </div>
          </div>
          <div className="tnav">
            <div className="tnb" onClick={() => navigate(PATHS.ironSheet)}>Iron Sheet</div>
            <div className="tnb" onClick={() => navigate(PATHS.theOracle)}>The Oracle</div>
            <div className="tnb active">The Skald</div>
            <div className="tnb" onClick={() => navigate(PATHS.worldForge)}>World Forge</div>
          </div>
        </div>

        {/* Mode banner */}
        <div className="mode-banner">
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <div className="mode-toggle">
              <div className={`mt-btn ${mode === "same" ? "active" : ""}`} onClick={() => setMode("same")}>Same PC</div>
              <div className={`mt-btn ${mode === "remote" ? "active" : ""}`} onClick={() => setMode("remote")}>Remote</div>
            </div>
            <div className="mode-info">
              Campaign link: <span style={{color:'#3d3428',fontFamily:'monospace',fontSize:'9px',background:'#0a0806',padding:'2px 7px',borderRadius:'2px',border:'1px solid #1e1710'}}>saga.app/frozen-shore</span>
              <span style={{color:'#2a241c'}}>· Copy</span>
            </div>
          </div>
          <div className="presence">
            <div className="presence-pill online"><div className="presence-dot gold"></div>Björn · You</div>
            <div className="presence-pill remote-online"><div className="presence-dot blue"></div>Sigrid · Online</div>
          </div>
        </div>

        <div className="body">
          {/* Sidebar */}
          <div className="sd">
            <div className="char-card me">
              <div className="cc-top">
                <div className="cc-name gold">Björn</div>
                <div className="cc-you me">You</div>
              </div>
              <div className="cc-rank">Dangerous · Warden</div>
              <div className="cc-bars">
                <div className="cb-row"><div className="cb-label">HP</div><div className="cb-track"><div className="cb-fill" style={{background:'#8b1a1a',width:'80%'}}></div></div><div className="cb-num">4</div></div>
                <div className="cb-row"><div className="cb-label">SP</div><div className="cb-track"><div className="cb-fill" style={{background:'#4a7a8a',width:'60%'}}></div></div><div className="cb-num">3</div></div>
                <div className="cb-row"><div className="cb-label">MO</div><div className="cb-track"><div className="cb-fill" style={{background:'#5a8fa0',width:'67%'}}></div></div><div className="cb-num">+2</div></div>
              </div>
            </div>
            <div className="char-card partner">
              <div className="cc-top">
                <div className="cc-name blue">Sigrid</div>
                <div className="cc-you partner">Partner</div>
              </div>
              <div className="cc-rank">Seasoned · Shield-maiden</div>
              <div className="cc-bars">
                <div className="cb-row"><div className="cb-label">HP</div><div className="cb-track"><div className="cb-fill" style={{background:'#8b5a1a',width:'100%'}}></div></div><div className="cb-num">5</div></div>
                <div className="cb-row"><div className="cb-label">SP</div><div className="cb-track"><div className="cb-fill" style={{background:'#4a7a8a',width:'80%'}}></div></div><div className="cb-num">4</div></div>
                <div className="cb-row"><div className="cb-label">MO</div><div className="cb-track"><div className="cb-fill" style={{background:'#5a8fa0',width:'40%'}}></div></div><div className="cb-num">+0</div></div>
              </div>
            </div>
            <div className="ssl">Sessions</div>
            <div className={`ssi ${activeSidebarItem === "session" ? "active" : ""}`} onClick={() => setActiveSidebarItem("session")}>🔥 Current Session</div>
            <div className={`ssi ${activeSidebarItem === "drowned" ? "active" : ""}`} onClick={() => setActiveSidebarItem("drowned")}>📜 The Drowned Shore</div>
            <div className={`ssi ${activeSidebarItem === "ice" ? "active" : ""}`} onClick={() => setActiveSidebarItem("ice")}>📜 Ice and Ashes</div>
            <div className="ssl">Shared World</div>
            <div className={`ssi ${activeSidebarItem === "npcs" ? "active" : ""}`} onClick={() => setActiveSidebarItem("npcs")}>👥 NPCs</div>
            <div className={`ssi ${activeSidebarItem === "places" ? "active" : ""}`} onClick={() => setActiveSidebarItem("places")}>🗺 Places</div>
            <div className={`ssi ${activeSidebarItem === "recap" ? "active" : ""}`} onClick={() => setActiveSidebarItem("recap")}>📖 Recap</div>
          </div>

          {/* Chat */}
          <div className="main">
            <div className="mh">
              <div>
                <div className="mh-title">The Skald · Remote Co-op</div>
                <div className="mh-sub">Shared feed · Both players see all actions in real time</div>
              </div>
              <div className="mh-ctrls">
                <div className="mh-ctrl lit">⚔ Auto-Roll</div>
                <div className="mh-ctrl lit">✦ Auto-Oracle</div>
                <div className="mh-ctrl">⚙ Tone</div>
                <div className="mh-ctrl">🔗 Sync</div>
              </div>
            </div>

            <div className="feed">
              {/* Skald sets scene */}
              <div className="msg">
                <div className="mav skald">🪶</div>
                <div style={{flex:1}}>
                  <div className="mlabel">The Skald · Scene</div>
                  <div className="mbubble skald">The tomb entrance yawns before you — a maw of black stone carved with the sigil of the Drowned God. Water seeps between the flagstones. Somewhere below, something shifts in the dark. You have found it. But so, it seems, has someone else: fresh torch marks score the outer arch.</div>
                </div>
              </div>

              {/* Björn acts */}
              <div className="msg right">
                <div className="mav bjorn">🪖</div>
                <div style={{flex:1}}>
                  <div className="mlabel right"><span className="char-tag bjorn">Björn</span></div>
                  <div className="mbubble bjorn">I draw my blade and hold a fist up — signal to stop. I scan the torch marks. How fresh are they? Someone could still be inside.</div>
                </div>
              </div>

              {/* Auto oracle */}
              <div className="oracle-auto">
                <div style={{fontSize:'12px'}}>✦</div>
                <div>
                  <div className="oa-label">Skald consulted oracle · Scout Ahead</div>
                  <div className="oa-val">Are intruders still inside? · Likely · d100 → 23 · Yes</div>
                </div>
                <div className="oa-roll">Strong Yes</div>
              </div>

              {/* Move card — Björn */}
              <div className="move-card bjorn">
                <div><div className="mc-name bjorn">Secure an Advantage</div><div className="mc-stat">Björn · Wits (2) · Roll: 2+2=4</div></div>
                <div className="mc-right">
                  <div className="die-s act-gold">4</div>
                  <div className="die-vs">vs</div>
                  <div className="die-s chal">3</div>
                  <div className="die-s chal">8</div>
                  <div className="hit-b weak">Weak Hit</div>
                </div>
              </div>

              {/* Skald narrates */}
              <div className="msg">
                <div className="mav skald">🪶</div>
                <div style={{flex:1}}>
                  <div className="mlabel">The Skald · Weak Hit</div>
                  <div className="mbubble skald">The marks are hours old, not days. Whoever entered is still within — or never left. You catch movement in the dark below. At least two torches, moving slowly upward. <em>Take +1 momentum, but they have also spotted your light.</em></div>
                </div>
              </div>

              {/* Section divider */}
              <div className="section-divider"><div className="sd-line"></div><div className="sd-label">Sigrid acts</div><div className="sd-line"></div></div>

              {/* Sigrid acts */}
              <div className="msg right">
                <div className="mav sigrid">🛡</div>
                <div style={{flex:1}}>
                  <div className="mlabel right"><span className="char-tag sigrid">Sigrid</span></div>
                  <div className="mbubble sigrid">I move to the left side of the arch and flatten against the stone. Shield raised. Whatever comes up, we meet it here — not inside where they know the ground.</div>
                </div>
              </div>

              {/* Move card — Sigrid */}
              <div className="move-card sigrid">
                <div><div className="mc-name sigrid">Enter the Fray</div><div className="mc-stat">Sigrid · Heart (3) · Roll: 5+3=8</div></div>
                <div className="mc-right">
                  <div className="die-s act-blue">8</div>
                  <div className="die-vs">vs</div>
                  <div className="die-s chal">5</div>
                  <div className="die-s chal">3</div>
                  <div className="hit-b strong">Strong Hit</div>
                </div>
              </div>

              {/* Skald narrates Sigrid hit */}
              <div className="msg">
                <div className="mav skald">🪶</div>
                <div style={{flex:1}}>
                  <div className="mlabel">The Skald · Strong Hit</div>
                  <div className="mbubble skald">Sigrid's read of the ground is perfect. As the first raider crests the steps, she is already in position — shield-rim to throat, momentum entirely yours. <em>You have initiative. Choose your next move.</em></div>
                </div>
              </div>

              {/* Suggest */}
              <div className="suggest">The Skald suggests: <strong>Strike</strong> now while you hold initiative — or <strong>Compel</strong> to find out who sent these raiders before blades are drawn.</div>

              {/* Partner typing */}
              <div className="partner-typing">
                <div className="mav sigrid">🛡</div>
                <div className="typing-dots">
                  <div className="tdot blue"></div><div className="tdot blue"></div><div className="tdot dim"></div>
                </div>
                <div style={{fontSize:'8px',color:'#3a6070',letterSpacing:'1px',marginLeft:'2px'}}>Sigrid is responding...</div>
              </div>

              {/* Turn wait block */}
              <div className="turn-wait">
                <div className="tw-left">
                  <div className="tw-dot"></div>
                  <div className="tw-text">Waiting for Sigrid to confirm action before Skald advances the scene</div>
                </div>
                <div className="tw-btn">Act Now</div>
              </div>
            </div>

            {/* Input bar */}
            <div className="input-bar">
              <div className="pills-row">
                <div className="pill hot">Strike</div>
                <div className="pill hot">Clash</div>
                <div className="pill">Compel</div>
                <div className="pill">Aid your Ally</div>
                <div className="pill">Endure Harm</div>
                <div className="oracle-btn">✦ Oracle</div>
              </div>
              {/* Same PC switcher */}
              <div style={{background:'#13100d',border:'1px solid rgba(212,148,26,0.15)',borderRadius:'3px',padding:'5px 10px',marginBottom:'7px',display:'flex',alignItems:'center',gap:'8px'}}>
                <div style={{fontSize:'7px',letterSpacing:'3px',textTransform:'uppercase',color:'#3d3428'}}>Same PC Mode:</div>
                <div style={{display:'flex',gap:'4px',flex:1}}>
                  <div style={{flex:1,display:'flex',alignItems:'center',gap:'6px',padding:'5px 8px',borderRadius:'3px',border:'1px solid rgba(212,148,26,0.4)',background:'rgba(212,148,26,0.08)'}}>
                    <span style={{fontSize:'12px'}}>🪖</span>
                    <div><div style={{fontSize:'8px',letterSpacing:'1px',textTransform:'uppercase',color:'#d4941a'}}>Björn</div><div style={{fontSize:'7px',color:'#3d3428'}}>Active</div></div>
                  </div>
                  <div style={{flex:1,display:'flex',alignItems:'center',gap:'6px',padding:'5px 8px',borderRadius:'3px',border:'1px solid #1e1710',background:'#0f0d0a',opacity:0.6}}>
                    <span style={{fontSize:'12px'}}>🛡</span>
                    <div><div style={{fontSize:'8px',letterSpacing:'1px',textTransform:'uppercase',color:'#5f5447'}}>Sigrid</div><div style={{fontSize:'7px',color:'#2a241c'}}>Tap to switch</div></div>
                  </div>
                </div>
                <div style={{fontSize:'8px',color:'#3d3428',fontStyle:'italic'}}>Hidden in Remote mode</div>
              </div>
              <div className="input-row">
                <div className="inp bjorn-inp">I call out to them — drop your torches and speak your master's name...</div>
                <div className="send-btn">⚔ Speak</div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="rp">
            <div className="rp-t">Party Stats</div>
            <div className="stat-compare">
              <div className="sc-head">
                <div className="sc-col" style={{textAlign:'left',color:'#5f5447'}}>Stat</div>
                <div className="sc-col bjorn-col">Björn</div>
                <div className="sc-col sigrid-col">Sigrid</div>
              </div>
              <div className="sc-row"><div className="sc-stat">Health</div><div className="sc-val gold">4</div><div className="sc-val blue">5</div></div>
              <div className="sc-row"><div className="sc-stat">Spirit</div><div className="sc-val gold">3</div><div className="sc-val blue">4</div></div>
              <div className="sc-row"><div className="sc-stat">Supply</div><div className="sc-val gold">2</div><div className="sc-val blue">2</div></div>
              <div className="sc-row"><div className="sc-stat">Momentum</div><div className="sc-val gold">+2</div><div className="sc-val blue">+0</div></div>
              <div className="sc-row"><div className="sc-stat">Iron</div><div className="sc-val gold">2</div><div className="sc-val blue">3</div></div>
              <div className="sc-row"><div className="sc-stat">Heart</div><div className="sc-val gold">3</div><div className="sc-val blue">3</div></div>
            </div>

            <div className="rp-t">Shared Vow</div>
            <div className="shared-vow">
              <div className="sv-label">Epic · Shared Oath</div>
              <div className="sv-title">"Uncover the truth of the Drowned God's tomb"</div>
              <div className="sv-prog">
                <div className="svpb on"></div><div className="svpb on"></div><div className="svpb on"></div><div className="svpb on"></div><div className="svpb on"></div>
                <div className="svpb on"></div><div className="svpb on"></div><div className="svpb on"></div><div className="svpb"></div><div className="svpb"></div>
              </div>
              <div className="sv-contrib">Björn +3 · Sigrid +5 progress marked</div>
            </div>

            <div className="rp-t">Private Notes</div>
            <div className="priv-note bjorn-note">
              <div className="pn-label gold">Björn's eyes only</div>
              <div className="pn-text">I recognise the raider's clan-mark. These are Kaer's men — but Sigrid doesn't know I crossed them before. Do I tell her?</div>
            </div>
            <div className="priv-note sigrid-note">
              <div className="pn-label blue">Sigrid's eyes only</div>
              <div className="pn-text">Hidden from your view — only Sigrid's player can see this note on their device.</div>
            </div>

            <div style={{background:'rgba(139,26,26,0.06)',border:'1px solid rgba(139,26,26,0.18)',borderRadius:'3px',padding:'9px'}}>
              <div style={{fontSize:'7px',letterSpacing:'3px',textTransform:'uppercase',color:'#5f5447',marginBottom:'4px'}}>Skald's Warning</div>
              <div style={{fontSize:'9px',color:'#7a6a52',fontStyle:'italic',lineHeight:'1.6'}}>Supply is at 2 for both characters. A prolonged fight or failed journey could leave the party desperate before reaching the tomb's heart.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
