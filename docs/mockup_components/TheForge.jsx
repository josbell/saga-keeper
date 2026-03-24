import { useState } from "react";
import { navigate, PATHS } from "./navigate.js";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  .fw{background:#0d0b08;border-radius:12px;overflow:hidden;font-family:'Cinzel',Georgia,serif;color:#c4a96e;min-height:900px;display:grid;grid-template-rows:47px 1fr;}
  /* topbar */
  .ftb{background:#13100d;border-bottom:1px solid #2a241c;display:flex;align-items:center;justify-content:space-between;padding:10px 24px;}
  .flogo{display:flex;align-items:center;gap:10px;}
  .flt{font-family:'Cinzel Decorative',serif;font-size:15px;color:#f0b429;letter-spacing:2px;}
  .fls{font-size:9px;color:#5f5447;letter-spacing:3px;text-transform:uppercase;}
  .fback{background:transparent;border:1px solid #2a241c;border-radius:3px;padding:5px 12px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#5f5447;cursor:pointer;}
  /* layout */
  .fb{display:grid;grid-template-columns:220px 1fr;height:100%;}
  /* step sidebar */
  .fsteps{background:#0f0d0a;border-right:1px solid #1e1710;padding:24px 14px;}
  .fsteps-title{font-size:8px;letter-spacing:5px;color:#3d3428;text-transform:uppercase;margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid #1e1710;}
  .fstep{display:flex;align-items:flex-start;gap:12px;padding:10px 8px;border-radius:3px;margin-bottom:4px;border:1px solid transparent;}
  .fstep.done{opacity:0.6;}
  .fstep.current{background:rgba(212,148,26,0.07);border-color:rgba(212,148,26,0.2);}
  .fstep.locked{opacity:0.3;}
  .fstep-num{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-family:'Cinzel Decorative',serif;flex-shrink:0;margin-top:1px;}
  .fstep-num.done{background:#2a241c;border:1px solid #3d3428;color:#5f5447;}
  .fstep-num.current{background:rgba(212,148,26,0.15);border:1px solid rgba(212,148,26,0.5);color:#f0b429;}
  .fstep-num.locked{background:#13100d;border:1px solid #1e1710;color:#2a241c;}
  .fstep-check{color:#d4941a;font-size:12px;}
  .fstep-info{}
  .fstep-name{font-size:10px;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;}
  .fstep.done .fstep-name{color:#5f5447;}
  .fstep.current .fstep-name{color:#d4941a;}
  .fstep.locked .fstep-name{color:#2a241c;}
  .fstep-sub{font-size:8px;color:#3d3428;font-style:italic;}
  .fstep.current .fstep-sub{color:#5f5447;}
  /* progress line */
  .fstep-connector{width:1px;height:10px;background:#1e1710;margin:0 auto 4px;margin-left:18px;}
  /* main area */
  .fm{padding:28px 32px;overflow:hidden;}
  .fm-breadcrumb{font-size:8px;letter-spacing:4px;color:#3d3428;text-transform:uppercase;margin-bottom:6px;}
  .fm-title{font-family:'Cinzel Decorative',serif;font-size:24px;color:#f0b429;margin-bottom:6px;letter-spacing:1px;}
  .fm-sub{font-size:11px;color:#7a6a52;font-style:italic;margin-bottom:24px;line-height:1.6;}
  /* stat assignment area */
  .fm-sh{font-size:8px;letter-spacing:4px;color:#7a6a52;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
  .fm-sh::before{content:'⟡';color:#d4941a;font-size:10px;}
  /* stat grid */
  .stat-assign-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:24px;}
  .stat-slot{background:#13100d;border:1px solid #2a241c;border-radius:4px;padding:14px 10px;text-align:center;position:relative;cursor:pointer;}
  .stat-slot.assigned{border-color:rgba(212,148,26,0.4);background:rgba(212,148,26,0.07);}
  .stat-slot-rune{font-size:18px;color:#5f5447;margin-bottom:4px;}
  .stat-slot.assigned .stat-slot-rune{color:#d4941a;}
  .stat-slot-name{font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#3d3428;margin-bottom:8px;}
  .stat-slot.assigned .stat-slot-name{color:#7a6a52;}
  .stat-slot-val{font-family:'Cinzel Decorative',serif;font-size:28px;color:#f0b429;line-height:1;}
  .stat-slot-empty{font-family:'Cinzel Decorative',serif;font-size:28px;color:#1e1710;line-height:1;}
  .stat-slot-desc{font-size:8px;color:#3d3428;margin-top:4px;font-style:italic;}
  /* point pool */
  .point-pool{display:flex;align-items:center;gap:8px;margin-bottom:20px;background:#13100d;border:1px solid #2a241c;border-radius:3px;padding:10px 16px;}
  .pp-label{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#5f5447;}
  .pp-dots{display:flex;gap:5px;}
  .pp-dot{width:12px;height:12px;border-radius:50%;border:1px solid #3d3428;background:#0f0d0a;}
  .pp-dot.used{background:#d4941a;border-color:#f0b429;}
  .pp-remaining{font-size:11px;color:#d4941a;margin-left:4px;font-family:'Cinzel Decorative',serif;}
  /* available values */
  .avail-vals{display:flex;gap:6px;margin-bottom:24px;}
  .av-chip{width:40px;height:40px;background:#1e1710;border:1px solid #3d3428;border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:'Cinzel Decorative',serif;font-size:18px;color:#7a6a52;cursor:pointer;}
  .av-chip.used{background:#0f0d0a;border-color:#1e1710;color:#1e1710;cursor:default;}
  .av-chip.highlight{border-color:rgba(212,148,26,0.5);color:#f0b429;background:rgba(212,148,26,0.08);}
  /* name + background section */
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;}
  .field-group{}
  .field-label{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#5f5447;margin-bottom:6px;}
  .field-input{background:#13100d;border:1px solid #2a241c;border-radius:3px;padding:10px 14px;font-family:'Cinzel',serif;font-size:13px;color:#c4a96e;letter-spacing:1px;width:100%;}
  .field-input.filled{border-color:rgba(212,148,26,0.3);color:#f0b429;}
  /* background cards */
  .bg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:24px;}
  .bg-card{background:#13100d;border:1px solid #2a241c;border-radius:3px;padding:10px 12px;cursor:pointer;}
  .bg-card.selected{border-color:rgba(212,148,26,0.45);background:rgba(212,148,26,0.07);}
  .bg-card-icon{font-size:18px;margin-bottom:5px;}
  .bg-card-name{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#7a6a52;margin-bottom:3px;}
  .bg-card.selected .bg-card-name{color:#d4941a;}
  .bg-card-desc{font-size:8px;color:#3d3428;font-style:italic;line-height:1.5;}
  .bg-card.selected .bg-card-desc{color:#5f5447;}
  /* vow input */
  .vow-input-wrap{background:rgba(139,26,26,0.07);border:1px solid rgba(139,26,26,0.2);border-radius:4px;padding:16px;margin-bottom:24px;position:relative;overflow:hidden;}
  .vow-input-wrap::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:rgba(192,57,43,0.5);}
  .vow-field-label{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#8b1a1a;margin-bottom:8px;}
  .vow-field{background:rgba(0,0,0,0.2);border:1px solid rgba(139,26,26,0.2);border-radius:3px;padding:10px 14px;font-family:'Cinzel',serif;font-size:12px;color:#c4a96e;font-style:italic;letter-spacing:1px;width:100%;}
  /* footer nav */
  .fm-footer{display:flex;justify-content:space-between;align-items:center;padding-top:20px;border-top:1px solid #1e1710;}
  .fm-prev{background:#1e1710;border:1px solid #2a241c;border-radius:3px;padding:8px 18px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#5f5447;cursor:pointer;}
  .fm-step-indicator{font-size:9px;letter-spacing:3px;color:#3d3428;text-transform:uppercase;}
  .fm-next{background:linear-gradient(135deg,rgba(139,26,26,0.75),rgba(192,57,43,0.55));border:1px solid rgba(192,57,43,0.45);border-radius:3px;padding:9px 22px;font-family:'Cinzel Decorative',serif;font-size:10px;letter-spacing:2px;color:#c4a96e;cursor:pointer;}
`;

const STAT_VALUES = [3, 2, 2, 1, 1];

const STATS = [
  { key: "edge", rune: "ᛖ", name: "Edge", desc: "Speed & ranged" },
  { key: "heart", rune: "ᚺ", name: "Heart", desc: "Courage & bonds" },
  { key: "iron", rune: "ᛁ", name: "Iron", desc: "Strength & combat" },
  { key: "shadow", rune: "ᛊ", name: "Shadow", desc: "Deception & stealth" },
  { key: "wits", rune: "ᚹ", name: "Wits", desc: "Cunning & survival" },
];

// Step 3 is "Assign Stats" — current step
const STEPS = [
  { num: 1, status: "done", name: "Name Your World", sub: "The Ironlands · Iron Age" },
  { num: 2, status: "done", name: "Name & Background", sub: "Björn · Warrior" },
  { num: 3, status: "current", name: "Assign Stats", sub: "Distribute your attributes" },
  { num: 4, status: "locked", name: "Choose Assets", sub: "3 starting assets" },
  { num: 5, status: "locked", name: "Swear Your Vow", sub: "Your first iron oath" },
  { num: 6, status: "locked", name: "Enter the World", sub: "Begin your saga" },
];

export default function TheForge() {
  // stats[key] = assigned value or null
  const [stats, setStats] = useState({ edge: 2, heart: 3, iron: null, shadow: null, wits: null });
  const [selectedValue, setSelectedValue] = useState(2); // currently highlighted chip value

  const assignedValues = Object.values(stats).filter(v => v !== null);
  const usedValues = assignedValues;

  const previewStats = [
    ["Edge", stats.edge],
    ["Heart", stats.heart],
    ["Iron", stats.iron],
    ["Shadow", stats.shadow],
    ["Wits", stats.wits],
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="fw">
        {/* Topbar */}
        <div className="ftb">
          <div className="flogo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <polygon points="16,2 30,30 2,30" stroke="#d4941a" strokeWidth="1.2" fill="none" opacity="0.6"/>
              <line x1="16" y1="2" x2="16" y2="30" stroke="#d4941a" strokeWidth="0.8"/>
              <line x1="9" y1="15" x2="23" y2="15" stroke="#d4941a" strokeWidth="0.8" opacity="0.7"/>
              <circle cx="16" cy="16" r="2.5" fill="#f0b429" opacity="0.7"/>
            </svg>
            <div>
              <div className="flt">Saga Keeper</div>
              <div className="fls">The Forge · Character Creation</div>
            </div>
          </div>
          <div className="fback" onClick={() => navigate(PATHS.greatHall)}>← Back to Great Hall</div>
        </div>

        <div className="fb">
          {/* Steps sidebar */}
          <div className="fsteps">
            <div className="fsteps-title">Creation Ritual</div>

            {STEPS.map((step, i) => (
              <div key={step.num}>
                <div className={`fstep ${step.status}`}>
                  <div className={`fstep-num ${step.status}`}>
                    {step.status === "done" ? <span className="fstep-check">✓</span> : step.num}
                  </div>
                  <div className="fstep-info">
                    <div className="fstep-name">{step.name}</div>
                    <div className="fstep-sub">{step.sub}</div>
                  </div>
                </div>
                {i < STEPS.length - 1 && <div className="fstep-connector"></div>}
              </div>
            ))}

            {/* Preview card */}
            <div style={{marginTop:'24px',background:'#13100d',border:'1px solid #1e1710',borderRadius:'3px',padding:'12px'}}>
              <div style={{fontSize:'7px',letterSpacing:'3px',color:'#3d3428',textTransform:'uppercase',marginBottom:'8px'}}>Character Preview</div>
              <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:'13px',color:'#f0b429',marginBottom:'2px'}}>Björn Ashclaw</div>
              <div style={{fontSize:'8px',color:'#5f5447',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px'}}>Warrior · Ironlands</div>
              <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                {previewStats.map(([label, val]) => (
                  <div key={label} style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:'8px',color:'#3d3428',letterSpacing:'1px',textTransform:'uppercase'}}>{label}</span>
                    <span style={{fontSize:'9px',color: val !== null ? '#d4941a' : '#5f5447',fontFamily:"'Cinzel Decorative',serif"}}>
                      {val !== null ? val : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main step content */}
          <div className="fm">
            <div className="fm-breadcrumb">Step 3 of 6 · The Forge</div>
            <div className="fm-title">Assign Your Stats</div>
            <div className="fm-sub">Distribute the values 3, 2, 2, 1, 1 among your five attributes. These define how you meet every challenge the Ironlands throws at you — choose wisely. They cannot be changed once your vow is sworn.</div>

            {/* Available values */}
            <div className="fm-sh">Available Values</div>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px'}}>
              <div className="avail-vals">
                {STAT_VALUES.map((v, i) => {
                  const used = usedValues.filter(u => u === v).length;
                  const total = STAT_VALUES.filter(sv => sv === v).length;
                  const isUsed = i < used; // simplistic ordering
                  const isHighlight = v === selectedValue && !isUsed;
                  return (
                    <div
                      key={i}
                      className={`av-chip ${isUsed ? "used" : ""} ${isHighlight ? "highlight" : ""}`}
                      onClick={() => !isUsed && setSelectedValue(v)}
                    >{v}</div>
                  );
                })}
              </div>
              <div style={{fontSize:'9px',color:'#3d3428',fontStyle:'italic'}}>← drag or click to assign</div>
            </div>

            {/* Stat slots */}
            <div className="fm-sh">Attributes</div>
            <div className="stat-assign-grid">
              {STATS.map(s => {
                const val = stats[s.key];
                const isAssigned = val !== null;
                const isPending = s.key === "iron" && !isAssigned; // highlight iron slot
                return (
                  <div
                    key={s.key}
                    className={`stat-slot ${isAssigned ? "assigned" : ""}`}
                    style={isPending ? {borderColor:'rgba(212,148,26,0.4)',background:'rgba(212,148,26,0.05)'} : {}}
                    onClick={() => {
                      if (!isAssigned && selectedValue) {
                        setStats(prev => ({...prev, [s.key]: selectedValue}));
                      }
                    }}
                  >
                    <div className="stat-slot-rune" style={isPending ? {color:'#d4941a'} : {}}>{s.rune}</div>
                    <div className="stat-slot-name" style={isPending ? {color:'#7a6a52'} : {}}>{s.name}</div>
                    {isAssigned ? (
                      <div className="stat-slot-val">{val}</div>
                    ) : isPending ? (
                      <div style={{width:'28px',height:'28px',border:'1px dashed rgba(212,148,26,0.4)',borderRadius:'3px',margin:'0 auto 4px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color:'#d4941a'}}>{selectedValue}</div>
                    ) : (
                      <div className="stat-slot-empty">—</div>
                    )}
                    <div className="stat-slot-desc" style={isPending ? {color:'#5f5447'} : {}}>{s.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* AI suggestion */}
            <div style={{background:'rgba(122,179,204,0.05)',border:'1px solid rgba(122,179,204,0.15)',borderRadius:'3px',padding:'10px 14px',marginBottom:'24px',display:'flex',gap:'10px',alignItems:'flex-start'}}>
              <div style={{fontSize:'16px',flexShrink:0}}>🪶</div>
              <div>
                <div style={{fontSize:'8px',letterSpacing:'3px',textTransform:'uppercase',color:'#5a8fa0',marginBottom:'4px'}}>Skald's Counsel</div>
                <div style={{fontSize:'10px',color:'#7a6a52',fontStyle:'italic',lineHeight:'1.6'}}>You chose the Warrior background. Iron is your likely calling — consider placing your highest value there. A warrior who fights with Heart makes for a compelling saga, but one who fights with Iron rarely falls.</div>
              </div>
            </div>

            {/* Footer */}
            <div className="fm-footer">
              <div className="fm-prev">← Back</div>
              <div className="fm-step-indicator">Step 3 of 6</div>
              <div className="fm-next">Choose Assets →</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
