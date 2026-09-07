/* VANTA AI — online assistant with local VANTA context */
(function () {
  'use strict';
  const PREFIX='vanta:';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const read=(key,fallback)=>{try{const v=localStorage.getItem(PREFIX+key);return v===null?fallback:JSON.parse(v)}catch(_){return fallback}};
  const data=()=>({tasks:read('tasks',[]),notes:read('notes',[]),goals:read('goals',[]),transactions:read('transactions',[])});
  async function ask(message){const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,context:data()})});const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.error||'ارتباط با VANTA AI برقرار نشد.');return j.reply||'پاسخی دریافت نشد.';}
  function openAI(){const box=document.getElementById('vantaAIBox');if(box){box.hidden=false;setTimeout(()=>document.getElementById('vantaAIInput')?.focus(),50)}}
  function addNavItem(container){if(!container||container.querySelector('[data-vanta-ai-nav]'))return;const item=document.createElement('div');item.className='nav-item';item.dataset.vantaAiNav='1';item.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9c1.5 0 2.9-.4 4.1-1.1L21 21l-1.1-4.9A8.9 8.9 0 0 0 21 12a9 9 0 0 0-9-9Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></svg><span>VANTA AI</span>';item.onclick=e=>{e.preventDefault();e.stopPropagation();openAI()};container.appendChild(item)}
  function inject(){
    if(!document.getElementById('vantaAIButton')){const b=document.createElement('button');b.id='vantaAIButton';b.className='btn btn-primary';b.textContent='VANTA AI';b.style.cssText='position:fixed;left:18px;bottom:18px;z-index:1200;box-shadow:0 12px 35px rgba(0,0,0,.3)';b.onclick=openAI;document.body.appendChild(b)}
    if(!document.getElementById('vantaAIBox')){const box=document.createElement('div');box.id='vantaAIBox';box.hidden=true;box.innerHTML='<div style="padding:18px;width:min(92vw,440px);max-height:70vh;overflow:auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><div><b>VANTA AI</b><div style="font-size:11px;color:var(--text-tertiary)">آنلاین • OpenAI</div></div><button id="vantaAIClose" class="icon-btn">×</button></div><div id="vantaAIMessages" style="min-height:90px;margin-bottom:12px"><div style="padding:10px;border-radius:12px;background:rgba(255,255,255,.05)">سلام 😎 من VANTA AI هستم. آنلاینم، بپرس.</div></div><div style="display:flex;gap:8px"><input id="vantaAIInput" class="input" placeholder="مثلاً برنامه امروزمو بررسی کن" style="flex:1"><button id="vantaAISend" class="btn btn-primary">ارسال</button></div></div>';box.style.cssText='position:fixed;left:18px;bottom:72px;z-index:1199;background:var(--surface,rgba(15,17,24,.98));border:1px solid var(--border,rgba(255,255,255,.1));border-radius:20px;backdrop-filter:blur(18px);box-shadow:0 20px 60px rgba(0,0,0,.35)';document.body.appendChild(box);
      const input=box.querySelector('#vantaAIInput'),messages=box.querySelector('#vantaAIMessages'),sendBtn=box.querySelector('#vantaAISend');
      const send=async()=>{const text=input.value.trim();if(!text)return;messages.insertAdjacentHTML('beforeend',`<div style="margin:10px 0"><b>تو:</b> ${esc(text)}</div><div id="vantaAILoading" style="margin:10px 0;opacity:.65">در حال فکر کردن…</div>`);input.value='';input.disabled=true;sendBtn.disabled=true;try{const reply=await ask(text);document.getElementById('vantaAILoading')?.remove();messages.insertAdjacentHTML('beforeend',`<div style="margin:10px 0"><b>AI:</b> ${esc(reply).replace(/\n/g,'<br>')}</div>`)}catch(e){document.getElementById('vantaAILoading')?.remove();messages.insertAdjacentHTML('beforeend',`<div style="margin:10px 0;color:var(--danger)">${esc(e.message)}</div>`)}finally{input.disabled=false;sendBtn.disabled=false;input.focus()}};
      box.querySelector('#vantaAIClose').onclick=()=>box.hidden=true;sendBtn.onclick=send;input.addEventListener('keydown',e=>{if(e.key==='Enter')send()};
    }
    addNavItem(document.getElementById('sidebarNav'));addNavItem(document.getElementById('bottomNav'));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
  new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});
  window.VANTAAI={ask,data,open:openAI};
})();
