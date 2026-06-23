const S = window.S;

function renderTeamFilterBars(){
  const groups = getGroupList();

  // 업무탭 팀 필터
  const boardBar = document.getElementById('board-team-filter-bar') || document.getElementById('board-team-filter');
  if(boardBar){
    boardBar.innerHTML = ['전체',...groups.map(g=>g.name)].map(name=>`
      <button class="team-fbtn ${S.teamFilter===name?'on':''}" onclick="setTeamFilter('${name}')">${name}</button>
    `).join('');
  }

  // 달력 팀 필터 (다중선택 + 팀원 펼침)
  const calBar = document.getElementById('cal-team-filter-bar') || document.getElementById('cal-team-filter');
  if(calBar){
    calBar.innerHTML = ['전체',...groups.map(g=>g.name)].map(name=>{
      const isTeamOn = name==='전체' ? S.calTeamFilters.has('전체') : S.calTeamFilters.has(name)&&!S.calTeamFilters.has('전체');
      return `<button class="team-fbtn cal-team-fbtn ${name==='전체'&&S.calTeamFilters.has('전체')?'on':isTeamOn?'multi-on':''}" onclick="toggleCalTeamFilter('${name}')">${name}</button>`;
    }).join('');
  }
  renderCalMemberFilter();

  // 일정표 팀 필터 바
  const ganttBar = document.getElementById('gantt-team-filter-bar');
  if(ganttBar){
    ganttBar.innerHTML = ['전체',...groups.map(g=>g.name)].map(name=>`
      <button class="team-fbtn ${S.ganttTeamFilter===name?'on':''}" onclick="setGanttTeamFilter('${name}')">${name}</button>
    `).join('');
  }

  // 소속팀 select (업무 입력)
  const inpTeam = document.getElementById('inp-team');
  if(inpTeam){
    inpTeam.innerHTML = '<option value="">소속팀</option>' +
      groups.map(g=>`<option value="${g.name}">${g.name}</option>`).join('');
  }

  // 일정표 소속팀 드롭다운 (비고→소속팀)
  const ganttTeamDd = document.getElementById('gantt-team-dd');
  if(ganttTeamDd){
    ganttTeamDd.innerHTML = `<div class="gantt-prog-item" onclick="ganttTeamSelect('','소속팀 (선택)')" data-val="">-</div>` +
      groups.map(g=>`<div class="gantt-prog-item" onclick="ganttTeamSelect('${g.name}','${g.name}')" data-val="${g.name}">${g.name}</div>`).join('');
  }

  // 메모 그룹 탭
  renderMemoGroupTabs();
  // 일정 뷰 필터 갱신
  if(S.calView==='schedule') renderScheduleFilterBars();
}

// 업무탭 팀 필터
window.setTeamFilter = function(name){
  S.teamFilter = name;
  renderTeamFilterBars();
  render();
};

// 달력 팀 필터 (다중선택)
// 달력 팀원 필터 렌더
function renderCalMemberFilter(){
  const bar = document.getElementById('cal-member-filter-bar');
  if(!bar) return;

  // 선택된 팀이 하나이고 전체가 아닌 경우에만 팀원 표시
  const selectedTeams = [...calTeamFilters].filter(t=>t!=='전체');
  if(S.calTeamFilters.has('전체') || selectedTeams.length !== 1){
    bar.style.display='none';
    S.calMemberFilter='';
    return;
  }

  const teamName = selectedTeams[0];
  const groups = getGroupList();
  const g = groups.find(g=>g.name===teamName);
  const members = g ? (g.members||[]).filter(n=>getMemberList().includes(n)) : [];

  if(!members.length){ bar.style.display='none'; return; }

  bar.style.display='flex';
  bar.innerHTML = `
    <span style="font-size:9px;color:var(--text3);align-self:center;white-space:nowrap;">팀원:</span>
    <button class="team-fbtn ${S.calMemberFilter===''?'on':''}" onclick="setCalMemberFilter('')" style="font-size:9px;padding:2px 7px;">전체</button>
    ${members.map(name=>`
      <button class="team-fbtn ${S.calMemberFilter===name?'on':''}" onclick="setCalMemberFilter('${name}')" style="font-size:9px;padding:2px 7px;">${name}</button>
    `).join('')}
  `;
}

window.setCalMemberFilter = function(name){
  S.calMemberFilter = name;
  renderCalMemberFilter();
  renderCal();
};

window.toggleCalTeamFilter = function(name){
  if(name==='전체'){
    S.calTeamFilters = new Set(['전체']);
    S.calMemberFilter = '';
  } else {
    S.calTeamFilters.delete('전체');
    if(S.calTeamFilters.has(name)){
      S.calTeamFilters.delete(name);
    } else {
      S.calTeamFilters.add(name);
      S.calMemberFilter = '';
    }
    if(S.calTeamFilters.size===0) S.calTeamFilters.add('전체');
  }
  renderTeamFilterBars();
  renderCal();
};

// 일정표 팀 필터
window.setGanttTeamFilter = function(name){
  S.ganttTeamFilter = name;
  renderTeamFilterBars();
  ganttRender();
};

// 일정표 소속팀 드롭다운 토글
window.ganttTeamDropToggle = function(){
  const dd = document.getElementById('gantt-team-dd');
  if(!dd) return;
  const isOpen = dd.style.display!=='none';
  dd.style.display = isOpen?'none':'block';
  if(!isOpen){
    setTimeout(()=>{
      const handler = e=>{
        if(!dd.contains(e.target)&&!document.getElementById('gantt-team-btn').contains(e.target)){
          dd.style.display='none'; document.removeEventListener('click',handler);
        }
      };
// [app.js]
    },0);
  }
};

// 일정표 소속팀 선택
window.ganttTeamSelect = function(val, label){
  const h = document.getElementById('gantt-team-value');
  const l = document.getElementById('gantt-team-label');
  const dd = document.getElementById('gantt-team-dd');
  if(h) h.value = val;
  if(l){ l.textContent = label||'소속팀 (선택)'; l.style.color = val?'var(--text)':'var(--text3)'; }
  if(dd) dd.style.display='none';
};

// 메모 그룹 탭 렌더
function renderMemoGroupTabs(){
  const el = document.getElementById('memo-group-tabs');
  if(!el) return;
  const groups = getGroupList();
  // '전체' 탭 제거 — 그룹 탭만 표시
  if(!groups.length){ el.innerHTML=''; return; }
  // 첫 번째 그룹이 기본 선택
  if(!groups.find(g=>g.name===S.memoGroupFilter)){
    S.memoGroupFilter = groups[0].name;
  }
  el.innerHTML = groups.map(g=>`
    <button class="team-fbtn ${S.memoGroupFilter===g.name?'on':''}" onclick="setMemoGroupFilter('${g.name}')">${g.name}</button>
  `).join('');
}

// 메모 그룹 선택
window.setMemoGroupFilter = function(name){
  S.memoGroupFilter = name;
  S.memoPersonFilter = '전체';
  renderMemoGroupTabs();
  renderMemoTabs();
};

// 메모 키워드 검색
window.memoSearchFilter = function(){
  renderMemoList();
};

// 메모 인라인 수정
window.editMemoInline = function(memoId){
  const m = S.memos[memoId];
  if(!m) return;
  const bodyEl = document.getElementById('memo-body-'+memoId);
  if(!bodyEl) return;
  // 이미 수정 중이면 취소
  if(bodyEl.dataset.editing === '1'){
    bodyEl.innerHTML = (m.text||'').replace(/</g,'&lt;');
    delete bodyEl.dataset.editing;
    return;
  }
  bodyEl.dataset.editing = '1';
  bodyEl.innerHTML = `<textarea id="memo-edit-ta-${memoId}" style="width:100%;min-height:50px;resize:none;font-size:11px;padding:5px 7px;border-radius:6px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-family:var(--font);outline:none;box-sizing:border-box;">${(m.text||'').replace(/</g,'&lt;')}</textarea>
    <div style="display:flex;gap:5px;margin-top:4px;justify-content:flex-end;">
      <button onclick="saveMemoEdit('${memoId}')" style="font-size:10px;padding:3px 10px;border-radius:5px;background:var(--blue);color:#fff;border:none;cursor:pointer;font-family:var(--font);font-weight:600;">저장</button>
      <button onclick="cancelMemoEdit('${memoId}')" style="font-size:10px;padding:3px 10px;border-radius:5px;background:var(--surface2);color:var(--text2);border:1px solid var(--border);cursor:pointer;font-family:var(--font);">취소</button>
    </div>`;
  document.getElementById('memo-edit-ta-'+memoId)?.focus();
};
window.saveMemoEdit = function(memoId){
  const ta = document.getElementById('memo-edit-ta-'+memoId);
  if(!ta) return;
  const newText = ta.value.trim();
  if(!newText) return;
  window._fb.update('memos/'+memoId, { text: newText });
};
window.cancelMemoEdit = function(memoId){
  const m = S.memos[memoId];
  const bodyEl = document.getElementById('memo-body-'+memoId);
  if(!bodyEl||!m) return;
  delete bodyEl.dataset.editing;
  bodyEl.innerHTML = (m.text||'').replace(/</g,'&lt;');
};

// ── 달력 뷰 전환 ──
window.switchCalView = function(view){
  S.calView = view;
  document.getElementById('cal-tab-work').classList.toggle('on', view==='work');
  document.getElementById('cal-tab-schedule').classList.toggle('on', view==='schedule');
  document.getElementById('cal-view-work').style.display = view==='work' ? 'block' : 'none';
  document.getElementById('cal-view-schedule').style.display = view==='schedule' ? 'block' : 'none';
  if(view==='schedule'){ renderScheduleGrid(); renderScheduleFilterBars(); }
  else renderCal();
};

window.onCalAddBtn = function(){
  if(S.calView==='schedule') openAddEvent();
  else openAddEvent();
};

// ── 개인 일정 달력 렌더 ──
// ── 일정 뷰 팀/팀원 필터 ──
function renderScheduleFilterBars(){
  const groups = getGroupList();
  const bar = document.getElementById('sch-team-filter-bar');
  if(bar){
    bar.innerHTML = ['전체',...groups.map(g=>g.name)].map(name=>{
      const isOn = name==='전체' ? S.schTeamFilters.has('전체') : S.schTeamFilters.has(name)&&!S.schTeamFilters.has('전체');
      return `<button class="team-fbtn cal-team-fbtn ${name==='전체'&&S.schTeamFilters.has('전체')?'on':isOn?'multi-on':''}" onclick="setSchTeamFilter('${name}')">${name}</button>`;
    }).join('');
  }
  renderSchMemberFilterBar();
}

function renderSchMemberFilterBar(){
  const bar = document.getElementById('sch-member-filter-bar');
  if(!bar) return;
  // 단일 팀 선택 시에만 팀원 필터 표시
  const selectedTeams = [...schTeamFilters].filter(t=>t!=='전체');
  if(S.schTeamFilters.has('전체') || selectedTeams.length !== 1){
    bar.style.display='none'; S.schMemberFilter=''; return;
  }
  const groups = getGroupList();
  const g = groups.find(g=>g.name===selectedTeams[0]);
  const members = g ? (g.members||[]).filter(n=>getMemberList().includes(n)) : [];
  if(!members.length){ bar.style.display='none'; return; }
  bar.style.display='flex';
  bar.innerHTML = `
    <span style="font-size:9px;color:var(--text3);align-self:center;white-space:nowrap;">팀원:</span>
    <button class="team-fbtn ${S.schMemberFilter===''?'on':''}" onclick="setSchMemberFilter('')" style="font-size:9px;padding:2px 7px;">전체</button>
    ${members.map(name=>`
      <button class="team-fbtn ${S.schMemberFilter===name?'on':''}" onclick="setSchMemberFilter('${name}')" style="font-size:9px;padding:2px 7px;">${name}</button>
    `).join('')}
  `;
}

window.setSchTeamFilter = function(name){
  if(name==='전체'){
    S.schTeamFilters = new Set(['전체']);
    S.schMemberFilter = '';
  } else {
    S.schTeamFilters.delete('전체');
    if(S.schTeamFilters.has(name)){
      S.schTeamFilters.delete(name);
    } else {
      S.schTeamFilters.add(name);
      S.schMemberFilter = ''; // 팀 추가할 때만 팀원 초기화
    }
    if(S.schTeamFilters.size===0) S.schTeamFilters.add('전체');
  }
  renderScheduleFilterBars();
  renderScheduleGrid();
  document.getElementById('cal-schedule-detail').style.display='none';
};

window.setSchMemberFilter = function(name){
  S.schMemberFilter = name;
  renderSchMemberFilterBar();
  renderScheduleGrid();
  document.getElementById('cal-schedule-detail').style.display='none';
};

window.renderScheduleGrid = function(){
  const y=S.calYear, m=S.calMonth;
  const firstDow=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();
  const todayD=new Date();
  const dows=['일','월','화','수','목','금','토'];

  // 필터에 따라 표시할 작성자 결정
  let allowedAuthors = null; // null = 전체
  if(S.schMemberFilter){
    allowedAuthors = new Set([S.schMemberFilter]);
  } else if(!S.schTeamFilters.has('전체')){
    const groups = getGroupList();
    allowedAuthors = new Set();
    S.schTeamFilters.forEach(teamName=>{
      const g = groups.find(g=>g.name===teamName);
      if(g) (g.members||[]).forEach(m=>allowedAuthors.add(m));
    });
  }

  const allEvents=Object.entries(S.calEvents).map(([id,e])=>({...e,id}))
    .filter(e=>{
      if(!e.date || !e.date.startsWith(`${y}-${String(m+1).padStart(2,'0')}`)) return false;
      if(allowedAuthors && !allowedAuthors.has(e.author)) return false;
      return true;
    });

  let html=dows.map((d,i)=>`<div class="cal-dow" style="${i===0?'color:#ef4444':i===6?'color:#3b82f6':''}">${d}</div>`).join('');
  for(let i=0;i<firstDow;i++) html+=`<div class="cal-cell other-month"><div class="cal-num"></div></div>`;
  for(let d=1;d<=days;d++){
    const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dow=new Date(y,m,d).getDay();
    const isToday=todayD.getFullYear()===y&&todayD.getMonth()===m&&todayD.getDate()===d;
    const de=allEvents.filter(e=>e.date===ds);
    const dots=de.slice(0,2).map(e=>`<div class="cal-dot-event">${e.author?e.author+': ':''} ${e.title||'일정'}</div>`).join('');
    const more=de.length>2?`<div style="font-size:9px;color:var(--text3)">+${de.length-2}</div>`:'';
    html+=`<div class="cal-cell${isToday?' today':''}" onclick="showScheduleDetail('${ds}')">
      <div class="cal-num" style="${dow===0?'color:#ef4444':dow===6?'color:#3b82f6':''}">${d}</div>
      <div class="cal-dots">${dots}${more}</div>
    </div>`;
  }
  const grid=document.getElementById('cal-schedule-grid');
  if(grid) grid.innerHTML=html;
  renderScheduleFilterBars();
};

window.showScheduleDetail = function(ds){
  const det=document.getElementById('cal-schedule-detail');
  const detBody=document.getElementById('cal-schedule-detail-body');
  const detTitle=document.getElementById('cal-schedule-detail-title');
  const curUser=localStorage.getItem('currentUser')||'';

  let allowedAuthors = null;
  if(S.schMemberFilter){ allowedAuthors = new Set([S.schMemberFilter]); }
  else if(!S.schTeamFilters.has('전체')){
    const groups = getGroupList();
    allowedAuthors = new Set();
    S.schTeamFilters.forEach(teamName=>{
      const g = groups.find(g=>g.name===teamName);
      if(g) (g.members||[]).forEach(m=>allowedAuthors.add(m));
    });
  }

  const de=Object.entries(S.calEvents).map(([id,e])=>({...e,id}))
    .filter(e=>{
      if(e.date!==ds) return false;
      if(allowedAuthors && !allowedAuthors.has(e.author)) return false;
      return true;
    });
  if(!de.length){ det.style.display='none'; return; }
  const[,mo,d]=ds.split('-');
  detTitle.textContent=`${parseInt(mo)}월 ${parseInt(d)}일 일정 (${de.length}건)`;
  detBody.innerHTML=de.map(e=>{
    const canEdit = e.author===curUser || currentIsAdmin();
    return `<div class="personal-event-card">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:2px;">
            <span style="font-size:12px;font-weight:700;color:var(--text);">${e.title||'일정'}</span>
            ${e.author?`<span style="font-size:9px;color:var(--text3);background:var(--surface2);border:1px solid var(--border2);border-radius:99px;padding:0 5px;">${e.author}</span>`:''}
          </div>
          ${e.memo?`<div style="font-size:11px;color:var(--text2);">${e.memo}</div>`:''}
        </div>
        ${canEdit?`<div style="display:flex;gap:4px;flex-shrink:0;">
          <button class="act-btn" onclick="editCalEvent('${e.id}')">✏</button>
          <button class="act-btn" onclick="deleteCalEvent('${e.id}','${ds}')">✕</button>
        </div>`:''}
      </div>
    </div>`;
  }).join('');
  det.style.display='block';
};

window.deleteCalEvent = function(id, ds){
  if(!confirm('일정을 삭제할까요?')) return;
  window._fb.remove('calEvents/'+id);
  setTimeout(()=>{ renderScheduleGrid(); showScheduleDetail(ds); }, 200);
};

window.editCalEvent = function(id){
  const e=S.calEvents[id];
  if(!e) return;
  document.getElementById('cal-event-edit-id').value=id;
  document.getElementById('cal-event-date').value=e.date||'';
  document.getElementById('cal-event-title-inp').value=e.title||'';
  document.getElementById('cal-event-memo').value=e.memo||'';
  document.getElementById('cal-event-modal-title').textContent='일정 수정';
  document.getElementById('cal-event-modal-bg').classList.add('open');
};
window.boardSearch = function(){
  const q = (document.getElementById('board-search-input')?.value||'').trim().toLowerCase();
  const resultsEl = document.getElementById('board-search-results');
  const normalEl  = document.getElementById('board-normal-view');
  const clearBtn  = document.getElementById('board-search-clear');

  if(!q){
    resultsEl.style.display='none';
    normalEl.style.display='flex';
    if(clearBtn) clearBtn.style.display='none';
    return;
  }

  resultsEl.style.display='block';
  normalEl.style.display='none';
  if(clearBtn) clearBtn.style.display='inline-flex';

  const curUser = localStorage.getItem('currentUser')||'';

  // 전체 entries에서 검색 (날짜 무관)
  const results = Object.values(S.entries).filter(e=>{
    const task    = (e.task||'').toLowerCase();
    const pname   = (e.projectId && S.projects[e.projectId]) ? S.projects[e.projectId].name.toLowerCase() : '';
    const name    = (e.name||'').toLowerCase();
    return task.includes(q) || pname.includes(q) || name.includes(q);
  }).sort((a,b)=>(b.date||'').localeCompare(a.date||'')); // 최신 날짜 순

  if(!results.length){
    resultsEl.innerHTML=`<div class="empty" style="padding:20px">"${q}" 검색 결과가 없습니다</div>`;
    return;
  }

  // 키워드 하이라이트
  const hl = (text)=> text.replace(/</g,'&lt;').replace(
    new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),
    m=>`<mark class="search-highlight">${m}</mark>`
  );

  resultsEl.innerHTML = `
    <div style="padding:6px 10px;font-size:10px;color:var(--text3);border-bottom:1px solid var(--border);background:var(--surface);flex-shrink:0;">
      <b style="color:var(--blue-txt)">${results.length}건</b> 검색됨 — "<b>${q}</b>"
    </div>
    <div style="overflow-y:auto;flex:1;padding:8px 10px;display:flex;flex-direction:column;gap:6px;">
    ${results.map(e=>{
      const [bg,fg] = getColor(e.name);
      const proj = e.projectId && S.projects[e.projectId];
      const pc   = e.projectId ? getProjColor(e.projectId) : null;
      const projBadge = proj ? `<div class="proj-badge" style="background:${pc}18;color:${pc};border-color:${pc}44">${hl(proj.name)}</div>` : '';
      const timeStr = e.startTime&&e.endTime ? `${e.startTime}~${e.endTime}` : '';
      const canEdit = e.name===curUser||currentIsAdmin();
      return `<div class="card" style="position:relative;cursor:pointer;" onclick="goToSearchDate('${e.id}','${e.date||''}',event)">
        <div class="card-hd">
          <div class="av" style="background:${bg};color:${fg}">${initials(e.name)}</div>
          <div class="meta">
            <div class="meta-name">${hl(e.name)}</div>
            ${timeStr?`<div class="meta-time">${timeStr}</div>`:''}
          </div>
          <div style="display:flex;align-items:center;gap:4px;margin-left:auto;flex-shrink:0;">
            ${canEdit?`<button class="act-btn" onclick="event.stopPropagation();openEdit('${e.id}')">✏</button>
            <button class="act-btn" onclick="event.stopPropagation();deleteEntry('${e.id}')">✕</button>`:''}
            <div class="tag-wrap">
              ${canEdit
                ? `<span class="tag t${(e.tag||'').replace(/ /g,'')} tag-clickable" onclick="event.stopPropagation();toggleTagDropdown('${e.id}',event)">${e.tag||''} ▾</span>
                   <div class="tag-dropdown" id="tagdd-${e.id}">
                     <div class="tag-dd-item t작업중" onclick="changeEntryTag('${e.id}','작업중',event)">작업중</div>
                     <div class="tag-dd-item t작업완료" onclick="changeEntryTag('${e.id}','작업완료',event)">작업완료</div>
                   </div>`
                : `<span class="tag t${(e.tag||'').replace(/ /g,'')}"> ${e.tag||''}</span>`
              }
            </div>
            <span class="search-result-date" style="font-size:10px;color:var(--text3);white-space:nowrap;">${e.date||''}</span>
          </div>
        </div>
        ${projBadge}
        <div class="card-body">${hl(e.task||'')}</div>
      </div>`;
    }).join('')}
    </div>`;
};

window.clearBoardSearch = function(){
  const inp = document.getElementById('board-search-input');
  if(inp) inp.value='';
  boardSearch();
};
// [state: let S._timerInterval = null;]
// [state: let S._timerStart = null;]

window.toggleTimer = function(){
  const btn = document.getElementById('timer-btn');
  const display = document.getElementById('timer-display');
  if(!S._timerInterval){
    S._timerStart = new Date();
    const h = String(S._timerStart.getHours()).padStart(2,'0');
    const m = String(S._timerStart.getMinutes()).padStart(2,'0');
    document.getElementById('inp-start').value = `${h}:${m}`;
    btn.textContent = '⏹ 완료';
    btn.classList.replace('start','stop');
    display.style.display = 'inline';
    S._timerInterval = setInterval(()=>{
      const elapsed = Math.floor((Date.now()-S._timerStart)/1000);
      const mm = String(Math.floor(elapsed/60)).padStart(2,'0');
      const ss = String(elapsed%60).padStart(2,'0');
      display.textContent = `${mm}:${ss}`;
      document.title = `⏱ ${mm}:${ss} | EXHEOH 업무보드`;
    }, 1000);
  } else {
    clearInterval(S._timerInterval); S._timerInterval = null;
    const end = new Date();
    const h = String(end.getHours()).padStart(2,'0');
    const m = String(end.getMinutes()).padStart(2,'0');
    document.getElementById('inp-end').value = `${h}:${m}`;
    btn.textContent = '▶ 시작';
    btn.classList.replace('stop','start');
    display.style.display = 'none';
    display.textContent = '00:00';
    document.title = 'EXHEOH 업무보드';
    S._timerStart = null;
  }
};

// ── 즐겨찾기 프로젝트 ──
// [app.js: const _favRef = ref(db, 'favorites');]
// [state: let S._favCache = {};]

// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
