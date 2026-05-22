// Root app — home + 3 sub-pages with swipe / arrow-key navigation between them.

const { useState: useStateA, useRef: useRefA, useEffect: useEffectA } = React;

const ROUTES = ["planner", "records", "timetable"];

function App() {
  const [route, setRoute] = useStateA("home");
  const [toast, setToast] = useStateA(null);
  const prevIdxRef = useRefA(-1);

  const idx = ROUTES.indexOf(route);

  // figure out direction of the latest transition (for slide-in animation)
  const dir = (() => {
    if (idx < 0) return "none";
    const prev = prevIdxRef.current;
    if (prev < 0) return "in";
    if (idx > prev) return "forward";
    if (idx < prev) return "back";
    return "none";
  })();

  useEffectA(() => { prevIdxRef.current = idx; }, [idx]);

  // touch swipe + arrow keys (active when inside a sub-page)
  useSwipeNav(idx, (next) => setRoute(next));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  return (
    <>
      <style>{`
        .page-anim{
          animation: pageIn .5s cubic-bezier(.2,.7,.2,1) both;
        }
        .page-anim[data-dir="forward"]{ animation-name: pageInRight }
        .page-anim[data-dir="back"]   { animation-name: pageInLeft }
        .page-anim[data-dir="in"]     { animation-name: pageInUp }
        @keyframes pageInRight { from{opacity:0; transform:translateX(70px)} to{opacity:1; transform:none} }
        @keyframes pageInLeft  { from{opacity:0; transform:translateX(-70px)} to{opacity:1; transform:none} }
        @keyframes pageInUp    { from{opacity:0; transform:translateY(20px)} to{opacity:1; transform:none} }

        /* leave room at the bottom of every sub-page so the floating switcher
           (≈110px tall incl. hint) doesn't cover the last row */
        .sub-pad{ padding-bottom: 140px }
      `}</style>

      {route === "home" && <Home onNavigate={setRoute}/>}

      {idx >= 0 && (
        <div key={route} className="page-anim sub-pad" data-dir={dir}>
          {route === "planner"   && <PagePlanner   onBack={()=>setRoute("home")} onGenerated={(plan)=>{ showToast(`计划已生成 · ${plan.title}`); }}/>}
          {route === "records"   && <PageRecords   onBack={()=>setRoute("home")}/>}
          {route === "timetable" && <PageTimetable onBack={()=>setRoute("home")}/>}
        </div>
      )}

      {idx >= 0 && <PageSwitcher idx={idx} onNavigate={setRoute}/>}

      {toast && (
        <div style={{
          position:"fixed", left:"50%", bottom:160, transform:"translateX(-50%)",
          padding:"14px 22px", borderRadius:999, background:"var(--paper)", color:"var(--ink)",
          fontWeight:600, fontSize:14, boxShadow:"0 20px 40px -16px rgba(0,0,0,.6)",
          display:"flex", alignItems:"center", gap:10, zIndex:9999
        }}>
          <span style={{width:8,height:8,borderRadius:"50%",background:"var(--green)"}}/>
          {toast}
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
