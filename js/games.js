// ══════════════════════════════════════
// 🎯 게임 공통
// ══════════════════════════════════════
const GAME_COLORS = ['#2563eb','#16a34a','#d97706','#7c3aed','#dc2626','#0891b2','#db2777','#65a30d','#ea580c','#6366f1'];

function openGameModal(){
  const bg = document.getElementById('game-modal-bg');
  bg.style.cssText = 'display:flex;position:fixed;inset:0;z-index:15000;background:rgba(0,0,0,0.55);align-items:center;justify-content:center;border-radius:16px;';
  switchGameTab('ladder');
  initLadder();
  initRoulette();
  renderGameQuickMembers();
}
function closeGameModal(){
  document.getElementById('game-modal-bg').style.display='none';
}
function switchGameTab(tab){
  const lp = document.getElementById('game-panel-ladder');
  const rp = document.getElementById('game-panel-roulette');
  const pp = document.getElementById('game-panel-rps');
  lp.style.cssText = (tab==='ladder'   ? 'display:flex;' : 'display:none;') + 'padding:14px 16px;flex-direction:column;gap:10px;';
  rp.style.cssText = (tab==='roulette' ? 'display:flex;' : 'display:none;') + 'padding:14px 16px;flex-direction:column;gap:10px;';
  if(pp) pp.style.cssText = (tab==='rps' ? 'display:flex;' : 'display:none;') + 'padding:14px 16px;flex-direction:column;gap:12px;';
  const lt = document.getElementById('game-tab-ladder');
  const rt = document.getElementById('game-tab-roulette');
  const pt = document.getElementById('game-tab-rps');
  if(lt){ lt.style.background = tab==='ladder'?'var(--blue)':'var(--surface2)'; lt.style.color = tab==='ladder'?'#fff':'var(--text2)'; lt.style.border = tab==='ladder'?'none':'1px solid var(--border2)'; }
  if(rt){ rt.style.background = tab==='roulette'?'#7c3aed':'var(--surface2)'; rt.style.color = tab==='roulette'?'#fff':'var(--text2)'; rt.style.border = tab==='roulette'?'none':'1px solid var(--border2)'; }
  if(pt){ pt.style.background = tab==='rps'?'#16a34a':'var(--surface2)'; pt.style.color = tab==='rps'?'#fff':'var(--text2)'; pt.style.border = tab==='rps'?'none':'1px solid var(--border2)'; }
  if(tab==='roulette') setTimeout(()=>drawRoulette(), 50);
  if(tab==='rps') initRpsPanel();
}

function _getGameMembers(){
  try {
    // _memberListCache는 module scope에서 window에 노출
    if(window._memberListCache && Array.isArray(window._memberListCache)){
      return window._memberListCache.filter(n=>n!=='어드민');
    }
    if(window._groupsCache){
      const all = new Set();
      Object.values(window._groupsCache).forEach(g=>(g.members||[]).forEach(m=>all.add(m)));
      return [...all].filter(n=>n!=='어드민');
    }
  } catch(e){}
  return [];
}

function renderGameQuickMembers(){
  const members = _getGameMembers();
  const ldWrap = document.getElementById('ladder-quick-members');
  const rlWrap = document.getElementById('roulette-quick-members');
  const btnStyle = 'font-size:10px;padding:2px 8px;border-radius:99px;border:1px solid var(--border2);background:var(--surface2);color:var(--text2);cursor:pointer;font-family:var(--font);';
  if(ldWrap) ldWrap.innerHTML = members.map(n=>`<button style="${btnStyle}" onclick="ladderQuickAdd('${n}')">${n}</button>`).join('');
  if(rlWrap) rlWrap.innerHTML = members.map(n=>`<button style="${btnStyle}" onclick="rouletteQuickAdd('${n}')">${n}</button>`).join('');
}

// ══════════════════════════════════════
// 🪜 사다리타기
// ══════════════════════════════════════
let ladderNames   = [];
let ladderResults = [];

function initLadder(){
  ladderNames = ['참가자1','참가자2','참가자3'];
  ladderResults = [{label:'당첨',type:'win'},{label:'꽝',type:'lose'},{label:'꽝',type:'lose'}];
  renderLadderNames();
  renderLadderResults();
  document.getElementById('ladder-canvas-wrap').style.display='none';
}

function renderLadderNames(){
  const wrap = document.getElementById('ladder-names-wrap');
  wrap.innerHTML = ladderNames.map((n,i)=>`
    <div style="display:flex;gap:5px;align-items:center;">
      <input value="${n}" oninput="ladderNames[${i}]=this.value" maxlength="8"
        style="flex:1;font-size:12px;padding:5px 8px;border-radius:6px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-family:var(--font);outline:none;"/>
      <button onclick="ladderRemoveName(${i})" style="background:none;border:none;font-size:13px;cursor:pointer;color:var(--text3);padding:0 2px;">✕</button>
    </div>`).join('');
}
function renderLadderResults(){
  const wrap = document.getElementById('ladder-results-wrap');
  wrap.innerHTML = ladderResults.map((r,i)=>`
    <div style="display:flex;gap:5px;align-items:center;">
      <span style="font-size:14px;">${r.type==='win'?'🎉':'💀'}</span>
      <input value="${r.label}" oninput="ladderResults[${i}].label=this.value" maxlength="8"
        style="flex:1;font-size:12px;padding:5px 8px;border-radius:6px;border:1px solid ${r.type==='win'?'var(--green-bd)':'var(--red-bd)'};background:${r.type==='win'?'var(--green-bg)':'var(--red-bg)'};color:${r.type==='win'?'var(--green-txt)':'var(--red-txt)'};font-family:var(--font);outline:none;"/>
      <button onclick="ladderRemoveResult(${i})" style="background:none;border:none;font-size:13px;cursor:pointer;color:var(--text3);padding:0 2px;">✕</button>
    </div>`).join('');
}
function ladderAddName(){
  ladderNames.push('참가자'+(ladderNames.length+1));
  renderLadderNames();
}
function ladderRemoveName(i){
  ladderNames.splice(i,1);
  renderLadderNames();
}
function ladderAddResult(label){
  ladderResults.push({label, type: label==='당첨'?'win':'lose'});
  renderLadderResults();
}
function ladderRemoveResult(i){
  ladderResults.splice(i,1);
  renderLadderResults();
}
function ladderQuickAdd(name){
  if(!ladderNames.includes(name)){
    ladderNames.push(name);
    renderLadderNames();
  }
}
function resetLadder(){ initLadder(); }

function startLadder(){
  const names = ladderNames.map(n=>n.trim()).filter(Boolean);
  const results = ladderResults.map(r=>({...r, label:r.label.trim()||'?'}));
  if(names.length < 2){ alert('참가자를 2명 이상 입력해주세요'); return; }
  if(results.length !== names.length){ alert(`참가자(${names.length}명)와 결과(${results.length}개) 수를 맞춰주세요`); return; }

  // 결과 셔플
  const shuffled = [...results].sort(()=>Math.random()-.5);

  const canvas = document.getElementById('ladder-canvas');
  const wrap   = document.getElementById('ladder-canvas-wrap');
  wrap.style.display = 'block';

  const N      = names.length;
  const colW   = 260 / (N+1);
  const W      = 260;
  const H      = 320;
  const dpr    = window.devicePixelRatio||1;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W+'px';
  canvas.style.height = H+'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // 가로줄 생성 (랜덤)
  const ROWS = 6;
  const rowH = (H - 80) / (ROWS + 1);
  const horizontals = []; // [{row, col}] col = 0~N-2 (col과 col+1 사이)
  for(let r=1; r<=ROWS; r++){
    const used = new Set();
    for(let c=0; c<N-1; c++){
      if(!used.has(c) && !used.has(c+1) && Math.random()>.45){
        horizontals.push({row:r, col:c});
        used.add(c); used.add(c+1);
      }
    }
  }

  // 세로선 x좌표 계산
  const xs = Array.from({length:N},(_,i)=>colW*(i+1));
  const topY = 40, botY = H-40;

  function drawBase(){
    ctx.clearRect(0,0,W,H);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    // 세로선
    xs.forEach((x,i)=>{
      ctx.strokeStyle = GAME_COLORS[i%GAME_COLORS.length]+'cc';
      ctx.beginPath(); ctx.moveTo(x,topY); ctx.lineTo(x,botY); ctx.stroke();
    });
    // 가로선
    ctx.strokeStyle = '#64748b88';
    ctx.lineWidth = 2;
    horizontals.forEach(({row,col})=>{
      const y = topY + row * rowH;
      ctx.beginPath(); ctx.moveTo(xs[col],y); ctx.lineTo(xs[col+1],y); ctx.stroke();
    });
    // 이름 (상단)
    names.forEach((n,i)=>{
      ctx.font = 'bold 11px "나눔스퀘어", "Noto Sans KR", sans-serif';
      ctx.fillStyle = GAME_COLORS[i%GAME_COLORS.length];
      ctx.textAlign = 'center';
      ctx.fillText(n.length>4?n.slice(0,4)+'…':n, xs[i], topY-8);
    });
    // 결과 (하단) — 먼저 가린 상태로
    shuffled.forEach((r,i)=>{
      ctx.font = 'bold 11px "나눔스퀘어", "Noto Sans KR", sans-serif';
      ctx.fillStyle = '#9e9b91';
      ctx.textAlign = 'center';
      ctx.fillText('?', xs[i], botY+16);
    });
  }

  // 경로 추적 함수
  function tracePath(startCol){
    let col = startCol;
    let y   = topY;
    const path = [{x:xs[col], y}];
    for(let r=1; r<=ROWS; r++){
      const nextY = topY + r * rowH;
      // 이 행에서 현재 col에 연결된 가로줄?
      const h = horizontals.find(h=>h.row===r && (h.col===col || h.col===col-1));
      if(h){
        // 직선 아래로
        path.push({x:xs[col], y:nextY});
        // 가로 이동
        const newCol = h.col===col ? col+1 : col-1;
        path.push({x:xs[newCol], y:nextY});
        col = newCol;
      } else {
        path.push({x:xs[col], y:nextY});
      }
      y = nextY;
    }
    path.push({x:xs[col], y:botY});
    return {path, result: col};
  }

  const paths = names.map((_,i)=>tracePath(i));

  // 애니메이션
  drawBase();
  let frame = 0;
  const totalFrames = 60;
  const resultBoard = document.getElementById('ladder-result-board');
  resultBoard.innerHTML = '';

  function animate(){
    drawBase();
    const t = Math.min(frame/totalFrames, 1);
    paths.forEach(({path},pi)=>{
      const color = GAME_COLORS[pi%GAME_COLORS.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      // 전체 경로 길이 계산
      let totalLen = 0;
      for(let k=1;k<path.length;k++) totalLen += Math.hypot(path[k].x-path[k-1].x, path[k].y-path[k-1].y);
      let drawn = totalLen * t;
      ctx.moveTo(path[0].x, path[0].y);
      for(let k=1;k<path.length;k++){
        const seg = Math.hypot(path[k].x-path[k-1].x, path[k].y-path[k-1].y);
        if(drawn <= 0) break;
        if(drawn >= seg){ ctx.lineTo(path[k].x, path[k].y); drawn -= seg; }
        else { const r=drawn/seg; ctx.lineTo(path[k-1].x+(path[k].x-path[k-1].x)*r, path[k-1].y+(path[k].y-path[k-1].y)*r); drawn=0; }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    frame++;
    if(frame <= totalFrames){
      requestAnimationFrame(animate);
    } else {
      // 결과 공개 & 하단 텍스트
      ctx.clearRect(0,0,W,H);
      drawBase();
      paths.forEach(({path, result},pi)=>{
        const color = GAME_COLORS[pi%GAME_COLORS.length];
        ctx.strokeStyle = color+'99';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); path.forEach((p,k)=>k===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.stroke();
        // 하단 결과 텍스트 공개
        const r = shuffled[result];
        ctx.font = 'bold 11px "나눔스퀘어", "Noto Sans KR", sans-serif';
        ctx.fillStyle = r.type==='win' ? '#16a34a' : '#dc2626';
        ctx.textAlign = 'center';
        ctx.fillText(r.label.length>4?r.label.slice(0,4)+'…':r.label, xs[result], botY+16);
      });

      // 결과 보드 렌더
      resultBoard.innerHTML = paths.map(({result},pi)=>{
        const r = shuffled[result];
        const isWin = r.type==='win';
        return `<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;background:${isWin?'var(--green-bg)':'var(--surface2)'};border:1px solid ${isWin?'var(--green-bd)':'var(--border)'};font-size:12px;">
          <span style="font-size:16px;">${isWin?'🎉':'💀'}</span>
          <span style="font-weight:700;color:${GAME_COLORS[pi%GAME_COLORS.length]};flex:1;">${names[pi]}</span>
          <span style="font-weight:700;color:${isWin?'var(--green-txt)':'var(--text3)'};">${r.label}</span>
        </div>`;
      }).join('');

      // 당첨자 폭죽
      const winners = paths.filter(({result})=>shuffled[result].type==='win').map(({_},pi)=>names[pi]);
      if(winners.length) shootConfetti();
    }
  }
  animate();
}

// ══════════════════════════════════════
// 🎡 룰렛
// ══════════════════════════════════════
let rouletteItems = [];
let rouletteSpinning = false;
let rouletteAngle = 0;
let rouletteHistory = [];

function initRoulette(){
  rouletteItems = [
    {label:'당첨',type:'win'},
    {label:'당첨',type:'win'},
    {label:'꽝',type:'lose'},
    {label:'꽝',type:'lose'},
    {label:'꽝',type:'lose'},
  ];
  rouletteHistory = [];
  renderRouletteItems();
  drawRoulette();
  document.getElementById('roulette-result').style.display='none';
  document.getElementById('roulette-history').style.display='none';
}

function renderRouletteItems(){
  const wrap = document.getElementById('roulette-items-wrap');
  wrap.innerHTML = rouletteItems.map((r,i)=>`
    <div style="display:flex;gap:5px;align-items:center;">
      <span style="font-size:13px;">${r.type==='win'?'🎉':r.type==='lose'?'💀':'✏️'}</span>
      <input value="${r.label}" oninput="rouletteItems[${i}].label=this.value;drawRoulette()" maxlength="8"
        style="flex:1;font-size:12px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-family:var(--font);outline:none;"/>
      <button onclick="rouletteRemoveItem(${i})" style="background:none;border:none;font-size:13px;cursor:pointer;color:var(--text3);padding:0 2px;">✕</button>
    </div>`).join('');
  drawRoulette();
}
function rouletteAddItem(label, type){
  rouletteItems.push({label: label||(type==='custom'?'항목':''), type: type||'custom'});
  renderRouletteItems();
}
function rouletteRemoveItem(i){
  rouletteItems.splice(i,1);
  renderRouletteItems();
}
function rouletteQuickAdd(name){
  if(!rouletteItems.find(r=>r.label===name)){
    rouletteItems.push({label:name, type:'custom'});
    renderRouletteItems();
  }
}

const ROULETTE_PALETTE = [
  '#2563eb','#16a34a','#d97706','#7c3aed','#dc2626',
  '#0891b2','#db2777','#65a30d','#ea580c','#6366f1',
  '#0d9488','#ca8a04','#9333ea','#e11d48','#0284c7'
];

function drawRoulette(highlightIdx=-1){
  const canvas = document.getElementById('roulette-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2, R = Math.min(cx,cy)-4;
  ctx.clearRect(0,0,W,H);
  const n = rouletteItems.length;
  if(!n){ ctx.fillStyle='var(--surface2)'; ctx.fillRect(0,0,W,H); return; }
  const slice = (Math.PI*2)/n;

  rouletteItems.forEach((item,i)=>{
    const start = rouletteAngle + i*slice - Math.PI/2;
    const end   = start + slice;
    const color = ROULETTE_PALETTE[i%ROULETTE_PALETTE.length];

    // 부채꼴
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,R,start,end);
    ctx.closePath();
    ctx.fillStyle = highlightIdx===i ? '#fff' : color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 텍스트
    const mid = start + slice/2;
    const tx = cx + (R*.65)*Math.cos(mid);
    const ty = cy + (R*.65)*Math.sin(mid);
    ctx.save();
    ctx.translate(tx,ty);
    ctx.rotate(mid + Math.PI/2);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${n>8?10:12}px "나눔스퀘어", "Noto Sans KR", sans-serif`;
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    const txt = item.label.length>5?item.label.slice(0,5)+'…':item.label;
    ctx.fillText(txt,0,0);
    ctx.restore();
  });

  // 중앙 원
  ctx.beginPath();
  ctx.arc(cx,cy,18,0,Math.PI*2);
  ctx.fillStyle='#fff';
  ctx.fill();
  ctx.strokeStyle='#e2e0d8';
  ctx.lineWidth=2;
  ctx.stroke();
  ctx.fillStyle='#1a1916';
  ctx.font='bold 10px "나눔스퀘어", "Noto Sans KR"';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText('GO',cx,cy);
}

function spinRoulette(){
  if(rouletteSpinning) return;
  const n = rouletteItems.length;
  if(n < 2){ alert('항목을 2개 이상 추가해주세요'); return; }
  rouletteSpinning = true;
  document.getElementById('roulette-spin-btn').disabled = true;
  document.getElementById('roulette-result').style.display='none';

  const extraSpins = 6 + Math.random()*4;
  const targetAngle = rouletteAngle + extraSpins * Math.PI * 2 + Math.random() * Math.PI * 2;
  const duration = 3500 + Math.random()*1000;
  const startAngle = rouletteAngle;
  const startTime = performance.now();

  function easeOut(t){ return 1 - Math.pow(1-t, 3); }

  function frame(now){
    const elapsed = now - startTime;
    const t = Math.min(elapsed/duration, 1);
    rouletteAngle = startAngle + (targetAngle - startAngle) * easeOut(t);
    drawRoulette();
    if(t < 1){ requestAnimationFrame(frame); return; }

    rouletteAngle = targetAngle % (Math.PI*2);
    // 어떤 항목이 상단(화살표 위치)에?
    const slice = (Math.PI*2)/n;
    // 화살표는 상단(−π/2), 룰렛 기준
    const normalizedAngle = ((Math.PI*2) - (rouletteAngle % (Math.PI*2))) % (Math.PI*2);
    const idx = Math.floor(normalizedAngle / slice) % n;
    const winner = rouletteItems[idx];

    drawRoulette(idx);

    // 결과 표시
    const resultEl = document.getElementById('roulette-result');
    const isWin = winner.type==='win';
    const isLose = winner.type==='lose';
    resultEl.style.display='block';
    resultEl.style.background = isWin?'var(--green-bg)':isLose?'var(--red-bg)':'var(--amber-bg)';
    resultEl.style.border = `2px solid ${isWin?'var(--green-bd)':isLose?'var(--red-bd)':'var(--amber-bd)'}`;
    resultEl.style.color = isWin?'var(--green-txt)':isLose?'var(--red-txt)':'var(--amber-txt)';
    resultEl.textContent = (isWin?'🎉 ':isLose?'💀 ':'✨ ') + winner.label + '!';

    if(isWin) shootConfetti();

    // 히스토리
    rouletteHistory.unshift({label:winner.label, type:winner.type, time: new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})});
    renderRouletteHistory();

    rouletteSpinning = false;
    document.getElementById('roulette-spin-btn').disabled = false;
  }
  requestAnimationFrame(frame);
}

function renderRouletteHistory(){
  const wrap = document.getElementById('roulette-history');
  const list = document.getElementById('roulette-history-list');
  if(!rouletteHistory.length){ wrap.style.display='none'; return; }
  wrap.style.display='block';
  list.innerHTML = rouletteHistory.map(h=>`
    <div style="display:flex;align-items:center;gap:6px;font-size:11px;">
      <span>${h.type==='win'?'🎉':h.type==='lose'?'💀':'✨'}</span>
      <span style="font-weight:600;color:${h.type==='win'?'var(--green-txt)':h.type==='lose'?'var(--text3)':'var(--amber-txt)'};">${h.label}</span>
      <span style="color:var(--text3);font-size:10px;margin-left:auto;">${h.time}</span>
    </div>`).join('');
}
function clearRouletteHistory(){ rouletteHistory=[]; renderRouletteHistory(); }

// ══════════════════════════════════════
// 🎊 폭죽 애니메이션
// ══════════════════════════════════════
function shootConfetti(){
  const overlay = document.getElementById('ladder-confetti-overlay');
  overlay.style.display='block';
  overlay.innerHTML='';
  const colors=['#2563eb','#16a34a','#d97706','#7c3aed','#dc2626','#0891b2','#fbbf24','#f472b6'];
  for(let i=0;i<60;i++){
    const el = document.createElement('div');
    const size = 6+Math.random()*8;
    el.style.cssText=`position:absolute;width:${size}px;height:${size}px;border-radius:${Math.random()>.5?'50%':'2px'};background:${colors[Math.floor(Math.random()*colors.length)]};left:${10+Math.random()*80}%;top:-10px;opacity:1;`;
    overlay.appendChild(el);
    const tx = (Math.random()-.5)*300;
    const ty = 300+Math.random()*300;
    const rot = Math.random()*720;
    el.animate([
      {transform:`translate(0,0) rotate(0deg)`,opacity:1},
      {transform:`translate(${tx}px,${ty}px) rotate(${rot}deg)`,opacity:0}
    ],{duration:1200+Math.random()*800,easing:'cubic-bezier(.25,.46,.45,.94)',fill:'forwards'});
  }
  setTimeout(()=>{ overlay.style.display='none'; overlay.innerHTML=''; }, 2200);
}

// ══════════════════════════════════════
// ✊ 가위바위보
// ══════════════════════════════════════
const RPS_CHOICES = {'✌️':'가위','✊':'바위','🤚':'보'};
const RPS_WIN = {'✌️':'🤚','✊':'✌️','🤚':'✊'}; // key가 이기는 상대
let _rpsRoomId = null;
let _rpsRole   = null; // 'challenger' | 'opponent'
let _rpsOpponent = null;
let _rpsListener = null;
let _rpsMyPick = null;

function _getRpsDb(){ return window._firebaseDatabase; }

function initRpsPanel(){
  const me = localStorage.getItem('currentUser')||'';
  const members = _getGameMembers().filter(n=>n!==me);
  const list = document.getElementById('rps-member-list');
  if(!list) return;
  if(!members.length){ list.innerHTML='<div style="font-size:11px;color:var(--text3);text-align:center;padding:20px 0;">대결 가능한 팀원이 없습니다</div>'; return; }
  list.innerHTML = members.map(name=>{
    const initials = name.slice(0,2);
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border:1px solid var(--border);border-radius:8px;background:var(--surface2);">
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:28px;height:28px;border-radius:50%;background:var(--blue-bg);color:var(--blue-txt);font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;">${initials}</div>
        <span style="font-size:12px;font-weight:600;color:var(--text);">${name}</span>
      </div>
      <button onclick="rpsSendChallenge('${name}')" style="font-size:11px;padding:4px 12px;border-radius:6px;background:var(--blue);color:#fff;border:none;cursor:pointer;font-family:var(--font);font-weight:700;">✊ 대결 신청</button>
    </div>`;
  }).join('');
  // 기존 수신 리스너 등록
  _rpsListenIncoming();
}

function _rpsListenIncoming(){
  const me = localStorage.getItem('currentUser')||'';
  if(!me || !window.firebase_db) return;
  const { ref: fbRef, onValue, off } = window.firebase_fns||{};
  if(!fbRef||!onValue) return;
  const inRef = fbRef(window.firebase_db, `rps/incoming/${me}`);
  onValue(inRef, snap=>{
    const data = snap.val();
    if(!data || data.status!=='pending') return;
    const msg = document.getElementById('rps-incoming-msg');
    const bg  = document.getElementById('rps-incoming-bg');
    if(msg) msg.textContent = `${data.challenger}님이 가위바위보 대결을 신청했습니다!`;
    if(bg)  bg.style.cssText = 'display:flex;position:fixed;inset:0;z-index:16000;background:rgba(0,0,0,0.55);align-items:center;justify-content:center;border-radius:16px;';
    _rpsRoomId   = data.roomId;
    _rpsRole     = 'opponent';
    _rpsOpponent = data.challenger;
  });
}

function rpsSendChallenge(target){
  const me = localStorage.getItem('currentUser')||'';
  if(!me || !window.firebase_db) return;
  const { ref: fbRef, set } = window.firebase_fns||{};
  if(!fbRef||!set) return;
  const roomId = 'rps_'+Date.now();
  _rpsRoomId   = roomId;
  _rpsRole     = 'challenger';
  _rpsOpponent = target;
  // 상대에게 신청 알림 저장
  set(fbRef(window.firebase_db, `rps/incoming/${target}`), {
    status:'pending', challenger:me, roomId, ts:Date.now()
  });
  // 대기 화면
  _rpsShowView('waiting');
  const wm = document.getElementById('rps-waiting-msg');
  if(wm) wm.textContent = `${target}님의 승락을 기다리는 중...`;
  // 방 상태 리스닝
  _rpsListenRoom(roomId);
}

function rpsAccept(){
  const bg = document.getElementById('rps-incoming-bg');
  if(bg) bg.style.display='none';
  const me = localStorage.getItem('currentUser')||'';
  if(!me || !window.firebase_db || !_rpsRoomId) return;
  const { ref: fbRef, set, remove } = window.firebase_fns||{};
  if(!fbRef||!set) return;
  // 수신 노드 즉시 삭제 (팝업 재출현 방지)
  if(remove) remove(fbRef(window.firebase_db, `rps/incoming/${me}`));
  // 방 상태 업데이트
  set(fbRef(window.firebase_db, `rps/rooms/${_rpsRoomId}`), {
    status:'ready', challenger:_rpsOpponent, opponent:me, ts:Date.now()
  });
  // 게임 모달 열기 — rps 탭으로 전환 후 배틀 시작
  const gameBg = document.getElementById('game-modal-bg');
  if(gameBg) gameBg.style.cssText = 'display:flex;position:fixed;inset:0;z-index:15000;background:rgba(0,0,0,0.55);align-items:center;justify-content:center;border-radius:16px;';
  initLadder(); initRoulette(); renderGameQuickMembers();
  setTimeout(()=>{ switchGameTab('rps'); setTimeout(()=>_rpsStartBattle(), 150); }, 100);
}

function rpsDecline(){
  const bg = document.getElementById('rps-incoming-bg');
  if(bg) bg.style.display='none';
  const me = localStorage.getItem('currentUser')||'';
  if(!me || !window.firebase_db || !_rpsRoomId) return;
  const { ref: fbRef, set, remove } = window.firebase_fns||{};
  if(!fbRef||!set) return;
  // 수신 노드 즉시 삭제 (팝업 재출현 방지)
  if(remove) remove(fbRef(window.firebase_db, `rps/incoming/${me}`));
  set(fbRef(window.firebase_db, `rps/rooms/${_rpsRoomId}`), { status:'declined', ts:Date.now() });
  _rpsRoomId = null; _rpsRole = null; _rpsOpponent = null;
}

function _rpsListenRoom(roomId){
  if(!window.firebase_db) return;
  const { ref: fbRef, onValue } = window.firebase_fns||{};
  if(!fbRef||!onValue) return;
  if(_rpsListener) _rpsListener();
  _rpsListener = onValue(fbRef(window.firebase_db, `rps/rooms/${roomId}`), snap=>{
    const data = snap.val();
    if(!data) return;
    if(data.status==='declined'){
      _rpsShowView('challenge');
      alert('상대방이 대결을 거절했습니다.');
      _rpsCleanup();
      return;
    }
    if(data.status==='ready' && _rpsRole==='challenger'){
      _rpsStartBattle();
      return;
    }
    if(data.status==='playing'){
      _rpsUpdateBattle(data);
    }
  });
}

function _rpsStartBattle(){
  const me = localStorage.getItem('currentUser')||'';
  _rpsMyPick = null;
  _rpsShowView('battle');
  const header = document.getElementById('rps-battle-header');
  if(header) header.textContent = `${me} VS ${_rpsOpponent}`;
  const myName  = document.getElementById('rps-my-name');
  const oppName = document.getElementById('rps-opp-name');
  if(myName)  myName.textContent  = me;
  if(oppName) oppName.textContent = _rpsOpponent;
  const myChoice  = document.getElementById('rps-my-choice');
  const oppChoice = document.getElementById('rps-opp-choice');
  if(myChoice)  myChoice.textContent = '?';
  if(oppChoice) oppChoice.textContent = '?';
  const pickBtns  = document.getElementById('rps-pick-btns');
  const statusMsg = document.getElementById('rps-status-msg');
  const resultMsg = document.getElementById('rps-result-msg');
  const rematch   = document.getElementById('rps-rematch-btn');
  if(pickBtns)  pickBtns.style.display = 'flex';
  if(statusMsg) statusMsg.textContent  = '선택하세요!';
  if(resultMsg) resultMsg.style.display = 'none';
  if(rematch)   rematch.style.display   = 'none';
  if(!_rpsListener) _rpsListenRoom(_rpsRoomId);
}

function rpsPickLocal(choice){
  if(_rpsMyPick) return; // 이미 선택함
  const me = localStorage.getItem('currentUser')||'';
  _rpsMyPick = choice;
  const myChoice = document.getElementById('rps-my-choice');
  if(myChoice) myChoice.textContent = choice;
  const statusMsg = document.getElementById('rps-status-msg');
  if(statusMsg) statusMsg.textContent = '상대방 선택 대기 중...';
  const pickBtns = document.getElementById('rps-pick-btns');
  if(pickBtns) pickBtns.style.display='none';
  // Firebase에 내 선택 저장
  if(!window.firebase_db || !_rpsRoomId) return;
  const { ref: fbRef, update: fbUpdate } = window.firebase_fns||{};
  if(!fbRef||!fbUpdate) return;
  const field = _rpsRole==='challenger' ? 'cChoice' : 'oChoice';
  fbUpdate(fbRef(window.firebase_db, `rps/rooms/${_rpsRoomId}`), {
    [field]: choice, status:'playing'
  });
}

function _rpsUpdateBattle(data){
  const me = localStorage.getItem('currentUser')||'';
  const myField  = _rpsRole==='challenger' ? 'cChoice' : 'oChoice';
  const oppField = _rpsRole==='challenger' ? 'oChoice' : 'cChoice';
  const myChoice  = data[myField];
  const oppChoice = data[oppField];
  if(!myChoice || !oppChoice) return; // 둘 다 선택해야
  // 결과 표시
  const myEl  = document.getElementById('rps-my-choice');
  const oppEl = document.getElementById('rps-opp-choice');
  if(myEl)  myEl.textContent  = myChoice;
  if(oppEl) oppEl.textContent = oppChoice;
  let resultText, resultBg;
  if(myChoice===oppChoice){ resultText='🤝 비겼습니다!'; resultBg='var(--surface2)'; }
  else if(RPS_WIN[myChoice]===oppChoice){ resultText='🎉 이겼습니다!'; resultBg='var(--green-bg)'; }
  else { resultText='😭 졌습니다...'; resultBg='var(--red-bg)'; }
  const resultMsg = document.getElementById('rps-result-msg');
  const rematch   = document.getElementById('rps-rematch-btn');
  const statusMsg = document.getElementById('rps-status-msg');
  if(resultMsg){ resultMsg.style.cssText=`display:block;font-size:18px;font-weight:700;padding:10px;border-radius:10px;margin-bottom:10px;background:${resultBg};`; resultMsg.textContent=resultText; }
  if(statusMsg) statusMsg.textContent='';
  if(rematch) rematch.style.display='block';
}

function rpsRematch(){
  if(!window.firebase_db || !_rpsRoomId) return;
  const { ref: fbRef, set } = window.firebase_fns||{};
  if(!fbRef||!set) return;
  set(fbRef(window.firebase_db, `rps/rooms/${_rpsRoomId}`), {
    status:'ready',
    challenger: _rpsRole==='challenger' ? (localStorage.getItem('currentUser')||'') : _rpsOpponent,
    opponent:   _rpsRole==='opponent'   ? (localStorage.getItem('currentUser')||'') : _rpsOpponent,
    ts: Date.now()
  });
  _rpsStartBattle();
}

function rpsCancelBattle(){
  _rpsCleanup();
  _rpsShowView('challenge');
  initRpsPanel();
}

function rpsCancelChallenge(){
  if(window.firebase_db && _rpsRoomId){
    const { ref: fbRef, remove: fbRemove } = window.firebase_fns||{};
    if(fbRef&&fbRemove) fbRemove(fbRef(window.firebase_db, `rps/rooms/${_rpsRoomId}`));
  }
  _rpsCleanup();
  _rpsShowView('challenge');
  initRpsPanel();
}

function _rpsCleanup(){
  if(_rpsListener){ _rpsListener(); _rpsListener=null; }
  // Firebase 잔여 데이터 정리
  if(window.firebase_db && window.firebase_fns){
    const { ref: fbRef, remove } = window.firebase_fns;
    const me = localStorage.getItem('currentUser')||'';
    if(me && remove){
      // 내 incoming 노드 삭제
      remove(fbRef(window.firebase_db, `rps/incoming/${me}`)).catch(()=>{});
      // 상대방 incoming 노드 삭제 (내가 신청자였을 경우)
      if(_rpsOpponent) remove(fbRef(window.firebase_db, `rps/incoming/${_rpsOpponent}`)).catch(()=>{});
      // 방 노드 삭제
      if(_rpsRoomId) remove(fbRef(window.firebase_db, `rps/rooms/${_rpsRoomId}`)).catch(()=>{});
    }
  }
  _rpsRoomId=null; _rpsRole=null; _rpsOpponent=null; _rpsMyPick=null;
}

function _rpsShowView(v){
  const cv = document.getElementById('rps-challenge-view');
  const bv = document.getElementById('rps-battle-view');
  const wv = document.getElementById('rps-waiting-view');
  if(cv) cv.style.display = v==='challenge' ? 'block' : 'none';
  if(bv) bv.style.display = v==='battle'   ? 'block' : 'none';
  if(wv) wv.style.display = v==='waiting'  ? 'block' : 'none';
}
