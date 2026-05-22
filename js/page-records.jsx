// Study records — driven by generated plans and completed schedule events.
const { useState: useStateR, useEffect: useEffectR } = React;

function PageRecords({ onBack }) {
  const data = useStudySeedData();
  const stats = StudySeed.getStats(data);
  const [filter, setFilter] = useStateR("全部");
  const [selected, setSelected] = useStateR(data.records[0] || null);

  useEffectR(() => {
    if (!data.records.length) {
      setSelected(null);
      return;
    }
    if (!selected || !data.records.some(r => r.id === selected.id)) {
      setSelected(data.records[0]);
    }
  }, [data.records]);

  const filters = ["全部", ...Array.from(new Set(data.records.map(r => r.tag).filter(Boolean)))];
  const filtered = filter === "全部" ? data.records : data.records.filter(r => r.tag === filter);

  return (
    <div className="page-shell scrollable" style={{background:"var(--ink)", color:"var(--paper)"}}>
      <SubHeader onBack={onBack} idx="02" label="STUDY RECORDS" zh="学习记录" accent="var(--paper)"/>

      <div style={{padding:"28px 56px 80px", maxWidth:1320, margin:"0 auto", width:"100%"}}>
        <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:32}}>
          <StatTile big={String(stats.streak)} unit="天" sub="连续学习" tone="green"/>
          <StatTile big={String(stats.monthHours)} unit="h" sub="本月累计" tone="paper"/>
          <StatTile big={`${stats.completedCount} / ${stats.recordCount}`} unit="" sub="完成记录" tone="yellow"/>
          <StatTile big={String(stats.activeDirections)} unit="方向" sub="正在跟进" tone="ghost"/>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1.05fr .95fr", gap:32}}>
          <div>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, gap:16, flexWrap:"wrap"}}>
              <h2 style={{margin:0, fontSize:30, fontWeight:900, letterSpacing:".01em"}}>
                已留下的<span style={{color:"var(--yellow)"}}>学习记录</span>
              </h2>
              <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
                {filters.map(f => (
                  <button key={f} onClick={()=>setFilter(f)}
                    style={{
                      padding:"8px 14px", borderRadius:999, fontSize:12, fontWeight:600,
                      background: filter===f ? "var(--paper)" : "transparent",
                      color: filter===f ? "var(--ink)" : "rgba(241,236,224,.7)",
                      border:"1px solid " + (filter===f ? "var(--paper)" : "var(--hairline-strong)")
                    }}>{f}</button>
                ))}
              </div>
            </div>

            {!filtered.length ? (
              <EmptyRecordState/>
            ) : (
              <div style={{display:"flex", flexDirection:"column", gap:12}}>
                {filtered.map(r => {
                  const active = selected && selected.id === r.id;
                  return (
                    <button key={r.id} onClick={()=>setSelected(r)} style={{
                      textAlign:"left", padding:"18px 22px", borderRadius:18,
                      background: active ? "var(--paper)" : "rgba(241,236,224,.04)",
                      color: active ? "var(--ink)" : "var(--paper)",
                      border: "1px solid " + (active ? "var(--paper)" : "var(--hairline)"),
                      transition:"all .25s",
                      display:"flex", alignItems:"center", justifyContent:"space-between", gap:18
                    }}>
                      <div style={{display:"flex", alignItems:"center", gap:16}}>
                        <div style={{
                          width:38, height:38, borderRadius:12,
                          background: r.color || StudySeed.colorFor(r.tag),
                          color: (r.color || "") === "var(--paper)" ? "var(--green)" : ((r.color || "") === "var(--yellow)" ? "#1a1305" : "var(--paper)"),
                          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0
                        }}>
                          <Icon.Check size={20}/>
                        </div>
                        <div>
                          <div style={{fontSize:15, fontWeight:700}}>{r.name}</div>
                          <div style={{fontSize:12, marginTop:4, opacity:.65, fontFamily:"var(--type-mono)", letterSpacing:".05em"}}>
                            {r.date} · {r.dur} · {r.status}
                          </div>
                        </div>
                      </div>
                      <span className="tag-text" style={{opacity:.55}}>{r.tag}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <RecordDetail selected={selected}/>
        </div>
      </div>
    </div>
  );
}

function EmptyRecordState() {
  return (
    <div style={{
      padding:"34px 28px", borderRadius:22,
      border:"1px dashed var(--hairline-strong)", color:"rgba(241,236,224,.62)",
      lineHeight:1.7
    }}>
      还没有学习记录。先在“安排计划”里生成一份计划，完成时间表里的事项后，这里会自动留下记录。
    </div>
  );
}

function RecordDetail({ selected }) {
  if (!selected) {
    return (
      <div className="paper-tex" style={{
        background:"var(--paper)", color:"var(--ink)",
        borderRadius:24, padding:"30px 30px", height:"fit-content"
      }}>
        <div className="tag-text" style={{color:"rgba(5,5,5,.5)"}}>RECORD · EMPTY</div>
        <h3 style={{margin:"14px 0 6px", fontSize:24, fontWeight:900}}>等待第一条记录</h3>
        <div style={{fontSize:13, color:"rgba(5,5,5,.6)", lineHeight:1.7}}>生成计划或完成任务后，记录会出现在这里。</div>
      </div>
    );
  }

  return (
    <div className="paper-tex" style={{
      background:"var(--paper)", color:"var(--ink)",
      borderRadius:24, padding:"30px 30px", position:"sticky", top:24, height:"fit-content",
      boxShadow:"0 30px 60px -24px rgba(0,0,0,.5)"
    }}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div className="tag-text" style={{color:"rgba(5,5,5,.5)"}}>RECORD · #{selected.id.slice(-5).toUpperCase()}</div>
        <div className="tag-text" style={{color:"rgba(5,5,5,.5)"}}>{selected.date}</div>
      </div>
      <h3 style={{margin:"14px 0 6px", fontSize:24, fontWeight:900, lineHeight:1.2}}>{selected.name}</h3>
      <div style={{fontSize:13, color:"rgba(5,5,5,.6)"}}>这条记录来自生成计划或完成的时间表事项。</div>

      <div style={{height:1, background:"rgba(5,5,5,.1)", margin:"22px 0"}}/>

      <div style={{display:"flex", flexDirection:"column", gap:10}}>
        {(selected.tasks || []).length ? selected.tasks.map((task, i) => (
          <div key={i} style={{display:"flex", alignItems:"center", gap:12}}>
            <div style={{
              width:22, height:22, borderRadius:6, background:"var(--green)",
              color:"var(--paper)", display:"flex", alignItems:"center", justifyContent:"center"
            }}>
              <Icon.Check size={14}/>
            </div>
            <span style={{fontSize:14}}>{task}</span>
          </div>
        )) : (
          <div style={{fontSize:14, color:"rgba(5,5,5,.55)"}}>暂无任务明细。</div>
        )}
      </div>

      {(selected.resources || []).length > 0 && (
        <>
          <div style={{height:1, background:"rgba(5,5,5,.1)", margin:"22px 0"}}/>
          <div className="tag-text" style={{color:"rgba(5,5,5,.5)", marginBottom:10}}>COURSE RESOURCES</div>
          <div style={{display:"flex", flexDirection:"column", gap:8}}>
            {selected.resources.slice(0, 5).map(r => (
              <a key={r.id || r.url} href={r.url} target="_blank" rel="noopener" style={{
                display:"flex", justifyContent:"space-between", gap:12,
                padding:"10px 12px", borderRadius:12, border:"1px solid rgba(5,5,5,.1)",
                color:"var(--ink)", background:"rgba(255,255,255,.35)", fontSize:13
              }}>
                <span>{r.title}</span>
                <span style={{fontFamily:"var(--type-mono)", color:"rgba(5,5,5,.5)", whiteSpace:"nowrap"}}>{r.platform}</span>
              </a>
            ))}
          </div>
        </>
      )}

      <div style={{height:1, background:"rgba(5,5,5,.1)", margin:"22px 0"}}/>

      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14}}>
        <DetailMini label="时长" value={selected.dur}/>
        <DetailMini label="状态" value={selected.status}/>
        <DetailMini label="方向" value={selected.tag}/>
      </div>
    </div>
  );
}

function StatTile({ big, unit, sub, tone }) {
  const tones = {
    green:  { bg:"var(--green)",  fg:"var(--paper)", sub:"rgba(241,236,224,.7)" },
    yellow: { bg:"var(--yellow)", fg:"#1a1305",       sub:"rgba(26,19,5,.65)" },
    paper:  { bg:"var(--paper)",  fg:"var(--ink)",    sub:"rgba(5,5,5,.55)" },
    ghost:  { bg:"transparent",   fg:"var(--paper)",  sub:"rgba(241,236,224,.55)", border:"1px solid var(--hairline)" },
  }[tone];
  return (
    <div className={tone==="paper" ? "paper-tex" : ""} style={{
      background:tones.bg, color:tones.fg, borderRadius:18, padding:"22px 22px",
      border: tones.border || "none"
    }}>
      <div style={{fontFamily:"var(--type-en)", fontWeight:700, fontSize:40, letterSpacing:".01em", lineHeight:1}}>
        {big}<span style={{fontSize:18, marginLeft:6, fontWeight:500}}>{unit}</span>
      </div>
      <div style={{fontSize:13, color:tones.sub, marginTop:8}}>{sub}</div>
    </div>
  );
}

function DetailMini({ label, value }) {
  return (
    <div>
      <div className="tag-text" style={{color:"rgba(5,5,5,.5)"}}>{label}</div>
      <div style={{fontSize:15, fontWeight:700, marginTop:4}}>{value}</div>
    </div>
  );
}

Object.assign(window, { PageRecords });
