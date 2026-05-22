const StudySeed = (() => {
  const STORAGE_KEY = "studyseed.workspace.v1";
  const listeners = new Set();

  const emptyState = {
    plans: [],
    activePlanId: null,
    records: [],
    events: [],
  };

  const directionColors = {
    "艺术": "var(--yellow)",
    "专业": "var(--green)",
    "岗位": "var(--paper)",
    "学科": "var(--green)",
    "其他": "var(--yellow)",
  };

  const readJson = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const writeJson = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const today = () => new Date().toISOString().slice(0, 10);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const get = () => readJson(STORAGE_KEY, emptyState);

  const set = (updater) => {
    const prev = get();
    const next = typeof updater === "function" ? updater(prev) : updater;
    writeJson(STORAGE_KEY, next);
    listeners.forEach(fn => fn(next));
    return next;
  };

  const subscribe = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };

  const pickDirection = (directions, index) => {
    if (!directions || !directions.length) return "其他";
    return directions[index % directions.length];
  };

  const colorFor = (direction) => directionColors[direction] || "var(--green)";

  const normalizeWeeks = (outline, form) => {
    const rawWeeks = outline.weeks || outline.phases || outline.stages || [];
    if (!Array.isArray(rawWeeks) || rawWeeks.length === 0) {
      throw new Error("AI 没有返回可用的阶段计划");
    }

    return rawWeeks.slice(0, 12).map((week, index) => {
      const direction = week.direction || pickDirection(form.subjects, index);
      const tasks = Array.isArray(week.tasks)
        ? week.tasks
        : (week.topics || []).map(topic => ({ title: topic, durationHours: form.hours }));

      return {
        id: uid("week"),
        week: week.week || index + 1,
        title: week.title || `第 ${index + 1} 阶段`,
        goal: week.goal || week.summary || "",
        direction,
        youtubeQuery: week.youtubeQuery || week.ytQuery || "",
        bilibiliQuery: week.bilibiliQuery || "",
        tasks: tasks.slice(0, 5).map((task, taskIndex) => ({
          id: uid("task"),
          title: task.title || task.name || String(task),
          durationHours: Number(task.durationHours || task.hours || form.hours || 1),
          done: false,
          note: task.note || "",
          direction: task.direction || direction,
          resourceQuery: task.resourceQuery || task.query || week.youtubeQuery || week.bilibiliQuery || form.goal,
          order: taskIndex,
        })),
        resources: Array.isArray(week.resources) ? week.resources : [],
      };
    });
  };

  const buildScheduleEvents = (plan) => {
    const slots = [
      { d: 0, s: 1 }, { d: 1, s: 3 }, { d: 2, s: 1 }, { d: 3, s: 4 },
      { d: 4, s: 2 }, { d: 5, s: 5 }, { d: 6, s: 2 }, { d: 1, s: 0 },
    ];
    const events = [];
    let cursor = 0;

    plan.weeks.forEach((week) => {
      week.tasks.slice(0, 2).forEach((task) => {
        const slot = slots[cursor % slots.length];
        const span = clamp(Math.round(task.durationHours / 1.5), 1, 3);
        events.push({
          id: uid("event"),
          planId: plan.id,
          weekId: week.id,
          taskId: task.id,
          d: slot.d,
          s: slot.s,
          span,
          t: task.title,
          sub: task.direction || week.direction,
          c: colorFor(task.direction || week.direction),
          done: false,
          source: "plan",
          resources: week.resources,
        });
        cursor += 1;
      });
    });

    return events;
  };

  const requestGeneratedPlan = async (form) => {
    const res = await fetch("/api/generate-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `生成接口错误 ${res.status}`);
    }
    return data;
  };

  const generatePlan = async (form) => {
    const outline = await requestGeneratedPlan(form);
    const weeks = normalizeWeeks(outline, form);

    const plan = {
      id: uid("plan"),
      title: outline.title || form.goal,
      summary: outline.summary || "AI 已生成学习路径与课程资源。",
      goal: form.goal,
      date: form.date,
      hours: form.hours,
      subjects: form.subjects,
      intensity: form.intensity,
      outcomes: outline.outcomes || [],
      weeks,
      createdAt: new Date().toISOString(),
    };

    const events = buildScheduleEvents(plan);
    const record = {
      id: uid("record"),
      planId: plan.id,
      name: `${plan.title} · 计划已生成`,
      date: today(),
      dur: "0h",
      hours: 0,
      status: "待开始",
      tag: form.subjects[0] || "其他",
      color: colorFor(form.subjects[0] || "其他"),
      tasks: weeks.flatMap(w => w.tasks.slice(0, 2).map(t => t.title)).slice(0, 6),
      resources: weeks.flatMap(w => w.resources).slice(0, 6),
    };

    set(prev => ({
      ...prev,
      plans: [plan, ...prev.plans],
      activePlanId: plan.id,
      events,
      records: [record, ...prev.records],
    }));

    return plan;
  };

  const upsertEvent = (event) => {
    set(prev => {
      const nextEvent = {
        ...event,
        id: event.id || uid("event"),
        c: event.c || colorFor(event.sub),
        span: clamp(Number(event.span || 1), 1, 3),
        d: Number(event.d || 0),
        s: Number(event.s || 0),
      };
      const exists = prev.events.some(e => e.id === nextEvent.id);
      return {
        ...prev,
        events: exists
          ? prev.events.map(e => e.id === nextEvent.id ? nextEvent : e)
          : [...prev.events, nextEvent],
      };
    });
  };

  const deleteEvent = (id) => {
    set(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }));
  };

  const completeEvent = (eventId) => {
    let completed;
    set(prev => {
      const events = prev.events.map(evt => {
        if (evt.id !== eventId) return evt;
        completed = { ...evt, done: true };
        return completed;
      });
      if (!completed) return prev;

      const hours = Number(completed.span || 1);
      const record = {
        id: uid("record"),
        planId: completed.planId,
        name: completed.t,
        date: today(),
        dur: `${hours}h`,
        hours,
        status: "已完成",
        tag: completed.sub || "其他",
        color: colorFor(completed.sub || "其他"),
        tasks: [completed.t],
        resources: completed.resources || [],
      };

      return { ...prev, events, records: [record, ...prev.records] };
    });
  };

  const syncActivePlanToSchedule = () => {
    set(prev => {
      const plan = prev.plans.find(p => p.id === prev.activePlanId);
      if (!plan) return prev;
      return { ...prev, events: buildScheduleEvents(plan) };
    });
  };

  const getStats = (state = get()) => {
    const completed = state.records.filter(r => r.status === "已完成");
    const totalHours = completed.reduce((sum, r) => sum + Number(r.hours || parseFloat(r.dur) || 0), 0);
    const activePlan = state.plans.find(p => p.id === state.activePlanId);
    const activeDirections = activePlan ? new Set(activePlan.subjects || []).size : 0;
    const hasToday = completed.some(r => r.date === today());
    return {
      streak: hasToday ? 1 : 0,
      monthHours: totalHours,
      activeDirections,
      completedCount: completed.length,
      recordCount: state.records.length,
    };
  };

  return {
    get,
    set,
    subscribe,
    generatePlan,
    upsertEvent,
    deleteEvent,
    completeEvent,
    syncActivePlanToSchedule,
    getStats,
    colorFor,
  };
})();

function useStudySeedData() {
  const [state, setState] = React.useState(StudySeed.get());

  React.useEffect(() => StudySeed.subscribe(setState), []);

  return state;
}

Object.assign(window, { StudySeed, useStudySeedData });
