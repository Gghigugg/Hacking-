(()=>{
const KEY='laglab_last_battle_v1';
let current=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
function save(x){try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}}
function delta(a,b){return Number((a-b).toFixed(1))}
function render(cur,prev){
 const old=prev;
 const scoreD=delta(cur.perf,old.perf),fpsD=delta(cur.fps,old.fps),stableD=delta(cur.stable,old.stable),dropD=delta(cur.drop,old.drop);
 const winner=Math.abs(scoreD)<1?'TIE':scoreD>0?'CURRENT RUN':'PREVIOUS RUN';
 const cls=winner==='TIE'?'tie':winner==='CURRENT RUN'?'current':'previous';
 const max=Math.max(cur.perf,old.perf,1);
 document.getElementById('battleCard')?.remove();
 const card=document.createElement('section');card.id='battleCard';card.className='battle-card glass';
 card.innerHTML=`<div class="battle-head"><div><span class="eyebrow">DEVICE BATTLE MODE</span><h2>Current Run <span>vs</span> Previous Run</h2><p>Compare two browser benchmark sessions. This is not a hardware upgrade test.</p></div><button class="battle-clear" id="battleClear">CLEAR</button></div>
 <div class="battle-winner ${cls}"><span>WINNER</span><strong>${winner}</strong><small>${scoreD>0?'+':''}${scoreD} score points</small></div>
 <div class="battle-bars"><div class="battle-bar"><div><span>SCORE</span><b>${cur.perf} vs ${old.perf}</b></div><i><em style="width:${Math.round(cur.perf/max*100)}%"></em></i></div><div class="battle-bar"><div><span>BEST FPS</span><b>${cur.fps} vs ${old.fps}</b></div><i><em style="width:${Math.min(100,Math.round(cur.fps/Math.max(cur.fps,old.fps,1)*100))}%"></em></i></div></div>
 <div class="battle-grid"><div><span>METRIC</span><b>CURRENT</b><b>PREVIOUS</b><b>Δ</b></div><div><span>Score</span><b>${cur.perf}</b><b>${old.perf}</b><b class="${scoreD>=0?'up':'down'}">${scoreD>0?'+':''}${scoreD}</b></div><div><span>Best FPS</span><b>${cur.fps}</b><b>${old.fps}</b><b class="${fpsD>=0?'up':'down'}">${fpsD>0?'+':''}${fpsD}</b></div><div><span>Max Stable</span><b>${cur.stable}/10</b><b>${old.stable}/10</b><b class="${stableD>=0?'up':'down'}">${stableD>0?'+':''}${stableD}</b></div><div><span>Dropped</span><b>${cur.drop}%</b><b>${old.drop}%</b><b class="${dropD<=0?'up':'down'}">${dropD>0?'+':''}${dropD}%</b></div></div>
 <p class="battle-note">Both results are saved only in this browser using local storage.</p>`;
 const anchor=document.querySelector('.result');anchor?.after(card);
 document.getElementById('battleClear')?.addEventListener('click',()=>{localStorage.removeItem(KEY);card.remove()});
}
function record(x){current=x;const prev=read();save({...x,at:new Date().toISOString()});if(prev)render(x,prev)}
function mount(){const prev=read();if(!prev)return;render({perf:prev.perf,fps:prev.fps,stable:prev.stable,drop:prev.drop},prev);document.getElementById('battleCard')?.querySelector('.battle-winner strong')&&(document.querySelector('.battle-winner strong').textContent='WAITING FOR CURRENT RUN')}
window.LAGLAB_BATTLE={record,mount};
window.addEventListener('DOMContentLoaded',mount);
})();