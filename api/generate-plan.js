const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_TIMEOUT_MS = numberFromEnv("DEEPSEEK_TIMEOUT_MS", 45000);
const DEEPSEEK_MAX_TOKENS = numberFromEnv("DEEPSEEK_MAX_TOKENS", 1800);
const YOUTUBE_TIMEOUT_MS = numberFromEnv("YOUTUBE_TIMEOUT_MS", 2500);
const YOUTUBE_MAX_WEEKS = numberFromEnv("YOUTUBE_MAX_WEEKS", 4);
const YOUTUBE_RESULTS_PER_WEEK = numberFromEnv("YOUTUBE_RESULTS_PER_WEEK", 2);
const YOUTUBE_CACHE_TTL_MS = numberFromEnv("YOUTUBE_CACHE_TTL_MS", 1000 * 60 * 60 * 6);
const youtubeCache = new Map();

function numberFromEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function cacheGet(cache, key, ttlMs) {
  const hit = cache.get(key);
  if (!hit || Date.now() - hit.time > ttlMs) return null;
  return hit.value;
}

function cacheSet(cache, key, value) {
  cache.set(key, { time: Date.now(), value });
  if (cache.size > 80) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
}

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

function makeYouTubeSearchResource(query, reason = "search-fallback") {
  const q = query || "learning tutorial";
  return [{
    id: `yt-search-${encodeURIComponent(q)}-${reason}`,
    platform: "YouTube",
    title: `YouTube search: ${q}`,
    channel: "YouTube Search",
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
    thumb: "",
  }];
}

async function searchYouTube(query, apiKey) {
  if (!apiKey) return makeYouTubeSearchResource(query, "missing-key");
  const cacheKey = query.toLowerCase().trim();
  const cached = cacheGet(youtubeCache, cacheKey, YOUTUBE_CACHE_TTL_MS);
  if (cached) return cached;

  const url = "https://www.googleapis.com/youtube/v3/search"
    + `?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${Math.max(1, Math.min(3, YOUTUBE_RESULTS_PER_WEEK))}&key=${apiKey}`;

  try {
    const response = await fetchWithTimeout(url, {}, YOUTUBE_TIMEOUT_MS);
    if (!response.ok) {
      console.warn(`YouTube search failed: ${response.status} ${response.statusText}`);
      return makeYouTubeSearchResource(query, `api-${response.status}`);
    }
    const data = await response.json();
    const videos = (data.items || []).map(item => ({
      id: item.id.videoId,
      platform: "YouTube",
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumb: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
    }));
    const resources = videos.length ? videos : makeYouTubeSearchResource(query, "empty");
    cacheSet(youtubeCache, cacheKey, resources);
    return resources;
  } catch (error) {
    console.warn(`YouTube search unavailable: ${error.name || "Error"}`);
    return makeYouTubeSearchResource(query, error.name === "AbortError" ? "timeout" : "network");
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
1. weeks 数量为 4 到 6 个，按从基础到实践递进。
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

  const response = await fetchWithTimeout(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      temperature: 0.4,
      max_tokens: DEEPSEEK_MAX_TOKENS,
      messages: [{ role: "user", content: buildPrompt(form) }],
    }),
  }, DEEPSEEK_TIMEOUT_MS);

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

  const enrichedWeeks = await Promise.all(weeks.map(async (week, index) => {
    const youtubeQuery = week.youtubeQuery || week.ytQuery || week.title || outline.title;
    const bilibiliQuery = week.bilibiliQuery || week.title || outline.title;
    const shouldSearchYouTube = index < Math.max(0, YOUTUBE_MAX_WEEKS);
    const youtube = shouldSearchYouTube
      ? await searchYouTube(`${youtubeQuery} tutorial`, youtubeKey)
      : makeYouTubeSearchResource(`${youtubeQuery} tutorial`, "deferred");
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
    const message = error.name === "AbortError"
      ? "生成时间过长，请稍后重试或把目标写得更具体一些。"
      : (error.message || "Failed to generate plan");
    return res.status(status).json({ error: message });
  }
};
