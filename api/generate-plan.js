const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

function extractJson(text) {
  const cleaned = String(text || "").replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("DeepSeek did not return valid JSON");
    return JSON.parse(match[0]);
  }
}

function makeBilibiliResources(query) {
  const q = query || "学习 入门";
  return [
    {
      id: `bili-${encodeURIComponent(q)}-system`,
      platform: "Bilibili",
      title: `${q} 系统课程`,
      channel: "Bilibili 搜索",
      url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(`${q} 系统课程`)}`,
      thumb: "",
    },
    {
      id: `bili-${encodeURIComponent(q)}-intro`,
      platform: "Bilibili",
      title: `${q} 入门到进阶`,
      channel: "Bilibili 搜索",
      url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(`${q} 入门 进阶`)}`,
      thumb: "",
    },
  ];
}

async function searchYouTube(query, apiKey) {
  if (!apiKey) return [];

  const url = "https://www.googleapis.com/youtube/v3/search"
    + `?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=2&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.items || []).map(item => ({
      id: item.id.videoId,
      platform: "YouTube",
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumb: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
    }));
  } catch {
    return [];
  }
}

function buildPrompt(form) {
  return `
你是 StudySeed 的专业学习规划师。请根据用户信息生成可执行学习计划，并只返回 JSON，不要 Markdown，不要代码块。

用户目标：${form.goal}
截止日期：${form.date}
每日可用时间：${form.hours} 小时
学习方向：${(form.subjects || []).join("、")}
学习节奏：${form.intensity}

JSON 结构必须是：
{
  "title": "计划标题",
  "summary": "一句话说明",
  "weeks": [
    {
      "week": 1,
      "title": "阶段标题",
      "goal": "本阶段目标",
      "direction": "艺术/专业/岗位/学科/其他之一",
      "youtubeQuery": "英文 YouTube 搜索词，8 个词以内",
      "bilibiliQuery": "中文 Bilibili 搜索词，12 个字以内",
      "tasks": [
        {"title": "具体任务", "durationHours": 1.5, "resourceQuery": "课程搜索词"}
      ]
    }
  ],
  "outcomes": ["最终成果1", "最终成果2", "最终成果3"]
}

要求：
1. weeks 数量为 4 到 8 个，按从基础到实践递进。
2. 每个 week 至少 2 个任务，任务要具体、可执行。
3. 课程搜索词要适合匹配 YouTube 和 Bilibili 教程。
4. 不要返回任何 JSON 之外的说明。
`;
}

async function callDeepSeek(form) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    const err = new Error("Missing DEEPSEEK_API_KEY environment variable");
    err.statusCode = 500;
    throw err;
  }

  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      temperature: 0.4,
      max_tokens: 2600,
      messages: [{ role: "user", content: buildPrompt(form) }],
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const err = new Error(data.error?.message || `DeepSeek API error ${response.status}`);
    err.statusCode = response.status;
    throw err;
  }

  const data = await response.json();
  return extractJson(data.choices?.[0]?.message?.content || "");
}

async function attachResources(outline) {
  const youtubeKey = process.env.YOUTUBE_API_KEY || "";
  const weeks = Array.isArray(outline.weeks) ? outline.weeks : [];

  const enrichedWeeks = await Promise.all(weeks.map(async (week) => {
    const youtubeQuery = week.youtubeQuery || week.ytQuery || week.title || outline.title;
    const bilibiliQuery = week.bilibiliQuery || week.title || outline.title;
    const youtube = await searchYouTube(`${youtubeQuery} tutorial`, youtubeKey);
    const bilibili = makeBilibiliResources(bilibiliQuery);
    return {
      ...week,
      youtubeQuery,
      bilibiliQuery,
      resources: [...youtube, ...bilibili].slice(0, 4),
    };
  }));

  return { ...outline, weeks: enrichedWeeks };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = req.body || {};

    if (!form.goal || typeof form.goal !== "string") {
      return res.status(400).json({ error: "Missing goal" });
    }

    const outline = await callDeepSeek({
      goal: form.goal.slice(0, 500),
      date: form.date || "",
      hours: Number(form.hours || 1),
      subjects: Array.isArray(form.subjects) ? form.subjects.slice(0, 8) : [],
      intensity: form.intensity || "均衡",
    });

    const result = await attachResources(outline);
    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || "Failed to generate plan" });
  }
};
