/* VANTA recurring tasks extension */
(function () {
  const EXT_STYLE_ID = 'vanta-recurring-task-style';
  if (!document.getElementById(EXT_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = EXT_STYLE_ID;
    style.textContent = `
      .repeat-box{margin-top:4px;padding:14px;border:1px solid var(--border);border-radius:14px;background:rgba(255,255,255,.025)}
      .repeat-options{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
      .repeat-option{border:1px solid var(--border);background:rgba(255,255,255,.025);color:var(--text-secondary);border-radius:11px;padding:10px 7px;font-family:inherit;font-size:12px;cursor:pointer}
      .repeat-option.active{border-color:var(--accent);background:rgba(143,168,255,.12);color:var(--text-primary)}
      .weekday-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-top:10px}
      .weekday-btn{border:1px solid var(--border);background:rgba(255,255,255,.025);color:var(--text-secondary);border-radius:9px;padding:8px 2px;font-family:inherit;font-size:11px;cursor:pointer}
      .weekday-btn.active{background:var(--accent);border-color:var(--accent);color:#07080C;font-weight:700}
      .repeat-hint{font-size:11px;color:var(--text-tertiary);margin-top:8px;line-height:1.7}
      .repeat-badge{display:inline-flex;align-items:center;gap:4px;color:var(--accent);font-size:11px}
      @media(max-width:430px){.repeat-options{grid-template-columns:repeat(2,1fr)}}
    `;
    document.head.appendChild(style);
  }

  const DAY_LABELS = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
  const REPEAT_LABELS = { none:'یک‌بار', daily:'هر روز', weekly:'هفتگی', monthly:'ماهانه' };

  function dateKeyToday() { return todayKey(); }
  function dateToParts(key) { return key.split('-').map(Number); }
  function weekdayOf(key) {
    const [y,m,d] = dateToParts(key);
    return new Date(y, m - 1, d).getDay();
  }
  function sameOrAfter(a,b){ return a >= b; }

  function normalizeRepeat(task) {
    if (task.repeat && typeof task.repeat === 'object') {
      return {
        type: task.repeat.type || 'none',
        weekdays: Array.isArray(task.repeat.weekdays) ? task.repeat.weekdays.map(Number) : []
      };
    }
    return { type:'none', weekdays:[] };
  }

  function isOccurrence(task, key) {
    const r = normalizeRepeat(task);
    if (r.type === 'none') return task.due === key;
    if (!task.due || !sameOrAfter(key, task.due)) return false;
    if (r.type === 'daily') return true;
    if (r.type === 'weekly') return r.weekdays.includes(weekdayOf(key));
    if (r.type === 'monthly') {
      const [, , d] = dateToParts(key);
      const [, , startD] = dateToParts(task.due);
      return d === startD;
    }
    return false;
  }

  function isDoneFor(task, key) {
    const r = normalizeRepeat(task);
    if (r.type === 'none') return !!task.done;
    return !!(task.doneDates && task.doneDates[key]);
  }

  function setDoneFor(task, key, value) {
    const r = normalizeRepeat(task);
    if (r.type === 'none') {
      task.done = value;
      return;
    }
    task.doneDates = task.doneDates || {};
    if (value) task.doneDates[key] = true;
    else delete task.doneDates[key];
  }

  function repeatText(task) {
    const r = normalizeRepeat(task);
    if (r.type === 'weekly' && r.weekdays.length) {
      return r.weekdays.sort((a,b)=>a-b).map(d => DAY_LABELS[d]).join('، ');
    }
    return REPEAT_LABELS[r.type] || 'یک‌بار';
  }

  function currentTasks() {
    const all = Store.get('tasks', []);
    const today = dateKeyToday();
    return all.map(t => ({
      ...t,
      _occurrenceToday: isOccurrence(t, today),
      _doneToday: isDoneFor(t, today)
    }));
  }

  function renderRecurringTasks() {
    const tasks = currentTasks();
    const total = tasks.filter(t => t._occurrenceToday || normalizeRepeat(t).type === 'none').length;
    const done = tasks.filter(t => (t._occurrenceToday || normalizeRepeat(t).type === 'none') && t._doneToday).length;
    const summary = document.getElementById('tasksSummary');
    if (summary) summary.textContent = total ? `${Jalali.toPersianDigits(done)} از ${Jalali.toPersianDigits(total)} کار امروز انجام شده` : 'برای امروز کاری ثبت نشده';

    let filtered = tasks.filter(t => t._occurrenceToday || (normalizeRepeat(t).type === 'none' && t.due >= dateKeyToday()));
    if (State.taskFilter === 'active') filtered = filtered.filter(t => !t._doneToday);
    if (State.taskFilter === 'done') filtered = filtered.filter(t => t._doneToday);
    if (State.taskFilter === 'high') filtered = filtered.filter(t => t.priority === 'high');
    if (State.taskSearch.trim()) {
      const q = State.taskSearch.trim().toLowerCase();
      filtered = filtered.filter(t => t.text.toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q));
    }
    filtered.sort((a,b) => (a._doneToday - b._doneToday) || (b.createdAt - a.createdAt));

    const list = document.getElementById('tasksList');
    if (!list) return;
    if (!filtered.length) {
      list.innerHTML = emptyState('tasks', 'کاری برای امروز نیست', 'یک کار جدید اضافه کن یا زمان‌بندی تکرارش را تنظیم کن.');
      return;
    }
    const priorityLabel = { high:'اولویت بالا', medium:'اولویت متوسط', low:'اولویت پایین' };
    list.innerHTML = filtered.map(t => {
      const r = normalizeRepeat(t);
      const dueLabel = r.type === 'none' ? (t.due ? formatDueDate(t.due) : '') : repeatText(t);
      return `
        <div class="task-item ${t._doneToday ? 'done' : ''}" data-id="${t.id}">
          <div class="checkbox ${t._doneToday ? 'checked' : ''}" data-action="toggle-task">${svg('check',12)}</div>
          <div class="task-main">
            <div class="task-text">${escapeHtml(t.text)}</div>
            <div class="task-meta">
              <span class="badge priority-${t.priority}">${priorityLabel[t.priority] || t.priority}</span>
              ${t.category ? `<span class="meta-chip">${svg('tag',12)}${escapeHtml(t.category)}</span>` : ''}
              ${r.type !== 'none' ? `<span class="repeat-badge">${svg('calendar',12)}${escapeHtml(dueLabel)}</span>` : (t.due ? `<span class="meta-chip">${svg('calendar',12)}${formatDueDate(t.due)}</span>` : '')}
            </div>
          </div>
          <div class="task-actions">
            <button class="icon-btn" data-action="edit-task">${svg('edit',15)}</button>
            <button class="icon-btn danger" data-action="delete-task">${svg('trash',15)}</button>
          </div>
        </div>`;
    }).join('');

    list.querySelectorAll('.task-item').forEach(row => {
      const id = row.getAttribute('data-id');
      row.querySelector('[data-action="toggle-task"]').addEventListener('click', () => toggleRecurringTask(id));
      row.querySelector('[data-action="edit-task"]').addEventListener('click', () => openRecurringTaskModal(id));
      row.querySelector('[data-action="delete-task"]').addEventListener('click', () => deleteTask(id));
    });
  }

  function toggleRecurringTask(id) {
    const tasks = Store.get('tasks', []);
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    const key = dateKeyToday();
    setDoneFor(t, key, !isDoneFor(t, key));
    Store.set('tasks', tasks);
    renderRecurringTasks();
    renderDashboard();
  }

  function openRecurringTaskModal(id) {
    const tasks = Store.get('tasks', []);
    const editing = tasks.find(t => t.id === id);
    const repeat = normalizeRepeat(editing || {});
    const startDate = editing?.due || dateKeyToday();
    const body = `
      <div class="field"><label class="field-label">عنوان کار</label><input class="input" id="taskInputText" placeholder="مثلاً: ورزش صبحگاهی" value="${editing ? escapeHtml(editing.text) : ''}"></div>
      <div class="row-2">
        <div class="field"><label class="field-label">اولویت</label><select class="select" id="taskInputPriority">
          <option value="low" ${editing?.priority === 'low' ? 'selected' : ''}>پایین</option>
          <option value="medium" ${!editing || editing.priority === 'medium' ? 'selected' : ''}>متوسط</option>
          <option value="high" ${editing?.priority === 'high' ? 'selected' : ''}>بالا</option>
        </select></div>
        <div class="field"><label class="field-label">دسته‌بندی</label><input class="input" id="taskInputCategory" placeholder="کار، شخصی..." value="${editing ? escapeHtml(editing.category || '') : ''}"></div>
      </div>
      <div class="field"><label class="field-label">زمان‌بندی</label>
        <div class="repeat-box">
          <div class="repeat-options" id="repeatOptions">
            ${Object.entries(REPEAT_LABELS).map(([key,label]) => `<button type="button" class="repeat-option ${repeat.type === key ? 'active' : ''}" data-repeat="${key}">${label}</button>`).join('')}
          </div>
          <div id="weeklyPicker" style="display:${repeat.type === 'weekly' ? 'block' : 'none'}">
            <div class="weekday-grid">
              ${DAY_LABELS.map((label,i) => `<button type="button" class="weekday-btn ${repeat.weekdays.includes(i) ? 'active' : ''}" data-day="${i}">${label}</button>`).join('')}
            </div>
            <div class="repeat-hint">روزهایی که می‌خواهی این کار هر هفته تکرار شود را انتخاب کن.</div>
          </div>
          <div class="repeat-hint" id="repeatHint"></div>
        </div>
      </div>
      <div class="field"><label class="field-label">شروع از</label><input class="input" type="date" id="taskInputDue" value="${gregorianKeyToInput(startDate)}"></div>
      <div class="modal-actions">
        <button class="btn btn-ghost btn-block" id="taskCancelBtn">انصراف</button>
        <button class="btn btn-primary btn-block" id="taskSaveBtn">${editing ? 'ذخیره تغییرات' : 'افزودن کار'}</button>
      </div>`;

    let selectedRepeat = repeat.type;
    let selectedDays = repeat.weekdays.length ? [...repeat.weekdays] : [6];
    openModal(editing ? 'ویرایش کار' : 'کار جدید', body, {
      onMount: () => {
        const hint = document.getElementById('repeatHint');
        const weeklyPicker = document.getElementById('weeklyPicker');
        const updateRepeatUI = () => {
          document.querySelectorAll('#repeatOptions .repeat-option').forEach(b => b.classList.toggle('active', b.dataset.repeat === selectedRepeat));
          weeklyPicker.style.display = selectedRepeat === 'weekly' ? 'block' : 'none';
          const hints = { none:'این کار فقط در تاریخ انتخاب‌شده نمایش داده می‌شود.', daily:'این کار از تاریخ شروع، هر روز نمایش داده می‌شود.', weekly:'این کار در روزهای انتخاب‌شده هر هفته نمایش داده می‌شود.', monthly:'این کار هر ماه در همان روزِ ماه تکرار می‌شود.' };
          hint.textContent = hints[selectedRepeat] || '';
        };
        document.querySelectorAll('#repeatOptions .repeat-option').forEach(btn => btn.onclick = () => { selectedRepeat = btn.dataset.repeat; updateRepeatUI(); });
        document.querySelectorAll('#weeklyPicker .weekday-btn').forEach(btn => btn.onclick = () => {
          const d = Number(btn.dataset.day);
          selectedDays = selectedDays.includes(d) ? selectedDays.filter(x => x !== d) : [...selectedDays, d];
          btn.classList.toggle('active', selectedDays.includes(d));
        });
        updateRepeatUI();
        document.getElementById('taskCancelBtn').onclick = closeModal;
        document.getElementById('taskSaveBtn').onclick = () => {
          const text = document.getElementById('taskInputText').value.trim();
          if (!text) { toast('عنوان کار را وارد کن','error'); return; }
          if (selectedRepeat === 'weekly' && !selectedDays.length) { toast('حداقل یک روز هفته را انتخاب کن','error'); return; }
          const priority = document.getElementById('taskInputPriority').value;
          const category = document.getElementById('taskInputCategory').value.trim();
          const due = document.getElementById('taskInputDue').value || dateKeyToday();
          const allTasks = Store.get('tasks', []);
          const repeatObj = { type:selectedRepeat, weekdays:selectedRepeat === 'weekly' ? selectedDays.sort((a,b)=>a-b) : [] };
          if (editing) {
            const t = allTasks.find(x => x.id === id);
            Object.assign(t, { text, priority, category, due, repeat:repeatObj });
            if (selectedRepeat === 'none') delete t.doneDates;
            else { t.doneDates = t.doneDates || {}; t.done = false; }
          } else {
            allTasks.push({ id:uid(), text, priority, category, due, repeat:repeatObj, done:false, doneDates:{}, createdAt:Date.now() });
          }
          Store.set('tasks', allTasks);
          closeModal();
          renderRecurringTasks();
          renderDashboard();
          toast(editing ? 'کار به‌روزرسانی شد' : 'کار جدید اضافه شد','success');
        };
      }
    });
  }

  window.renderTasks = renderRecurringTasks;
  window.openTaskModal = openRecurringTaskModal;
  window.toggleTask = toggleRecurringTask;

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { renderRecurringTasks(); }, 0);
  });
})();
