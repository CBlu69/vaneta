/* =========================================================
   VANTA — Backup & Restore
   Export/restore all VANTA localStorage data safely.
   ========================================================= */
(function () {
  'use strict';

  const PREFIX = 'vanta:';
  const VERSION = 1;
  const META_KEY = PREFIX + 'backupMeta';

  function collectData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(PREFIX)) continue;
      try {
        data[key.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(key));
      } catch (_) {
        data[key.slice(PREFIX.length)] = localStorage.getItem(key);
      }
    }
    return data;
  }

  function makeBackup() {
    return {
      app: 'VANTA',
      type: 'local-backup',
      version: VERSION,
      createdAt: new Date().toISOString(),
      data: collectData()
    };
  }

  function downloadBackup(showToast = true) {
    try {
      const backup = makeBackup();
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.href = url;
      a.download = `VANTA-backup-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      localStorage.setItem(META_KEY, JSON.stringify({ lastExportAt: Date.now() }));
      if (showToast && typeof window.toast === 'function') {
        window.toast('نسخه پشتیبان با موفقیت ساخته شد', 'success');
      }
    } catch (err) {
      console.error('VANTA backup export failed:', err);
      if (typeof window.toast === 'function') window.toast('ساخت Backup ناموفق بود', 'error');
    }
  }

  function isValidBackup(payload) {
    return !!(
      payload &&
      payload.app === 'VANTA' &&
      payload.type === 'local-backup' &&
      payload.data &&
      typeof payload.data === 'object' &&
      !Array.isArray(payload.data)
    );
  }

  function createSafetyBackup() {
    try {
      const backup = makeBackup();
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VANTA-safety-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.warn('VANTA safety backup failed:', err);
    }
  }

  function restoreBackup(payload) {
    if (!isValidBackup(payload)) throw new Error('INVALID_BACKUP');

    // Keep a local emergency copy before replacing the current state.
    createSafetyBackup();

    // True restore: remove every current VANTA key first so deleted records
    // from the backup do not survive accidentally.
    const currentKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX)) currentKeys.push(key);
    }
    currentKeys.forEach(key => localStorage.removeItem(key));

    Object.keys(payload.data).forEach((key) => {
      if (!key || key.startsWith('__')) return;
      localStorage.setItem(PREFIX + key, JSON.stringify(payload.data[key]));
    });

    localStorage.setItem(META_KEY, JSON.stringify({
      lastRestoreAt: Date.now(),
      sourceCreatedAt: payload.createdAt || null
    }));
  }

  function openFilePicker() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';

    input.addEventListener('change', async function () {
      const file = input.files && input.files[0];
      input.remove();
      if (!file) return;

      try {
        const text = await file.text();
        const payload = JSON.parse(text);
        restoreBackup(payload);
        if (typeof window.toast === 'function') {
          window.toast('اطلاعات بازیابی شد؛ VANTA دوباره بارگذاری می‌شود', 'success');
        }
        setTimeout(() => window.location.reload(), 900);
      } catch (err) {
        console.error('VANTA backup restore failed:', err);
        const message = err.message === 'INVALID_BACKUP'
          ? 'این فایل Backup معتبر VANTA نیست'
          : 'بازیابی Backup انجام نشد؛ فایل را بررسی کن';
        if (typeof window.toast === 'function') window.toast(message, 'error');
      }
    });

    document.body.appendChild(input);
    input.click();
  }

  function addRestoreRow() {
    const exportRow = document.getElementById('exportDataRow');
    if (!exportRow || document.getElementById('importDataRow')) return;

    const row = document.createElement('div');
    row.className = 'settings-row';
    row.id = 'importDataRow';
    row.style.cursor = 'pointer';
    row.innerHTML = `
      <div class="settings-icon">${typeof window.svg === 'function' ? window.svg('download', 16) : ''}</div>
      <div class="settings-main">
        <div class="settings-label">بازیابی اطلاعات</div>
        <div class="settings-desc">انتخاب فایل Backup و برگرداندن اطلاعات</div>
      </div>
    `;
    row.addEventListener('click', openFilePicker);
    exportRow.insertAdjacentElement('afterend', row);
  }

  function bindExport() {
    const row = document.getElementById('exportDataRow');
    if (!row || row.dataset.backupBound === '1') return;
    row.dataset.backupBound = '1';
    row.addEventListener('click', () => downloadBackup(true));
  }

  function init() {
    bindExport();
    addRestoreRow();
  }

  document.addEventListener('DOMContentLoaded', init);
  init();

  const observer = new MutationObserver(() => {
    bindExport();
    addRestoreRow();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.VANTABackup = {
    export: downloadBackup,
    import: openFilePicker,
    makeBackup
  };
})();
