/* VANTA AI — local-first personal assistant */
(function () {
  'use strict';
  const PREFIX = 'vanta:';
  const esc = s => String(s ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const fa = n => { try { return window.Jalali?.toPersianDigits(String(n)); } catch (_) { return String(n); } };
  function read(key, fallback) { try { const v=localStorage.getItem(PREFIX+key); return v===null?fallback:JSON.parse(v); } catch(_) { return fallback; } }
  function data() {
    const tasks = read('tasks', []), notes = read('notes', []), goals = read('goals', []), tx = read('transactions', []);
    const done = Array.isArray(tasks) ? tasks.filter(x=>x.done).length : 0;
    const income = Array.isArray(tx) ? tx.filter(x=>String(x.type||'').toLowerCase()==='income').reduce((a,x)=>a+Number(x.amount||0),0) : 0;
    const expense = Array.isArray(tx) ? tx.filter(x=>String(x.type||'').toLowerCase()!=='income').reduce((a,x)=>a+Number(x.amount||0),0) : 0;
    return {tasks:Array.isArray(tasks)?tasks:[],notes:Array.isArray(notes)?notes:[],goals:Array.isArray(goals)?goals:[],tx:Array.isArray(tx)?tx:[],done,income,expense};
  }
  function answer(q) {
    const d=data(), s=q.trim().toLowerCase();
    if (!s) return 'سؤالت رو بنویس 👀';
    if (/کار|task|todo/.test(s)) return `الان ${fa(d.tasks.length)} کار داری؛ ${fa(d.tasks.length-d.done)} تا باقی مونده و ${fa(d.done)} تا انجام شده.`;
    if (/یادداشت|نوت|note/.test(s)) return `تعداد یادداشت‌هات ${fa(d.notes.length)} تاست.`;
    if (/هدف|goal/.test(s)) return `تعداد هدف‌هات ${fa(d.goals.length)} تاست.`;
    if (/خرج|هزینه|expense/.test(s)) return `مجموع هزینه‌های ثبت‌شده: ${fa(d.expense.toLocaleString('en-US'))} تومان.`;
    if (/درآمد|income/.test(s)) return `مجموع درآمدهای ثبت‌شده: ${fa(d.income.toLocaleString('en-US'))} تومان.`;
    if (/موجودی|balance/.test(s)) return `خالص جریان مالی ثبت‌شده: ${fa((d.income-d.expense).toLocaleString('en-US'))} تومان.`;
    if (/امروز|today/.test(s)) {
      const key = new Date().toISOString().slice(0,10), today=d.tasks.filter(x=>String(x.due||x.date||'').slice(0,10)===key);
      return today.length ? `برای امروز ${fa(today.length)} کار پیدا کردم: ${today.slice(0,4).map(x=>x.text||x.title).filter(Boolean).join('، ')}.` : 'برای امروز کاری با تاریخ مشخص پیدا نکردم.';
    }
    if (/سلام|hello|hi/.test(s)) return 'سلام 😎 من VANTA AI هستم. درباره کارها، یادداشت‌ها، اهداف و وضعیت مالی ازم بپرس.';
    return 'فعلاً در حالت آفلاینم و از داده‌های خود VANTA جواب می‌دم. مثلاً بپرس: «چند تا کار دارم؟» یا «مجموع هزینه‌هام چقدره؟»';
  }
  function inject() {
    if (document.getElementById('vantaAIButton')) return;
    const b=document.createElement('button'); b.id='vantaAIButton'; b.className='btn btn-primary'; b.textContent='VANTA AI';
    b.style.cssText='position:fixed;left:18px;bottom:18px;z-index:1200;box-shadow:0 12px 35px rgba(0,0,0,.3)';
    const box=document.createElement('div'); box.id='vantaAIBox'; box.hidden=true; box.innerHTML=`<div style="padding:18px;width:min(92vw,420px);max-height:70vh;overflow:auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><b>VANTA AI</b><button id="vantaAIClose" class="icon-btn">×</button></div><div id="vantaAIMessages" style="min-height:90px;margin-bottom:12px">سلام 😎 من دستیار آفلاین VANTA هستم.</div><div style="display:flex;gap:8px"><input id="vantaAIInput" class="input" placeholder="مثلاً چند تا کار دارم؟" style="flex:1"><button id="vantaAISend" class="btn btn-primary">ارسال</button></div></div>`;
    box.style.cssText='position:fixed;left:18px;bottom:72px;z-index:1199;background:var(--surface,rgba(15,17,24,.96));border:1px solid var(--border,rgba(255,255,255,.1));border-radius:20px;backdrop-filter:blur(18px);box-shadow:0 20px 60px rgba(0,0,0,.35)';
    document.body.append(b,box);
    const send=()=>{const i=document.getElementById('vantaAIInput'),m=document.getElementById('vantaAIMessages'); if(!i.value.trim())return; m.innerHTML+=`<div style="margin:8px 0"><b>تو:</b> ${esc(i.value)}</div><div style="margin:8px 0"><b>AI:</b> ${esc(answer(i.value))}</div>`; i.value='';};
    b.onclick=()=>{box.hidden=!box.hidden;if(!box.hidden)setTimeout(()=>document.getElementById('vantaAIInput')?.focus(),50)};
    document.getElementById('vantaAIClose').onclick=()=>box.hidden=true; document.getElementById('vantaAISend').onclick=send; document.getElementById('vantaAIInput').addEventListener('keydown',e=>{if(e.key==='Enter')send()});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',inject); else inject();
  window.VANTAAI={ask:answer,refresh:data};
})();
