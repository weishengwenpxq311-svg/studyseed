// Arrange plan — form + AI generation pipeline.
const { useState: useStateP } = React;

function PagePlanner({ onBack, onGenerated }) {
  const data = useStudySeedData();
  const activePlan = data.plans.find(p => p.id === data.activePlanId);

  const [goal, setGoal] = useStateP(activePlan?.goal || "准备 2026 年 6 月作品集与岗位面试");
  const [date, setDate] = useStateP(activePlan?.date || "2026-06-13");
  const [hours, setHours] = useStateP(activePlan?.hours || 2);
  const [subjects, setSubjects] = useStateP(activePlan?.subjects || ["专业", "学科"]);
  const [intensity, setIntensity] = useStateP(activePlan?.intensity || "均衡");
  const [generating, setGenerating] = useStateP(false);
  const [error, setError] = useStateP("");

  const allSubjects = ["艺术","专业","岗位","学科","其他"];
  const toggleSubject = (s) => setSubjects(p => p.includes(s) ? p.filter(x=>x!==s) : [...p, s]);

  const submit = async () => {
    setError("");
    if (!goal.trim()) {
      setError("请先填写想学的内容或目标。");
      return;
    }
    if (!subjects.length) {
      setError("请至少选择一个学习方向。");
      return;
    }

    setGenerating(true);
    try {
      const plan = await StudySeed.generatePlan(
        { goal: goal.trim(), date, hours, subjects, intensity }
      );
      setGenerating(false);
      onGenerated(plan);
    } catch (err) {
      setGenerating(false);
      setError(err.message || "生成失败，请检查 API Key 或网络。");
    }
  };

  const previewWeeks = activePlan?.weeks?.slice(0, 3) || [
    { title:"基础回顾", week:"1-2", direction:"专业", goal:"AI 会根据你的目标生成第一阶段。" },
    { title:"专项强化", week:"3-5", direction:"岗位", goal:"自动匹配 YouTube 与 Bilibili 课程资源。" },
    { title:"模拟冲刺", week:"6", direction:"学科", goal:"同步到计划时间表，并可手动编辑。" },
  ];

  return (
    <div className="page-shell scrollable" style={{background:"var(--ink)", color:"var(--paper)"}}>
      <SubHeader onBack={onBack} idx="01" label="ARRANGE A PLAN" zh="安排计划" accent="var(--green)"/>

      <div style={{padding:"24px 56px 80px", maxWidth:1240, margin:"0 auto", width:"100%"}}>
        <div style={{display:"grid", gridTemplateColumns:"1.1fr .9fr", gap:48}}>
          <div className="paper-tex" style={{
            background:"var(--paper)", color:"var(--ink)",
            borderRadius:28, padding:"40px 44px", position:"relative",
            boxShadow:"0 40px 80px -30px rgba(0,0,0,.6)"
          }}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28}}>
              <div>
                <div className="tag-text" style={{color:"rgba(5,5,5,.5)"}}>FORM · 01</div>
                <h2 style={{margin:"8px 0 0", fontSize:34, fontWeight:900, letterSpacing:".01em"}}>
                  今日之决，<span style={{color:"var(--green)"}}>明日之响</span>
                </h2>
                <p style={{margin:"10px 0 0", fontSize:14, color:"rgba(5,5,5,.6)", lineHeight:1.6}}>
                  把目标、时间和方向交给 AI，由服务端代理生成学习阶段、课程资源、记录和时间表。
                </p>
              </div>
              <div className="seal" style={{flexShrink:0}}>计</div>
            </div>

            <div style={{display:"flex", flexDirection:"column", gap:22}}>
              <div>
                <label className="field-label">学习目标</label>
                <input className="field-input" value={goal} onChange={e=>setGoal(e.target.value)} placeholder="例如：完善作品集 / 准备岗位面试 / 完成专业项目"/>
              </div>

              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:18}}>
                <div>
                  <label className="field-label">截止日期</label>
                  <input className="field-input" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
                </div>
                <div>
                  <label className="field-label">每日可用时间（小时）</label>
                  <div style={{display:"flex", alignItems:"center", gap:14}}>
                    <input type="range" min="0.5" max="8" step="0.5" value={hours} onChange={e=>setHours(parseFloat(e.target.value))} style={{flex:1, accentColor:"var(--green)"}}/>
                    <div style={{minWidth:64, padding:"10px 12px", borderRadius:10, background:"var(--ink)", color:"var(--paper)", textAlign:"center", fontFamily:"var(--type-mono)", fontWeight:600, fontSize:14}}>
                      {Number(hours).toFixed(1)} h
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="field-label">学习方向（可多选）</label>
                <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
                  {allSubjects.map(s => (
                    <button key={s} className="chip" aria-pressed={subjects.includes(s)} onClick={()=>toggleSubject(s)}>{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="field-label">学习节奏</label>
                <div style={{display:"flex", gap:8}}>
                  {["轻松","均衡","紧凑"].map(t => (
                    <button key={t} className="chip" aria-pressed={intensity===t} onClick={()=>setIntensity(t)}>{t}</button>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{padding:"12px 14px", borderRadius:12, background:"rgba(190,18,60,.08)", color:"#9f1239", border:"1px solid rgba(190,18,60,.18)", fontSize:13}}>
                  {error}
                </div>
              )}

              <div style={{display:"flex", alignItems:"center", gap:16, marginTop:4}}>
                <button onClick={submit} disabled={generating} className="btn btn-primary" style={{padding:"16px 28px", fontSize:15, opacity:generating ? .7 : 1}}>
                  {generating ? "正在生成计划与课程..." : "生成学习计划"}
                  {!generating && <Icon.ArrowRight size={18}/>}
                </button>
                <span style={{fontFamily:"var(--type-mono)", fontSize:11, color:"rgba(5,5,5,.5)", letterSpacing:".18em"}}>
                  SERVER PROXY · VERCEL READY
                </span>
              </div>
            </div>
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:18}}>
            <div className="grain-dark" style={{
              background:"var(--ink-2)", border:"1px solid var(--hairline)",
              borderRadius:24, padding:"28px 28px"
            }}>
              <div className="tag-text" style={{color:"rgba(241,236,224,.5)"}}>PREVIEW · 计划骨架</div>
              <h3 style={{margin:"10px 0 10px", fontSize:22, fontWeight:800}}>{activePlan?.title || goal || "等待你填写"}</h3>
              <p style={{margin:"0 0 20px", fontSize:13, color:"rgba(241,236,224,.55)", lineHeight:1.65}}>
                {activePlan?.summary || "生成后会自动写入学习记录，并把任务同步到计划时间表。"}
              </p>

              <div style={{display:"flex", flexDirection:"column", gap:12}}>
                {previewWeeks.map((row,i)=>(
                  <div key={row.id || i} style={{
                    padding:"14px 16px", borderRadius:14,
                    background:"rgba(241,236,224,.04)", border:"1px solid var(--hairline)"
                  }}>
                    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:12}}>
                      <div>
                        <div className="tag-text" style={{color:StudySeed.colorFor(row.direction)}}>{row.direction || "阶段"}</div>
                        <div style={{fontSize:15, fontWeight:700, marginTop:2}}>{row.title}</div>
                      </div>
                      <div style={{fontFamily:"var(--type-mono)", fontSize:12, color:"rgba(241,236,224,.5)", whiteSpace:"nowrap"}}>
                        WEEK {row.week}
                      </div>
                    </div>
                    {row.goal && <div style={{marginTop:8, fontSize:13, color:"rgba(241,236,224,.58)", lineHeight:1.55}}>{row.goal}</div>}
                    {row.resources && row.resources.length > 0 && (
                      <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:12}}>
                        {row.resources.slice(0,3).map(r => (
                          <a key={r.id || r.url} href={r.url} target="_blank" rel="noopener" style={{
                            fontSize:11, padding:"6px 9px", borderRadius:999,
                            background:"rgba(241,236,224,.08)", color:"var(--paper)", border:"1px solid var(--hairline)"
                          }}>{r.platform}</a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              border:"1px dashed var(--hairline-strong)", borderRadius:20, padding:"20px 22px",
              display:"flex", gap:14, alignItems:"flex-start"
            }}>
              <div style={{width:36,height:36,borderRadius:12,background:"var(--yellow)",color:"#1a1305",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon.Sprout size={20}/>
              </div>
              <div>
                <div style={{fontWeight:700, fontSize:14}}>部署说明</div>
                <div style={{fontSize:13, color:"rgba(241,236,224,.55)", marginTop:4, lineHeight:1.6}}>
                  API Key 不会暴露给用户。部署到 Vercel 后，在 Environment Variables 中配置 DeepSeek 和 YouTube Key 即可。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubHeader({ onBack, idx, label, zh, accent }) {
  return (
    <header style={{
      padding:"28px 56px", display:"flex", alignItems:"center", justifyContent:"space-between",
      borderBottom:"1px solid var(--hairline)"
    }}>
      <button onClick={onBack} className="btn btn-ghost" style={{padding:"10px 16px"}}>
        <Icon.ArrowLeft size={16}/> 回到信封
      </button>
      <div style={{display:"flex", alignItems:"center", gap:16}}>
        <span className="tag-text" style={{color:"rgba(241,236,224,.5)"}}>{idx} · {label}</span>
        <span style={{width:6,height:6,borderRadius:"50%",background:accent}}/>
        <span style={{fontFamily:"var(--type-cn-serif)", fontWeight:900, fontSize:18}}>{zh}</span>
      </div>
      <div className="tag-text" style={{color:"rgba(241,236,224,.4)"}}>STUDYSEED · 2026</div>
    </header>
  );
}

Object.assign(window, { PagePlanner, SubHeader });
