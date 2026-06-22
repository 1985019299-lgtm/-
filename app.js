const todayKey = new Date().toISOString().slice(0, 10);
const storeKey = "weight-checkin-site-v4";

const defaults = {
  settings: {
    waterGoal: 8,
    waterInterval: 60,
    exerciseTime: "19:30",
    exerciseGoal: 30,
    trendRange: 30
  },
  videos: [
    {
      id: createId(),
      name: "周末拉伸 20 分钟",
      url: "https://www.youtube.com/results?search_query=20+minute+stretching",
      type: "拉伸"
    },
    {
      id: createId(),
      name: "低冲击燃脂训练",
      url: "https://www.bilibili.com/",
      type: "燃脂"
    }
  ],
  days: {},
  mealPlan: null,
  trainings: [
    {
      id: createId(),
      name: "快走或椭圆机",
      detail: "20 分钟",
      type: "有氧"
    },
    {
      id: createId(),
      name: "深蹲",
      detail: "3 组 × 15 次",
      type: "力量"
    }
  ]
};

let data = loadData();
let waterTimer = null;
let exerciseTimer = null;

const el = {
  todayText: document.querySelector("#todayText"),
  resetTodayBtn: document.querySelector("#resetTodayBtn"),
  weightInput: document.querySelector("#weightInput"),
  moodInput: document.querySelector("#moodInput"),
  breakfastCheck: document.querySelector("#breakfastCheck"),
  snackCheck: document.querySelector("#snackCheck"),
  sleepCheck: document.querySelector("#sleepCheck"),
  noteInput: document.querySelector("#noteInput"),
  waterCount: document.querySelector("#waterCount"),
  waterGoalText: document.querySelector("#waterGoalText"),
  waterGoalInput: document.querySelector("#waterGoalInput"),
  waterIntervalInput: document.querySelector("#waterIntervalInput"),
  waterRing: document.querySelector("#waterRing"),
  addWaterBtn: document.querySelector("#addWaterBtn"),
  waterMinusBtn: document.querySelector("#waterMinusBtn"),
  waterReminderText: document.querySelector("#waterReminderText"),
  exerciseMinutes: document.querySelector("#exerciseMinutes"),
  exerciseDoneInput: document.querySelector("#exerciseDoneInput"),
  exerciseTimeInput: document.querySelector("#exerciseTimeInput"),
  exerciseGoalInput: document.querySelector("#exerciseGoalInput"),
  exerciseBar: document.querySelector("#exerciseBar"),
  exerciseReminderText: document.querySelector("#exerciseReminderText"),
  videoForm: document.querySelector("#videoForm"),
  videoNameInput: document.querySelector("#videoNameInput"),
  videoUrlInput: document.querySelector("#videoUrlInput"),
  videoTypeInput: document.querySelector("#videoTypeInput"),
  videoList: document.querySelector("#videoList"),
  historyList: document.querySelector("#historyList"),
  notifyBtn: document.querySelector("#notifyBtn"),
  toast: document.querySelector("#toast")
};

Object.assign(el, {
  pageViews: document.querySelectorAll("[data-page]"),
  navButtons: document.querySelectorAll("[data-page-target]"),
  trendRangeInput: document.querySelector("#trendRangeInput"),
  trendStats: document.querySelector("#trendStats"),
  weightChart: document.querySelector("#weightChart"),
  manualWeightForm: document.querySelector("#manualWeightForm"),
  manualDateInput: document.querySelector("#manualDateInput"),
  manualWeightInput: document.querySelector("#manualWeightInput"),
  weightEntryList: document.querySelector("#weightEntryList"),
  mealPlanForm: document.querySelector("#mealPlanForm"),
  mealIngredientsInput: document.querySelector("#mealIngredientsInput"),
  mealStyleInput: document.querySelector("#mealStyleInput"),
  mealCalorieInput: document.querySelector("#mealCalorieInput"),
  mealPlanOutput: document.querySelector("#mealPlanOutput"),
  mealBreakfastCheck: document.querySelector("#mealBreakfastCheck"),
  mealLunchCheck: document.querySelector("#mealLunchCheck"),
  mealDinnerCheck: document.querySelector("#mealDinnerCheck"),
  mealSnackCheck: document.querySelector("#mealSnackCheck"),
  trainingForm: document.querySelector("#trainingForm"),
  trainingNameInput: document.querySelector("#trainingNameInput"),
  trainingDetailInput: document.querySelector("#trainingDetailInput"),
  trainingTypeInput: document.querySelector("#trainingTypeInput"),
  trainingList: document.querySelector("#trainingList"),
  trainingCount: document.querySelector("#trainingCount"),
  trainingPercent: document.querySelector("#trainingPercent"),
  trainingBar: document.querySelector("#trainingBar")
});

function loadData() {
  const saved = localStorage.getItem(storeKey);
  if (!saved) return structuredClone(defaults);

  try {
    return mergeData(JSON.parse(saved));
  } catch {
    return structuredClone(defaults);
  }
}

function mergeData(saved) {
  return {
    settings: { ...defaults.settings, ...(saved.settings || {}) },
    videos: Array.isArray(saved.videos) ? saved.videos : defaults.videos,
    days: saved.days || {},
    mealPlan: saved.mealPlan || null,
    trainings: Array.isArray(saved.trainings) ? saved.trainings : defaults.trainings
  };
}

function saveData() {
  localStorage.setItem(storeKey, JSON.stringify(data));
}

function getToday() {
  if (!data.days[todayKey]) {
    data.days[todayKey] = {
      weight: "",
      mood: "稳稳的",
      breakfast: false,
      snack: false,
      sleep: false,
      note: "",
      water: 0,
      exercise: 0,
      exerciseDone: false,
      mealChecks: {
        breakfast: false,
        lunch: false,
        dinner: false,
        snack: false
      },
      trainingDone: {}
    };
  }
  if (!data.days[todayKey].mealChecks) {
    data.days[todayKey].mealChecks = {
      breakfast: false,
      lunch: false,
      dinner: false,
      snack: false
    };
  }
  if (!data.days[todayKey].trainingDone) {
    data.days[todayKey].trainingDone = {};
  }
  return data.days[todayKey];
}

function render() {
  const today = getToday();
  const dateText = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(new Date());

  el.todayText.textContent = dateText;
  el.weightInput.value = today.weight;
  el.moodInput.value = today.mood;
  el.breakfastCheck.checked = today.breakfast;
  el.snackCheck.checked = today.snack;
  el.sleepCheck.checked = today.sleep;
  el.noteInput.value = today.note;
  el.waterCount.textContent = today.water;
  el.waterGoalText.textContent = data.settings.waterGoal;
  el.waterGoalInput.value = data.settings.waterGoal;
  el.waterIntervalInput.value = data.settings.waterInterval;
  el.exerciseMinutes.textContent = today.exercise;
  el.exerciseDoneInput.checked = today.exerciseDone;
  el.exerciseTimeInput.value = data.settings.exerciseTime;
  el.exerciseGoalInput.value = data.settings.exerciseGoal;
  el.mealBreakfastCheck.checked = today.mealChecks.breakfast;
  el.mealLunchCheck.checked = today.mealChecks.lunch;
  el.mealDinnerCheck.checked = today.mealChecks.dinner;
  el.mealSnackCheck.checked = today.mealChecks.snack;
  el.trendRangeInput.value = data.settings.trendRange;

  const waterProgress = Math.min(today.water / data.settings.waterGoal, 1);
  el.waterRing.style.strokeDashoffset = `${314 - 314 * waterProgress}`;
  const exerciseProgress = Math.min(today.exercise / data.settings.exerciseGoal, 1);
  el.exerciseBar.style.width = `${exerciseProgress * 100}%`;

  el.waterReminderText.textContent = `每 ${data.settings.waterInterval} 分钟提醒一次喝水。`;
  el.exerciseReminderText.textContent = `每天 ${data.settings.exerciseTime} 提醒运动，目标 ${data.settings.exerciseGoal} 分钟。`;

  renderVideos();
  renderHistory();
  renderTrend();
  renderMealPlan();
  renderTrainings();
}

function renderVideos() {
  if (!data.videos.length) {
    el.videoList.innerHTML = '<p class="hint">把你常看的运动视频放进来，打开会很顺手。</p>';
    return;
  }

  el.videoList.innerHTML = data.videos
    .map(
      (video) => `
        <div class="video-card">
          <div>
            <a href="${escapeHtml(video.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(video.name)}</a>
            <span class="tag">${escapeHtml(video.type)}</span>
          </div>
          <button class="delete-video" type="button" data-id="${video.id}" title="删除">×</button>
        </div>
      `
    )
    .join("");
}

function renderHistory() {
  const rows = [...Array(7)].map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    const day = data.days[key] || {};
    const label = new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", weekday: "short" }).format(date);
    const water = day.water || 0;
    const exercise = day.exercise || 0;
    const weight = day.weight ? `${day.weight} kg` : "未记录体重";

    return `
      <div class="history-row">
        <strong>${label}</strong>
        <span>${weight} · 喝水 ${water} 杯 · 运动 ${exercise} 分钟</span>
      </div>
    `;
  });

  el.historyList.innerHTML = rows.join("");
}

function renderTrend() {
  const points = getWeightPoints(Number(data.settings.trendRange));
  const allWeights = Object.entries(data.days)
    .filter(([, day]) => day.weight)
    .sort(([a], [b]) => b.localeCompare(a));

  if (!points.length) {
    el.trendStats.innerHTML = `
      <div class="stat-card"><strong>暂无</strong><span>体重记录</span></div>
      <div class="stat-card"><strong>--</strong><span>起始</span></div>
      <div class="stat-card"><strong>--</strong><span>最近</span></div>
      <div class="stat-card"><strong>--</strong><span>变化</span></div>
    `;
    el.weightChart.innerHTML = '<text x="360" y="145" text-anchor="middle" class="chart-label">先记录几天体重，趋势就会出现</text>';
  } else {
    const first = points[0].weight;
    const last = points[points.length - 1].weight;
    const change = last - first;
    const min = Math.min(...points.map((point) => point.weight));
    const max = Math.max(...points.map((point) => point.weight));

    el.trendStats.innerHTML = `
      <div class="stat-card"><strong>${points.length}</strong><span>有记录天数</span></div>
      <div class="stat-card"><strong>${first.toFixed(1)}</strong><span>起始 kg</span></div>
      <div class="stat-card"><strong>${last.toFixed(1)}</strong><span>最近 kg</span></div>
      <div class="stat-card"><strong>${change > 0 ? "+" : ""}${change.toFixed(1)}</strong><span>区间变化 kg</span></div>
    `;
    el.weightChart.innerHTML = buildWeightChart(points, min, max);
  }

  if (!allWeights.length) {
    el.weightEntryList.innerHTML = '<p class="hint">还没有体重记录。</p>';
    return;
  }

  el.weightEntryList.innerHTML = allWeights
    .map(([date, day]) => {
      const label = formatDate(date);
      return `
        <div class="weight-entry">
          <div>
            <strong>${Number(day.weight).toFixed(1)} kg</strong>
            <span>${label}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function getWeightPoints(range) {
  const start = new Date();
  start.setDate(start.getDate() - range + 1);
  return Object.entries(data.days)
    .filter(([date, day]) => date >= start.toISOString().slice(0, 10) && day.weight)
    .map(([date, day]) => ({ date, weight: Number(day.weight) }))
    .filter((point) => !Number.isNaN(point.weight))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildWeightChart(points, min, max) {
  const width = 720;
  const height = 280;
  const padding = { top: 28, right: 28, bottom: 44, left: 48 };
  const span = Math.max(max - min, 1);
  const low = min - span * 0.2;
  const high = max + span * 0.2;
  const yFor = (weight) => padding.top + ((high - weight) / (high - low)) * (height - padding.top - padding.bottom);
  const xFor = (index) => padding.left + (index / Math.max(points.length - 1, 1)) * (width - padding.left - padding.right);
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${xFor(index).toFixed(1)} ${yFor(point.weight).toFixed(1)}`).join(" ");
  const grid = [0, 1, 2, 3].map((index) => {
    const y = padding.top + index * ((height - padding.top - padding.bottom) / 3);
    const value = high - index * ((high - low) / 3);
    return `<line class="chart-grid" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"></line><text class="chart-label" x="8" y="${y + 4}">${value.toFixed(1)}</text>`;
  });
  const dots = points
    .map((point, index) => `<circle class="chart-dot" cx="${xFor(index).toFixed(1)}" cy="${yFor(point.weight).toFixed(1)}" r="5"><title>${formatDate(point.date)} ${point.weight.toFixed(1)} kg</title></circle>`)
    .join("");
  const labels = points
    .filter((_, index) => index === 0 || index === points.length - 1 || index % Math.ceil(points.length / 4) === 0)
    .map((point, index, filtered) => {
      const originalIndex = points.indexOf(point);
      const anchor = index === 0 ? "start" : index === filtered.length - 1 ? "end" : "middle";
      return `<text class="chart-label" text-anchor="${anchor}" x="${xFor(originalIndex).toFixed(1)}" y="260">${point.date.slice(5)}</text>`;
    })
    .join("");

  return `${grid.join("")}<path class="chart-line" d="${path}"></path>${dots}${labels}`;
}

function renderMealPlan() {
  const plan = data.mealPlan || createMealPlan("", "清淡", "轻盈");
  el.mealIngredientsInput.value = plan.ingredients || "";
  el.mealStyleInput.value = plan.style || "清淡";
  el.mealCalorieInput.value = plan.calorie || "轻盈";
  el.mealPlanOutput.innerHTML = plan.meals
    .map(
      (meal) => `
        <div class="meal-card ${meal.type === "小提醒" ? "meal-tip" : ""}">
          <strong>${escapeHtml(meal.type)} <span>${escapeHtml(meal.time)}</span></strong>
          <p>${escapeHtml(meal.text)}</p>
        </div>
      `
    )
    .join("");
}

function renderTrainings() {
  const today = getToday();
  const total = data.trainings.length;
  const done = data.trainings.filter((item) => today.trainingDone[item.id]).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  el.trainingCount.textContent = `${done}/${total}`;
  el.trainingPercent.textContent = `${percent}%`;
  el.trainingBar.style.width = `${percent}%`;

  if (!total) {
    el.trainingList.innerHTML = '<p class="hint">还没有训练计划，先添加一个今天想做的动作。</p>';
    return;
  }

  el.trainingList.innerHTML = data.trainings
    .map((item) => {
      const checked = Boolean(today.trainingDone[item.id]);
      return `
        <div class="training-item ${checked ? "done" : ""}">
          <label class="training-check">
            <input type="checkbox" data-training-id="${item.id}" ${checked ? "checked" : ""} />
            <span></span>
          </label>
          <div class="training-copy">
            <strong>${escapeHtml(item.name)}</strong>
            <p>${escapeHtml(item.detail || "按自己的节奏完成")} · ${escapeHtml(item.type)}</p>
          </div>
          <button class="delete-training" type="button" data-training-delete="${item.id}" title="删除">×</button>
        </div>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function updateToday(patch) {
  data.days[todayKey] = { ...getToday(), ...patch };
  saveData();
  render();
}

function updateMealChecks(patch) {
  const today = getToday();
  updateToday({ mealChecks: { ...today.mealChecks, ...patch } });
}

function updateTrainingDone(id, checked) {
  const today = getToday();
  updateToday({ trainingDone: { ...today.trainingDone, [id]: checked } });
  showToast(checked ? "训练已完成。" : "已取消完成标记。");
}

function switchPage(page) {
  el.pageViews.forEach((view) => view.classList.toggle("active", view.dataset.page === page));
  el.navButtons.forEach((button) => button.classList.toggle("active", button.dataset.pageTarget === page));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formatDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", weekday: "short" }).format(new Date(year, month - 1, day));
}

function createMealPlan(rawIngredients, style, calorie) {
  const ingredients = rawIngredients
    .split(/[，,、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const picks = ingredients.length ? ingredients : ["鸡蛋", "燕麦", "青菜", "鸡胸肉", "酸奶", "苹果"];
  const protein = findFirst(picks, ["鸡", "牛", "鱼", "虾", "蛋", "豆腐", "酸奶", "牛奶"]) || picks[0];
  const vegetable = findFirst(picks, ["菜", "西兰花", "菠菜", "番茄", "黄瓜", "生菜", "蘑菇"]) || picks[1] || "青菜";
  const carb = findFirst(picks, ["米", "饭", "燕麦", "面", "土豆", "红薯", "玉米", "全麦"]) || "杂粮饭";
  const fruit = findFirst(picks, ["苹果", "香蕉", "莓", "橙", "梨", "桃"]) || "水果";
  const portions = {
    "轻盈": "主食半拳，蛋白一掌，蔬菜两拳",
    "均衡": "主食一拳，蛋白一掌，蔬菜两拳",
    "运动日": "主食一到一拳半，蛋白一掌半，蔬菜两拳"
  };
  const prep = {
    "清淡": "少油少盐，蒸煮或清炒",
    "中式": "家常做法，油盐减半",
    "高蛋白": "优先保证蛋白质，主食适量",
    "省事": "十到十五分钟内能完成"
  };

  return {
    ingredients: rawIngredients,
    style,
    calorie,
    meals: [
      { type: "早餐", time: "07:00-09:00", text: `${carb}配${protein}，加一份${fruit}。${prep[style]}，吃到七八分饱。` },
      { type: "午餐", time: "11:30-13:30", text: `${protein}、${vegetable}和${carb}组合成一盘，按${portions[calorie]}来配。` },
      { type: "加餐", time: "15:00-17:00", text: `饿了选${fruit}或无糖酸奶，先喝水，十分钟后再决定要不要加。` },
      { type: "晚餐", time: "18:00-20:00", text: `${vegetable}加${protein}，主食比午餐少一点，睡前三小时尽量不再加餐。` },
      { type: "小提醒", time: "全天", text: "这是生活记录工具，不替代医生或营养师建议；如果你有基础病、孕期或饮食禁忌，要按专业建议调整。" }
    ]
  };
}

function findFirst(items, keywords) {
  return items.find((item) => keywords.some((keyword) => item.includes(keyword)));
}

function showToast(message, alsoNotify = false) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => el.toast.classList.remove("show"), 3600);

  if (alsoNotify && Notification.permission === "granted") {
    new Notification("快乐打卡", { body: message });
  }
}

function scheduleWaterReminder() {
  window.clearInterval(waterTimer);
  waterTimer = window.setInterval(() => {
    const today = getToday();
    if (today.water < data.settings.waterGoal) {
      showToast("该喝水啦，起身接一杯也顺便活动一下。", true);
    }
  }, data.settings.waterInterval * 60 * 1000);
}

function scheduleExerciseReminder() {
  window.clearInterval(exerciseTimer);
  exerciseTimer = window.setInterval(() => {
    const now = new Date();
    const current = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const today = getToday();
    if (current === data.settings.exerciseTime && !today.exerciseDone) {
      showToast("运动时间到，选一个视频动起来。", true);
    }
  }, 30 * 1000);
}

function bindEvents() {
  el.navButtons.forEach((button) => {
    button.addEventListener("click", () => switchPage(button.dataset.pageTarget));
  });

  el.weightInput.addEventListener("input", () => updateToday({ weight: el.weightInput.value }));
  el.moodInput.addEventListener("change", () => updateToday({ mood: el.moodInput.value }));
  el.breakfastCheck.addEventListener("change", () => updateToday({ breakfast: el.breakfastCheck.checked }));
  el.snackCheck.addEventListener("change", () => updateToday({ snack: el.snackCheck.checked }));
  el.sleepCheck.addEventListener("change", () => updateToday({ sleep: el.sleepCheck.checked }));
  el.noteInput.addEventListener("input", () => updateToday({ note: el.noteInput.value }));

  el.addWaterBtn.addEventListener("click", () => {
    const water = Math.min(getToday().water + 1, 99);
    updateToday({ water });
    showToast(water >= data.settings.waterGoal ? "今天喝水目标完成。" : "已记录一杯水。");
  });

  el.waterMinusBtn.addEventListener("click", () => {
    updateToday({ water: Math.max(getToday().water - 1, 0) });
  });

  el.waterGoalInput.addEventListener("change", () => {
    data.settings.waterGoal = clampNumber(el.waterGoalInput.value, 1, 20, 8);
    saveData();
    render();
  });

  el.waterIntervalInput.addEventListener("change", () => {
    data.settings.waterInterval = Number(el.waterIntervalInput.value);
    saveData();
    scheduleWaterReminder();
    render();
  });

  document.querySelectorAll("[data-minutes]").forEach((button) => {
    button.addEventListener("click", () => {
      const minutes = Number(button.dataset.minutes);
      const exercise = getToday().exercise + minutes;
      updateToday({ exercise, exerciseDone: exercise >= data.settings.exerciseGoal });
      showToast(`已记录 ${minutes} 分钟运动。`);
    });
  });

  el.exerciseDoneInput.addEventListener("change", () => {
    updateToday({ exerciseDone: el.exerciseDoneInput.checked });
  });

  el.exerciseTimeInput.addEventListener("change", () => {
    data.settings.exerciseTime = el.exerciseTimeInput.value || "19:30";
    saveData();
    render();
  });

  el.exerciseGoalInput.addEventListener("change", () => {
    data.settings.exerciseGoal = clampNumber(el.exerciseGoalInput.value, 5, 300, 30);
    saveData();
    render();
  });

  el.trendRangeInput.addEventListener("change", () => {
    data.settings.trendRange = Number(el.trendRangeInput.value);
    saveData();
    renderTrend();
  });

  el.manualWeightForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const date = el.manualDateInput.value;
    const weight = clampNumber(el.manualWeightInput.value, 20, 300, 0);
    if (!date || !weight) return;
    data.days[date] = {
      weight: String(weight),
      mood: "稳稳的",
      breakfast: false,
      snack: false,
      sleep: false,
      note: "",
      water: 0,
      exercise: 0,
      exerciseDone: false,
      mealChecks: {
        breakfast: false,
        lunch: false,
        dinner: false,
        snack: false
      },
      ...(data.days[date] || {}),
      weight: String(weight)
    };
    el.manualWeightForm.reset();
    saveData();
    render();
    showToast("体重已补录。");
  });

  el.videoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    data.videos.unshift({
      id: createId(),
      name: el.videoNameInput.value.trim(),
      url: el.videoUrlInput.value.trim(),
      type: el.videoTypeInput.value
    });
    el.videoForm.reset();
    saveData();
    render();
    showToast("视频已添加。");
  });

  el.videoList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".delete-video");
    if (!deleteButton) return;
    data.videos = data.videos.filter((video) => video.id !== deleteButton.dataset.id);
    saveData();
    render();
  });

  el.resetTodayBtn.addEventListener("click", () => {
    data.days[todayKey] = structuredClone(defaults.days[todayKey] || {
      weight: "",
      mood: "稳稳的",
      breakfast: false,
      snack: false,
      sleep: false,
      note: "",
      water: 0,
      exercise: 0,
      exerciseDone: false,
      mealChecks: {
        breakfast: false,
        lunch: false,
        dinner: false,
        snack: false
      },
      trainingDone: {}
    });
    saveData();
    render();
    showToast("今天的记录已清空。");
  });

  el.notifyBtn.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      showToast("这个浏览器暂时不支持系统通知。");
      return;
    }

    const permission = await Notification.requestPermission();
    showToast(permission === "granted" ? "通知已开启。" : "没有开启通知，页面内提醒仍然可用。");
  });

  el.mealPlanForm.addEventListener("submit", (event) => {
    event.preventDefault();
    data.mealPlan = createMealPlan(el.mealIngredientsInput.value.trim(), el.mealStyleInput.value, el.mealCalorieInput.value);
    saveData();
    renderMealPlan();
    showToast("今日食谱已生成。");
  });

  el.mealBreakfastCheck.addEventListener("change", () => updateMealChecks({ breakfast: el.mealBreakfastCheck.checked }));
  el.mealLunchCheck.addEventListener("change", () => updateMealChecks({ lunch: el.mealLunchCheck.checked }));
  el.mealDinnerCheck.addEventListener("change", () => updateMealChecks({ dinner: el.mealDinnerCheck.checked }));
  el.mealSnackCheck.addEventListener("change", () => updateMealChecks({ snack: el.mealSnackCheck.checked }));

  el.trainingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    data.trainings.push({
      id: createId(),
      name: el.trainingNameInput.value.trim(),
      detail: el.trainingDetailInput.value.trim(),
      type: el.trainingTypeInput.value
    });
    el.trainingForm.reset();
    saveData();
    renderTrainings();
    showToast("训练已添加。");
  });

  el.trainingList.addEventListener("change", (event) => {
    const input = event.target.closest("[data-training-id]");
    if (!input) return;
    updateTrainingDone(input.dataset.trainingId, input.checked);
  });

  el.trainingList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-training-delete]");
    if (!button) return;
    const id = button.dataset.trainingDelete;
    data.trainings = data.trainings.filter((item) => item.id !== id);
    Object.values(data.days).forEach((day) => {
      if (day.trainingDone) delete day.trainingDone[id];
    });
    saveData();
    renderTrainings();
    showToast("训练已删除。");
  });
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

bindEvents();
render();
scheduleWaterReminder();
scheduleExerciseReminder();
