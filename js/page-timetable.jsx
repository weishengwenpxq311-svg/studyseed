// Weekly timetable — generated events + manual editing.
const { useState: useStateT } = React;

const DAYS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const DAYS_CN = ["周一","周二","周三","周四","周五","周六","周日"];
const HOURS = ["07:00","09:00","11:00","13:00","15:00","17:00","19:00","21:00"];
const DIRECTIONS = ["艺术","专业","岗位","学科","其他"];

function PageTimetable({ onBack, user, onRequireLogin }) {
  const data = useStudySeedData();
  const [view, setView] = useStateT("week");
  const [editing, setEditing] = useStateT(null);
  const [syncing, setSyncing] = useStateT(false);
  const activePlan = data.plans.find(p => p.id === data.activePlanId);

  const openNew = () => setEditing({
    d:0, s:1, span:1, t:"新的学习事项", sub:"专业",
    c:StudySeed.colorFor("专业"), source:"manual", done:false,
  });

  const sync = () => {
    setSyncing(true);
    StudySeed.syncActivePlanToSchedule();
    setTimeout(()=> setSyncing(false), 650);
  };

  const downloadTimetable = () => {
    if (!onRequireLogin()) return;
    StudySeedExport.downloadTimetable();
  };

  return (
    <div className="page-shell scrollable" style={{background:"var(--ink)", color:"var(--paper)"}}>
      <SubHeader onBack={onBack} idx="03" label="WEEKLY SCHEDULE" zh="计划时间表" accent="var(--yellow)"/>

      <div className="page-content" style={{padding:"28px 56px 80px", maxWidth:1360, margin:"0 auto", width:"100%"}}>
        <div className="timetable-head" style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24, gap:24, flexWrap:"wrap"}}>
          <div>
            <div className="tag-text" style={{color:"rgba(241,236,224,.5)"}}>
              {activePlan ? `ACTIVE PLAN · ${activePlan.title}` : "NO ACTIVE PLAN · 先生成一份计划"}
            </div>
            <h2 style={{margin:"8px 0 0", fontSize:32, fontWeight:900, letterSpacing:".01em"}}>
              这周，把<span style={{color:"var(--yellow)"}}>计划</span>装进时间。
            </h2>
          </div>

          <div className="timetable-actions" style={{display:"flex", gap:10, alignItems:"center"}}>
            <div style={{display:"flex", background:"rgba(241,236,224,.06)", borderRadius:999, padding:4, border:"1px solid var(--hairline)"}}>
              {["day","week"].map(v => (
                <button key={v} onClick={()=>setView(v)} style={{
                  padding:"8px 16px", borderRadius:999, fontSize:12, fontWeight:600, letterSpacing:".06em", textTransform:"uppercase",
                  background: view===v ? "var(--paper)" : "transparent",
                  color: view===v ? "var(--ink)" : "var(--paper)"
                }}>{v==="day"?"日视图":"周视图"}</button>
              ))}
            </div>
            <button onClick={sync} disabled={!activePlan || syncing} className="btn" style={{
              background:"var(--yellow)", color:"#1a1305", padding:"12px 18px", fontSize:13, opacity:(!activePlan || syncing) ? .55 : 1
            }}>
              {syncing ? "已同步 ✓" : <>同步当前计划 <Icon.ArrowRight size={16}/></>}
            </button>
          </div>
        </div>

        <div style={{display:"flex", gap:18, marginBottom:18, flexWrap:"wrap"}}>
          {[
            {c:"var(--green)",  l:"专业 / 学科 · 深度推进"},
            {c:"var(--yellow)", l:"艺术 / 其他 · 灵感整理"},
            {c:"var(--paper)",  l:"岗位 · 表达训练"},
            {c:"transparent",   l:"手动 / 自由调整", b:true},
          ].map((x,i)=>(
            <div key={i} style={{display:"flex", alignItems:"center", gap:8, fontSize:12, color:"rgba(241,236,224,.7)"}}>
              <span style={{width:12,height:12,borderRadius:3, background:x.c, border:x.b?"1px dashed var(--hairline-strong)":"none"}}/>
              {x.l}
            </div>
          ))}
        </div>

        <div className="timetable-board" style={{
          border:"1px solid var(--hairline)",
          borderRadius:24, overflow:"hidden",
          background:"var(--ink-2)"
        }}>
          <div style={{
            display:"grid",
            gridTemplateColumns:"86px repeat(7, 1fr)",
            borderBottom:"1px solid var(--hairline)"
          }}>
            <div style={{padding:"16px 12px", borderRight:"1px solid var(--hairline)"}}>
              <div className="tag-text" style={{color:"rgba(241,236,224,.4)"}}>TIME</div>
            </div>
            {DAYS.map((d,i)=>(
              <div key={d} style={{
                padding:"16px 14px", borderRight: i<6 ? "1px solid var(--hairline)" : "none",
                display:"flex", justifyContent:"space-between", alignItems:"baseline"
              }}>
                <div>
                  <div className="tag-text" style={{color:i===2?"var(--yellow)":"rgba(241,236,224,.5)"}}>{d}</div>
                  <div style={{fontWeight:700, fontSize:18, marginTop:2}}>{DAYS_CN[i]}</div>
                </div>
                <div style={{fontFamily:"var(--type-mono)", fontSize:12, color:"rgba(241,236,224,.4)"}}>{18+i}</div>
              </div>
            ))}
          </div>

          {HOURS.map((h, hi) => (
            <div key={h} style={{
              display:"grid",
              gridTemplateColumns:"86px repeat(7, 1fr)",
              borderBottom: hi < HOURS.length-1 ? "1px solid var(--hairline)" : "none",
              minHeight:74
            }}>
              <div style={{
                padding:"12px 12px", borderRight:"1px solid var(--hairline)",
                fontFamily:"var(--type-mono)", fontSize:12, color:"rgba(241,236,224,.55)", letterSpacing:".06em"
              }}>{h}</div>
              {DAYS.map((d, di) => {
                const evt = data.events.find(e => e.d === di && e.s === hi);
                return (
                  <div key={di} style={{
                    position:"relative",
                    borderRight: di<6 ? "1px solid var(--hairline)" : "none",
                    padding:6
                  }}>
                    {evt && <EventBlock evt={evt} onEdit={()=>setEditing(evt)}/>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="timetable-note" style={{
          marginTop:22, display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"18px 22px", borderRadius:18,
          border:"1px dashed var(--hairline-strong)", background:"rgba(241,236,224,.02)", gap:16
        }}>
          <div style={{display:"flex", alignItems:"center", gap:14}}>
            <div style={{width:36,height:36,borderRadius:12,background:"var(--yellow)",color:"#1a1305",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Icon.Clock size={20}/>
            </div>
            <div>
              <div style={{fontWeight:700, fontSize:14}}>时间表可以手动修改</div>
              <div style={{fontSize:13, color:"rgba(241,236,224,.55)", marginTop:3}}>
                点击任意时间块可以编辑、删除或标记完成；完成后会自动写入学习记录。
              </div>
            </div>
          </div>
          <div className="timetable-note-actions" style={{display:"flex", gap:10, flexWrap:"wrap", justifyContent:"flex-end"}}>
            <button onClick={downloadTimetable} className="btn" style={{fontSize:13, whiteSpace:"nowrap", background:"var(--paper)", color:"var(--ink)"}}>
              下载时间表
            </button>
            <button onClick={openNew} className="btn btn-ghost" style={{fontSize:13, whiteSpace:"nowrap"}}>
              <Icon.Plus size={16}/> 手动添加事项
            </button>
          </div>
        </div>
      </div>

      {editing && <EventEditor event={editing} onClose={()=>setEditing(null)}/>}
    </div>
  );
}

function EventBlock({ evt, onEdit }) {
  const isFree = evt.c === "transparent";
  const isYellow = evt.c === "var(--yellow)";
  const isPaper  = evt.c === "var(--paper)";
  const fg = isYellow ? "#1a1305" : (isPaper ? "var(--green)" : (isFree ? "var(--paper)" : "var(--paper)"));
  const height = evt.span * 74 - 12 + (evt.span - 1) * 1;
  return (
    <button style={{
      position:"absolute", left:6, right:6, top:6,
      height:height,
      borderRadius:12, padding:"10px 12px",
      background: isFree ? "transparent" : evt.c,
      border: isFree ? "1px dashed var(--hairline-strong)" : "none",
      color: fg,
      display:"flex", flexDirection:"column", justifyContent:"space-between",
      cursor:"pointer", transition:"transform .2s", textAlign:"left",
      opacity: evt.done ? .48 : 1,
      boxShadow: isFree ? "none" : "0 6px 16px -10px rgba(0,0,0,.6)"
    }}
    onClick={onEdit}
    onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"}
    onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}
    >
      <div>
        <div style={{fontSize:13, fontWeight:700, lineHeight:1.25}}>{evt.t}</div>
        <div style={{fontFamily:"var(--type-mono)", fontSize:10, opacity:.7, letterSpacing:".08em", marginTop:4, textTransform:"uppercase"}}>
          {evt.sub}{evt.done ? " · DONE" : ""}
        </div>
      </div>
      {evt.span >= 2 && !isFree && (
        <div style={{fontFamily:"var(--type-mono)", fontSize:10, opacity:.65, letterSpacing:".06em"}}>
          {evt.span}H · {evt.source === "manual" ? "MANUAL" : "FROM PLAN"}
        </div>
      )}
    </button>
  );
}

function EventEditor({ event, onClose }) {
  const [draft, setDraft] = useStateT({...event});
  const set = (key, value) => setDraft(prev => ({...prev, [key]: value}));

  const save = () => {
    StudySeed.upsertEvent({...draft, c: StudySeed.colorFor(draft.sub)});
    onClose();
  };

  const remove = () => {
    if (draft.id) StudySeed.deleteEvent(draft.id);
    onClose();
  };

  const complete = () => {
    if (draft.id) {
      StudySeed.upsertEvent({...draft, c: StudySeed.colorFor(draft.sub)});
      StudySeed.completeEvent(draft.id);
    }
    onClose();
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9000,
      background:"rgba(0,0,0,.62)", display:"flex", alignItems:"center", justifyContent:"center",
      padding:24
    }}>
      <div className="paper-tex modal-panel" style={{
        width:"min(560px, 100%)", background:"var(--paper)", color:"var(--ink)",
        borderRadius:24, padding:"28px 30px", boxShadow:"0 34px 80px -28px rgba(0,0,0,.8)"
      }}>
        <div className="tag-text" style={{color:"rgba(5,5,5,.5)"}}>TIMETABLE ITEM</div>
        <h3 style={{margin:"8px 0 22px", fontSize:26, fontWeight:900}}>编辑学习事项</h3>

        <div style={{display:"flex", flexDirection:"column", gap:16}}>
          <div>
            <label className="field-label">事项标题</label>
            <input className="field-input" value={draft.t} onChange={e=>set("t", e.target.value)}/>
          </div>

          <div className="editor-grid" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
            <div>
              <label className="field-label">方向</label>
              <select className="field-input" value={draft.sub} onChange={e=>set("sub", e.target.value)}>
                {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">时长</label>
              <select className="field-input" value={draft.span} onChange={e=>set("span", Number(e.target.value))}>
                <option value={1}>1 格</option>
                <option value={2}>2 格</option>
                <option value={3}>3 格</option>
              </select>
            </div>
          </div>

          <div className="editor-grid" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
            <div>
              <label className="field-label">星期</label>
              <select className="field-input" value={draft.d} onChange={e=>set("d", Number(e.target.value))}>
                {DAYS_CN.map((d,i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">开始时间</label>
              <select className="field-input" value={draft.s} onChange={e=>set("s", Number(e.target.value))}>
                {HOURS.map((h,i) => <option key={h} value={i}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, marginTop:26, flexWrap:"wrap"}}>
          <button onClick={remove} className="btn btn-ghost" style={{color:"#b91c1c", borderColor:"rgba(185,28,28,.35)"}}>删除</button>
          <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
            <button onClick={onClose} className="btn btn-ghost" style={{color:"var(--ink)", borderColor:"rgba(5,5,5,.18)"}}>取消</button>
            {draft.id && !draft.done && <button onClick={complete} className="btn" style={{background:"var(--yellow)", color:"#1a1305"}}>标记完成</button>}
            <button onClick={save} className="btn btn-primary">保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PageTimetable });
