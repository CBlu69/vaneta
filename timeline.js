/* =========================================================
   VANTA — Life Timeline
   Builds a personal history from existing VANTA data.
   ========================================================= */
(function () {
  'use strict';

  const PREFIX = 'vanta:';
  const ICONS = {
    tasks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18"/></svg>',
    note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
    goal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v2M21 12h-2"/></svg>',
    money: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 9h18"/></svg>'
  };

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function read(key, fallback) {
    try {
      if (typeof window.Store === 'object' && typeof Store.get === 'function') return Store.get(key, fallback);
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) { return fallback; }
  }

  function keyDate(value) {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    if (typeof todayKey === 'function') return todayKey(d);
    return d.toISOString().slice(0, 10);
  }

  function dateLabel(key) {
    try {
      if (typeof formatDueDate === 'function') return formatDueDate(key);
      return key;
    } catch (_) { return key; }
  }

  function buildItems(filter) {
    const items = [];
    const tasks = read('tasks', []);
    const notes = read('notes', []);
    const goals = read('goals', []);
    const txs = read('transactions', []);
    const events = read('events', []);

    tasks.forEach(t => items.push({
      type:'tasks', date:keyDate(t.doneAt || t.completedAt || t.createdAt || t.due),
      title:t.done ? `کار انجام شد: ${t.text}` : `کار اضافه شد: ${t.text}`,
      meta:t.done ? 'انجام‌شده' : (t.category || 'کار'),
      ts:new Date(t.doneAt || t.completedAt || t.createdAt || t.due || 0).getTime() || 0
    }));
    notes.forEach(n => items.push({
      type:'note', date:keyDate(n.updatedAt || n.createdAt || n.date),
      title:`یادداشت: ${n.title || n.text || 'بدون عنوان'}`,
      meta:n.category || (Array.isArray(n.tags) ? n.tags.join('، ') : 'یادداشت'),
      ts:new Date(n.updatedAt || n.createdAt || n.date || 0).getTime() || 0
    }));
    goals.forEach(g => items.push({
      type:'goal', date:keyDate(g.updatedAt || g.createdAt || g.due || g.deadline),
      title:`هدف: ${g.title || g.name || 'بدون عنوان'}`,
      meta:`${Number(g.progress || 0)}٪ پیشرفت`,
      ts:new Date(g.updatedAt || g.createdAt || g.due || 0).getTime() || 0
    }));
    txs.forEach(t => items.push({
      type:'money', date:keyDate(t.date || t.createdAt),
      title:`${t.type === 'income' ? 'درآمد' : 'هزینه'}: ${t.title || 'تراکنش'}`,
      meta:`${Number(t.amount || 0).toLocaleString('fa-IR')} تومان • ${t.category || 'متفرقه'}`,
      ts:new Date(t.date || t.createdAt || 0).getTime() || 0
    }));
    events.forEach(e => items.push({
      type:'calendar', date:keyDate(e.date || e.createdAt),
      title:`رویداد: ${e.title || 'بدون عنوان'}`,
      meta:e.time ? e.time : 'تمام روز',
      ts:new Date(e.date || e.createdAt || 0).getTime() || 0
    }));

    return items.filter(x => x.date && (!filter || filter === 'all' || x.type === filter)).sort((a,b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return b.ts - a.ts;
    });
  }

  function injectStyles() {
    if (document.getElementById('vantaTimelineStyles')) return;
    const style = document.createElement('style');
    style.id = 'vantaTimelineStyles';
    style.textContent = `
      .timeline-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:var(--sp-4)}
      .timeline-filter{border:1px solid var(--border);background:var(--surface-1);color:var(--text-secondary);padding:8px 13px;border-radius:999px;cursor:pointer;font-family:inherit;font-size:var(--fs-xs)}
      .timeline-filter.active{background:var(--accent-soft);color:var(--accent-1);border-color:transparent}
      .timeline-list{position:relative;padding:4px 0 12px}
      .timeline-list:before{content:"";position:absolute;right:17px;top:10px;bottom:10px;width:1px;background:var(--border)}
      .timeline-day{position:relative;margin:0 0 var(--sp-5)}
      .timeline-date{font-size:var(--fs-xs);color:var(--text-tertiary);font-weight:700;margin:0 0 10px 48px}
      .timeline-item{position:relative;display:flex;gap:12px;margin:0 0 10px}
      .timeline-icon{width:36px;height:36px;border-radius:11px;background:var(--surface-2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--accent-1);z-index:1;flex:none}
      .timeline-icon svg{width:17px;height:17px}
      .timeline-card{flex:1;min-width:0;padding:11px 13px;border:1px solid var(--border);border-radius:14px;background:var(--surface-1)}
      .timeline-title{font-size:var(--fs-sm);font-weight:650;line-height:1.7}
      .timeline-meta{margin-top:3px;color:var(--text-tertiary);font-size:var(--fs-xs)}
      .timeline-empty{padding:38px 15px;text-align:center;color:var(--text-tertiary)}
    `;
    document.head.appendChild(style);
  }

  function addNav() {
    const navs = [document.getElementById('sidebarNav'), document.getElementById('bottomNav')].filter(Boolean);
    navs.forEach(nav => {
      if (nav.querySelector('[data-nav="timeline"]')) return;
      const item = document.createElement('div');
      item.className = 'nav-item';
      item.dataset.nav = 'timeline';
      item.innerHTML = `${ICONS.calendar}<span>تایم‌لاین</span>`;
      item.addEventListener('click', () => show());
      nav.appendChild(item);
    });
  }

  function addView() {
    if (document.getElementById('view-timeline')) return;
    const main = document.querySelector('main.content');
    if (!main) return;
    const section = document.createElement('section');
    section.className = 'view';
    section.id = 'view-timeline';
    section.innerHTML = `
      <div class="view-head"><div><div class="view-title">تایم‌لاین زندگی</div><div class="view-sub">ردپای کارها، یادداشت‌ها، اهداف، مالی و رویدادهای تو</div></div></div>
      <div class="timeline-toolbar" id="timelineFilters">
        <button class="timeline-filter active" data-tf="all">همه</button>
        <button class="timeline-filter" data-tf="tasks">کارها</button>
        <button class="timeline-filter" data-tf="note">یادداشت‌ها</button>
        <button class="timeline-filter" data-tf="goal">اهداف</button>
        <button class="timeline-filter" data-tf="money">مالی</button>
        <button class="timeline-filter" data-tf="calendar">رویدادها</button>
      </div>
      <div class="glass-card"><div class="timeline-list" id="timelineList"></div></div>
    `;
    main.appendChild(section);
    section.querySelectorAll('[data-tf]').forEach(btn => btn.addEventListener('click', () => {
      section.querySelectorAll('[data-tf]').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      render(btn.dataset.tf);
    }));
  }

  function render(filter) {
    const list = document.getElementById('timelineList');
    if (!list) return;
    const items = buildItems(filter || 'all');
    if (!items.length) {
      list.innerHTML = '<div class="timeline-empty">هنوز چیزی برای نمایش در تایم‌لاین نیست.<br>با ثبت کار، یادداشت، هدف، تراکنش یا رویداد، اینجا تاریخچه‌ات ساخته می‌شود.</div>';
      return;
    }
    const groups = [];
    items.forEach(item => {
      let group = groups.find(g => g.date === item.date);
      if (!group) { group = {date:item.date, items:[]}; groups.push(group); }
      group.items.push(item);
    });
    list.innerHTML = groups.map(g => `
      <div class="timeline-day">
        <div class="timeline-date">${esc(dateLabel(g.date))}</div>
        ${g.items.map(item => `
          <div class="timeline-item">
            <div class="timeline-icon">${ICONS[item.type]}</div>
            <div class="timeline-card"><div class="timeline-title">${esc(item.title)}</div><div class="timeline-meta">${esc(item.meta)}</div></div>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  function show() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById('view-timeline');
    if (view) view.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.nav === 'timeline'));
    render('all');
  }

  function init() {
    injectStyles();
    addView();
    addNav();
    render('all');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // app.js may rebuild navigation; keep the Timeline entry available.
  const observer = new MutationObserver(() => { addNav(); });
  observer.observe(document.body, {childList:true, subtree:true});

  window.VANTATimeline = { render, show };
})();
