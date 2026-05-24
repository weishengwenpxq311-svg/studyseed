// Home page — black canvas, headline, envelope + fan-out cards
const { useState: useStateH, useEffect: useEffectH, useRef: useRefH } = React;

function playEnvelopeSound() {
  try {
    const audio = new Audio("uploads/tissue2.mp3");
    audio.preload = "auto";
    audio.volume = 0.85;
    audio.play().catch(() => {});
  } catch {}
}

function Home({ onNavigate, user, onLoginClick, onLogout }) {
  const [open, setOpen] = useStateH(false);
  const [hoverIdx, setHoverIdx] = useStateH(null);
  const prevScrollRef = useRefH(null);
  const quoteSpace = "clamp(110px, 9vw, 156px)";
  const data = useStudySeedData();
  const stats = StudySeed.getStats(data);

  const toggleEnvelope = () => {
    playEnvelopeSound();
    setOpen(o => !o);
  };

  const openEnvelope = () => {
    if (!open) playEnvelopeSound();
    setOpen(true);
  };

  // when opening: remember scroll, gently bring envelope into view
  // when closing: smoothly restore the prior scroll position so the headline is visible again
  useEffectH(() => {
    if (open) {
      if (prevScrollRef.current === null) {
        prevScrollRef.current = window.scrollY;
      }
      const el = document.getElementById("envelope-anchor");
      if (el) {
        const rect = el.getBoundingClientRect();
        const target = window.scrollY + rect.top - 80;
        // only scroll down if envelope is actually below viewport top
        if (target > window.scrollY + 4) {
          window.scrollTo({ top: target, behavior:"smooth" });
        }
      }
    } else if (prevScrollRef.current !== null) {
      const restoreTo = prevScrollRef.current;
      prevScrollRef.current = null;
      window.scrollTo({ top: restoreTo, behavior:"smooth" });
    }
  }, [open]);

  useEffectH(() => {
    const primeEnvelopeAudio = () => {
      try {
        const audio = new Audio("uploads/tissue2.mp3");
        audio.preload = "auto";
        audio.load();
      } catch {}
    };
    window.addEventListener("pointerdown", primeEnvelopeAudio, { once:true, passive:true });
    return () => window.removeEventListener("pointerdown", primeEnvelopeAudio);
  }, []);

  return (
    <div style={{minHeight:"100vh", display:"flex", flexDirection:"column", overflow:"hidden"}}>
      <TopBar onNavigate={onNavigate} user={user} onLoginClick={onLoginClick} onLogout={onLogout}/>

      <main style={{flex:1, position:"relative"}}>
        {/* subtle far-back grid texture */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background:"radial-gradient(80% 60% at 50% 0%, rgba(241,236,224,.04), transparent 60%)"
        }}/>

        <div className="home-layout" style={{
          maxWidth:1320, margin:"0 auto", padding:"28px 56px 80px",
          display:"grid", gridTemplateColumns:"minmax(360px, 1fr) minmax(720px, 1.4fr)", gap:48, alignItems:"start"
        }}>
          {/* LEFT — copy */}
          <div className="home-copy-enter" style={{paddingTop:32}}>
            <div className="fade-in d1 eyebrow">PLAN · TRACK · GROW</div>

            <h1 className="fade-in d2 home-title" style={{
              margin:"22px 0 0",
              fontFamily:"var(--type-cn-display)",
              fontWeight:900,
              letterSpacing:0,
              fontSize:"clamp(54px, 6.3vw, 88px)",
              lineHeight:.92,
              textShadow:"2px 2px 0 rgba(0,0,0,.34), 4px 4px 0 rgba(241,236,224,.035)",
              WebkitTextStroke:"0.45px currentColor",
              paintOrder:"stroke fill",
              display:"flex",
              flexDirection:"column",
              alignItems:"flex-start",
              gap:0,
              whiteSpace:"nowrap"
            }}>
              <span>把</span>
              <span style={{color:"var(--yellow)"}}>学习计划</span>
              <span>装进一封</span>
              <span style={{color:"var(--green)"}}>会展开的信</span>
            </h1>

            <p className="fade-in d3 home-lead" style={{
              margin:"26px 0 0", maxWidth:440,
              fontSize:16, lineHeight:1.75, color:"rgba(241,236,224,.7)"
            }}>
              生成你的专属学习安排，记录每一次完成，
              <br/>也看见时间如何积累成进步。
            </p>

            <div className="fade-in d4" style={{display:"flex", alignItems:"center", gap:16, marginTop:36, flexWrap:"wrap"}}>
              <button className="btn btn-primary" onClick={toggleEnvelope}>
                {open ? "收起信封" : "点击信封，开始规划"}
                <Icon.ArrowRight size={16}/>
              </button>
            </div>

            <div className="fade-in d4 home-stats" style={{marginTop:48, display:"flex", gap:32, flexWrap:"wrap"}}>
              <MetaStat k={String(stats.streak)} u="天" l="连续学习"/>
              <MetaStat k={String(stats.monthHours)} u="h" l="本月累计"/>
              <MetaStat k={String(stats.activeDirections)} u="方向" l="正在跟进"/>
            </div>
          </div>

          {/* RIGHT — stage */}
          <div className="home-stage-enter" style={{position:"relative"}}>
            {/* decorative brand quote — sits above the envelope */}
            <div className="home-quote" style={{
              paddingTop:2,
              position:"absolute",
              top:0,
              left:0,
              right:0,
              zIndex: open ? 0 : 5,
              opacity: open ? 0 : 1,
              transition: open
                ? "opacity .25s ease, z-index 0s"
                : "opacity .35s ease, z-index 0s linear .35s",
              pointerEvents:"none"
            }}>
              <p style={{
                margin:0,
                fontFamily:"'Caprasimo', 'Lemon', 'Yeseva One', serif",
                fontSize:"clamp(30px, 3.4vw, 48px)",
                lineHeight:1.34,
                letterSpacing:".005em",
                color:"var(--yellow)",
                textWrap:"balance"
              }}>
                <span className="blur-quote" aria-label="The choices you make today will echo in the future.">
                  <span className="blur-line" aria-hidden="true">
                    <span className="blur-word" style={{"--delay":".12s"}}>The</span>
                    <span className="blur-word" style={{"--delay":".195s"}}>choices</span>
                    <span className="blur-word" style={{"--delay":".27s"}}>you</span>
                    <span className="blur-word" style={{"--delay":".345s"}}>make</span>
                    <span className="blur-word" style={{"--delay":".42s", color:"var(--paper)"}}>today</span>
                  </span>
                  <br/>
                  <span className="blur-line" aria-hidden="true">
                    <span className="blur-word" style={{"--delay":".495s"}}>will</span>
                    <span className="blur-word" style={{"--delay":".57s"}}>echo</span>
                    <span className="blur-word" style={{"--delay":".645s"}}>in</span>
                    <span className="blur-word" style={{"--delay":".72s"}}>the</span>
                    <span className="blur-word" style={{"--delay":".795s"}}>future.</span>
                  </span>
                </span>
              </p>
            </div>

            <div id="envelope-anchor" className={`stage home-envelope-stage ${open ? "is-open" : ""}`} style={{
              position:"relative",
              zIndex:2,
              display:"flex", justifyContent:"center", alignItems:"flex-start",
              paddingTop: open ? 540 : `calc(104px + ${quoteSpace})`,
              paddingBottom: 40,
              transition:"padding-top .65s cubic-bezier(.22, 1, .36, 1)"
            }}>
              <div style={{position:"relative", willChange:"transform"}}>
                <Envelope open={open} onToggle={toggleEnvelope} onSealClick={openEnvelope}/>

                {/* cards — anchored to envelope */}
                <FunctionCard idx={0} open={open} hoveredIdx={hoverIdx} onHover={setHoverIdx} onClick={i=>onNavigate(["planner","records","timetable"][i])} variant="green"/>
                <FunctionCard idx={1} open={open} hoveredIdx={hoverIdx} onHover={setHoverIdx} onClick={i=>onNavigate(["planner","records","timetable"][i])} variant="paper"/>
                <FunctionCard idx={2} open={open} hoveredIdx={hoverIdx} onHover={setHoverIdx} onClick={i=>onNavigate(["planner","records","timetable"][i])} variant="yellow"/>
              </div>
            </div>

            {/* hint pill below envelope when closed */}
            {!open && (
              <div className="home-hint-pill" style={{
                position:"absolute", left:"50%", transform:"translateX(-50%)", bottom:-6,
                padding:"10px 18px", borderRadius:999, border:"1px solid var(--hairline-strong)",
                fontSize:12, color:"rgba(241,236,224,.6)", display:"flex", alignItems:"center", gap:10
              }}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"var(--green)", animation:"pulse 1.6s infinite"}}/>
                点击信封展开三张功能卡片
              </div>
            )}
          </div>
        </div>

        {/* foot decoration */}
        <FootStrip/>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity:1; transform:scale(1) }
          50% { opacity:.4; transform:scale(.7) }
        }
        .limelight-nav {
          position:relative;
          display:inline-flex;
          align-items:center;
          min-height:46px;
          padding:4px 6px;
          border-radius:999px;
          border:1px solid rgba(241,236,224,.12);
          background:rgba(241,236,224,.035);
          overflow:hidden;
        }
        .limelight-item {
          position:relative;
          z-index:20;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          min-width:74px;
          height:38px;
          padding:0 17px;
          border-radius:999px;
          color:rgba(241,236,224,.55);
          font-size:14px;
          font-weight:700;
          letter-spacing:.01em;
          transition:color .18s ease, opacity .18s ease;
          white-space:nowrap;
        }
        .limelight-item:hover,
        .limelight-item.active {
          color:var(--paper);
        }
        .limelight-icon {
          display:flex;
          opacity:.72;
        }
        .limelight-beam {
          position:absolute;
          top:0;
          z-index:10;
          width:54px;
          height:5px;
          border-radius:999px;
          background:var(--yellow);
          box-shadow:0 42px 18px rgba(250,199,94,.22);
        }
        .limelight-beam.ready {
          transition:left .4s cubic-bezier(.22, 1, .36, 1);
        }
        .limelight-cone {
          position:absolute;
          left:-55%;
          top:5px;
          width:210%;
          height:44px;
          clip-path:polygon(8% 100%, 30% 0, 70% 0, 92% 100%);
          background:linear-gradient(to bottom, rgba(250,199,94,.24), transparent);
          pointer-events:none;
        }
        @keyframes homeCopyEnter {
          from {
            opacity:0;
            transform:translateX(-96px);
            filter:blur(10px);
          }
          to {
            opacity:1;
            transform:translateX(0);
            filter:blur(0);
          }
        }
        @keyframes homeStageEnter {
          from {
            opacity:0;
            transform:translateY(120px);
            filter:blur(8px);
          }
          to {
            opacity:1;
            transform:translateY(0);
            filter:blur(0);
          }
        }
        .home-copy-enter {
          animation:homeCopyEnter .95s cubic-bezier(.16, 1, .3, 1) .08s both;
          will-change:transform, filter, opacity;
        }
        .home-stage-enter {
          animation:homeStageEnter 1.05s cubic-bezier(.16, 1, .3, 1) .28s both;
          will-change:transform, filter, opacity;
        }
        @keyframes blurQuoteIn {
          0% {
            opacity:0;
            filter:blur(16px);
            transform:translateY(22px) scale(.98);
          }
          65% {
            opacity:1;
            filter:blur(2px);
          }
          100% {
            opacity:1;
            filter:blur(0);
            transform:translateY(0) scale(1);
          }
        }
        .blur-line {
          display:inline-flex;
          flex-wrap:wrap;
          column-gap:.24em;
        }
        .blur-word {
          display:inline-block;
          opacity:0;
          filter:blur(16px);
          transform:translateY(22px) scale(.98);
          animation:blurQuoteIn .85s cubic-bezier(.16, 1, .3, 1) forwards;
          animation-delay:var(--delay);
          will-change:transform, filter, opacity;
        }
        @media (prefers-reduced-motion: reduce) {
          .home-copy-enter,
          .home-stage-enter {
            opacity:1;
            filter:none;
            transform:none;
            animation:none;
          }
          .blur-word {
            opacity:1;
            filter:none;
            transform:none;
            animation:none;
          }
        }
      `}</style>
    </div>
  );
}

function TopBar({ onNavigate, user, onLoginClick, onLogout }) {
  const navItems = [
    { id:"home", label:"首页", onClick:()=>window.scrollTo({top:0, behavior:"smooth"}) },
    { id:"planner", label:"我的计划", onClick:()=>onNavigate("planner") },
    { id:"records", label:"学习记录", onClick:()=>onNavigate("records") },
    { id:"login", label:user ? "退出" : "登录", onClick:()=> user ? onLogout() : onLoginClick() },
  ];

  return (
    <header className="fade-in d1 top-bar" style={{
      padding:"22px 56px",
      display:"flex", justifyContent:"space-between", alignItems:"center",
      borderBottom:"1px solid var(--hairline)"
    }}>
      <div style={{display:"flex", alignItems:"center", gap:14}}>
        <div style={{
          width:42, height:42,
          display:"flex", alignItems:"center", justifyContent:"center"
        }}>
          <img
            src="uploads/studyseed-envelope-mark.svg"
            alt="StudySeed"
            style={{width:42, height:42, display:"block", objectFit:"contain"}}
          />
        </div>
        <div>
          <div style={{fontWeight:800, fontSize:16, letterSpacing:".02em"}}>StudySeed</div>
          <div className="tag-text" style={{color:"rgba(241,236,224,.45)", marginTop:2}}>PLAN · TRACK · GROW</div>
        </div>
      </div>

      <nav className="top-nav" style={{display:"flex", alignItems:"center", gap:18, fontSize:14}}>
        <LimelightNav items={navItems}/>
        <button className="btn btn-paper" onClick={()=>onNavigate("planner")} style={{padding:"10px 18px", fontSize:13}}>
          开始使用 <Icon.ArrowRight size={14}/>
        </button>
      </nav>
    </header>
  );
}

function MetaStat({k,u,l}) {
  return (
    <div>
      <div style={{fontFamily:"var(--type-en)", fontWeight:600, fontSize:28, letterSpacing:".01em", lineHeight:1}}>
        {k}<span style={{fontSize:14, fontWeight:400, marginLeft:4, color:"rgba(241,236,224,.55)"}}>{u}</span>
      </div>
      <div className="tag-text" style={{color:"rgba(241,236,224,.5)", marginTop:8}}>{l}</div>
    </div>
  );
}

function FootStrip() {
  return (
    <div className="foot-strip" style={{
      borderTop:"1px solid var(--hairline)", marginTop:40,
      padding:"22px 56px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:18
    }}>
      <div className="tag-text" style={{color:"rgba(241,236,224,.4)"}}>NO.001 · STUDYSEED · 2026</div>
      <div className="foot-strip-palette" style={{display:"flex", gap:24, fontSize:12, color:"rgba(241,236,224,.5)"}}>
        <span>麻纸米白 #F1ECE0</span>
        <span style={{color:"var(--green)"}}>草木深绿 #117C0D</span>
        <span style={{color:"var(--yellow)"}}>麦秆暖黄 #FAC75E</span>
      </div>
      <div className="tag-text" style={{color:"rgba(241,236,224,.4)"}}>会展开的学习工具盒</div>
    </div>
  );
}

Object.assign(window, { Home });
