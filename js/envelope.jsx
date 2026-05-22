// Envelope — horizontal paper envelope with click-to-open flap animation.
// Props: open (bool), onToggle (fn), compact (bool, for sub-page header)
const { useState } = React;

function Envelope({ open, onToggle, onSealClick, compact=false }) {
  const W = compact ? 280 : 720;       // envelope width
  const H = compact ? 158 : 405;       // envelope height (≈16:9)
  const FLAP_H = H * 0.46;             // height of triangular flap
  const FOLD_OFFSET = compact ? 8 : 18; // how far below top the side-walls start (creates V)

  return (
    <div className="envelope-wrap" style={{
      width:W, height:H, position:"relative",
      perspective:"1800px", perspectiveOrigin:"center 40%",
      filter: open ? "drop-shadow(0 40px 60px rgba(0,0,0,.55))" : "drop-shadow(0 24px 40px rgba(0,0,0,.5))",
      transition:"filter .6s ease"
    }}>

      {/* string-and-tag hand-cut tag, top-left */}
      {!compact && (
        <div style={{
          position:"absolute", top:-22, left:18, zIndex:6, pointerEvents:"none",
          transform: open ? "rotate(-14deg) translateY(-6px)" : "rotate(-8deg)",
          transition:"transform .8s cubic-bezier(.2,.7,.2,1)"
        }}>
          <svg width="92" height="78" viewBox="0 0 92 78" fill="none">
            <path d="M14 4 C 22 14, 30 18, 34 28" stroke="#b9a87a" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="32" cy="32" r="3" fill="#0c0c0c"/>
            <circle cx="32" cy="32" r="6.6" stroke="#0c0c0c" strokeWidth="1.1" fill="none"/>
          </svg>
        </div>
      )}

      {/* back wall of envelope (paper visible inside) */}
      <div className="paper-tex" style={{
        position:"absolute", inset:0, borderRadius: compact?16:28,
        background:"var(--paper)",
        boxShadow:"inset 0 0 0 1px rgba(0,0,0,.06)"
      }}/>

      {/* left + right side-wall triangles (form the inside V) */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position:"absolute", inset:0, zIndex:2, pointerEvents:"none"}}>
        {/* left wall */}
        <path d={`M0 ${FOLD_OFFSET} L${W/2} ${FLAP_H + FOLD_OFFSET*0.2} L0 ${H}`}
              fill="var(--paper-2)" opacity="0.95"/>
        {/* right wall */}
        <path d={`M${W} ${FOLD_OFFSET} L${W/2} ${FLAP_H + FOLD_OFFSET*0.2} L${W} ${H}`}
              fill="var(--paper-2)" opacity="0.95"/>
        {/* center crease line, faint */}
        <path d={`M0 ${FOLD_OFFSET} L${W/2} ${FLAP_H + FOLD_OFFSET*0.2} L${W} ${FOLD_OFFSET}`}
              stroke="rgba(0,0,0,.12)" strokeWidth="1" fill="none"/>
      </svg>

      {/* FRONT POCKET — the lower trapezoid you see closed; sits IN FRONT of cards when open */}
      <div className="paper-tex" style={{
        position:"absolute", left:0, right:0, bottom:0, height: H - 4,
        borderRadius: compact?16:28,
        background:"var(--paper)",
        zIndex:5,
        clipPath: `polygon(0 ${(FOLD_OFFSET/H)*100 + 6}%, 50% ${((FLAP_H+FOLD_OFFSET*0.2)/H)*100}%, 100% ${(FOLD_OFFSET/H)*100 + 6}%, 100% 100%, 0 100%)`,
        boxShadow:"inset 0 -1px 0 rgba(0,0,0,.07)"
      }}>
        {/* seal / smiley + caption visible when closed — also acts as a button to trigger the swipe-carousel mode */}
        {!compact && (
          <div style={{
            position:"absolute", left:"50%", bottom:"22%", transform:"translateX(-50%)",
            display:"flex", flexDirection:"column", alignItems:"center", gap:14,
            opacity: open ? 0 : 1,
            transform: `translateX(-50%) scale(${open ? 0.86 : 1})`,
            transition:"opacity .32s cubic-bezier(.22, 1, .36, 1), transform .32s cubic-bezier(.22, 1, .36, 1)",
            pointerEvents: open ? "none" : "auto",
            zIndex:6,
            willChange:"opacity, transform"
          }}>
            <button
              onClick={(e)=>{ e.stopPropagation(); onSealClick && onSealClick(); }}
              aria-label="打开学习计划"
              className="seal-btn"
              style={{
                width:74, height:74, borderRadius:"50%", background:"var(--green)",
                display:"flex", alignItems:"center", justifyContent:"center", color:"var(--paper)",
                boxShadow:"0 8px 18px -8px rgba(17,124,13,.6)",
                border:"0", padding:0, cursor:"pointer",
                position:"relative",
                transition:"box-shadow .25s ease"
              }}>
              <Icon.Smile size={56}/>
              {/* tiny "tap" ping */}
              <span aria-hidden="true" style={{
                position:"absolute", inset:-6, borderRadius:"50%",
                border:"1.5px solid var(--green)", opacity:.6,
                animation:"sealPing 2.4s ease-out infinite",
                pointerEvents:"none"
              }}/>
              {/* hint bubble */}
              <span style={{
                position:"absolute", top:-30, left:"50%", transform:"translateX(-50%)",
                fontFamily:"var(--type-mono)", fontSize:10, letterSpacing:".18em",
                color:"var(--green)", whiteSpace:"nowrap",
                pointerEvents:"none"
              }}>TAP · 打开计划</span>
            </button>
          </div>
        )}
        <style>{`
          .seal-btn:hover{ box-shadow:0 14px 26px -10px rgba(17,124,13,.8) }
          @keyframes sealPing {
            0%   { transform:scale(.9);  opacity:.55 }
            70%  { transform:scale(1.55); opacity:0 }
            100% { transform:scale(1.55); opacity:0 }
          }
        `}</style>

        {!compact && (
          <div style={{
            position:"absolute", right:24, bottom:18, textAlign:"right",
            opacity: open ? 0 : 1, transition:"opacity .35s ease"
          }}>
            <div className="tag-text" style={{color:"rgba(5,5,5,.45)"}}>NO. 001 · STUDYSEED</div>
            <div style={{
              fontFamily:"var(--type-cn-serif)", fontWeight:900, color:"var(--green)",
              fontSize:18, marginTop:4, letterSpacing:".04em"
            }}>打开你的学习计划 →</div>
          </div>
        )}

        {!compact && (
          <div style={{position:"absolute", left:24, bottom:22, color:"var(--green)"}}>
            <Icon.Triangles size={36}/>
          </div>
        )}
      </div>

      {/* THE FLAP — pivots up from its bottom edge when opened */}
      <div
        onClick={onToggle}
        role="button"
        aria-label={open ? "关闭信封" : "打开信封"}
        style={{
          position:"absolute", left:0, top:0, width:W, height: FLAP_H + FOLD_OFFSET*0.2,
          transformOrigin:"50% 100%",
          transform: open ? "rotateX(178deg)" : "rotateX(0deg)",
          transition:"transform .7s cubic-bezier(.22, 1, .36, 1)",
          transformStyle:"preserve-3d",
          willChange:"transform",
          zIndex:7,
          cursor:"pointer"
        }}>
        {/* OUTER face of flap (visible closed) */}
        <div className="paper-tex" style={{
          position:"absolute", inset:0,
          borderRadius:`${compact?16:28}px ${compact?16:28}px 0 0`,
          background:"var(--paper)",
          backfaceVisibility:"hidden",
          clipPath:`polygon(0 0, 100% 0, 100% ${(FOLD_OFFSET/(FLAP_H+FOLD_OFFSET*0.2))*100}%, 50% 100%, 0 ${(FOLD_OFFSET/(FLAP_H+FOLD_OFFSET*0.2))*100}%)`,
          boxShadow:"inset 0 1px 0 rgba(255,255,255,.6)"
        }}/>
        {/* INNER face (visible when open — slightly darker paper) */}
        <div className="paper-tex" style={{
          position:"absolute", inset:0,
          borderRadius:`${compact?16:28}px ${compact?16:28}px 0 0`,
          background:"var(--paper-2)",
          transform:"rotateX(180deg)",
          backfaceVisibility:"hidden",
          clipPath:`polygon(0 0, 100% 0, 100% ${(FOLD_OFFSET/(FLAP_H+FOLD_OFFSET*0.2))*100}%, 50% 100%, 0 ${(FOLD_OFFSET/(FLAP_H+FOLD_OFFSET*0.2))*100}%)`
        }}/>
      </div>

      {/* tiny hint label, anchored to top edge (only when closed, non-compact) */}
      {!compact && !open && (
        <div className="tag-text" style={{
          position:"absolute", top:18, right:24, color:"rgba(5,5,5,.4)", zIndex:8
        }}>
          CLICK · TO · OPEN
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Envelope });
