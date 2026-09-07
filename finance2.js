/* =========================================================
   VANTA — Finance 2.0
   Budget, categories, monthly report and transaction filters.
   Works on top of the existing finance module without changing
   the original transaction model.
   ========================================================= */
(function () {
  'use strict';

  const PREFIX = 'vanta:';
  const BUDGET_KEY = PREFIX + 'financeBudget';
  let currentFilter = 'all';
  let lastMonth = '';

  function readTxs() {
    try { return JSON.parse(localStorage.getItem(PREFIX + 'transactions') || '[]'); }
    catch (_) { return []; }
  }

  function monthKey(d = new Date()) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  function getBudget() {
    const value = Number(localStorage.getItem(BUDGET_KEY) || 0);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function setBudget(value) {
    localStorage.setItem(BUDGET_KEY, String(Math.max(0, Number(value) || 0)));
  }

  function fmt(n) {
    const num = Math.round(Number(n) || 0).toLocaleString('en-US');
    return typeof Jalali !== 'undefined' && Jalali.toPersianDigits ? Jalali.toPersianDigits(num) : num;
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function currentMonthTxs() {
    const key = monthKey();
    return readTxs().filter(t => String(t.date || '').slice(0, 7) === key);
  }

  function categoryTotals(txs) {
    const map = {};
    txs.filter(t => t.type === 'expense').forEach(t => {
      const c = t.category || 'متفرقه';
      map[c] = (map[c] || 0) + Number(t.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }

  function injectUI() {
    const view = document.getElementById('view-finance');
    if (!view || document.getElementById('finance20Panel')) return;

    const panel = document.createElement('div');
    panel.id = 'finance20Panel';
    panel.innerHTML = `
      <div class="glass-card" style="margin-bottom:var(--sp-4)">
        <div class="card-head" style="align-items:center;gap:12px;">
          <div>
            <div class="card-title">بودجه ماهانه</div>
            <div class="text-tertiary" style="font-size:var(--fs-xs);margin-top:4px">کنترل هزینه‌های این ماه</div>
          </div>
          <button class="btn btn-ghost btn-sm" id="financeBudgetBtn">تعیین بودجه</button>
        </div>
        <div style="margin-top:var(--sp-3)">
          <div style="display:flex;justify-content:space-between;gap:12px;font-size:var(--fs-xs);color:var(--text-secondary);margin-bottom:7px">
            <span id="financeBudgetUsed">۰ تومان مصرف شده</span>
            <span id="financeBudgetText">بودجه تعیین نشده</span>
          </div>
          <div style="height:8px;border-radius:99px;background:var(--surface-2);overflow:hidden">
            <div id="financeBudgetBar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--accent-1),var(--accent-2));border-radius:99px;transition:width .35s ease"></div>
          </div>
        </div>
      </div>

      <div class="glass-card" style="margin-bottom:var(--sp-4)">
        <div class="card-head">
          <div class="card-title">هزینه بر اساس دسته‌بندی</div>
        </div>
        <div id="financeCategories" style="margin-top:var(--sp-3)"></div>
      </div>

      <div class="glass-card" style="margin-bottom:var(--sp-4)">
        <div class="card-head" style="align-items:center;gap:10px;">
          <div class="card-title">تراکنش‌ها</div>
          <div class="chip-filters" id="financeFilters" style="margin-inline-start:auto">
            <button class="chip active" data-fin-filter="all">همه</button>
            <button class="chip" data-fin-filter="expense">هزینه</button>
            <button class="chip" data-fin-filter="income">درآمد</button>
          </div>
        </div>
        <div id="finance20Transactions" class="list-stack" style="margin-top:var(--sp-3)"></div>
      </div>
    `;

    const firstCard = view.querySelector('.bento');
    if (firstCard) firstCard.insertAdjacentElement('afterend', panel);
    else view.prepend(panel);

    document.getElementById('financeBudgetBtn').addEventListener('click', openBudgetModal);
    document.querySelectorAll('[data-fin-filter]').forEach(btn => btn.addEventListener('click', () => {
      currentFilter = btn.dataset.finFilter;
      document.querySelectorAll('[data-fin-filter]').forEach(b => b.classList.toggle('active', b === btn));
      render20();
    }));
  }

  function openBudgetModal() {
    const current = getBudget();
    const body = `
      <div class="field">
        <label class="field-label">بودجه هزینه ماهانه (تومان)</label>
        <input class="input" type="number" id="financeBudgetInput" min="0" value="${current || ''}" placeholder="مثلاً ۲۰۰۰۰۰۰۰">
      </div>
      <div class="text-tertiary" style="font-size:var(--fs-xs);line-height:1.8;margin-bottom:var(--sp-3)">اگر صفر بگذاری، بودجه ماهانه حذف می‌شود.</div>
      <div class="modal-actions">
        <button class="btn btn-ghost btn-block" id="financeBudgetCancel">انصراف</button>
        <button class="btn btn-primary btn-block" id="financeBudgetSave">ذخیره بودجه</button>
      </div>
    `;
    if (typeof openModal !== 'function') return;
    openModal('بودجه ماهانه', body, {
      onMount: () => {
        document.getElementById('financeBudgetCancel').onclick = closeModal;
        document.getElementById('financeBudgetSave').onclick = () => {
          setBudget(document.getElementById('financeBudgetInput').value);
          closeModal();
          render20();
          if (typeof toast === 'function') toast('بودجه ماهانه ذخیره شد', 'success');
        };
      }
    });
  }

  function renderBudget(txs) {
    const used = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
    const budget = getBudget();
    const usedEl = document.getElementById('financeBudgetUsed');
    const textEl = document.getElementById('financeBudgetText');
    const bar = document.getElementById('financeBudgetBar');
    if (!usedEl || !textEl || !bar) return;

    usedEl.textContent = `${fmt(used)} تومان مصرف شده`;
    if (!budget) {
      textEl.textContent = 'بودجه تعیین نشده';
      bar.style.width = '0%';
      return;
    }
    const percent = Math.min(100, (used / budget) * 100);
    textEl.textContent = `${fmt(budget)} تومان`;
    bar.style.width = percent + '%';
    bar.style.background = percent >= 100 ? 'var(--danger)' : percent >= 80 ? 'var(--warning)' : 'linear-gradient(90deg,var(--accent-1),var(--accent-2))';
  }

  function renderCategories(txs) {
    const el = document.getElementById('financeCategories');
    if (!el) return;
    const rows = categoryTotals(txs);
    if (!rows.length) {
      el.innerHTML = '<div class="text-tertiary" style="text-align:center;padding:var(--sp-3) 0;font-size:var(--fs-sm)">هنوز هزینه‌ای در این ماه ثبت نشده</div>';
      return;
    }
    const max = rows[0][1];
    el.innerHTML = rows.slice(0, 8).map(([name, amount]) => `
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;gap:10px;font-size:var(--fs-xs);margin-bottom:5px">
          <span>${esc(name)}</span><span class="fa-num" style="color:var(--text-secondary)">${fmt(amount)} تومان</span>
        </div>
        <div style="height:6px;border-radius:99px;background:var(--surface-2);overflow:hidden">
          <div style="height:100%;width:${Math.max(3, amount / max * 100)}%;background:var(--accent-1);border-radius:99px"></div>
        </div>
      </div>
    `).join('');
  }

  function renderTransactions() {
    const el = document.getElementById('finance20Transactions');
    if (!el) return;
    let txs = currentMonthTxs();
    if (currentFilter !== 'all') txs = txs.filter(t => t.type === currentFilter);
    txs.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

    if (!txs.length) {
      el.innerHTML = '<div class="text-tertiary" style="text-align:center;padding:var(--sp-3) 0;font-size:var(--fs-sm)">تراکنشی با این فیلتر وجود ندارد</div>';
      return;
    }
    el.innerHTML = txs.slice(0, 12).map(t => {
      const income = t.type === 'income';
      return `
        <div class="task-item">
          <div style="width:34px;height:34px;border-radius:var(--r-sm);background:var(--surface-2);display:flex;align-items:center;justify-content:center;color:${income ? 'var(--success)' : 'var(--danger)'};flex-shrink:0;">
            ${typeof svg === 'function' ? svg(income ? 'arrowDown' : 'arrowUp', 15) : ''}
          </div>
          <div class="task-main">
            <div class="task-text">${esc(t.title)}</div>
            <div class="task-meta"><span class="meta-chip">${esc(t.category || 'متفرقه')}</span><span class="meta-chip fa-num">${esc(t.date || '')}</span></div>
          </div>
          <div class="fa-num" style="font-weight:700;color:${income ? 'var(--success)' : 'var(--danger)'}">${income ? '+' : '-'}${fmt(t.amount)}</div>
        </div>
      `;
    }).join('');
  }

  function render20() {
    injectUI();
    const txs = currentMonthTxs();
    renderBudget(txs);
    renderCategories(txs);
    renderTransactions();
  }

  function boot() {
    render20();
    setInterval(() => {
      const m = monthKey();
      if (m !== lastMonth) lastMonth = m;
      render20();
    }, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
