/* =========================================================
   VANTA — Application Logic
   Modular: Storage layer -> Models -> Render -> Events
   Vanilla JS, offline-first (localStorage), RTL, Jalali dates.
   ========================================================= */

/* ---------- Icon library (lucide-style inline SVG) ---------- */
const ICON = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"/>',
  tasks: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>',
  notes: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>',
  goals: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.2.63.77 1.09 1.43 1.09H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/>',
  pin: '<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14l-1.5-1.5A3 3 0 0117 13.3V8a5 5 0 00-10 0v5.3a3 3 0 01-.5 2.2z"/>',
  tag: '<path d="M20.59 13.41L11 3.83A2 2 0 009.6 3.2H4a1 1 0 00-1 1v5.6c0 .5.2 1 .6 1.4l9.6 9.6a2 2 0 002.8 0l4.6-4.6a2 2 0 000-2.8z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  report: '<path d="M3 3v18h18"/><path d="M7 15l4-6 3 4 5-8"/>',
  wallet: '<path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4z"/>',
  plusCircle: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
  arrowDown: '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
  arrowUp: '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
  play: '<polygon points="5 3 19 12 5 21 5 3"/>',
  pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  refresh: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  moodGreat: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
  moodGood: '<circle cx="12" cy="12" r="10"/><path d="M8 13.5s1.5 1.5 4 1.5 4-1.5 4-1.5"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
  moodOk: '<circle cx="12" cy="12" r="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
  moodTired: '<circle cx="12" cy="12" r="10"/><path d="M8 15s1.5-1 4-1 4 1 4 1"/><path d="M8.5 9.5l1-.8M15.5 9.5l-1-.8"/>',
  moodBad: '<circle cx="12" cy="12" r="10"/><path d="M8 16s1.5-2 4-2 4 2 4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
  fileText: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
  chevronRight: '<polyline points="9 18 15 12 9 6"/>',
  download: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
};
function svg(name, size = 20) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[name] || ''}</svg>`;
}

/* ---------- Storage layer ---------- */
const DB_PREFIX = 'vanta:';
const Store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(DB_PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(DB_PREFIX + key, JSON.stringify(value)); } catch (e) { /* storage full/unavailable */ }
  },
  remove(key) { localStorage.removeItem(DB_PREFIX + key); },
};

function uid() {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function todayKey(date = new Date()) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}
function fmtToman(n) {
  return Jalali.toPersianDigits(Math.round(n).toLocaleString('en-US'));
}

/* ---------- Data models (defaults seeded on first run) ---------- */
const DEFAULT_SETTINGS = {
  name: 'مهدی',
  accent: 'iceLavender',
  pinEnabled: true,
  bioEnabled: false,
  autolockSeconds: 300,
  notifTasks: true,
  notifFocus: false,
};

function seedIfEmpty() {
  if (Store.get('seeded', false)) return;
  const now = new Date();
  const t1 = uid(), t2 = uid(), t3 = uid();
  Store.set('tasks', [
    { id: t1, text: 'مرور برنامه هفته', done: false, priority: 'high', due: todayKey(), category: 'کار', createdAt: Date.now() },
    { id: t2, text: 'خرید هفتگی', done: false, priority: 'medium', due: todayKey(new Date(now.getTime() + 86400000)), category: 'شخصی', createdAt: Date.now() },
    { id: t3, text: 'مطالعه ۲۰ دقیقه‌ای', done: true, priority: 'low', due: todayKey(), category: 'رشد فردی', createdAt: Date.now() },
  ]);
  Store.set('notes', [
    { id: uid(), title: 'ایده برای پروژه بعدی', body: 'یک فضای شخصی مینیمال برای مدیریت روزمره؛ تمرکز روی سرعت و آرامش بصری.', tags: ['ایده', 'محصول'], pinned: true, updatedAt: Date.now() },
    { id: uid(), title: 'یادداشت جلسه', body: 'جمع‌بندی جلسه صبح: اولویت‌ها مشخص شد، پیگیری هفته بعد.', tags: ['کار'], pinned: false, updatedAt: Date.now() - 86400000 },
  ]);
  Store.set('goals', [
    { id: uid(), title: 'یادگیری طراحی رابط کاربری', description: 'تسلط بر اصول UI/UX در سه ماه.', progress: 45, target: todayKey(new Date(now.getTime() + 60 * 86400000)), category: 'رشد فردی',
      milestones: [{ id: uid(), text: 'دوره پایه', done: true }, { id: uid(), text: 'پروژه عملی اول', done: true }, { id: uid(), text: 'پروژه عملی دوم', done: false }] },
    { id: uid(), title: 'پس‌انداز ماهانه', description: 'کنار گذاشتن بخشی از درآمد هر ماه.', progress: 20, target: todayKey(new Date(now.getTime() + 200 * 86400000)), category: 'مالی',
      milestones: [{ id: uid(), text: 'باز کردن حساب پس‌انداز', done: true }, { id: uid(), text: 'اولین واریزی', done: false }] },
  ]);
  Store.set('transactions', [
    { id: uid(), type: 'income', title: 'حقوق', amount: 25000000, category: 'درآمد', date: todayKey(new Date(now.getTime() - 3 * 86400000)) },
    { id: uid(), type: 'expense', title: 'خرید سوپرمارکت', amount: 850000, category: 'خوراک', date: todayKey() },
    { id: uid(), type: 'expense', title: 'قبض اینترنت', amount: 450000, category: 'قبوض', date: todayKey(new Date(now.getTime() - 1 * 86400000)) },
  ]);
  Store.set('events', [
    { id: uid(), title: 'جلسه تیم', date: todayKey(), time: '10:30', type: 'event' },
  ]);
  Store.set('moods', {});
  Store.set('settings', DEFAULT_SETTINGS);
  Store.set('seeded', true);
}

/* ---------- App state ---------- */
const State = {
  view: 'home',
  taskFilter: 'all',
  taskSearch: '',
  noteSearch: '',
  calYear: null,
  calMonth: null,
  calSelected: null,
  timer: { total: 25 * 60, remaining: 25 * 60, running: false, interval: null },
};

/* ---------- Toast ---------- */
function toast(message, type = 'info') {
  const root = document.getElementById('toastRoot');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const iconName = type === 'success' ? 'check' : type === 'error' ? 'x' : 'info';
  el.innerHTML = `${svg(iconName, 16)}<span>${message}</span>`;
  root.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 240ms ease, transform 240ms ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    setTimeout(() => el.remove(), 260);
  }, 2600);
}

/* ---------- Modal ---------- */
function openModal(title, bodyHtml, { onMount } = {}) {
  const backdrop = document.getElementById('modalBackdrop');
  const root = document.getElementById('modalRoot');
  root.innerHTML = `
    <div class="modal-head">
      <div class="modal-title">${title}</div>
      <button class="icon-btn" id="modalCloseBtn">${svg('x', 16)}</button>
    </div>
    <div id="modalBody">${bodyHtml}</div>
  `;
  backdrop.classList.add('open');
  document.getElementById('modalCloseBtn').onclick = closeModal;
  backdrop.onclick = (e) => { if (e.target === backdrop) closeModal(); };
  if (onMount) onMount(root);
}
function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('open');
}

/* ---------- Navigation ---------- */
const NAV_ITEMS = [
  { key: 'home', label: 'خانه', icon: 'home' },
  { key: 'tasks', label: 'کارها', icon: 'tasks' },
  { key: 'notes', label: 'یادداشت‌ها', icon: 'notes' },
  { key: 'goals', label: 'اهداف', icon: 'goals' },
  { key: 'settings', label: 'تنظیمات', icon: 'settings' },
];

function buildNav() {
  const sidebarNav = document.getElementById('sidebarNav');
  sidebarNav.innerHTML = NAV_ITEMS.slice(0, 4).map(item => `
    <button class="nav-item" data-nav="${item.key}">
      ${svg(item.icon, 19)}
      <span>${item.label}</span>
    </button>
  `).join('');

  const bottomNav = document.getElementById('bottomNav');
  bottomNav.innerHTML = NAV_ITEMS.map(item => `
    <button class="bottom-nav-item" data-nav="${item.key}">
      ${svg(item.icon, 20)}
      <span>${item.label}</span>
    </button>
  `).join('');

  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => switchView(el.getAttribute('data-nav')));
  });
}

function switchView(view) {
  State.view = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-nav') === view);
  });
  document.getElementById('mobileFab').classList.toggle('hidden', view !== 'tasks');
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  renderView(view);
}

function renderView(view) {
  if (view === 'home') renderDashboard();
  else if (view === 'tasks') renderTasks();
  else if (view === 'notes') renderNotes();
  else if (view === 'goals') renderGoals();
  else if (view === 'finance') renderFinance();
  else if (view === 'calendar') renderCalendar();
  else if (view === 'settings') renderSettings();
}

/* =========================================================
   HEADER CLOCK
   ========================================================= */
function tickClock() {
  const now = new Date();
  const dateStr = Jalali.formatFull(now);
  const timeStr = Jalali.formatTime(now);
  ['headerDate', 'heroDate'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = dateStr; });
  ['headerTime', 'heroTime'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = timeStr; });
}

/* =========================================================
   DASHBOARD
   ========================================================= */
function renderDashboard() {
  const settings = Store.get('settings', DEFAULT_SETTINGS);
  document.getElementById('heroGreeting').innerHTML = `سلام ${settings.name}،<br><span class="accent-text">امروز مال توئه.</span>`;
  document.getElementById('headerAvatar').textContent = settings.name.charAt(0);

  const tasks = Store.get('tasks', []);
  const todayTasks = tasks.filter(t => t.due === todayKey());
  const completed = todayTasks.filter(t => t.done).length;
  const pct = todayTasks.length ? Math.round((completed / todayTasks.length) * 100) : 0;

  const moods = Store.get('moods', {});
  const todayMood = moods[todayKey()];

  const txs = Store.get('transactions', []);
  const nowKey = todayKey();
  const monthPrefix = nowKey.slice(0, 7);
  const todayExpense = txs.filter(t => t.type === 'expense' && t.date === nowKey).reduce((s, t) => s + t.amount, 0);
  const monthExpense = txs.filter(t => t.type === 'expense' && t.date.startsWith(monthPrefix)).reduce((s, t) => s + t.amount, 0);

  const moodOptions = [
    { key: 'great', label: 'عالی', icon: 'moodGreat' },
    { key: 'good', label: 'خوب', icon: 'moodGood' },
    { key: 'ok', label: 'معمولی', icon: 'moodOk' },
    { key: 'tired', label: 'خسته', icon: 'moodTired' },
    { key: 'bad', label: 'بد', icon: 'moodBad' },
  ];

  const bento = document.getElementById('dashboardBento');
  bento.innerHTML = `
    <div class="glass-card span-2">
      <div class="card-head">
        <div class="card-title">${svg('tasks', 16)} کارهای امروز</div>
        <button class="card-icon-btn" data-nav="tasks">${svg('chevronLeft', 15)}</button>
      </div>
      <div class="flex-between">
        <div>
          <div class="stat-value fa-num">${Jalali.toPersianDigits(completed)}<span style="color:var(--text-tertiary);font-size:var(--fs-lg)">‌/‌${Jalali.toPersianDigits(todayTasks.length)}</span></div>
          <div class="stat-label">انجام‌شده از امروز</div>
        </div>
        <div style="text-align:left">
          <div class="stat-value fa-num" style="font-size:var(--fs-xl)">${Jalali.toPersianDigits(pct)}٪</div>
        </div>
      </div>
      <div class="progress-track"><div class="progress-fill success" style="width:${pct}%"></div></div>
    </div>

    <div class="glass-card">
      <div class="card-title">${svg('clock', 16)} تایمر تمرکز</div>
      <div class="timer-ring-wrap">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/>
          <circle id="timerRingProgress" cx="60" cy="60" r="52" fill="none" stroke="url(#timerGrad)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * 52}" stroke-dashoffset="0"/>
          <defs><linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#8FA8FF"/><stop offset="100%" stop-color="#B6A6F2"/></linearGradient></defs>
        </svg>
        <div class="timer-display fa-num" id="timerDisplay">۲۵:۰۰</div>
      </div>
      <div class="timer-controls">
        <button class="icon-btn" id="timerToggleBtn">${svg(State.timer.running ? 'pause' : 'play', 16)}</button>
        <button class="icon-btn" id="timerResetBtn">${svg('refresh', 16)}</button>
      </div>
    </div>

    <div class="glass-card">
      <div class="card-title">حال امروزت چطوره؟</div>
      <div class="mood-grid" id="moodGrid">
        ${moodOptions.map(m => `
          <button class="mood-option ${todayMood === m.key ? 'selected' : ''}" data-mood="${m.key}">
            ${svg(m.icon, 20)}
            <span>${m.label}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <div class="glass-card">
      <div class="card-head">
        <div class="card-title">${svg('wallet', 16)} مالی</div>
        <button class="card-icon-btn" data-nav="finance">${svg('chevronLeft', 15)}</button>
      </div>
      <div class="stat-value fa-num">${fmtToman(todayExpense)}</div>
      <div class="stat-label">هزینه امروز (تومان)</div>
      <div class="divider" style="margin:12px 0"></div>
      <div class="flex-between">
        <span class="text-secondary" style="font-size:var(--fs-xs)">هزینه این ماه</span>
        <span class="fa-num" style="font-weight:700;font-size:var(--fs-sm)">${fmtToman(monthExpense)}</span>
      </div>
    </div>

    <div class="glass-card span-2">
      <div class="card-title">دسترسی سریع</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--sp-3);margin-top:var(--sp-3)">
        ${quickAccessCard('notes', 'notes', 'یادداشت‌ها')}
        ${quickAccessCard('goals', 'goals', 'اهداف')}
        ${quickAccessCard('calendar', 'calendar', 'تقویم')}
        ${quickAccessCard('report', 'finance', 'گزارش‌ها')}
      </div>
    </div>
  `;

  // wire events
  bento.querySelectorAll('[data-nav]').forEach(el => el.addEventListener('click', () => switchView(el.getAttribute('data-nav'))));
  bento.querySelectorAll('[data-mood]').forEach(el => el.addEventListener('click', () => setMood(el.getAttribute('data-mood'))));
  document.getElementById('timerToggleBtn').addEventListener('click', toggleTimer);
  document.getElementById('timerResetBtn').addEventListener('click', resetTimer);
  updateTimerDisplay();
}

function quickAccessCard(icon, navKey, label) {
  return `
    <div class="glass-card interactive" data-nav="${navKey}" style="padding:var(--sp-4);display:flex;flex-direction:column;gap:var(--sp-2);">
      <div style="width:34px;height:34px;border-radius:var(--r-sm);background:var(--surface-2);display:flex;align-items:center;justify-content:center;color:var(--accent-1);">${svg(icon, 17)}</div>
      <span style="font-size:var(--fs-sm);font-weight:600;">${label}</span>
    </div>
  `;
}

function setMood(key) {
  const moods = Store.get('moods', {});
  moods[todayKey()] = key;
  Store.set('moods', moods);
  renderDashboard();
  toast('حال‌وهوای امروزت ثبت شد', 'success');
}

/* ---------- Focus Timer ---------- */
function toggleTimer() {
  State.timer.running = !State.timer.running;
  if (State.timer.running) {
    State.timer.interval = setInterval(() => {
      if (State.timer.remaining > 0) {
        State.timer.remaining -= 1;
        updateTimerDisplay();
      } else {
        clearInterval(State.timer.interval);
        State.timer.running = false;
        toast('زمان تمرکز به پایان رسید 🌙'.replace(' 🌙', ''), 'success');
        updateTimerDisplay();
      }
    }, 1000);
  } else {
    clearInterval(State.timer.interval);
  }
  const btn = document.getElementById('timerToggleBtn');
  if (btn) btn.innerHTML = svg(State.timer.running ? 'pause' : 'play', 16);
}
function resetTimer() {
  clearInterval(State.timer.interval);
  State.timer.running = false;
  State.timer.remaining = State.timer.total;
  const btn = document.getElementById('timerToggleBtn');
  if (btn) btn.innerHTML = svg('play', 16);
  updateTimerDisplay();
}
function updateTimerDisplay() {
  const el = document.getElementById('timerDisplay');
  const ring = document.getElementById('timerRingProgress');
  if (!el) return;
  const m = Math.floor(State.timer.remaining / 60);
  const s = State.timer.remaining % 60;
  el.textContent = Jalali.toPersianDigits(String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'));
  if (ring) {
    const circumference = 2 * Math.PI * 52;
    const frac = State.timer.remaining / State.timer.total;
    ring.style.strokeDashoffset = String(circumference * (1 - frac));
  }
}

/* =========================================================
   TASKS
   ========================================================= */
function renderTasks() {
  const tasks = Store.get('tasks', []);
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  document.getElementById('tasksSummary').textContent = total ? `${Jalali.toPersianDigits(done)} از ${Jalali.toPersianDigits(total)} کار انجام شده` : 'هنوز کاری ثبت نشده';

  let filtered = tasks.filter(t => {
    if (State.taskFilter === 'active') return !t.done;
    if (State.taskFilter === 'done') return t.done;
    if (State.taskFilter === 'high') return t.priority === 'high';
    return true;
  });
  if (State.taskSearch.trim()) {
    const q = State.taskSearch.trim().toLowerCase();
    filtered = filtered.filter(t => t.text.toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q));
  }
  filtered = filtered.sort((a, b) => (a.done - b.done) || (b.createdAt - a.createdAt));

  const list = document.getElementById('tasksList');
  if (!filtered.length) {
    list.innerHTML = emptyState('tasks', 'کاری پیدا نشد', 'یک کار جدید اضافه کن تا اینجا نمایش داده شود.');
    return;
  }
  const priorityLabel = { high: 'اولویت بالا', medium: 'اولویت متوسط', low: 'اولویت پایین' };
  list.innerHTML = filtered.map(t => `
    <div class="task-item ${t.done ? 'done' : ''}" data-id="${t.id}">
      <div class="checkbox ${t.done ? 'checked' : ''}" data-action="toggle-task">${svg('check', 12)}</div>
      <div class="task-main">
        <div class="task-text">${escapeHtml(t.text)}</div>
        <div class="task-meta">
          <span class="badge priority-${t.priority}">${priorityLabel[t.priority] || t.priority}</span>
          ${t.category ? `<span class="meta-chip">${svg('tag', 12)}${escapeHtml(t.category)}</span>` : ''}
          ${t.due ? `<span class="meta-chip">${svg('calendar', 12)}${formatDueDate(t.due)}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="icon-btn" data-action="edit-task">${svg('edit', 15)}</button>
        <button class="icon-btn danger" data-action="delete-task">${svg('trash', 15)}</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.task-item').forEach(row => {
    const id = row.getAttribute('data-id');
    row.querySelector('[data-action="toggle-task"]').addEventListener('click', () => toggleTask(id));
    row.querySelector('[data-action="edit-task"]').addEventListener('click', () => openTaskModal(id));
    row.querySelector('[data-action="delete-task"]').addEventListener('click', () => deleteTask(id));
  });
}

function formatDueDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  const j = Jalali.gregorianToJalali(y, m, d);
  return Jalali.formatShort(j.jy, j.jm, j.jd);
}

function toggleTask(id) {
  const tasks = Store.get('tasks', []);
  const t = tasks.find(x => x.id === id);
  if (t) t.done = !t.done;
  Store.set('tasks', tasks);
  renderTasks();
}
function deleteTask(id) {
  const tasks = Store.get('tasks', []).filter(t => t.id !== id);
  Store.set('tasks', tasks);
  renderTasks();
  toast('کار حذف شد', 'info');
}

function openTaskModal(id) {
  const tasks = Store.get('tasks', []);
  const editing = tasks.find(t => t.id === id);
  const body = `
    <div class="field"><label class="field-label">عنوان کار</label><input class="input" id="taskInputText" placeholder="مثلاً: تماس با مشتری" value="${editing ? escapeHtml(editing.text) : ''}"></div>
    <div class="row-2">
      <div class="field"><label class="field-label">اولویت</label>
        <select class="select" id="taskInputPriority">
          <option value="low" ${editing?.priority === 'low' ? 'selected' : ''}>پایین</option>
          <option value="medium" ${!editing || editing.priority === 'medium' ? 'selected' : ''}>متوسط</option>
          <option value="high" ${editing?.priority === 'high' ? 'selected' : ''}>بالا</option>
        </select>
      </div>
      <div class="field"><label class="field-label">دسته‌بندی</label><input class="input" id="taskInputCategory" placeholder="کار، شخصی..." value="${editing ? escapeHtml(editing.category || '') : ''}"></div>
    </div>
    <div class="field"><label class="field-label">موعد انجام</label><input class="input" type="date" id="taskInputDue" value="${editing ? gregorianKeyToInput(editing.due) : gregorianKeyToInput(todayKey())}"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost btn-block" id="taskCancelBtn">انصراف</button>
      <button class="btn btn-primary btn-block" id="taskSaveBtn">${editing ? 'ذخیره تغییرات' : 'افزودن کار'}</button>
    </div>
  `;
  openModal(editing ? 'ویرایش کار' : 'کار جدید', body, {
    onMount: () => {
      document.getElementById('taskCancelBtn').onclick = closeModal;
      document.getElementById('taskSaveBtn').onclick = () => {
        const text = document.getElementById('taskInputText').value.trim();
        if (!text) { toast('عنوان کار را وارد کن', 'error'); return; }
        const priority = document.getElementById('taskInputPriority').value;
        const category = document.getElementById('taskInputCategory').value.trim();
        const due = document.getElementById('taskInputDue').value || todayKey();
        const allTasks = Store.get('tasks', []);
        if (editing) {
          const t = allTasks.find(x => x.id === id);
          Object.assign(t, { text, priority, category, due });
        } else {
          allTasks.push({ id: uid(), text, priority, category, due, done: false, createdAt: Date.now() });
        }
        Store.set('tasks', allTasks);
        closeModal();
        renderTasks();
        renderDashboard();
        toast(editing ? 'کار به‌روزرسانی شد' : 'کار جدید اضافه شد', 'success');
      };
    }
  });
}
function gregorianKeyToInput(key) { return key; }

/* =========================================================
   NOTES
   ========================================================= */
function renderNotes() {
  const notes = Store.get('notes', []);
  document.getElementById('notesSummary').textContent = notes.length ? `${Jalali.toPersianDigits(notes.length)} یادداشت` : 'هنوز یادداشتی ثبت نشده';

  let filtered = notes;
  if (State.noteSearch.trim()) {
    const q = State.noteSearch.trim().toLowerCase();
    filtered = notes.filter(n => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) || (n.tags || []).some(t => t.toLowerCase().includes(q)));
  }
  filtered = filtered.sort((a, b) => (b.pinned - a.pinned) || (b.updatedAt - a.updatedAt));

  const grid = document.getElementById('notesGrid');
  if (!filtered.length) {
    grid.innerHTML = emptyState('notes', 'یادداشتی پیدا نشد', 'یک یادداشت جدید بنویس تا اینجا نمایش داده شود.');
    return;
  }
  grid.innerHTML = filtered.map(n => `
    <div class="note-card" data-id="${n.id}">
      <div class="note-title">${n.pinned ? svg('pin', 14) : ''}<span>${escapeHtml(n.title) || 'بدون عنوان'}</span></div>
      <div class="note-preview">${escapeHtml(n.body)}</div>
      <div class="note-footer">
        <div class="note-tags">${(n.tags || []).slice(0, 3).map(t => `<span class="badge">${escapeHtml(t)}</span>`).join('')}</div>
        <div class="note-date fa-num">${relativeDate(n.updatedAt)}</div>
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('.note-card').forEach(card => card.addEventListener('click', () => openNoteModal(card.getAttribute('data-id'))));
}

function relativeDate(ts) {
  const d = new Date(ts);
  const j = Jalali.dateToJalali(d);
  return Jalali.formatShort(j.jy, j.jm, j.jd);
}

function openNoteModal(id) {
  const notes = Store.get('notes', []);
  const editing = notes.find(n => n.id === id);
  const body = `
    <div class="field"><input class="input" id="noteInputTitle" placeholder="عنوان" style="font-weight:700;font-size:var(--fs-lg)" value="${editing ? escapeHtml(editing.title) : ''}"></div>
    <div class="field"><textarea class="input" id="noteInputBody" placeholder="بنویس..." style="min-height:160px">${editing ? escapeHtml(editing.body) : ''}</textarea></div>
    <div class="field"><label class="field-label">برچسب‌ها (با کاما جدا کن)</label><input class="input" id="noteInputTags" placeholder="ایده, کار" value="${editing ? (editing.tags || []).join(', ') : ''}"></div>
    <label class="checkbox-row"><div class="checkbox ${editing?.pinned ? 'checked' : ''}" id="noteInputPin">${svg('check', 12)}</div><span style="font-size:var(--fs-sm)">سنجاق کردن یادداشت</span></label>
    <div class="modal-actions">
      ${editing ? `<button class="btn btn-danger" id="noteDeleteBtn">${svg('trash', 15)}</button>` : ''}
      <button class="btn btn-ghost btn-block" id="noteCancelBtn">انصراف</button>
      <button class="btn btn-primary btn-block" id="noteSaveBtn">ذخیره</button>
    </div>
  `;
  let pinned = !!editing?.pinned;
  openModal(editing ? 'ویرایش یادداشت' : 'یادداشت جدید', body, {
    onMount: () => {
      document.getElementById('noteCancelBtn').onclick = closeModal;
      document.getElementById('noteInputPin').onclick = (e) => { pinned = !pinned; e.currentTarget.classList.toggle('checked', pinned); };
      if (editing) document.getElementById('noteDeleteBtn').onclick = () => {
        const remaining = Store.get('notes', []).filter(n => n.id !== id);
        Store.set('notes', remaining);
        closeModal(); renderNotes();
        toast('یادداشت حذف شد', 'info');
      };
      document.getElementById('noteSaveBtn').onclick = () => {
        const title = document.getElementById('noteInputTitle').value.trim();
        const bodyText = document.getElementById('noteInputBody').value.trim();
        if (!title && !bodyText) { toast('یادداشت خالی است', 'error'); return; }
        const tags = document.getElementById('noteInputTags').value.split(',').map(s => s.trim()).filter(Boolean);
        const allNotes = Store.get('notes', []);
        if (editing) {
          const n = allNotes.find(x => x.id === id);
          Object.assign(n, { title, body: bodyText, tags, pinned, updatedAt: Date.now() });
        } else {
          allNotes.push({ id: uid(), title, body: bodyText, tags, pinned, updatedAt: Date.now() });
        }
        Store.set('notes', allNotes);
        closeModal(); renderNotes();
        toast('یادداشت ذخیره شد', 'success');
      };
    }
  });
}

/* =========================================================
   GOALS
   ========================================================= */
function renderGoals() {
  const goals = Store.get('goals', []);
  document.getElementById('goalsSummary').textContent = goals.length ? `${Jalali.toPersianDigits(goals.length)} هدف فعال` : 'هنوز هدفی ثبت نشده';
  const grid = document.getElementById('goalsGrid');
  if (!goals.length) {
    grid.innerHTML = emptyState('goals', 'هدفی پیدا نشد', 'یک هدف جدید تعریف کن و پیشرفتش را دنبال کن.');
    return;
  }
  grid.innerHTML = goals.map(g => {
    const r = 24, c = 2 * Math.PI * r;
    const offset = c * (1 - (g.progress || 0) / 100);
    return `
    <div class="goal-card" data-id="${g.id}">
      <div class="goal-head">
        <div>
          <div style="font-weight:700;font-size:var(--fs-md)">${escapeHtml(g.title)}</div>
          <div class="text-secondary" style="font-size:var(--fs-sm);margin-top:4px">${escapeHtml(g.description || '')}</div>
          <div class="flex-gap mt-2">
            <span class="badge accent">${escapeHtml(g.category || 'عمومی')}</span>
            ${g.target ? `<span class="meta-chip text-tertiary" style="font-size:var(--fs-2xs)">${svg('calendar', 12)}${formatDueDate(g.target)}</span>` : ''}
          </div>
        </div>
        <div class="goal-ring-wrap">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="5"/>
            <circle cx="28" cy="28" r="${r}" fill="none" stroke="url(#goalGrad${g.id})" stroke-width="5" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
            <defs><linearGradient id="goalGrad${g.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#8FA8FF"/><stop offset="100%" stop-color="#B6A6F2"/></linearGradient></defs>
          </svg>
          <div class="goal-ring-pct fa-num">${Jalali.toPersianDigits(g.progress || 0)}٪</div>
        </div>
      </div>
      <div class="goal-milestones">
        ${(g.milestones || []).map(m => `
          <div class="milestone-row ${m.done ? 'done' : ''}" data-mid="${m.id}">
            <div class="checkbox ${m.done ? 'checked' : ''}" data-action="toggle-milestone">${svg('check', 10)}</div>
            <span>${escapeHtml(m.text)}</span>
          </div>
        `).join('')}
      </div>
      <div class="modal-actions" style="margin-top:var(--sp-4)">
        <button class="btn btn-ghost btn-sm" data-action="edit-goal" style="flex:1">${svg('edit', 14)} ویرایش</button>
        <button class="btn btn-danger btn-sm" data-action="delete-goal" style="flex:1">${svg('trash', 14)} حذف</button>
      </div>
    </div>
  `;
  }).join('');

  grid.querySelectorAll('.goal-card').forEach(card => {
    const id = card.getAttribute('data-id');
    card.querySelectorAll('[data-action="toggle-milestone"]').forEach(chk => {
      chk.addEventListener('click', (e) => {
        e.stopPropagation();
        const mid = chk.closest('.milestone-row').getAttribute('data-mid');
        toggleMilestone(id, mid);
      });
    });
    card.querySelector('[data-action="edit-goal"]').addEventListener('click', () => openGoalModal(id));
    card.querySelector('[data-action="delete-goal"]').addEventListener('click', () => deleteGoal(id));
  });
}

function toggleMilestone(goalId, mid) {
  const goals = Store.get('goals', []);
  const g = goals.find(x => x.id === goalId);
  const m = g.milestones.find(x => x.id === mid);
  m.done = !m.done;
  const doneCount = g.milestones.filter(x => x.done).length;
  g.progress = g.milestones.length ? Math.round((doneCount / g.milestones.length) * 100) : g.progress;
  Store.set('goals', goals);
  renderGoals();
}
function deleteGoal(id) {
  Store.set('goals', Store.get('goals', []).filter(g => g.id !== id));
  renderGoals();
  toast('هدف حذف شد', 'info');
}

function openGoalModal(id) {
  const goals = Store.get('goals', []);
  const editing = goals.find(g => g.id === id);
  const body = `
    <div class="field"><label class="field-label">عنوان هدف</label><input class="input" id="goalInputTitle" value="${editing ? escapeHtml(editing.title) : ''}"></div>
    <div class="field"><label class="field-label">توضیح</label><textarea class="input" id="goalInputDesc" style="min-height:70px">${editing ? escapeHtml(editing.description || '') : ''}</textarea></div>
    <div class="row-2">
      <div class="field"><label class="field-label">دسته‌بندی</label><input class="input" id="goalInputCategory" value="${editing ? escapeHtml(editing.category || '') : ''}"></div>
      <div class="field"><label class="field-label">تاریخ هدف</label><input class="input" type="date" id="goalInputTarget" value="${editing ? editing.target : todayKey()}"></div>
    </div>
    <div class="field"><label class="field-label">پیشرفت (٪)</label><input class="input" type="number" min="0" max="100" id="goalInputProgress" value="${editing ? editing.progress : 0}"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost btn-block" id="goalCancelBtn">انصراف</button>
      <button class="btn btn-primary btn-block" id="goalSaveBtn">${editing ? 'ذخیره تغییرات' : 'افزودن هدف'}</button>
    </div>
  `;
  openModal(editing ? 'ویرایش هدف' : 'هدف جدید', body, {
    onMount: () => {
      document.getElementById('goalCancelBtn').onclick = closeModal;
      document.getElementById('goalSaveBtn').onclick = () => {
        const title = document.getElementById('goalInputTitle').value.trim();
        if (!title) { toast('عنوان هدف را وارد کن', 'error'); return; }
        const description = document.getElementById('goalInputDesc').value.trim();
        const category = document.getElementById('goalInputCategory').value.trim();
        const target = document.getElementById('goalInputTarget').value || todayKey();
        const progress = Math.max(0, Math.min(100, Number(document.getElementById('goalInputProgress').value) || 0));
        const allGoals = Store.get('goals', []);
        if (editing) {
          Object.assign(editing, { title, description, category, target, progress });
        } else {
          allGoals.push({ id: uid(), title, description, category, target, progress, milestones: [] });
        }
        Store.set('goals', allGoals);
        closeModal(); renderGoals();
        toast(editing ? 'هدف به‌روزرسانی شد' : 'هدف جدید اضافه شد', 'success');
      };
    }
  });
}

/* =========================================================
   FINANCE
   ========================================================= */
function renderFinance() {
  const txs = Store.get('transactions', []).sort((a, b) => b.date.localeCompare(a.date));
  const monthPrefix = todayKey().slice(0, 7);
  const monthTxs = txs.filter(t => t.date.startsWith(monthPrefix));
  const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const allIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const allExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const todayExp = txs.filter(t => t.type === 'expense' && t.date === todayKey()).reduce((s, t) => s + t.amount, 0);

  document.getElementById('finBalance').textContent = fmtToman(allIncome - allExpense);
  document.getElementById('finIncome').textContent = fmtToman(income);
  document.getElementById('finExpense').textContent = fmtToman(expense);
  document.getElementById('finToday').textContent = fmtToman(todayExp);

  // 7-day expense chart
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push({ key: todayKey(d), label: Jalali.WEEKDAYS_SHORT[d.getDay()] });
  }
  const dayTotals = days.map(d => txs.filter(t => t.type === 'expense' && t.date === d.key).reduce((s, t) => s + t.amount, 0));
  const max = Math.max(...dayTotals, 1);
  document.getElementById('finChart').innerHTML = days.map((d, i) => `
    <div class="bar-col">
      <div class="bar" style="height:${Math.max(4, (dayTotals[i] / max) * 100)}%"></div>
      <div class="bar-label">${d.label}</div>
    </div>
  `).join('');

  const txList = document.getElementById('txList');
  if (!txs.length) {
    txList.innerHTML = emptyState('report', 'تراکنشی ثبت نشده', 'اولین تراکنش خودت را اضافه کن.');
    return;
  }
  const catIcon = { 'درآمد': 'arrowDown', default: 'arrowUp' };
  txList.innerHTML = txs.slice(0, 12).map(t => `
    <div class="tx-row" data-id="${t.id}">
      <div class="tx-icon ${t.type}">${svg(t.type === 'income' ? 'arrowDown' : 'arrowUp', 16)}</div>
      <div class="tx-main">
        <div class="tx-title">${escapeHtml(t.title)}</div>
        <div class="tx-sub">${escapeHtml(t.category)} · ${formatDueDate(t.date)}</div>
      </div>
      <div class="tx-amount ${t.type} fa-num">${t.type === 'income' ? '+' : '−'}${fmtToman(t.amount)}</div>
      <button class="icon-btn danger" data-action="delete-tx" style="width:30px;height:30px;">${svg('trash', 13)}</button>
    </div>
  `).join('');
  txList.querySelectorAll('[data-action="delete-tx"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('.tx-row').getAttribute('data-id');
      Store.set('transactions', Store.get('transactions', []).filter(t => t.id !== id));
      renderFinance();
      toast('تراکنش حذف شد', 'info');
    });
  });
}

function openTxModal() {
  const body = `
    <div class="segmented" id="txTypeSeg" style="margin-bottom:var(--sp-4);width:100%;">
      <button class="active" data-type="expense" style="flex:1">هزینه</button>
      <button data-type="income" style="flex:1">درآمد</button>
    </div>
    <div class="field"><label class="field-label">عنوان</label><input class="input" id="txInputTitle" placeholder="مثلاً: خرید سوپرمارکت"></div>
    <div class="row-2">
      <div class="field"><label class="field-label">مبلغ (تومان)</label><input class="input" type="number" id="txInputAmount" placeholder="۰"></div>
      <div class="field"><label class="field-label">دسته‌بندی</label><input class="input" id="txInputCategory" placeholder="خوراک، قبوض..."></div>
    </div>
    <div class="field"><label class="field-label">تاریخ</label><input class="input" type="date" id="txInputDate" value="${todayKey()}"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost btn-block" id="txCancelBtn">انصراف</button>
      <button class="btn btn-primary btn-block" id="txSaveBtn">افزودن تراکنش</button>
    </div>
  `;
  let type = 'expense';
  openModal('تراکنش جدید', body, {
    onMount: () => {
      document.querySelectorAll('#txTypeSeg button').forEach(b => b.addEventListener('click', () => {
        type = b.getAttribute('data-type');
        document.querySelectorAll('#txTypeSeg button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      }));
      document.getElementById('txCancelBtn').onclick = closeModal;
      document.getElementById('txSaveBtn').onclick = () => {
        const title = document.getElementById('txInputTitle').value.trim();
        const amount = Number(document.getElementById('txInputAmount').value);
        if (!title || !amount) { toast('عنوان و مبلغ را وارد کن', 'error'); return; }
        const category = document.getElementById('txInputCategory').value.trim() || (type === 'income' ? 'درآمد' : 'متفرقه');
        const date = document.getElementById('txInputDate').value || todayKey();
        const txs = Store.get('transactions', []);
        txs.push({ id: uid(), type, title, amount, category, date });
        Store.set('transactions', txs);
        closeModal(); renderFinance(); renderDashboard();
        toast('تراکنش ثبت شد', 'success');
      };
    }
  });
}

/* =========================================================
   CALENDAR
   ========================================================= */
function renderCalendar() {
  if (State.calYear === null) {
    const t = Jalali.today();
    State.calYear = t.jy; State.calMonth = t.jm; State.calSelected = todayKey();
  }
  document.getElementById('calMonthLabel').textContent = `${Jalali.MONTHS[State.calMonth - 1]} ${Jalali.toPersianDigits(State.calYear)}`;
  document.getElementById('calWeekdays').innerHTML = Jalali.WEEKDAYS_SHORT.map(w => `<div class="cal-weekday">${w}</div>`).join('');

  const events = Store.get('events', []);
  const tasks = Store.get('tasks', []);

  // first day of jalali month -> weekday
  const g0 = Jalali.jalaliToGregorian(State.calYear, State.calMonth, 1);
  const firstDate = new Date(g0.gy, g0.gm - 1, g0.gd);
  const startWeekday = firstDate.getDay(); // 0=Sun
  const monthLen = Jalali.jalaliMonthLength(State.calYear, State.calMonth);

  let cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= monthLen; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayJ = Jalali.today();

  const daysHtml = cells.map(d => {
    if (!d) return `<div class="cal-cell muted"></div>`;
    const g = Jalali.jalaliToGregorian(State.calYear, State.calMonth, d);
    const key = todayKey(new Date(g.gy, g.gm - 1, g.gd));
    const isToday = todayJ.jy === State.calYear && todayJ.jm === State.calMonth && todayJ.jd === d;
    const isSelected = key === State.calSelected;
    const hasEvents = events.some(e => e.date === key) || tasks.some(t => t.due === key);
    return `<div class="cal-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-key="${key}">
      <span class="fa-num">${Jalali.toPersianDigits(d)}</span>
      ${hasEvents ? `<div class="dot-row"><div class="ev-dot"></div></div>` : ''}
    </div>`;
  }).join('');
  document.getElementById('calDays').innerHTML = daysHtml;

  document.querySelectorAll('#calDays .cal-cell[data-key]').forEach(cell => {
    cell.addEventListener('click', () => { State.calSelected = cell.getAttribute('data-key'); renderCalendar(); });
  });

  const selEvents = events.filter(e => e.date === State.calSelected);
  const selTasks = tasks.filter(t => t.due === State.calSelected);
  const label = State.calSelected === todayKey() ? 'رویدادهای امروز' : `رویدادهای ${formatDueDate(State.calSelected)}`;
  document.getElementById('calSelectedLabel').textContent = label;

  const evList = document.getElementById('calEventsList');
  if (!selEvents.length && !selTasks.length) {
    evList.innerHTML = `<div class="text-tertiary" style="font-size:var(--fs-sm);padding:var(--sp-4) 0;text-align:center;">رویدادی برای این روز ثبت نشده</div>`;
  } else {
    evList.innerHTML = [
      ...selEvents.map(e => `
        <div class="task-item" data-id="${e.id}">
          <div style="width:34px;height:34px;border-radius:var(--r-sm);background:var(--accent-soft);display:flex;align-items:center;justify-content:center;color:var(--accent-1);flex-shrink:0;">${svg('calendar', 15)}</div>
          <div class="task-main"><div class="task-text">${escapeHtml(e.title)}</div><div class="task-meta"><span class="meta-chip">${svg('clock', 12)}${e.time ? Jalali.toPersianDigits(e.time) : 'تمام روز'}</span></div></div>
          <div class="task-actions"><button class="icon-btn danger" data-action="delete-event">${svg('trash', 15)}</button></div>
        </div>
      `),
      ...selTasks.map(t => `
        <div class="task-item ${t.done ? 'done' : ''}">
          <div style="width:34px;height:34px;border-radius:var(--r-sm);background:var(--surface-2);display:flex;align-items:center;justify-content:center;color:var(--text-secondary);flex-shrink:0;">${svg('tasks', 15)}</div>
          <div class="task-main"><div class="task-text">${escapeHtml(t.text)}</div><div class="task-meta"><span class="badge priority-${t.priority}">کار</span></div></div>
        </div>
      `)
    ].join('');
    evList.querySelectorAll('[data-action="delete-event"]').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.closest('[data-id]').getAttribute('data-id');
      Store.set('events', Store.get('events', []).filter(e => e.id !== id));
      renderCalendar();
    }));
  }
}

function openEventModal() {
  const body = `
    <div class="field"><label class="field-label">عنوان رویداد</label><input class="input" id="evInputTitle" placeholder="مثلاً: جلسه تیم"></div>
    <div class="row-2">
      <div class="field"><label class="field-label">تاریخ</label><input class="input" type="date" id="evInputDate" value="${State.calSelected || todayKey()}"></div>
      <div class="field"><label class="field-label">ساعت</label><input class="input" type="time" id="evInputTime"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost btn-block" id="evCancelBtn">انصراف</button>
      <button class="btn btn-primary btn-block" id="evSaveBtn">افزودن رویداد</button>
    </div>
  `;
  openModal('رویداد جدید', body, {
    onMount: () => {
      document.getElementById('evCancelBtn').onclick = closeModal;
      document.getElementById('evSaveBtn').onclick = () => {
        const title = document.getElementById('evInputTitle').value.trim();
        if (!title) { toast('عنوان رویداد را وارد کن', 'error'); return; }
        const date = document.getElementById('evInputDate').value || todayKey();
        const time = document.getElementById('evInputTime').value;
        const events = Store.get('events', []);
        events.push({ id: uid(), title, date, time, type: 'event' });
        Store.set('events', events);
        closeModal(); renderCalendar();
        toast('رویداد اضافه شد', 'success');
      };
    }
  });
}

/* =========================================================
   SETTINGS
   ========================================================= */
const ACCENTS = {
  iceLavender: { a1: '#8FA8FF', a2: '#B6A6F2' },
  mint: { a1: '#7FE0C2', a2: '#8FD1E0' },
  rose: { a1: '#F2A5C4', a2: '#E3A6E8' },
  amber: { a1: '#F0C27A', a2: '#F2A88A' },
};

function applyAccent(key) {
  const a = ACCENTS[key] || ACCENTS.iceLavender;
  document.documentElement.style.setProperty('--accent-1', a.a1);
  document.documentElement.style.setProperty('--accent-2', a.a2);
}

function renderSettings() {
  const settings = Store.get('settings', DEFAULT_SETTINGS);
  document.getElementById('profileName').value = settings.name;
  document.getElementById('settingsAvatar').textContent = settings.name.charAt(0);
  document.getElementById('oledSwitch').classList.add('on');
  toggleSwitchEl('notifTasksSwitch', settings.notifTasks);
  toggleSwitchEl('notifFocusSwitch', settings.notifFocus);
  toggleSwitchEl('pinLockSwitch', settings.pinEnabled);
  toggleSwitchEl('bioSwitch', settings.bioEnabled);
  document.getElementById('autolockSelect').value = String(settings.autolockSeconds);

  document.getElementById('accentSwatches').innerHTML = Object.entries(ACCENTS).map(([key, val]) => `
    <div class="swatch ${settings.accent === key ? 'selected' : ''}" data-accent="${key}" style="background:linear-gradient(135deg, ${val.a1}, ${val.a2})"></div>
  `).join('');
  document.querySelectorAll('.swatch').forEach(sw => sw.addEventListener('click', () => {
    const s = Store.get('settings', DEFAULT_SETTINGS);
    s.accent = sw.getAttribute('data-accent');
    Store.set('settings', s);
    applyAccent(s.accent);
    renderSettings();
  }));
}
function toggleSwitchEl(id, on) {
  document.getElementById(id).classList.toggle('on', !!on);
}

function wireSettingsEvents() {
  document.getElementById('profileName').addEventListener('change', (e) => {
    const s = Store.get('settings', DEFAULT_SETTINGS);
    s.name = e.target.value.trim() || 'کاربر';
    Store.set('settings', s);
    renderDashboard();
    renderSettings();
    toast('نام به‌روزرسانی شد', 'success');
  });

  [['notifTasksSwitch', 'notifTasks'], ['notifFocusSwitch', 'notifFocus'], ['pinLockSwitch', 'pinEnabled'], ['bioSwitch', 'bioEnabled']].forEach(([elId, key]) => {
    document.getElementById(elId).addEventListener('click', (e) => {
      const s = Store.get('settings', DEFAULT_SETTINGS);
      s[key] = !s[key];
      Store.set('settings', s);
      e.currentTarget.classList.toggle('on', s[key]);
    });
  });

  document.getElementById('autolockSelect').addEventListener('change', (e) => {
    const s = Store.get('settings', DEFAULT_SETTINGS);
    s.autolockSeconds = Number(e.target.value);
    Store.set('settings', s);
  });

  document.getElementById('changePinRow').addEventListener('click', () => startPinSetup(true));

  document.getElementById('exportDataRow').addEventListener('click', exportData);
  document.getElementById('clearDataRow').addEventListener('click', () => {
    openModal('پاک کردن همه داده‌ها', `
      <p class="text-secondary" style="font-size:var(--fs-sm);line-height:var(--lh-relaxed)">این عمل تمام کارها، یادداشت‌ها، اهداف و اطلاعات مالی شما را برای همیشه حذف می‌کند. این عمل غیرقابل بازگشت است.</p>
      <div class="modal-actions">
        <button class="btn btn-ghost btn-block" id="clearCancelBtn">انصراف</button>
        <button class="btn btn-danger btn-block" id="clearConfirmBtn">پاک کردن همه چیز</button>
      </div>
    `, {
      onMount: () => {
        document.getElementById('clearCancelBtn').onclick = closeModal;
        document.getElementById('clearConfirmBtn').onclick = () => {
          Object.keys(localStorage).filter(k => k.startsWith(DB_PREFIX)).forEach(k => localStorage.removeItem(k));
          closeModal();
          location.reload();
        };
      }
    });
  });
}

function exportData() {
  const data = {};
  Object.keys(localStorage).filter(k => k.startsWith(DB_PREFIX)).forEach(k => {
    data[k.replace(DB_PREFIX, '')] = JSON.parse(localStorage.getItem(k));
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'vanta-backup.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('فایل پشتیبان دانلود شد', 'success');
}

/* =========================================================
   Empty state helper + escaping
   ========================================================= */
function emptyState(icon, title, desc) {
  return `
    <div class="empty-state">
      <div class="empty-icon">${svg(icon, 24)}</div>
      <div class="empty-title">${title}</div>
      <div class="empty-desc">${desc}</div>
    </div>
  `;
}
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* =========================================================
   PIN LOCK
   ========================================================= */
const Lock = {
  pinBuffer: '',
  mode: 'unlock', // unlock | setup | confirm | change-old | change-new | change-confirm
  tempPin: '',
  autolockTimer: null,
};

function getStoredPin() { return Store.get('pin', null); }
function setStoredPin(pin) { Store.set('pin', pin); }

function initLock() {
  const settings = Store.get('settings', DEFAULT_SETTINGS);
  const existingPin = getStoredPin();
  if (!settings.pinEnabled) {
    hideLockScreen();
    return;
  }
  if (!existingPin) {
    Lock.mode = 'setup';
    document.getElementById('lockSub').textContent = 'یک پین ۴ رقمی برای فضای شخصی‌ات بساز';
  } else {
    Lock.mode = 'unlock';
    document.getElementById('lockSub').textContent = 'برای ورود، پین خود را وارد کن';
  }
  showLockScreen();
}

function showLockScreen() { document.getElementById('lockScreen').classList.remove('hidden'); }
function hideLockScreen() { document.getElementById('lockScreen').classList.add('hidden'); resetAutolockTimer(); }

function startPinSetup(isChange) {
  Lock.mode = isChange ? 'change-old' : 'setup';
  Lock.pinBuffer = '';
  document.getElementById('lockSub').textContent = isChange ? 'پین فعلی را وارد کن' : 'یک پین ۴ رقمی بساز';
  renderPinDots();
  showLockScreen();
}

function renderPinDots() {
  const dots = document.querySelectorAll('.pin-dot');
  dots.forEach((d, i) => d.classList.toggle('filled', i < Lock.pinBuffer.length));
}

function shakePinDots() {
  const container = document.getElementById('pinDots');
  container.classList.add('shake');
  setTimeout(() => container.classList.remove('shake'), 340);
}

function handlePinKey(k) {
  if (Lock.pinBuffer.length >= 4) return;
  Lock.pinBuffer += k;
  renderPinDots();
  if (Lock.pinBuffer.length === 4) setTimeout(() => processPinEntry(), 120);
}
function handlePinBackspace() {
  Lock.pinBuffer = Lock.pinBuffer.slice(0, -1);
  renderPinDots();
}

function processPinEntry() {
  const entered = Lock.pinBuffer;
  const sub = document.getElementById('lockSub');

  if (Lock.mode === 'setup') {
    Lock.tempPin = entered;
    Lock.mode = 'confirm';
    Lock.pinBuffer = '';
    sub.textContent = 'دوباره پین را وارد کن';
    renderPinDots();
    return;
  }
  if (Lock.mode === 'confirm') {
    if (entered === Lock.tempPin) {
      setStoredPin(entered);
      toast('پین با موفقیت تنظیم شد', 'success');
      hideLockScreen();
    } else {
      shakePinDots();
      sub.textContent = 'مطابقت ندارد — دوباره تلاش کن';
      Lock.mode = 'setup';
      Lock.pinBuffer = '';
      setTimeout(renderPinDots, 200);
    }
    return;
  }
  if (Lock.mode === 'unlock') {
    if (entered === getStoredPin()) {
      hideLockScreen();
      Lock.pinBuffer = '';
    } else {
      shakePinDots();
      sub.textContent = 'پین اشتباه است — دوباره تلاش کن';
      Lock.pinBuffer = '';
      setTimeout(renderPinDots, 200);
    }
    return;
  }
  if (Lock.mode === 'change-old') {
    if (entered === getStoredPin()) {
      Lock.mode = 'change-new';
      Lock.pinBuffer = '';
      sub.textContent = 'پین جدید را وارد کن';
      renderPinDots();
    } else {
      shakePinDots();
      sub.textContent = 'پین فعلی اشتباه است';
      Lock.pinBuffer = '';
      setTimeout(renderPinDots, 200);
    }
    return;
  }
  if (Lock.mode === 'change-new') {
    Lock.tempPin = entered;
    Lock.mode = 'change-confirm';
    Lock.pinBuffer = '';
    sub.textContent = 'دوباره پین جدید را وارد کن';
    renderPinDots();
    return;
  }
  if (Lock.mode === 'change-confirm') {
    if (entered === Lock.tempPin) {
      setStoredPin(entered);
      toast('پین با موفقیت تغییر کرد', 'success');
      hideLockScreen();
    } else {
      shakePinDots();
      sub.textContent = 'مطابقت ندارد — دوباره تلاش کن';
      Lock.mode = 'change-new';
      Lock.pinBuffer = '';
      setTimeout(renderPinDots, 200);
    }
    return;
  }
}

function resetAutolockTimer() {
  clearTimeout(Lock.autolockTimer);
  const settings = Store.get('settings', DEFAULT_SETTINGS);
  if (!settings.pinEnabled || !settings.autolockSeconds) return;
  Lock.autolockTimer = setTimeout(() => {
    Lock.mode = 'unlock';
    Lock.pinBuffer = '';
    document.getElementById('lockSub').textContent = 'برای ورود، پین خود را وارد کن';
    renderPinDots();
    showLockScreen();
  }, settings.autolockSeconds * 1000);
}

function wireLock() {
  document.getElementById('pinPad').addEventListener('click', (e) => {
    const btn = e.target.closest('.pin-key');
    if (!btn) return;
    if (btn.id === 'pinBack') { handlePinBackspace(); return; }
    if (btn.id === 'pinBiometric') { toast('احراز هویت بیومتریک به‌زودی', 'info'); return; }
    const k = btn.getAttribute('data-k');
    if (k) handlePinKey(k);
  });
  document.getElementById('lockNowBtn').addEventListener('click', () => {
    const settings = Store.get('settings', DEFAULT_SETTINGS);
    if (!settings.pinEnabled) { toast('ابتدا قفل پین را در تنظیمات فعال کن', 'info'); return; }
    Lock.mode = 'unlock';
    Lock.pinBuffer = '';
    document.getElementById('lockSub').textContent = 'برای ورود، پین خود را وارد کن';
    renderPinDots();
    showLockScreen();
  });
  document.getElementById('lockResetBtn').addEventListener('click', () => {
    if (confirm('همه داده‌های محلی VANTA پاک شود؟')) {
      localStorage.clear();
      location.reload();
    }
  });
  ['mousemove', 'keydown', 'click', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, () => {
      if (document.getElementById('lockScreen').classList.contains('hidden')) resetAutolockTimer();
    }, { passive: true });
  });
}

/* =========================================================
   BOOTSTRAP
   ========================================================= */
function init() {
  seedIfEmpty();
  const settings = Store.get('settings', DEFAULT_SETTINGS);
  applyAccent(settings.accent);

  buildNav();
  wireLock();
  wireSettingsEvents();

  document.getElementById('addTaskBtn').addEventListener('click', () => openTaskModal(null));
  document.getElementById('mobileFab').addEventListener('click', () => openTaskModal(null));
  document.getElementById('addNoteBtn').addEventListener('click', () => openNoteModal(null));
  document.getElementById('addGoalBtn').addEventListener('click', () => openGoalModal(null));
  document.getElementById('addTxBtn').addEventListener('click', openTxModal);
  document.getElementById('addEventBtn').addEventListener('click', openEventModal);

  document.getElementById('taskSearch').addEventListener('input', (e) => { State.taskSearch = e.target.value; renderTasks(); });
  document.getElementById('noteSearch').addEventListener('input', (e) => { State.noteSearch = e.target.value; renderNotes(); });
  document.getElementById('taskFilters').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    document.querySelectorAll('#taskFilters .chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    State.taskFilter = chip.getAttribute('data-filter');
    renderTasks();
  });

  document.getElementById('calNext').addEventListener('click', () => { shiftCalMonth(1); });
  document.getElementById('calPrev').addEventListener('click', () => { shiftCalMonth(-1); });

  switchView('home');
  tickClock();
  setInterval(tickClock, 1000 * 15);

  initLock();
  registerServiceWorker();
}

function shiftCalMonth(dir) {
  // dir: 1 = next month (chronologically forward), UI arrow is mirrored due to RTL
  State.calMonth += dir;
  if (State.calMonth > 12) { State.calMonth = 1; State.calYear += 1; }
  if (State.calMonth < 1) { State.calMonth = 12; State.calYear -= 1; }
  renderCalendar();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
