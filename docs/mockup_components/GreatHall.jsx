import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  .gh{background:#0d0b08;border-radius:12px;overflow:hidden;font-family:'Cinzel',Georgia,serif;color:#c4a96e;min-height:880px;}
  /* topbar */
  .gh-tb{background:#13100d;border-bottom:1px solid #2a241c;display:flex;align-items:center;justify-content:space-between;padding:12px 28px;}
  .gh-logo{display:flex;align-items:center;gap:12px;}
  .gh-lt{font-family:'Cinzel Decorative',serif;font-size:17px;color:#f0b429;letter-spacing:2px;}
  .gh-ls{font-size:9px;color:#5f5447;letter-spacing:3px;text-transform:uppercase;}
  .gh-user{display:flex;align-items:center;gap:10px;}
  .gh-avatar{width:32px;height:32px;border-radius:50%;background:#1e1710;border:1px solid rgba(212,148,26,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;}
  .gh-uname{font-size:10px;letter-spacing:2px;color:#7a6a52;text-transform:uppercase;}
  /* hero band */
  .gh-hero{padding:36px 28px 28px;border-bottom:1px solid #1e1710;position:relative;overflow:hidden;}
  .gh-hero::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#d4941a 30%,#8b1a1a 60%,#d4941a 80%,transparent);}
  .gh-hero::after{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:60%;height:1px;background:linear-gradient(90deg,transparent,rgba(212,148,26,0.2),transparent);}
  .gh-hero-inner{max-width:520px;}
  .gh-greeting{font-size:9px;letter-spacing:5px;color:#5f5447;text-transform:uppercase;margin-bottom:8px;}
  .gh-headline{font-family:'Cinzel Decorative',serif;font-size:28px;color:#f0b429;letter-spacing:1px;line-height:1.2;margin-bottom:10px;}
  .gh-sub{font-size:12px;color:#7a6a52;font-style:italic;line-height:1.7;}
  .gh-hero-rune{position:absolute;right:28px;top:50%;transform:translateY(-50%);opacity:0.06;font-family:'Cinzel Decorative',serif;font-size:120px;color:#d4941a;pointer-events:none;line-height:1;}
  /* stats bar */
  .gh-statsbar{display:flex;gap:0;border-bottom:1px solid #1e1710;}
  .gh-stat{flex:1;padding:14px 20px;border-right:1px solid #1e1710;text-align:center;}
  .gh-stat:last-child{border-right:none;}
  .gh-stat-val{font-family:'Cinzel Decorative',serif;font-size:22px;color:#d4941a;line-height:1;margin-bottom:3px;}
  .gh-stat-label{font-size:8px;letter-spacing:3px;color:#3d3428;text-transform:uppercase;}
  /* body */
  .gh-body{padding:24px 28px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;}
  /* section heading */
  .gh-sh{font-size:8px;letter-spacing:5px;color:#5f5447;text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:10px;}
  .gh-sh::before{content:'⟡';color:#d4941a;font-size:10px;}
  .gh-sh-after{flex:1;height:1px;background:linear-gradient(90deg,rgba(212,148,26,0.15),transparent);}
  /* campaign card */
  .camp-col{grid-column:1 / 3;}
  .camp-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .camp-card{background:#13100d;border:1px solid #2a241c;border-radius:4px;overflow:hidden;position:relative;cursor:default;transition:border-color 0.2s;}
  .camp-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
  .camp-card.active-camp::before{background:linear-gradient(90deg,transparent,#d4941a 40%,transparent);}
  .camp-card.complete-camp::before{background:linear-gradient(90deg,transparent,rgba(122,179,204,0.5) 40%,transparent);}
  .camp-card.abandoned-camp::before{background:linear-gradient(90deg,transparent,rgba(60,50,40,0.5) 40%,transparent);}
  .camp-card-inner{padding:14px 16px;}
  .camp-status-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
  .camp-status{font-size:7px;letter-spacing:3px;text-transform:uppercase;padding:2px 8px;border-radius:2px;}
  .camp-status.active{background:rgba(212,148,26,0.1);border:1px solid rgba(212,148,26,0.3);color:#d4941a;}
  .camp-status.complete{background:rgba(122,179,204,0.08);border:1px solid rgba(122,179,204,0.25);color:#7ab3cc;}
  .camp-status.abandoned{background:rgba(60,50,40,0.3);border:1px solid rgba(80,65,50,0.4);color:#5f5447;}
  .camp-last{font-size:8px;color:#2a241c;letter-spacing:1px;}
  .camp-name{font-family:'Cinzel Decorative',serif;font-size:15px;color:#f0b429;margin-bottom:4px;line-height:1.2;}
  .camp-name.dim{color:#5f5447;}
  .camp-tagline{font-size:10px;color:#7a6a52;font-style:italic;margin-bottom:12px;line-height:1.5;}
  .camp-tagline.dim{color:#3d3428;}
  /* characters inside campaign card */
  .camp-chars{display:flex;gap:8px;margin-bottom:12px;}
  .camp-char{display:flex;align-items:center;gap:6px;background:#0f0d0a;border:1px solid #1e1710;border-radius:3px;padding:5px 8px;flex:1;}
  .camp-char-icon{font-size:14px;}
  .camp-char-info{}
  .camp-char-name{font-size:9px;color:#c4a96e;letter-spacing:1px;}
  .camp-char-rank{font-size:7px;color:#5f5447;letter-spacing:1px;text-transform:uppercase;}
  .camp-char-bars{display:flex;gap:3px;margin-top:3px;}
  .ccbar{height:3px;border-radius:1px;flex:1;}
  .ccbar.hp{background:#8b1a1a;}
  .ccbar.sp{background:#4a7a8a;}
  .ccbar.mo{background:#5a8fa0;}
  /* vow mini in card */
  .camp-vow{background:#0a0806;border:1px solid rgba(139,26,26,0.15);border-radius:2px;padding:6px 8px;margin-bottom:10px;}
  .camp-vow-text{font-size:9px;color:#7a6a52;font-style:italic;margin-bottom:4px;line-height:1.4;}
  .camp-vow-prog{display:flex;gap:2px;}
  .cvpb{flex:1;height:5px;border-radius:1px;background:rgba(0,0,0,0.3);border:1px solid rgba(139,26,26,0.15);}
  .cvpb.on{background:rgba(139,26,26,0.5);border-color:rgba(192,57,43,0.3);}
  /* continue btn */
  .camp-footer{padding:10px 16px;border-top:1px solid #1e1710;display:flex;gap:6px;}
  .camp-btn{flex:1;text-align:center;padding:7px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:2px;text-transform:uppercase;border-radius:3px;}
  .camp-btn.continue{background:linear-gradient(135deg,rgba(139,26,26,0.7),rgba(192,57,43,0.5));border:1px solid rgba(192,57,43,0.4);color:#c4a96e;}
  .camp-btn.view{background:#1e1710;border:1px solid #2a241c;color:#5f5447;}
  /* new campaign card */
  .new-camp-card{background:transparent;border:1px dashed #2a241c;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:32px 16px;cursor:default;min-height:180px;}
  .new-camp-icon{width:40px;height:40px;border-radius:50%;border:1px solid rgba(212,148,26,0.25);display:flex;align-items:center;justify-content:center;font-size:18px;color:#3d3428;}
  .new-camp-label{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#3d3428;}
  .new-camp-sub{font-size:9px;color:#2a241c;font-style:italic;text-align:center;line-height:1.5;}
  /* right column */
  .right-col{display:flex;flex-direction:column;gap:14px;}
  /* recent activity */
  .activity-feed{display:flex;flex-direction:column;gap:0;}
  .act-item{padding:9px 0;border-bottom:1px solid #1e1710;display:flex;gap:10px;align-items:flex-start;}
  .act-dot{width:6px;height:6px;border-radius:50%;margin-top:4px;flex-shrink:0;}
  .act-dot.gold{background:#d4941a;}
  .act-dot.blue{background:#7ab3cc;}
  .act-dot.red{background:#c0392b;}
  .act-dot.dim{background:#2a241c;}
  .act-body{}
  .act-title{font-size:10px;color:#7a6a52;line-height:1.4;margin-bottom:2px;}
  .act-meta{font-size:8px;color:#2a241c;letter-spacing:1px;}
  /* tips */
  .tip-card{background:#13100d;border:1px solid #1e1710;border-radius:3px;padding:10px 12px;}
  .tip-label{font-size:7px;letter-spacing:3px;color:#3d3428;text-transform:uppercase;margin-bottom:5px;}
  .tip-text{font-size:9px;color:#5f5447;font-style:italic;line-height:1.6;}
`;

export default function GreatHall() {
  return (
    <>
      <style>{styles}</style>
      <div className="gh">
        {/* Topbar */}
        <div className="gh-tb">
          <div className="gh-logo">
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <polygon points="17,2 32,32 2,32" stroke="#d4941a" strokeWidth="1.2" fill="none" opacity="0.6"/>
              <line x1="17" y1="2" x2="17" y2="32" stroke="#d4941a" strokeWidth="0.8"/>
              <line x1="10" y1="16" x2="24" y2="16" stroke="#d4941a" strokeWidth="0.8" opacity="0.7"/>
              <circle cx="17" cy="17" r="2.5" fill="#f0b429" opacity="0.7"/>
            </svg>
            <div>
              <div className="gh-lt">Saga Keeper</div>
              <div className="gh-ls">Ironsworn Companion</div>
            </div>
          </div>
          <div className="gh-user">
            <div className="gh-uname">Eirik Halvdansson</div>
            <div className="gh-avatar">🛡</div>
          </div>
        </div>

        {/* Hero */}
        <div className="gh-hero">
          <div className="gh-hero-rune">ᚺ</div>
          <div className="gh-hero-inner">
            <div className="gh-greeting">Welcome back, Skald</div>
            <div className="gh-headline">The Great Hall</div>
            <div className="gh-sub">Your sagas endure here. Choose a campaign to continue your oath — or forge a new one from blood and iron.</div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="gh-statsbar">
          <div className="gh-stat"><div className="gh-stat-val">3</div><div className="gh-stat-label">Campaigns</div></div>
          <div className="gh-stat"><div className="gh-stat-val">4</div><div className="gh-stat-label">Characters</div></div>
          <div className="gh-stat"><div className="gh-stat-val">12</div><div className="gh-stat-label">Vows Sworn</div></div>
          <div className="gh-stat"><div className="gh-stat-val">7</div><div className="gh-stat-label">Vows Fulfilled</div></div>
          <div className="gh-stat"><div className="gh-stat-val">34</div><div className="gh-stat-label">Sessions Played</div></div>
        </div>

        {/* Body */}
        <div className="gh-body">
          {/* Campaigns column (spans 2) */}
          <div className="camp-col">
            <div className="gh-sh">Campaigns <div className="gh-sh-after"></div></div>
            <div className="camp-grid">

              {/* Active campaign 1 */}
              <div className="camp-card active-camp">
                <div className="camp-card-inner">
                  <div className="camp-status-row">
                    <div className="camp-status active">Active</div>
                    <div className="camp-last">2 days ago</div>
                  </div>
                  <div className="camp-name">The Ashwood Oath</div>
                  <div className="camp-tagline">"A blood-debt, a buried stone, and a warlord who will not rest."</div>
                  <div className="camp-chars">
                    <div className="camp-char">
                      <div className="camp-char-icon">🪖</div>
                      <div className="camp-char-info">
                        <div className="camp-char-name">Björn Ashclaw</div>
                        <div className="camp-char-rank">Dangerous · Solo</div>
                        <div className="camp-char-bars">
                          <div className="ccbar hp" style={{width:'80%'}}></div>
                          <div className="ccbar sp" style={{width:'60%'}}></div>
                          <div className="ccbar mo" style={{width:'67%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="camp-vow">
                    <div className="camp-vow-text">"Avenge the slaughter of Clan Thornwood"</div>
                    <div className="camp-vow-prog">
                      <div className="cvpb on"></div><div className="cvpb on"></div><div className="cvpb on"></div>
                      <div className="cvpb"></div><div className="cvpb"></div><div className="cvpb"></div><div className="cvpb"></div><div className="cvpb"></div><div className="cvpb"></div><div className="cvpb"></div>
                    </div>
                  </div>
                </div>
                <div className="camp-footer">
                  <div className="camp-btn continue">⚔ Continue Saga</div>
                  <div className="camp-btn view">Details</div>
                </div>
              </div>

              {/* Active campaign 2 — duo */}
              <div className="camp-card active-camp">
                <div className="camp-card-inner">
                  <div className="camp-status-row">
                    <div className="camp-status active">Active · Co-op</div>
                    <div className="camp-last">5 days ago</div>
                  </div>
                  <div className="camp-name">Songs of the Frozen Shore</div>
                  <div className="camp-tagline">"Two wanderers chasing the ghost of a dead god."</div>
                  <div className="camp-chars">
                    <div className="camp-char">
                      <div className="camp-char-icon">🗡</div>
                      <div className="camp-char-info">
                        <div className="camp-char-name">Sigrid Ironfang</div>
                        <div className="camp-char-rank">Seasoned</div>
                        <div className="camp-char-bars">
                          <div className="ccbar hp" style={{width:'100%'}}></div>
                          <div className="ccbar sp" style={{width:'80%'}}></div>
                          <div className="ccbar mo" style={{width:'90%'}}></div>
                        </div>
                      </div>
                    </div>
                    <div className="camp-char">
                      <div className="camp-char-icon">🏹</div>
                      <div className="camp-char-info">
                        <div className="camp-char-name">Leif Nightsong</div>
                        <div className="camp-char-rank">Veteran</div>
                        <div className="camp-char-bars">
                          <div className="ccbar hp" style={{width:'60%'}}></div>
                          <div className="ccbar sp" style={{width:'40%'}}></div>
                          <div className="ccbar mo" style={{width:'55%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="camp-vow">
                    <div className="camp-vow-text">"Uncover the truth of the Drowned God's tomb"</div>
                    <div className="camp-vow-prog">
                      <div className="cvpb on"></div><div className="cvpb on"></div><div className="cvpb on"></div><div className="cvpb on"></div><div className="cvpb on"></div>
                      <div className="cvpb on"></div><div className="cvpb on"></div><div className="cvpb"></div><div className="cvpb"></div><div className="cvpb"></div>
                    </div>
                  </div>
                </div>
                <div className="camp-footer">
                  <div className="camp-btn continue">⚔ Continue Saga</div>
                  <div className="camp-btn view">Details</div>
                </div>
              </div>

              {/* Completed campaign */}
              <div className="camp-card complete-camp">
                <div className="camp-card-inner">
                  <div className="camp-status-row">
                    <div className="camp-status complete">Saga Complete</div>
                    <div className="camp-last">3 months ago</div>
                  </div>
                  <div className="camp-name dim">The Ember Crown</div>
                  <div className="camp-tagline dim">"The debt was paid. The crown returned to ash."</div>
                  <div className="camp-chars">
                    <div className="camp-char" style={{opacity:0.5}}>
                      <div className="camp-char-icon">⚰</div>
                      <div className="camp-char-info">
                        <div className="camp-char-name">Gunnar Coldhand</div>
                        <div className="camp-char-rank">Epic · Retired</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="camp-footer">
                  <div className="camp-btn view" style={{flex:1}}>View Chronicle</div>
                </div>
              </div>

              {/* New campaign card */}
              <div className="new-camp-card">
                <div className="new-camp-icon">+</div>
                <div className="new-camp-label">Forge New Campaign</div>
                <div className="new-camp-sub">Begin a new saga. Name your world, create your character, and swear your first iron vow.</div>
                <div style={{marginTop:'8px',background:'linear-gradient(135deg,rgba(139,26,26,0.6),rgba(192,57,43,0.4))',border:'1px solid rgba(192,57,43,0.35)',borderRadius:'3px',padding:'7px 20px',fontFamily:"'Cinzel Decorative',serif",fontSize:'9px',letterSpacing:'2px',color:'#c4a96e',textAlign:'center'}}>Enter the Forge</div>
              </div>

            </div>
          </div>

          {/* Right column */}
          <div className="right-col">
            <div>
              <div className="gh-sh">Recent Activity <div className="gh-sh-after"></div></div>
              <div className="activity-feed">
                <div className="act-item">
                  <div className="act-dot gold"></div>
                  <div className="act-body">
                    <div className="act-title">Björn compelled Elder Halvard — <em>Weak Hit</em></div>
                    <div className="act-meta">The Ashwood Oath · 2 days ago</div>
                  </div>
                </div>
                <div className="act-item">
                  <div className="act-dot blue"></div>
                  <div className="act-body">
                    <div className="act-title">Vow progress marked — "Find the Runestone of Valdris" 6/10</div>
                    <div className="act-meta">The Ashwood Oath · 2 days ago</div>
                  </div>
                </div>
                <div className="act-item">
                  <div className="act-dot red"></div>
                  <div className="act-body">
                    <div className="act-title">Leif took 2 harm — Wounded debility applied</div>
                    <div className="act-meta">Frozen Shore · 5 days ago</div>
                  </div>
                </div>
                <div className="act-item">
                  <div className="act-dot gold"></div>
                  <div className="act-body">
                    <div className="act-title">Oracle consulted — "Yes, but the truth cuts deeper"</div>
                    <div className="act-meta">The Ashwood Oath · 2 days ago</div>
                  </div>
                </div>
                <div className="act-item">
                  <div className="act-dot blue"></div>
                  <div className="act-body">
                    <div className="act-title">New NPC added — Runa, Halvard's daughter</div>
                    <div className="act-meta">The Ashwood Oath · 2 days ago</div>
                  </div>
                </div>
                <div className="act-item">
                  <div className="act-dot dim"></div>
                  <div className="act-body">
                    <div className="act-title">Session recap generated — "The Elder's Silence"</div>
                    <div className="act-meta">The Ashwood Oath · 2 days ago</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-label">Skald's Reminder</div>
              <div className="tip-text">"Leif Nightsong carries a Wounded debility and Spirit at 2. He may not survive another harsh journey without rest. Consider making camp before pressing north."</div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
