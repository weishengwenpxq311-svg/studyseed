// Three fan-out function cards that emerge from the envelope when opened.

function FunctionCard({ idx, open, hoveredIdx, onHover, onClick, variant }) {
  // closed state: cards stacked tightly inside envelope, invisible
  // open state: fan out — left tilt, center high, right tilt
  const layouts = [
    { x: -260, y: -360, rot: -9,  delay: 0.04 },
    { x:    0, y: -440, rot:  0,  delay: 0.12 },
    { x:  260, y: -360, rot:  9,  delay: 0.20 },
  ];
  const L = layouts[idx];

  const variants = {
    green:  { bg:"var(--green)",  fg:"var(--paper)", sub:"rgba(241,236,224,.78)", btn:"paper" },
    paper:  { bg:"var(--paper)",  fg:"var(--ink)",   sub:"rgba(5,5,5,.6)",        btn:"green" },
    yellow: { bg:"var(--yellow)", fg:"#1a1305",      sub:"rgba(26,19,5,.65)",     btn:"ink" },
  };
  const v = variants[variant];

  const isHover = hoveredIdx === idx;
  const isDimmed = hoveredIdx !== null && hoveredIdx !== idx;

  const baseTransform = open
    ? `translate(-50%, 0) translate(${L.x}px, ${L.y}px) rotate(${L.rot}deg) scale(1)`
    : `translate(-50%, 0) translate(0px, -40px) rotate(0deg) scale(0.6)`;

  const hoverTransform = isHover
    ? `translate(-50%, 0) translate(${L.x}px, ${L.y - 28}px) rotate(${L.rot * 0.4}deg) scale(1.04)`
    : isDimmed
      ? `translate(-50%, 0) translate(${L.x * 1.05}px, ${L.y + 14}px) rotate(${L.rot}deg) scale(.97)`
      : baseTransform;

  return (
    <button
      onMouseEnter={() => onHover(idx)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(idx)}
      aria-label={["进入安排计划","进入学习记录","进入计划时间表"][idx]}
      className={variant === "paper" ? "paper-tex" : ""}
      style={{
        position:"absolute", left:"50%", bottom:"30%",
        width:300, height:380,
        borderRadius:24,
        background:v.bg, color:v.fg,
        transform: open ? hoverTransform : baseTransform,
        opacity: open ? 1 : 0,
        transition:`transform .65s cubic-bezier(.22, 1, .36, 1) ${open ? L.delay : 0}s, opacity .35s ease ${open ? L.delay : 0}s, box-shadow .25s ease`,
        willChange:"transform, opacity",
        boxShadow: isHover
          ? "0 50px 80px -28px rgba(0,0,0,.7), 0 10px 18px -8px rgba(0,0,0,.5)"
          : "0 30px 60px -22px rgba(0,0,0,.6), 0 6px 12px -6px rgba(0,0,0,.4)",
        zIndex: isHover ? 30 : (10 + idx),
        textAlign:"left",
        padding:"26px 26px 22px",
        display:"flex", flexDirection:"column",
        cursor:"pointer",
        border: variant === "paper" ? "1px solid rgba(0,0,0,.06)" : "none",
        overflow:"hidden"
      }}
    >
      {variant === "green" && <GreenCard fg={v.fg} sub={v.sub}/>}
      {variant === "paper" && <PaperCard fg={v.fg} sub={v.sub}/>}
      {variant === "yellow" && <YellowCard fg={v.fg} sub={v.sub}/>}
    </button>
  );
}

/* ---------- card contents ---------- */
function CardLabel({ idx, total, color }) {
  return (
    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"var(--type-mono)", fontSize:11, letterSpacing:".24em", color, textTransform:"uppercase"}}>
      <span>NO. 0{idx}</span>
      <span>{idx}/{total}</span>
    </div>
  );
}

function GreenCard({fg, sub}) {
  return (<>
    <CardLabel idx={1} total={3} color="rgba(241,236,224,.55)"/>
    <div style={{flex:1, display:"flex", flexDirection:"column", justifyContent:"center"}}>
      <div style={{color:fg, marginBottom:18}}>
        <Icon.Calendar size={30}/>
      </div>
      <h3 style={{margin:0, fontSize:36, fontWeight:900, lineHeight:1.08, letterSpacing:".01em"}}>安排<br/>计划</h3>
      <p style={{margin:"14px 0 0", fontSize:13, lineHeight:1.65, color:sub, maxWidth:230}}>
        告诉我你的目标与时间，<br/>为你生成专属学习计划。
      </p>
    </div>
    <CardCTA label="生成学习计划" tone="onGreen"/>
  </>);
}

function PaperCard({fg, sub}) {
  return (<>
    <CardLabel idx={2} total={3} color="rgba(5,5,5,.45)"/>
    <div style={{flex:1, display:"flex", flexDirection:"column", justifyContent:"center", position:"relative"}}>
      <div style={{color:"var(--green)", marginBottom:18}}>
        <Icon.Book size={30}/>
      </div>
      <h3 style={{margin:0, fontSize:36, fontWeight:900, lineHeight:1.08, color:"var(--green)", letterSpacing:".01em"}}>学习<br/>记录</h3>
      <p style={{margin:"14px 0 0", fontSize:13, lineHeight:1.65, color:sub, maxWidth:230}}>
        查看你已经学习过的内容，<br/>回顾每一次完成的计划。
      </p>
    </div>
    <CardCTA label="查看学习记录" tone="onPaper"/>
  </>);
}

function YellowCard({fg, sub}) {
  return (<>
    <CardLabel idx={3} total={3} color="rgba(26,19,5,.55)"/>
    <div style={{flex:1, display:"flex", flexDirection:"column", justifyContent:"center"}}>
      <div style={{color:fg, marginBottom:18}}>
        <Icon.Grid size={30}/>
      </div>
      <h3 style={{margin:0, fontSize:36, fontWeight:900, lineHeight:1.08, letterSpacing:".01em"}}>计划<br/>时间表</h3>
      <p style={{margin:"14px 0 0", fontSize:13, lineHeight:1.65, color:sub, maxWidth:230}}>
        自己安排时间，<br/>也可同步生成好的计划。
      </p>
    </div>
    <CardCTA label="打开时间表" tone="onYellow"/>
  </>);
}

function CardCTA({label, tone}) {
  const styles = {
    onGreen:  { bg:"var(--paper)", fg:"var(--green)" },
    onPaper:  { bg:"var(--green)", fg:"var(--paper)" },
    onYellow: { bg:"#1a1305",      fg:"var(--yellow)" },
  }[tone];
  return (
    <div style={{
      marginTop:18, display:"inline-flex", alignSelf:"flex-start",
      padding:"12px 18px", borderRadius:999,
      background:styles.bg, color:styles.fg,
      fontWeight:700, fontSize:13, letterSpacing:".02em",
      gap:8, alignItems:"center"
    }}>
      {label}
      <Icon.ArrowRight size={16}/>
    </div>
  );
}

Object.assign(window, { FunctionCard });
