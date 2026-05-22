// Sub-page navigation pill — fixed bottom bar with prev/next, dots, and a swipe hint.
// Also exports useSwipeNav hook that wires up touch swipe + arrow keys to switch routes.

const { useEffect: useEffectN, useRef: useRefN, useState: useStateN } = React;

const SUB_PAGES = [
  { key:"planner",   no:"01", label:"安排计划",   accent:"var(--green)"  },
  { key:"records",   no:"02", label:"学习记录",   accent:"var(--paper)"  },
  { key:"timetable", no:"03", label:"计划时间表", accent:"var(--yellow)" },
];

let pageSwitchAudio = null;
function playPageSwitchSound() {
  try {
    if (!pageSwitchAudio) {
      pageSwitchAudio = new Audio("uploads/magazine1.mp3");
      pageSwitchAudio.preload = "auto";
      pageSwitchAudio.volume = 0.45;
    }
    pageSwitchAudio.currentTime = 0;
    pageSwitchAudio.play().catch(() => {});
  } catch {}
}

function navigateWithSound(key, onNavigate) {
  playPageSwitchSound();
  onNavigate(key);
}

function useSwipeNav(idx, onNavigate) {
  useEffectN(() => {
    if (idx < 0) return;
    const next = () => idx < 2 && navigateWithSound(SUB_PAGES[idx+1].key, onNavigate);
    const prev = () => idx > 0 && navigateWithSound(SUB_PAGES[idx-1].key, onNavigate);

    // touch swipe
    let start = null;
    const onTouchStart = (e) => {
      const t = e.touches[0];
      start = { x:t.clientX, y:t.clientY, t:Date.now() };
    };
    const onTouchEnd = (e) => {
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const dt = Date.now() - start.t;
      start = null;
      // require mostly-horizontal motion, > 70px, < 800ms
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.4 && dt < 800) {
        if (dx < 0) next(); else prev();
      }
    };

    // arrow keys
    const onKey = (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("touchstart", onTouchStart, { passive:true });
    window.addEventListener("touchend",   onTouchEnd,   { passive:true });
    window.addEventListener("keydown",    onKey);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("keydown",    onKey);
    };
  }, [idx, onNavigate]);
}

function PageSwitcher({ idx, onNavigate }) {
  const cur  = SUB_PAGES[idx];
  const prev = idx > 0 ? SUB_PAGES[idx-1] : null;
  const next = idx < 2 ? SUB_PAGES[idx+1] : null;

  return (
    <div className="ps-wrap" role="navigation" aria-label="sub-page switcher">
      <style>{`
        .ps-wrap{
          position:fixed; left:50%; bottom:26px; transform:translateX(-50%);
          z-index:8000;
          display:flex; align-items:stretch;
          background:rgba(8,8,8,.86);
          border:1px solid var(--hairline-strong);
          border-radius:999px;
          padding:5px;
          box-shadow:0 28px 60px -22px rgba(0,0,0,.75);
          backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
        }
        .ps-btn{
          display:flex; align-items:center; gap:8px;
          padding:11px 18px; border-radius:999px;
          font-size:13px; font-weight:600;
          color:rgba(241,236,224,.7);
          background:transparent; border:0; cursor:pointer;
          transition:all .2s; max-width:200px;
        }
        .ps-btn:hover{ background:rgba(241,236,224,.07); color:var(--paper) }
        .ps-btn:disabled{ opacity:.28; cursor:not-allowed }
        .ps-btn:disabled:hover{ background:transparent; color:rgba(241,236,224,.7) }
        .ps-btn small{ font-size:10px; letter-spacing:.2em; text-transform:uppercase; opacity:.55; margin-right:4px }
        .ps-center{
          padding:8px 20px; display:flex; align-items:center; gap:14px;
          border-left:1px solid var(--hairline);
          border-right:1px solid var(--hairline);
        }
        .ps-dot{ width:6px; height:6px; border-radius:50%; background:rgba(241,236,224,.22); transition:all .3s; cursor:pointer; border:0; padding:0 }
        .ps-dot.active{ width:22px; height:6px; border-radius:4px; background:var(--paper) }
        .ps-hint{
          position:absolute; left:50%; bottom:calc(100% + 12px); transform:translateX(-50%);
          font-family:var(--type-mono); font-size:11px; letter-spacing:.16em; text-transform:uppercase;
          color:rgba(241,236,224,.5); white-space:nowrap; pointer-events:none;
        }
        .ps-hint b{ color:var(--paper); font-weight:600 }
        .ps-arrow-nudge{ display:inline-block; animation: psNudge 1.8s ease-in-out infinite }
        @keyframes psNudge {
          0%, 100% { transform: translateX(0) }
          50% { transform: translateX(-4px) }
        }
        .ps-arrow-nudge.right{ animation-name: psNudgeR }
        @keyframes psNudgeR {
          0%, 100% { transform: translateX(0) }
          50% { transform: translateX(4px) }
        }
        @media (max-width:760px){
          .ps-btn{ padding:11px 12px; font-size:12px }
          .ps-btn small{ display:none }
          .ps-center{ padding:8px 12px; gap:10px }
        }
      `}</style>

      {/* hint floats above */}
      <PSHintLine idx={idx}/>

      <button className="ps-btn" disabled={!prev}
              onClick={() => prev && navigateWithSound(prev.key, onNavigate)}>
        <Icon.ArrowLeft size={14}/>
        <small>PREV</small>
        <span>{prev ? prev.label : "—"}</span>
      </button>

      <div className="ps-center">
        <span style={{width:8, height:8, borderRadius:"50%", background:cur.accent, flexShrink:0}}/>
        <span style={{fontWeight:700, fontSize:14, color:"var(--paper)"}}>{cur.no} · {cur.label}</span>
        <span style={{display:"flex", gap:5}}>
          {SUB_PAGES.map((p,i) => (
            <button key={i} aria-label={p.label} className={"ps-dot " + (i===idx?"active":"")} onClick={()=>i !== idx && navigateWithSound(p.key, onNavigate)}/>
          ))}
        </span>
      </div>

      <button className="ps-btn" disabled={!next}
              onClick={() => next && navigateWithSound(next.key, onNavigate)}
              style={{flexDirection:"row-reverse"}}>
        <Icon.ArrowRight size={14}/>
        <small style={{marginRight:0, marginLeft:4}}>NEXT</small>
        <span>{next ? next.label : "—"}</span>
      </button>
    </div>
  );
}

function PSHintLine({ idx }) {
  let body;
  if (idx === 0) body = (<><span className="ps-arrow-nudge">←</span> 左滑 · 或按 → 切换到「<b>学习记录</b>」</>);
  else if (idx === 1) body = (<><span className="ps-arrow-nudge">←</span> 继续左滑切换到「<b>计划时间表</b>」 · 右滑回到「<b>安排计划</b>」</>);
  else body = (<>已是最后一张 · <span className="ps-arrow-nudge right">→</span> 右滑回到「<b>学习记录</b>」</>);
  return <div className="ps-hint">{body}</div>;
}

Object.assign(window, { PageSwitcher, useSwipeNav, SUB_PAGES });
