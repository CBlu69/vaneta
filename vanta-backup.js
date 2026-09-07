/* VANTA Safe Backup Layer — v1.0
 * Keeps a private IndexedDB snapshot of vanta:* localStorage data.
 * It never overwrites app data automatically.
 */
(function(){
  'use strict';
  const DB='vanta-safe-backup', STORE='snapshots', VERSION=1;
  const PREFIX='vanta:';
  const MAX=5;
  const openDB=()=>new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
    const r=indexedDB.open(DB,VERSION);
    r.onupgradeneeded=()=>{ const db=r.result; if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE,{keyPath:'id',autoIncrement:true}); };
    r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error);
  });
  const readData=()=>{
    const data={};
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k && k.startsWith(PREFIX)) data[k]=localStorage.getItem(k);
    }
    return data;
  };
  async function save(reason){
    try{
      const db=await openDB();
      await new Promise((resolve,reject)=>{
        const tx=db.transaction(STORE,'readwrite');
        tx.objectStore(STORE).add({createdAt:Date.now(),reason:reason||'auto',data:readData()});
        tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error);
      });
      await trim(db); db.close();
      return true;
    }catch(e){ console.warn('[VANTA backup]',e); return false; }
  }
  async function trim(db){
    return new Promise((resolve)=>{
      const tx=db.transaction(STORE,'readwrite'), st=tx.objectStore(STORE), keys=[];
      st.openCursor(null,'prev').onsuccess=e=>{
        const c=e.target.result;
        if(!c) return resolve();
        keys.push(c.primaryKey); if(keys.length>MAX){ st.delete(keys[keys.length-1]); }
        c.continue();
      };
    });
  }
  async function latest(){
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const r=db.transaction(STORE,'readonly').objectStore(STORE).openCursor(null,'prev');
      r.onsuccess=()=>{ const c=r.result; db.close(); resolve(c?c.value:null); };
      r.onerror=()=>{db.close();reject(r.error)};
    });
  }
  async function restore(){
    const snap=await latest(); if(!snap) throw new Error('هیچ نسخه پشتیبانی وجود ندارد');
    if(!confirm('آخرین نسخه پشتیبان بازیابی شود؟ داده‌های فعلی VANTA جایگزین می‌شوند.')) return false;
    Object.keys(snap.data||{}).forEach(k=>localStorage.setItem(k,snap.data[k]));
    location.reload(); return true;
  }
  async function exportJSON(){
    const snap=await latest(); if(!snap) throw new Error('نسخه پشتیبانی وجود ندارد');
    const blob=new Blob([JSON.stringify({app:'VANTA',version:1,createdAt:snap.createdAt,data:snap.data},null,2)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='vanta-safe-backup.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  window.VANTABackup={save,latest,restore,exportJSON};
  window.addEventListener('DOMContentLoaded',()=>{
    setTimeout(()=>save('startup'),1200);
    setInterval(()=>save('periodic'),5*60*1000);
    window.addEventListener('beforeunload',()=>{ try{ save('before-close'); }catch(_){} });
  });
})();
