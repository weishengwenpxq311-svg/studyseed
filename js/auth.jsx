const StudySeedAuth = (() => {
  const USER_KEY = "studyseed.user.v1";

  const getUser = () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const login = (profile) => {
    const user = {
      name: profile.name || "StudySeed User",
      email: profile.email || "",
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
  };

  return { getUser, login, logout };
})();

const StudySeedExport = (() => {
  const safeName = (text) => String(text || "studyseed")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 72);

  const downloadText = (filename, text, type = "text/markdown;charset=utf-8") => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const activePlan = () => {
    const state = StudySeed.get();
    return state.plans.find(p => p.id === state.activePlanId) || null;
  };

  const planMarkdown = (plan, state) => {
    const events = state.events.filter(e => e.planId === plan.id);
    const lines = [
      `# ${plan.title}`,
      "",
      plan.summary || "",
      "",
      `- 学习目标：${plan.goal}`,
      `- 截止日期：${plan.date}`,
      `- 每日可用时间：${plan.hours} h`,
      `- 学习方向：${(plan.subjects || []).join("、")}`,
      `- 学习节奏：${plan.intensity}`,
      "",
      "## 阶段计划",
    ];

    (plan.weeks || []).forEach((week) => {
      lines.push("", `### Week ${week.week} · ${week.title}`, week.goal || "");
      (week.tasks || []).forEach((task, index) => {
        lines.push(`- [ ] ${index + 1}. ${task.title}（${task.durationHours || 1}h）`);
      });

      if ((week.resources || []).length) {
        lines.push("", "课程资源：");
        week.resources.forEach(resource => {
          lines.push(`- ${resource.platform} · [${resource.title}](${resource.url})`);
        });
      }
    });

    if (events.length) {
      lines.push("", "## 已同步时间表");
      events.forEach(event => {
        lines.push(`- ${event.t} · 周${event.d + 1} · ${event.s} · ${event.span} 格 · ${event.sub}`);
      });
    }

    return lines.join("\n");
  };

  const timetableMarkdown = (events) => {
    const dayNames = ["周一","周二","周三","周四","周五","周六","周日"];
    const hourNames = ["07:00","09:00","11:00","13:00","15:00","17:00","19:00","21:00"];
    const lines = ["# StudySeed 计划时间表", ""];

    if (!events.length) {
      lines.push("暂无时间表事项。");
      return lines.join("\n");
    }

    events
      .slice()
      .sort((a, b) => (a.d - b.d) || (a.s - b.s))
      .forEach(event => {
        lines.push(`- ${dayNames[event.d] || "未定"} ${hourNames[event.s] || ""} · ${event.t} · ${event.sub} · ${event.span || 1} 格${event.done ? " · 已完成" : ""}`);
      });

    return lines.join("\n");
  };

  const downloadPlanBundle = () => {
    const state = StudySeed.get();
    const plan = activePlan();
    if (!plan) throw new Error("还没有可下载的安排计划。");
    const markdown = planMarkdown(plan, state);
    downloadText(`${safeName(plan.title)}-studyseed-plan.md`, markdown);
  };

  const downloadTimetable = () => {
    const state = StudySeed.get();
    const markdown = timetableMarkdown(state.events || []);
    downloadText("studyseed-timetable.md", markdown);
  };

  return { downloadPlanBundle, downloadTimetable };
})();

function LoginModal({ onClose, onLogin }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");

  const submit = (event) => {
    event.preventDefault();
    const user = StudySeedAuth.login({ name: name.trim(), email: email.trim() });
    onLogin(user);
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:10000,
      background:"rgba(0,0,0,.68)", display:"flex", alignItems:"center", justifyContent:"center",
      padding:24
    }}>
      <form onSubmit={submit} className="paper-tex" style={{
        width:"min(460px, 100%)", background:"var(--paper)", color:"var(--ink)",
        borderRadius:24, padding:"30px 32px", boxShadow:"0 34px 80px -28px rgba(0,0,0,.85)"
      }}>
        <div className="tag-text" style={{color:"rgba(5,5,5,.5)"}}>LOGIN · DOWNLOAD ACCESS</div>
        <h2 style={{margin:"10px 0 8px", fontSize:30, fontWeight:900}}>登录后下载</h2>
        <p style={{margin:"0 0 22px", fontSize:14, color:"rgba(5,5,5,.62)", lineHeight:1.65}}>
          不登录也可以正常生成计划和查看视频。登录后可以下载安排计划、视频链接和计划时间表。
        </p>

        <div style={{display:"flex", flexDirection:"column", gap:14}}>
          <div>
            <label className="field-label">昵称</label>
            <input className="field-input" value={name} onChange={e=>setName(e.target.value)} placeholder="你的名字"/>
          </div>
          <div>
            <label className="field-label">邮箱（可选）</label>
            <input className="field-input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
          </div>
        </div>

        <div style={{display:"flex", justifyContent:"flex-end", gap:10, marginTop:24}}>
          <button type="button" onClick={onClose} className="btn btn-ghost" style={{color:"var(--ink)", borderColor:"rgba(5,5,5,.18)"}}>取消</button>
          <button type="submit" className="btn btn-primary">登录</button>
        </div>
      </form>
    </div>
  );
}

Object.assign(window, { StudySeedAuth, StudySeedExport, LoginModal });
