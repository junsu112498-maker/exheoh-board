const S = window.S;

function renderHistoryList(projId){
  const el = document.getElementById('hist-list-'+projId);
  if(!el) return;
  const items = S.historyData[projId] ? Object.entries(S.historyData[projId]).map(([id,h])=>({...h,id})) : [];
  items.sort((a,b)=>(b.ts||0)-(a.ts||0));
  const curUser = localStorage.getItem('currentUser')||'';
  const listHtml = items.length ? items.map(h=>{
    const [bg,fg] = getColor(h.author||'?');
    const isOwner = h.author === curUser || currentIsAdmin();
    return `<div class="history-item" id="hitem-${h.id}">
      <div class="av" style="background:${bg};color:${fg};width:20px;height:20px;font-size:9px;flex-shrink:0">${(h.author||'?').slice(0,2)}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:2px">
          <span style="font-size:10px;font-weight:700;color:var(--text)">${h.author||'?'}</span>
          <span class="history-time">${h.date||''} ${h.time||''}</span>
        </div>
        <div id="htext-${h.id}" style="font-size:11px;color:var(--text2);line-height:1.45;word-break:break-word">${h.text.replace(/</g,'&lt;')}</div>
        <div id="hedit-${h.id}" style="display:none;margin-top:4px">
          <input type="text" id="hinp-edit-${h.id}" value="${h.text.replace(/"/g,'&quot;')}"
            style="width:100%;font-size:11px;padding:4px 7px;border-radius:5px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-family:var(--font);outline:none;"
            onkeydown="if(event.key==='Enter') saveHistory('${projId}','${h.id}'); if(event.key==='Escape') cancelEditHistory('${h.id}')"/>
          <div style="display:flex;gap:4px;margin-top:3px">
            <button onclick="saveHistory('${projId}','${h.id}')" style="font-size:10px;padding:3px 8px;border-radius:5px;background:var(--blue);color:#fff;border:none;cursor:pointer;font-family:var(--font)">저장</button>
            <button onclick="cancelEditHistory('${h.id}')" style="font-size:10px;padding:3px 8px;border-radius:5px;background:var(--surface2);color:var(--text2);border:1px solid var(--border2);cursor:pointer;font-family:var(--font)">취소</button>
          </div>
        </div>
      </div>
      ${isOwner ? `<div style="display:flex;gap:1px;flex-shrink:0">
        <button class="act-btn" onclick="editHistory('${h.id}')" title="수정">✏</button>
        <button class="act-btn" onclick="deleteHistory('${projId}','${h.id}')" title="삭제">✕</button>
      </div>` : ''}
    </div>`;
  }).join('') : '<div style="font-size:11px;color:var(--text3);padding:4px 0">등록된 이슈/히스토리가 없습니다</div>';
  el.innerHTML = listHtml + `
    <div class="history-input-row">
      <input type="text" id="hinp-${projId}" placeholder="이슈 또는 히스토리 입력..."
        onkeydown="if(event.key==='Enter') addHistory('${projId}')"/>
      <button onclick="addHistory('${projId}')">등록</button>
    </div>`;
}

// ── 진행 단계 타임라인 렌더 ──
const PROG_STEPS = [
  { key:'1차송부', label:'1차 송부', icon:'①' },
  { key:'2차송부', label:'2차 송부', icon:'②' },
  { key:'납품',    label:'납품',     icon:'③' },
];
const PROG_STEP_ORDER = ['1차송부','2차송부','납품'];

// [state: let S._progLogCache = {};]

// Firebase progressLog 실시간 수신
// [app.js: const progLogRef = ref(db, 'progressLog');]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]

function renderProjTimeline(projId){
  const wrap = document.getElementById('prog-timeline-wrap-'+projId);
  if(!wrap) return;

  const logs = (S._progLogCache[projId]) || {};

  // 이 프로젝트의 일정표 항목들
  const schEntries = Object.values(ganttSchedules).filter(s => s.projId === projId);
  if(!schEntries.length){ wrap.innerHTML=''; return; }

  // 팀별 진행상태 구분
  const designGroups = getGroupList().filter(g=>g.name.includes('디자인'));
  const engGroups = getGroupList().filter(g=>g.name.includes('설계'));

  function getTeamAchieved(S.teamFilter){
    const teamEntries = schEntries.filter(s=>{
      if(!S.teamFilter) return true;
      if(!s.teamName) return false;
      return s.teamName.includes(S.teamFilter);
    });
    return new Set(teamEntries.map(s => s.progress).filter(Boolean));
  }

  function buildTimelineHtml(achievedSet, prefix, projId){
    const hasRevision = achievedSet.has('리비전');
    const maxAchievedIdx = PROG_STEP_ORDER.reduce((max, key, idx) => {
      return achievedSet.has(key) ? Math.max(max, idx) : max;
    }, -1);
    const displaySteps = [...PROG_STEPS];
    if(hasRevision) displaySteps.push({ key:'리비전', label:'리비전', icon:'↺' });

    return displaySteps.map((step, i) => {
      const isRevision = step.key === '리비전';
      const log = logs[`${prefix}_${step.key}`] || logs[step.key];
      const dateDisplay = log?.date || '';
      let cls = '';
      if(isRevision){
        cls = achievedSet.has('리비전') ? 'revision' : '';
      } else {
        const stepIdx = PROG_STEP_ORDER.indexOf(step.key);
        cls = stepIdx <= maxAchievedIdx ? 'done' : '';
      }
      const dotContent = cls === 'done' ? '✓' : cls === 'revision' ? '↺' : step.icon;
      const dateHtml = dateDisplay ? `<div class="prog-step-date">${dateDisplay}</div>` : '';
      return `<div class="prog-timeline-step ${cls}" onclick="progStepClick(event,'${projId}','${prefix}_${step.key}')" title="날짜 클릭하여 설정">
        <div class="prog-step-dot">${dotContent}</div>
        <div class="prog-step-label">${step.label}</div>
        ${dateHtml}
      </div>`;
    }).join('');
  }

  // 디자인팀 달성 상태
  const designAchieved = getTeamAchieved('디자인');
  // 설계팀 달성 상태
  const engAchieved = getTeamAchieved('설계');

  // 팀별 항목이 없으면 전체에서 가져옴
  const allAchieved = new Set(schEntries.map(s => s.progress).filter(Boolean));
  const useDesign = designAchieved.size > 0 || schEntries.some(s=>s.teamName&&s.teamName.includes('디자인'));
  const useEng = engAchieved.size > 0 || schEntries.some(s=>s.teamName&&s.teamName.includes('설계'));

  let timelineContent = '';
  if(useDesign || useEng){
    if(useDesign){
      timelineContent += `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
          <span style="font-size:10px;font-weight:700;color:var(--blue-txt);min-width:46px;">디자인팀</span>
          <div class="prog-timeline" style="flex:1;">${buildTimelineHtml(designAchieved,'design',projId)}</div>
        </div>`;
    }
    if(useEng){
      timelineContent += `
        <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
          <span style="font-size:10px;font-weight:700;color:var(--purple-txt);min-width:46px;">설계팀</span>
          <div class="prog-timeline" style="flex:1;">${buildTimelineHtml(engAchieved,'eng',projId)}</div>
        </div>`;
    }
  } else {
    // 소속팀 없는 경우 기본 표시 (기존처럼)
    const hasRevision = allAchieved.has('리비전');
    const maxAchievedIdx = PROG_STEP_ORDER.reduce((max, key, idx) => {
      return allAchieved.has(key) ? Math.max(max, idx) : max;
    }, -1);
    const displaySteps = [...PROG_STEPS];
    if(hasRevision) displaySteps.push({ key:'리비전', label:'리비전', icon:'↺' });
    const stepsHtml = displaySteps.map((step, i) => {
      const isRevision = step.key === '리비전';
      const log = logs[step.key];
      const dateDisplay = log?.date || '';
      let cls = '';
      if(isRevision){ cls = allAchieved.has('리비전') ? 'revision' : ''; }
      else { const stepIdx = PROG_STEP_ORDER.indexOf(step.key); cls = stepIdx <= maxAchievedIdx ? 'done' : ''; }
      const dotContent = cls === 'done' ? '✓' : cls === 'revision' ? '↺' : step.icon;
      const dateHtml = dateDisplay ? `<div class="prog-step-date">${dateDisplay}</div>` : '';
      return `<div class="prog-timeline-step ${cls}" onclick="progStepClick(event,'${projId}','${step.key}')" title="날짜 클릭하여 설정">
        <div class="prog-step-dot">${dotContent}</div>
        <div class="prog-step-label">${step.label}</div>
        ${dateHtml}
      </div>`;
    }).join('');
    timelineContent = `<div class="prog-timeline">${stepsHtml}</div>`;
  }

  wrap.innerHTML = `
    <div class="prog-timeline-title">📍 진행 단계 <span style="font-size:9px;color:var(--text3);font-weight:400">(원 클릭 → 날짜 기록)</span></div>
    ${timelineContent}
  `;
}

// ── 진행상태 변경 시 Firebase 로그 기록 ──
function logProgressChange(projId, progressVal, schId){
  if(!projId || !progressVal) return;
  const now = new Date();
  const dateStr = `${now.getMonth()+1}/${now.getDate()}`;
  const user = localStorage.getItem('currentUser')||'';
  // 일정표 항목의 teamName으로 prefix 결정
  const sch = schId ? Object.values(ganttSchedules).find(s=>s.projId===projId&&ganttSchedules[schId]) : null;
  const schDirect = schId ? ganttSchedules[schId] : null;
  const teamName = schDirect?.teamName || '';
  let storeKey = progressVal;
  if(teamName.includes('디자인')) storeKey = 'design_'+progressVal;
  else if(teamName.includes('설계')) storeKey = 'eng_'+progressVal;
  window._fb.update(`progressLog/${projId}/${storeKey}`, { date: dateStr, user, ts: Date.now(), schId: schId||'' });
  setTimeout(()=>renderProjTimeline(projId), 300);
}
window.logProgressChange = logProgressChange;

// ── 타임라인 달력 팝업 ──
{
  let _pcProjId = null, _pcStepKey = null, _pcYear = null, _pcMonth = null, _pcOutHandler = null;

  window.progStepClick = function(e, projId, stepKey){
    e.stopPropagation();
    e.preventDefault();
    // 원(dot)만 클릭해야 팝업 — prog-step-dot 또는 그 자식만 허용
    const dot = e.currentTarget.querySelector('.prog-step-dot');
    if(dot && !dot.contains(e.target) && e.target !== dot) return;
    const now = new Date();
    _pcProjId  = projId;
    _pcStepKey = stepKey;
    const log = (S._progLogCache[projId]||{})[stepKey];
    if(log?.date){
      const parts = log.date.split('/');
      _pcYear  = now.getFullYear();
      _pcMonth = parts.length===2 ? parseInt(parts[0])-1 : now.getMonth();
    } else {
      _pcYear  = now.getFullYear();
      _pcMonth = now.getMonth();
    }
    renderProgCal(projId, stepKey, dot ? dot.getBoundingClientRect() : e.currentTarget.getBoundingClientRect());
  };

  function renderProgCal(projId, stepKey, refRect){
    let popup = document.getElementById('prog-cal-popup');
    if(!popup){
      popup = document.createElement('div');
      popup.id = 'prog-cal-popup';
      popup.className = 'prog-cal-popup';
      document.body.appendChild(popup);
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    const log = (S._progLogCache[projId]||{})[stepKey];
    const selDate = log?.date || null; // "M/D" 형식

    const firstDow = new Date(_pcYear, _pcMonth, 1).getDay();
    const daysInMonth = new Date(_pcYear, _pcMonth+1, 0).getDate();
    const monthLabel = `${_pcYear}년 ${_pcMonth+1}월`;

    const dows = ['일','월','화','수','목','금','토'];
    let gridHtml = dows.map((d,i)=>`<div class="prog-cal-dow" style="${i===0?'color:#ef4444':i===6?'color:#3b82f6':''}">${d}</div>`).join('');

    for(let i=0;i<firstDow;i++) gridHtml += `<div class="prog-cal-day other"></div>`;
    for(let d=1;d<=daysInMonth;d++){
      const ds = `${_pcMonth+1}/${d}`;
      const isToday = _pcYear===now.getFullYear()&&_pcMonth===now.getMonth()&&d===now.getDate();
      const isSel = selDate === ds;
      const dow = (firstDow + d - 1) % 7;
      const colorCls = dow===0?'sun':dow===6?'sat':'';
      const cls = `prog-cal-day ${colorCls} ${isToday?'today':''} ${isSel?'selected':''}`;
      gridHtml += `<div class="${cls}" onclick="progCalSelect(${d})">${d}</div>`;
    }

    popup.innerHTML = `
      <div class="prog-cal-header">
        <button class="prog-cal-nav" onclick="progCalNav(-1)">←</button>
        <div class="prog-cal-title">${monthLabel}</div>
        <button class="prog-cal-nav" onclick="progCalNav(1)">→</button>
      </div>
      <div class="prog-cal-grid">${gridHtml}</div>
      <button class="prog-cal-clear" onclick="progCalClear()">날짜 삭제</button>
    `;

    // 위치 계산
    popup.style.display = 'block';
    const pw = popup.offsetWidth || 210;
    const ph = popup.offsetHeight || 220;
    let left = refRect.left;
    let top  = refRect.bottom + 6;
    if(left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
    if(top  + ph > window.innerHeight - 8) top = refRect.top - ph - 6;
    popup.style.left = left + 'px';
    popup.style.top  = top  + 'px';

    // 바깥 클릭 닫기
    if(_pcOutHandler) document.removeEventListener('click', _pcOutHandler);
    _pcOutHandler = function(ev){
      if(!popup.contains(ev.target)){
        popup.style.display = 'none';
        document.removeEventListener('click', _pcOutHandler);
        _pcOutHandler = null;
      }
    };
    setTimeout(()=> document.addEventListener('click', _pcOutHandler), 0);
  }

  window.progCalNav = function(dir){
    _pcMonth += dir;
    if(_pcMonth > 11){ _pcMonth=0; _pcYear++; }
    if(_pcMonth < 0 ){ _pcMonth=11; _pcYear--; }
    const popup = document.getElementById('prog-cal-popup');
    if(!popup) return;
    // 현재 팝업 위치 그대로 유지하며 내용만 재렌더
    const savedLeft = popup.style.left;
    const savedTop  = popup.style.top;
    renderProgCal(_pcProjId, _pcStepKey, { left: parseFloat(savedLeft)||0, bottom: parseFloat(savedTop)||0, top: parseFloat(savedTop)||0 });
    // 위치 복원 (renderProgCal이 덮어쓰므로)
    popup.style.left = savedLeft;
    popup.style.top  = savedTop;
  };

  window.progCalSelect = function(day){
    if(!_pcProjId||!_pcStepKey) return;
    const dateStr = `${_pcMonth+1}/${day}`;
    const user = localStorage.getItem('currentUser')||'';
    // 캐시 즉시 업데이트
    if(!S._progLogCache[_pcProjId]) S._progLogCache[_pcProjId] = {};
    S._progLogCache[_pcProjId][_pcStepKey] = { date: dateStr, user, ts: Date.now() };
    window._fb.update(`progressLog/${_pcProjId}/${_pcStepKey}`, {
      date: dateStr, user, ts: Date.now()
    });
    const popup = document.getElementById('prog-cal-popup');
    if(popup) popup.style.display='none';
    renderProjTimeline(_pcProjId);
  };

  window.progCalClear = function(){
    if(!_pcProjId||!_pcStepKey) return;
    // 캐시 즉시 삭제
    if(S._progLogCache[_pcProjId]) delete S._progLogCache[_pcProjId][_pcStepKey];
    window._fb.remove(`progressLog/${_pcProjId}/${_pcStepKey}`);
    const popup = document.getElementById('prog-cal-popup');
    if(popup) popup.style.display='none';
    renderProjTimeline(_pcProjId);
  };
}

window._addHistory=window.addHistory=function(projId){
  const inp = document.getElementById('hinp-'+projId);
  if(!inp||!inp.value.trim()) return;
  const now = new Date();
  const author = localStorage.getItem('currentUser')||'';
  const text = inp.value.trim();
  inp.value='';
  window._fb.push('history/'+projId,{
    text, author,
    date: now.toISOString().slice(0,10),
    time: now.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}),
    ts: now.getTime()
  });
  // 뱃지 표시: 오늘 날짜와 projId 저장
  try {
    const badgeKey = 'histNewBadge_' + projId;
    localStorage.setItem(badgeKey, now.toISOString().slice(0,10));
    updateHistBadge(projId);
  } catch(e){}
  setTimeout(()=>renderHistoryList(projId), 400);
}

window._deleteHistory=window.deleteHistory=function(projId, hid){
  if(!confirm('삭제하시겠습니까?')) return;
  window._fb.remove('history/'+projId+'/'+hid);
  setTimeout(()=>renderHistoryList(projId), 300);
}

window._toggleProjSort=window.toggleProjSort=function(){
  S.projSortOrder = S.projSortOrder==='asc' ? 'desc' : 'asc';
  const btn = document.getElementById('proj-sort-btn');
  if(btn) btn.textContent = S.projSortOrder==='asc' ? '코드 ↑' : '코드 ↓';
  renderProjList();
}

// ── PIN 시스템 ──
// [state: let S._pinBuffer = '';]
// [state: let S._pinTargetUser = '';]
// [state: let S._pinMode = 'login'; // 'login' | 'set' | 'change_old' ]
// [state: let S._pinOldVerified = '';]

// PIN 데이터 - Firebase 저장 (로컬 캐시 병행)
function updateHistBadge(projId){
  const today = todayStr();
  const badgeKey = 'histNewBadge_' + projId;
  const savedDate = localStorage.getItem(badgeKey);
  // 자정 지나면 삭제
  if(savedDate && savedDate < today){ localStorage.removeItem(badgeKey); }
  const badge = document.getElementById('hist-badge-'+projId);
  if(!badge) return;
  if(savedDate && savedDate >= today){ badge.style.display=''; }
  else { badge.style.display='none'; }
}
function updateAllHistBadges(){
  Object.keys(S.projects).forEach(id=>updateHistBadge(id));
}

// ── 일정표 셀 메모 ──
// [state: let S._ganttCellEditSchId = '';]
// [state: let S._ganttCellEditDate = '';]
window.ganttCellClick = function(schId, dateStr){
  if(!dateStr) return;
  S._ganttCellEditSchId = schId;
  S._ganttCellEditDate = dateStr;
  const s = ganttSchedules[schId]||{};
  const S.memos = s.cellMemos||{};
  const existing = S.memos[dateStr]||'';
  const p = S.projects[s.projId]||{};
  document.getElementById('gantt-cell-modal-title').textContent = (p.name||'') + ' · ' + dateStr;
  document.getElementById('gantt-cell-memo-input').value = existing;
  const delBtn = document.getElementById('gantt-cell-del-btn');
  delBtn.style.display = existing ? '' : 'none';
  document.getElementById('gantt-cell-modal-bg').style.display='flex';
  setTimeout(()=>document.getElementById('gantt-cell-memo-input').focus(),100);
};
window.closeGanttCellModal = function(){
  document.getElementById('gantt-cell-modal-bg').style.display='none';
};
window.ganttCellSave = function(){
  const text = document.getElementById('gantt-cell-memo-input').value.trim();
  if(!text){ ganttCellDelete(); return; }
  window._fb.update('ganttSchedules/'+S._ganttCellEditSchId+'/cellMemos',{ [S._ganttCellEditDate]: text });
  closeGanttCellModal();
};
window.ganttCellDelete = function(){
  window._fb.remove('ganttSchedules/'+S._ganttCellEditSchId+'/cellMemos/'+S._ganttCellEditDate);
  closeGanttCellModal();
};

// ── 달력 년/월 선택 팝업 ──
// [state: let S._cmpYear = new Date().getFullYear();]
window.openCalMonthPicker = function(){
  S._cmpYear = S.calYear;
  renderCmpMonths();
  document.getElementById('cal-month-picker-bg').style.display='flex';
};
window.closeCalMonthPicker = function(){
  document.getElementById('cal-month-picker-bg').style.display='none';
};
window.cmpChangeYear = function(d){
  S._cmpYear+=d;
  renderCmpMonths();
};