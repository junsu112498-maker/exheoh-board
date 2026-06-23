const S = window.S;

function renderMemoTabs(){
  const tabEl = document.getElementById('memo-person-tabs');
  if(!tabEl) return;
  const allMembers = getMemberList().filter(n=>n!=='어드민');
  const cur = localStorage.getItem('currentUser');

  // 그룹 필터에 따라 표시할 멤버 결정
  let members = allMembers;
  if(S.memoGroupFilter && S.memoGroupFilter!=='전체'){
    const gList = getGroupList();
    const g = gList.find(g=>g.name===S.memoGroupFilter);
    members = g ? (g.members||[]).filter(n=>allMembers.includes(n)) : allMembers;
  }

  // 현재 사용자를 기본 필터로 (그룹 멤버에 있을 때만)
  if(cur && (S.memoPersonFilter==='전체' || !members.includes(S.memoPersonFilter))){
    S.memoPersonFilter = members.includes(cur) ? cur : (members[0]||'전체');
  }

  tabEl.innerHTML = members.map(name=>`
    <button class="memo-person-tab ${S.memoPersonFilter===name?'on':''}" onclick="setMemoFilter('${name}')">${name}</button>
  `).join('');
  renderMemoList();
}

window._setMemoFilter=window.setMemoFilter=function(name){
  S.memoPersonFilter = name;
  renderMemoTabs();
}

function renderMemoList(){
  const el = document.getElementById('memo-list');
  if(!el) return;
  const curUser = localStorage.getItem('currentUser')||'';
  const keyword = (document.getElementById('memo-search-input')?.value||'').trim().toLowerCase();
  const all = Object.entries(S.memos).map(([id,m])=>({...m,id}));

  let filtered;
  if(keyword){
    const allMembers = getMemberList().filter(n=>n!=='어드민');
    let searchMembers = allMembers;
    if(S.memoGroupFilter && S.memoGroupFilter!=='전체'){
      const gList = getGroupList();
      const g = gList.find(g=>g.name===S.memoGroupFilter);
      searchMembers = g ? (g.members||[]).filter(n=>allMembers.includes(n)) : allMembers;
    }
    filtered = all.filter(m=>{
      if(!searchMembers.includes(m.author)) return false;
      const projName = (m.projId && S.projects[m.projId]) ? S.projects[m.projId].name.toLowerCase() : '';
      return (m.text||'').toLowerCase().includes(keyword) || projName.includes(keyword);
    });
  } else {
    filtered = all.filter(m=>m.author===S.memoPersonFilter);
  }

  filtered.sort((a,b)=>{
    if(a.pinned && !b.pinned) return -1;
    if(!a.pinned && b.pinned) return 1;
    return (b.ts||0)-(a.ts||0);
  });

  if(!filtered.length){
    el.innerHTML=`<div class="empty">${keyword?'검색 결과가 없습니다':'메모가 없습니다'}</div>`;
    return;
  }

  el.innerHTML = filtered.map(m=>{
    const proj = m.projId&&S.projects[m.projId];
    const [bg,fg] = getColor(m.author||'?');
    const canEdit = m.author===curUser||currentIsAdmin();
    const canDel  = m.author===curUser||currentIsAdmin();
    const bodyText = keyword
      ? (m.text||'').replace(/</g,'&lt;').replace(
          new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),
          match=>`<mark style="background:var(--amber-bg);color:var(--amber-txt);border-radius:2px;padding:0 1px">${match}</mark>`)
      : (m.text||'').replace(/</g,'&lt;');
    return `<div class="memo-card${m.pinned?' pinned':''}">
      <div class="card-actions">
        <button class="memo-pin-btn${m.pinned?' on':''}" onclick="toggleMemoPin('${m.id}')" title="${m.pinned?'고정 해제':'상단 고정'}">📌</button>
        ${canEdit?`<button class="act-btn" onclick="editMemoInline('${m.id}')" title="수정">✏</button>`:''}
        ${canDel?`<button class="act-btn" onclick="deleteMemo('${m.id}')">✕</button>`:''}
      </div>
      <div class="memo-hd">
        <div class="av" style="background:${bg};color:${fg};width:22px;height:22px;font-size:9px">${(m.author||'?').slice(0,2)}</div>
        <span style="font-size:11px;font-weight:700;color:var(--text)">${m.author||'익명'}</span>
        ${proj?`<span class="memo-proj-tag">${proj.name}</span>`:''}
        <span class="memo-time">${m.date||''} ${m.time||''}</span>
        ${m.pinned?`<span style="font-size:9px;color:var(--amber-txt);background:var(--amber-bg);border:1px solid var(--amber-bd);border-radius:4px;padding:1px 5px;">고정</span>`:''}
      </div>
      <div class="memo-body" id="memo-body-${m.id}">${bodyText}</div>
    </div>`;
  }).join('');
}

// ── 프로젝트 히스토리 ──
// [state: let S.historyData = {};]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]

window._toggleHistory=window.toggleHistory=function(projId){
  const el = document.getElementById('hist-'+projId);
  if(!el) return;
  if(el.classList.contains('open')){
    el.classList.remove('open');
  } else {
    el.classList.add('open');
    renderHistoryList(projId);
    renderProjTimeline(projId);
  }
}

function renderMemoProjSearchList(q){
  const dd = document.getElementById('memo-proj-search-dropdown');
  if(!dd) return;
  const sorted = Object.entries(S.projects).sort((a,b)=>(a[1].name||'').localeCompare(b[1].name||'','ko'));
  const filtered = q ? sorted.filter(([id,p])=>(p.name||'').includes(q)||(p.code||'').includes(q)) : sorted;
  const curVal = document.getElementById('memo-proj-sel').value;
  dd.innerHTML = [['','프로젝트 (선택)'],...filtered.map(([id,p])=>[id,p.name])].map(([id,name])=>`
    <div class="proj-search-item${id===curVal?' selected':''}" onmousedown="selectMemoProjSearch('${id}','${(name||'').replace(/'/g,"\'")}')">
      ${name}
    </div>`).join('');
}
window.selectMemoProjSearch = function(id, name){
  document.getElementById('memo-proj-sel').value = id;
  document.getElementById('memo-proj-search-input').value = id ? name : '';
  document.getElementById('memo-proj-search-dropdown').classList.remove('open');
}

// ── 달력 일정 CRUD ──
// [state: let S._calEventDate = '';]

window.openAddEvent = function(ds){
  if(ds) S._calEventDate = ds;
  document.getElementById('cal-event-edit-id').value = '';
  document.getElementById('cal-event-date').value = S._calEventDate||todayStr();
  document.getElementById('cal-event-title-inp').value = '';
  document.getElementById('cal-event-memo').value = '';
  document.getElementById('cal-event-modal-title').textContent = '일정 추가';
  document.getElementById('cal-event-detail-bg').classList.remove('open');
  document.getElementById('cal-event-modal-bg').classList.add('open');
}
window.closeCalEventModal = function(){
  document.getElementById('cal-event-modal-bg').classList.remove('open');
}
window.saveCalEvent = function(){
  const id = document.getElementById('cal-event-edit-id').value;
  const date = document.getElementById('cal-event-date').value;
  const title = document.getElementById('cal-event-title-inp').value.trim();
  const memo = document.getElementById('cal-event-memo').value.trim();
  if(!date||!title) return;
  const author = localStorage.getItem('currentUser')||'';
  if(id){
    window._fb.update('calEvents/'+id,{date,title,memo,author});
  } else {
    push(calEventsRef,{date,title,memo,author,ts:Date.now()});
  }
  closeCalEventModal();
}
window.showEventDetail = function(ds){
  S._calEventDate = ds;
  const[y,mo,d]=ds.split('-');
  document.getElementById('cal-event-detail-title').textContent=`${parseInt(mo)}월 ${parseInt(d)}일 일정`;
  renderEventDetailList(ds);
  document.getElementById('cal-event-detail-bg').classList.add('open');
}
window.closeEventDetail = function(){
  document.getElementById('cal-event-detail-bg').classList.remove('open');
}
function renderEventDetailList(ds){
  const curUser = localStorage.getItem('currentUser')||'';
  const evArr = Object.entries(S.calEvents).filter(([id,ev])=>ev.date===ds);
  const el = document.getElementById('cal-event-detail-list');
  if(!evArr.length){ el.innerHTML='<div class="empty">등록된 일정이 없습니다</div>'; return; }
  el.innerHTML = evArr.map(([id,ev])=>{
    const canEdit = ev.author===curUser || currentIsAdmin();
    return `<div style="padding:8px 0;border-bottom:1px solid var(--border);">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
        <span style="font-size:12px;font-weight:700;color:var(--text);flex:1">${ev.title}</span>
        ${canEdit?`<button class="act-btn" onclick="editCalEvent('${id}')">✏</button>
        <button class="act-btn" onclick="deleteCalEventItem('${id}','${ds}')">✕</button>`:''}
      </div>
      ${ev.memo?`<div style="font-size:11px;color:var(--text2)">${ev.memo}</div>`:''}
      <div style="font-size:10px;color:var(--text3);margin-top:2px">${ev.author||''}</div>
    </div>`;
  }).join('');
}
window.editCalEvent = function(id){
  const ev = S.calEvents[id];
  if(!ev) return;
  document.getElementById('cal-event-edit-id').value = id;
  document.getElementById('cal-event-date').value = ev.date;
  document.getElementById('cal-event-title-inp').value = ev.title||'';
  document.getElementById('cal-event-memo').value = ev.memo||'';
  document.getElementById('cal-event-modal-title').textContent = '일정 수정';
  document.getElementById('cal-event-detail-bg').classList.remove('open');
  document.getElementById('cal-event-modal-bg').classList.add('open');
}
window.deleteCalEventItem = function(id, ds){
  if(!confirm('일정을 삭제하시겠습니까?')) return;
  window._fb.remove('calEvents/'+id);
  setTimeout(()=>renderEventDetailList(ds), 300);
}





// ── 이슈/히스토리 N 뱃지 ──