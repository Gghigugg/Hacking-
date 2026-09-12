(()=>{
const KEY='laglab_last_battle_v1';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
function save(x){try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}}
function delta(a,b){return Number((Number(a)-Number(b)).toFixed(1))}
function render(cur,prev,waiting=false){
 const scoreD=delta(cur.perf,prev.perf),fpsD=delta(cur.fps,prev.fps),stableD=delta(cur.stable,prev.stable),dropD=delta(cur.drop,prev.drop);
 const winner=waiting?'WAITING FOR CURRENT RUN':Math.abs(scoreD)<1?'TIE':scoreD>0?'CURRENT RUN':'PREVIOUS RUN';
 const cls=waiting?'tie':winner==='TIE'?'tie':winner==='CURRENT RUN'?'current':'previous';
 const max=Math.max(cur.perf,prev.perf,1);
 document.getElementById('battleCard')?.remove();
 const card=document.createElement('section');card.id='battleCard';card.className='battle-card glass';
 card.innerHTML=`<div class="battle-head"><div><span class="eyebrow">DEVICE BATTLE MODE</span><h2>Current Run <span>vs</span> Previous Run</h2><p>Compare browser benchmark sessions. Results stay on this device.</p></div><button class="battle-clear" id="battleClear">CLEAR</button></div>
 <div class="battle-winner ${cls}"><span>WINNER</span><strong>${winner}</strong><small>${waiting?'Run AUTO BENCHMARK to create the comparison':(scoreD>0?'+':'')+scoreD+' score points'}</small></div>
 <div class="battle-bars"><div class="battle-bar"><div><span>SCORE</span><b>${cur.perf} vs ${prev.perf}</b></div><i><em style="width:${Math.round(cur.perf/max*100)}%"></em></i></div><div class="battle-bar"><div><span>BEST FPS</span><b>${cur.fps} vs ${prev.fps}</b></div><i><em style="width:${Math.min(100,Math.round(Number(cur.fps)/Math.max(Number(cur.fps),Number(prev.fps),1)*100))}%"></em></i></div></div>
 <div class="battle-grid"><div><span>METRIC</span><b>CURRENT</b><b>PREVIOUS</b><b>Δ</b></div><div><span>Score</span><b>${cur.perf}</b><b>${prev.perf}</b><b class="${scoreD>=0?'up':'down'}">${scoreD>0?'+':''}${scoreD}</b></div><div><span>Best FPS</span><b>${cur.fps}</b><b>${prev.fps}</b><b class="${fpsD>=0?'up':'down'}">${fpsD>0?'+':''}${fpsD}</b></div><div><span>Max Stable</span><b>${cur.stable}/10</b><b>${prev.stable}/10</b><b class="${stableD>=0?'up':'down'}">${stableD>0?'+':''}${stableD}</b></div><div><span>Dropped</span><b>${cur.drop}%</b><b>${prev.drop}%</b><b class="${dropD<=0?'up':'down'}">${dropD>0?'+':''}${dropD}%</b></div></div>
 <p class="battle-note">Browser-session comparison only • no hardware data is changed or uploaded.</p>`;
 const anchor=document.querySelector('.result');anchor?.after(card);
 document.getElementById('battleClear')?.addEventListener('click',()=>{localStorage.removeItem(KEY);card.remove()});
}
function record(x){const prev=read();save({...x,at:new Date().toISOString()});if(prev)render(x,prev)}
function mount(){const prev=read();if(prev)render(prev,prev,true)}
window.LAGLAB_BATTLE={record,mount};
const hook=()=>{const h=window.LAGLAB_HISTORY;if(!h||h.__battleHooked)return;const original=h.save;h.save=function(x){try{window.LAGLAB_BATTLE.record({perf:Number(String(x.score).replace(/[^0-9.]/g,''))||0,grade:x.grade,fps:Number(x.fps)||0,stable:Number(x.stable)||0,drop:Number(x.dropped)||0})}catch{}return original.apply(this,arguments)};h.__battleHooked=true};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{hook();mount()});else{hook();mount()}
})();