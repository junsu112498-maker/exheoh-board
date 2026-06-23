const S = window.S;

function updateProjSelects(){
  const sorted = Object.entries(S.projects).sort((a,b)=>{
    const na=(a[1].name||'').localeCompare(b[1].name||'','ko');
    return na;
  });
  const opts=sorted.map(([id,p])=>`<option value="${id}">${p.name}</option>`).join('');
  ['inp-proj','edit-proj'].forEach(elId=>{
    const el=document.getElementById(elId);
    if(!el) return;
    const empty = elId==='inp-proj'?'<option value="">프로젝트</option>':'<option value="">없음</option>';
    el.innerHTML=empty+opts;
  });
  updateTeamSelect();
}

function updateTeamSelect(){
  const el = document.getElementById('inp-team');
  if(!el) return;
  const groups = getGroupList();
  el.innerHTML = `<option value="">소속팀</option>`
    + groups.map(g=>`<option value="${g.name}">${g.name}</option>`).join('');
  // 현재 사용자의 팀 자동 선택
  const curUser = localStorage.getItem('currentUser')||'';
  const myGroup = getMemberGroup(curUser);
  if(myGroup) el.value = myGroup;
}

// ── 업무 CRUD ──
window._submitEntry=window.submitEntry=function(){
  const saved=localStorage.getItem('currentUser');
  const nameEl=document.getElementById('inp-name');
  if(saved && !nameEl.value.trim()) nameEl.value=saved;
  const name=nameEl.value.trim();
  const tag=document.getElementById('inp-tag').value;
  const task=document.getElementById('inp-task').value.trim();
  const date=document.getElementById('inp-date').value||todayStr();
  const startTime=document.getElementById('inp-start').value;
  const endTime=document.getElementById('inp-end').value;
  const projectId=document.getElementById('inp-proj').value||'';
  if(!name){nameEl.focus();return;}
  if(!task){document.getElementById('inp-task').focus();return;}
  push(entriesRef,{name,tag,task,date,startTime,endTime,projectId,ts:Date.now()});
  document.getElementById('inp-task').value='';
  document.getElementById('inp-start').value='';
  document.getElementById('inp-end').value='';
  document.getElementById('inp-proj').value='';
  const si = document.getElementById('proj-search-input'); if(si) si.value='';
  if(saved) setTimeout(()=>{ nameEl.value=saved; },100);

}
window._deleteEntry=window.deleteEntry=function(id){ if(!confirm('삭제하시겠습니까?')) return; window._fb.remove('entries/'+id); }
window._openEdit=window.openEdit=function(id){
  const e=S.entries[id]; if(!e) return;
  S.editId=id;
  // 이름 읽기전용 표시
  const nameDisplay = document.getElementById('edit-name-display');
  if(nameDisplay) nameDisplay.textContent = e.name;
  document.getElementById('edit-name').value=e.name;
  document.getElementById('edit-tag').value=e.tag;
  document.getElementById('edit-date').value=e.date||todayStr();
  document.getElementById('edit-start').value=e.startTime||'';
  document.getElementById('edit-end').value=e.endTime||'';
  document.getElementById('edit-proj').value=e.projectId||'';
  // 프로젝트 검색창 채우기
  const projInp = document.getElementById('edit-proj-search-input');
  if(projInp){
    const projName = e.projectId && S.projects[e.projectId] ? S.projects[e.projectId].name : '';
    projInp.value = projName;
  }
  document.getElementById('edit-task').value=e.task;
  document.getElementById('modal-bg').classList.add('open');
}
window._closeModal=window.closeModal=function(){ document.getElementById('modal-bg').classList.remove('open'); S.editId=null; }
window._saveEdit=window.saveEdit=function(){
  if(!S.editId){closeModal();return;}
  window._fb.update('entries/'+S.editId,{
    name:document.getElementById('edit-name').value.trim()||S.entries[S.editId].name,
    tag:document.getElementById('edit-tag').value,
    date:document.getElementById('edit-date').value,
    startTime:document.getElementById('edit-start').value,
    endTime:document.getElementById('edit-end').value,
    projectId:document.getElementById('edit-proj').value||'',
    task:document.getElementById('edit-task').value.trim()||S.entries[S.editId].task,
    ts:S.entries[S.editId].ts
  });
  closeModal();
}

// ── 프로젝트 CRUD ──
window._addProject=window.addProject=function(){
  const code=document.getElementById('new-proj-code').value.trim();
  const name=document.getElementById('new-proj-name').value.trim();
  const client=document.getElementById('new-proj-client').value.trim();
  const design=document.getElementById('new-proj-design').value.trim();
  const eng=document.getElementById('new-proj-eng').value.trim();
  if(!name) return;
  push(projectsRef,{code,name,client,design,eng});
  ['new-proj-code','new-proj-name','new-proj-client','new-proj-design','new-proj-eng'].forEach(id=>{ document.getElementById(id).value=''; });
}
window._deleteProject=window.deleteProject=function(id){ if(!confirm('프로젝트를 삭제하시겠습니까?')) return; window._fb.remove('projects/'+id); }
window._startEditProj=window.startEditProj=function(id){
  document.getElementById('pinfo-'+id).style.display='none';
  document.getElementById('pedit-'+id).classList.add('open');
}
window._saveEditProj=window.saveEditProj=function(id){
  const name=document.getElementById('pe-name-'+id).value.trim();
  const code=document.getElementById('pe-code-'+id).value.trim();
  const client=document.getElementById('pe-client-'+id)?document.getElementById('pe-client-'+id).value.trim():'';
  const design=document.getElementById('pe-design-'+id).value.trim();
  const eng=document.getElementById('pe-eng-'+id).value.trim();
  if(name) window._fb.update('projects/'+id,{name,code,client,design,eng});
  document.getElementById('pinfo-'+id).style.display='flex';
  document.getElementById('pedit-'+id).classList.remove('open');
}
function renderProjList(){
  const list=document.getElementById('proj-list');
  if(!list) return;
  let arr=Object.entries(S.projects);
  // 필터 적용
  if(_projFilter && _projFilter.field && _projFilter.value){
    arr=arr.filter(([id,p])=>(p[_projFilter.field]||'').trim()===_projFilter.value.trim());
  }
  if(!arr.length){list.innerHTML='<div class="empty">검색 결과가 없습니다</div>';return;}
  // 프로젝트 코드 기준 정렬
  arr.sort((a,b)=>{
    const ca=(a[1].code||'').trim().toLowerCase();
    const cb=(b[1].code||'').trim().toLowerCase();
    // 숫자 포함 코드 자연 정렬
    const cmp=ca.localeCompare(cb,undefined,{numeric:true,sensitivity:'base'});
    return S.projSortOrder==='asc'?cmp:-cmp;
  });
  list.innerHTML=arr.map(([id,p],i)=>{
    const color=PROJ_COLORS[i%PROJ_COLORS.length];
    const favs = getFavs();
    return `<div class="proj-item" id="proj-item-${id}">
      <div class="proj-item-top">
        <div class="proj-dot" style="background:${color}"></div>
        <div class="proj-info" id="pinfo-${id}" style="display:flex">
          ${p.code?`<span class="proj-tag-badge" style="background:#f3f4f6;color:#374151;border-color:#d1d5db">${p.code}</span>`:''}
          ${p.client?`<span class="proj-tag-badge" style="background:var(--green-bg);color:var(--green-txt);border-color:var(--green-bd);cursor:pointer;" onclick="setProjFilter('client','${p.client.replace(/'/g,"\'")}')">🏗 ${p.client}</span>`:''}
          <span style="font-size:12px;font-weight:700;color:var(--text);word-break:break-all;white-space:normal;">${p.name}</span>
          ${p.design?`<span class="proj-tag-badge" style="background:var(--blue-bg);color:var(--blue-txt);border-color:var(--blue-bd);cursor:pointer;" onclick="setProjFilter('design','${p.design.replace(/'/g,"\'")}')">디자인담당 ${p.design}</span>`:''}
          ${p.eng?`<span class="proj-tag-badge" style="background:var(--purple-bg);color:var(--purple-txt);border-color:var(--purple-bd);cursor:pointer;" onclick="setProjFilter('eng','${p.eng.replace(/'/g,"\'")}')">설계담당 ${p.eng}</span>`:''}

        </div>
        <button class="fav-star" onclick="toggleFavorite('${id}')" title="즐겨찾기" id="fav-star-${id}">${favs[id]?'⭐':'☆'}</button>
        <button class="proj-toggle-btn" onclick="toggleHistory('${id}')" style="position:relative;">📋 이슈/히스토리<span id="hist-badge-${id}" style="display:none;position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;border-radius:50%;width:14px;height:14px;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;line-height:1;">N</span></button>
        <button class="btn-ghost-sm" onclick="startEditProj('${id}')">✏ 수정</button>
        <button class="act-btn" onclick="deleteProject('${id}')">✕</button>
      </div>
      <div class="proj-edit-row" id="pedit-${id}">
        <input id="pe-code-${id}" type="text" value="${p.code||''}" placeholder="코드" style="width:62px" class="inp-sm"/>
        <input id="pe-client-${id}" type="text" value="${p.client||''}" placeholder="건설사" style="width:68px" class="inp-sm"/>
        <input id="pe-name-${id}" type="text" value="${p.name}" placeholder="프로젝트명" style="flex:1;min-width:70px" class="inp-sm"/>
        <input id="pe-design-${id}" type="text" value="${p.design||''}" placeholder="디자인담당" style="width:68px" class="inp-sm"/>
        <input id="pe-eng-${id}" type="text" value="${p.eng||''}" placeholder="설계담당" style="width:68px" class="inp-sm"/>
        <button class="btn-add" style="padding:5px 9px;font-size:11px" onclick="saveEditProj('${id}')">저장</button>
      </div>
      <div class="proj-history" id="hist-${id}">
        <div id="hist-list-${id}"></div>
        <div class="prog-timeline-wrap" id="prog-timeline-wrap-${id}"></div>
      </div>
    </div>`;
  }).join('');
  // 뱃지 업데이트 (렌더 후)
  setTimeout(updateAllHistBadges, 50);
}

// ── 날짜 네비 ──
window._changeViewDate=window.changeViewDate=function(delta){
  const d=new Date(S.viewDate); d.setDate(d.getDate()+delta);
  S.viewDate=d.toISOString().slice(0,10);
  updateViewDateLabel(); render();
}
window._goToViewToday=window.goToViewToday=function(){
  S.viewDate=todayStr(); updateViewDateLabel(); render();
}
function updateViewDateLabel(){
  const td=todayStr();
  const label=S.viewDate===td?'오늘':S.viewDate.slice(5).replace('-','/');
  const el=document.getElementById('view-date-lbl');
  el.textContent=label;
}

// ── 렌더 ──
function render(){
  const td=S.viewDate;
  const curUser=localStorage.getItem('currentUser')||'';
  const all=Object.entries(S.entries).map(([id,e])=>({...e,id}));
  const todayAll=all.filter(e=>e.date&&e.name&&e.date===td);
  // 태그 필터
  let filtered=S.filterTag==='전체'?todayAll:todayAll.filter(e=>e.tag===S.filterTag);
  // 팀 필터
  if(S.teamFilter!=='전체'){
    const gList = getGroupList();
    const g = gList.find(g=>g.name===S.teamFilter);
    const gMembers = g ? (g.members||[]) : [];
    filtered = filtered.filter(e=>gMembers.includes(e.name));
  }
  // 나만 보기 필터
  if(window._myOnlyMode) {
    const me = localStorage.getItem('currentUser')||'';
    if(me) filtered = filtered.filter(e=>e.name===me);
  }
  filtered = filtered.filter(e=>e.name); // name 없는 데이터 제외
  filtered.sort((a,b)=>(b.ts||0)-(a.ts||0));
  document.getElementById('cnt').textContent=todayAll.length;
  const list=document.getElementById('board-list');
  if(!filtered.length){list.innerHTML=`<div class="empty">${S.viewDate===todayStr()?'오늘':'해당 날짜에'} 등록된 업무가 없습니다</div>`;return;}
  list.innerHTML=filtered.map(e=>{
    const[bg,fg]=getColor(e.name);
    const proj=e.projectId&&S.projects[e.projectId];
    const pc=e.projectId?getProjColor(e.projectId):null;
    const projBadge=proj?`<div class="proj-badge" style="background:${pc}18;color:${pc};border-color:${pc}44">${proj.name}</div>`:'';
    const timeStr=e.startTime&&e.endTime?e.startTime+' ~ '+e.endTime:e.startTime?e.startTime+' 시작':'';
    // 근무 시간 계산 (점심시간 12:30~13:30 제외, 15분=0.25 단위)
    let durationBadge = '';
    if(e.startTime && e.endTime){
      const [sh,sm] = e.startTime.split(':').map(Number);
      const [eh,em] = e.endTime.split(':').map(Number);
      let totalMin = (eh*60+em) - (sh*60+sm);
      if(totalMin < 0) totalMin += 24*60;
      if(totalMin > 0){
        // 점심시간 12:30~13:30 겹치는 구간 제외
        const workStart = sh*60+sm;
        const workEnd   = eh*60+em <= workStart ? eh*60+em+24*60 : eh*60+em;
        const lunchStart = 12*60+30; // 750
        const lunchEnd   = 13*60+30; // 810
        const overlapStart = Math.max(workStart, lunchStart);
        const overlapEnd   = Math.min(workEnd,   lunchEnd);
        const lunchOverlap = Math.max(0, overlapEnd - overlapStart);
        const netMin = totalMin - lunchOverlap;
        if(netMin > 0){
          const hrs = Math.round(netMin / 15) * 0.25;
          durationBadge = `<span style="font-size:9px;font-weight:700;color:var(--blue-txt);background:var(--blue-bg);border:1px solid var(--blue-bd);border-radius:99px;padding:1px 7px;white-space:nowrap;">${hrs}h</span>`;
        }
      }
    }
    const canEdit = e.name===curUser || currentIsAdmin();

    const taskHtml = e.task.replace(/</g,'&lt;').replace(/\n/g,'<br>');
    const isLong = e.task.length > 80;
    return `<div class="card" id="card-${e.id}">
      <div class="card-hd">
        <div class="av" style="background:${bg};color:${fg}">${initials(e.name)}</div>
        <div class="meta">
          <div class="meta-name" style="display:flex;align-items:center;gap:5px;">
            ${e.name}
            ${(()=>{ const grp=e.team||getMemberGroup(e.name); return grp?`<span style="font-size:9px;font-weight:600;color:var(--text3);background:var(--surface2);border:1px solid var(--border2);border-radius:99px;padding:0 5px;white-space:nowrap;">${grp}</span>`:''; })()}
          </div>
          ${timeStr?`<div class="meta-time" style="display:flex;align-items:center;gap:5px;">${timeStr}${durationBadge}</div>`:''}
        </div>
        <div style="display:flex;align-items:center;gap:4px;margin-left:auto;flex-shrink:0;">
          ${canEdit?`<button class="act-btn" onclick="openEdit('${e.id}')">✏</button>
          <button class="act-btn" onclick="deleteEntry('${e.id}')">✕</button>`:''}
          <div class="tag-wrap">
            ${canEdit ? `
              <span class="tag t${e.tag.replace(/ /g,'')} tag-clickable" onclick="toggleTagDropdown('${e.id}',event)">${e.tag} ▾</span>
              <div class="tag-dropdown" id="tagdd-${e.id}">
                <div class="tag-dd-item t작업중" onclick="changeEntryTag('${e.id}','작업중',event)">작업중</div>
                <div class="tag-dd-item t작업완료" onclick="changeEntryTag('${e.id}','작업완료',event)">작업완료</div>
              </div>
            ` : `<span class="tag t${e.tag.replace(/ /g,'')}">${e.tag}</span>`}
          </div>
        </div>
      </div>
      ${projBadge}
      <div class="card-body-wrap">
        <div class="card-body-clamp" id="card-body-${e.id}">${taskHtml}</div>
        ${isLong?`<button class="card-more-btn" id="more-btn-${e.id}" onclick="toggleCardMore('${e.id}')">더보기 ▼</button>`:''}
      </div>
      <div class="comment-section">
        <div id="cmts-${e.id}"></div>
        <div class="comment-input-row">
          <input type="text" id="cmt-inp-${e.id}" placeholder="댓글 입력..." maxlength="100" onkeydown="if(event.key==='Enter') addComment('${e.id}')"/>
          <button onclick="addComment('${e.id}')">등록</button>
        </div>
      </div>
    </div>`;
  }).join('');
  if(typeof renderCommentsAll==='function') renderCommentsAll();
}

// ── 통계 ──



function getFavs(){
  const user = localStorage.getItem('currentUser')||'';
  return (S._favCache[user])||{};
}

function renderFavChips(){
  const wrap = document.getElementById('fav-chips-wrap');
  if(!wrap) return;
  const favs = getFavs();
  const favIds = Object.keys(favs).filter(id=>favs[id]&&S.projects[id]);
  if(!favIds.length){ wrap.innerHTML=''; return; }
  wrap.innerHTML = favIds.map(id=>`
    <span class="fav-chip" onclick="selectFavProj('${id}')" title="${(S.projects[id]?.name||'').replace(/'/g,'&apos;')}">
      ⭐ ${S.projects[id]?.name||''}
    </span>`).join('');
}

window.selectFavProj = function(id){
  const p = S.projects[id];
  if(!p) return;
  const inp = document.getElementById('proj-search-input');
  const sel = document.getElementById('inp-proj');
  if(inp) inp.value = p.name;
  if(sel) sel.value = id;
  // 프로젝트 정보 박스 표시
  if(window._ganttSelectProj_board){
    window._ganttSelectProj_board(id, p.name);
  } else {
    const box = document.getElementById('proj-search-info');
    if(box) { box.style.display='flex'; }
  }
};

window.toggleFavorite = function(projId){
  const user = localStorage.getItem('currentUser')||'';
  if(!user||user==='어드민') return;
  const favs = getFavs();
  if(favs[projId]){
    window._fb.remove(`favorites/${user}/${projId}`);
  } else {
    window._fb.update(`favorites/${user}`, { [projId]: true });
  }
};

function updateFavStars(){
  const favs = getFavs();
  Object.keys(S.projects).forEach(id=>{
    const star = document.getElementById('fav-star-'+id);
    if(star) star.textContent = favs[id] ? '⭐' : '☆';
  });
}

function renderBdpGrid(){
  const y=S._bdpYear,m=S._bdpMonth;
  document.getElementById('bdp-title').textContent=y+'년 '+(m+1)+'월';
  const first=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();
  const dows=['일','월','화','수','목','금','토'];
  let html=dows.map(d=>`<div style="text-align:center;font-size:9px;font-weight:700;color:var(--text3);padding:3px 0;">${d}</div>`).join('');
  for(let i=0;i<first;i++) html+=`<div></div>`;
  for(let d=1;d<=days;d++){
    const ds=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const isToday=ds===todayStr();
    const curVd = window._getViewDate ? window._getViewDate() : S.viewDate;
    const isSel=ds===curVd;
    const dow=new Date(y,m,d).getDay();
    const color=dow===0?'#ef4444':dow===6?'#3b82f6':'var(--text)';
    html+=`<div onclick="bdpSelectDate('${ds}')" style="text-align:center;padding:4px 2px;cursor:pointer;border-radius:50%;font-size:11px;font-weight:600;
      background:${isSel?'var(--blue)':isToday?'var(--blue-bg)':'transparent'};
      color:${isSel?'#fff':color};
      outline:${isToday&&!isSel?'2px solid var(--blue-bd)':'none'};
      transition:background .1s;"
      onmouseover="if(!this.style.background.includes('2563')){this.style.background='var(--surface2)';}"
      onmouseout="this.style.background='${isSel?'var(--blue)':isToday?'var(--blue-bg)':'transparent'}';"
    >${d}</div>`;
  }
  document.getElementById('bdp-grid').innerHTML=html;
}
window.bdpSelectDate = function(ds){
  // viewDate는 module 스코프라 window._setViewDate 사용
  if(window._setViewDate) window._setViewDate(ds);
  else S.viewDate=ds;
  if(window._updateViewDateLabel) window._updateViewDateLabel();
  if(window._render) window._render();
  // 즉시 닫기
  const bg = document.getElementById('board-date-picker-bg');
  if(bg) bg.style.display='none';
};

// ══════════════════════════════════════════
// ── 위젯 드래그/리사이즈/전체화면 ──
// ══════════════════════════════════════════
(function(){
  const shell = document.getElementById('widget-shell');
  if(!shell) return;

  // ── 전체화면 ──
  let _isMax = false;
  window._doToggleMaximize = function(){
    _isMax = !_isMax;
    shell.classList.toggle('maximized', _isMax);
    if(window.electronAPI) window.electronAPI.toggleMaximize();
    setTimeout(() => {
      const boardList = document.getElementById('board-list');
      if(boardList) { boardList.style.flex='0'; boardList.offsetHeight; boardList.style.flex='1'; }
    }, 100);
  };
  window._toggleMaximize = window._doToggleMaximize;

  // ── 드래그 (IPC 방식) ──
  const titlebar = shell.querySelector('.titlebar');
  if(titlebar){
    let lastX = 0, lastY = 0, dragging = false;

    titlebar.addEventListener('mousedown', e => {
      if(_isMax) return;
      if(e.target.closest('button,input,select,a,[onclick]')) return;
      if(e.detail >= 2) return; // 더블클릭 제외
      dragging = true;
      lastX = e.screenX;
      lastY = e.screenY;
      e.preventDefault();
      document.body.style.userSelect = 'none';
      titlebar.style.cursor = 'grabbing';
    });

// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]

// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
  }

  // ── 리사이즈 (IPC 방식) ──
  ['e','s','se','w','n','nw','ne','sw'].forEach(dir => {
    const el = document.getElementById('rh-'+dir);
    if(!el) return;

    let startX=0, startY=0, startW=0, startH=0;

    el.addEventListener('mousedown', e => {
      if(_isMax) return;
      e.preventDefault(); e.stopPropagation();
      startX = e.screenX; startY = e.screenY;
      // 현재 창 크기는 IPC로 가져오거나 window 크기 사용
      startW = window.innerWidth; startH = window.innerHeight;
      document.body.style.userSelect = 'none';

      const onMove = e2 => {
        const ddx = e2.screenX - startX;
        const ddy = e2.screenY - startY;
        let dw=0, dh=0, mx=0, my=0;
        if(dir.includes('e')) dw = ddx;
        if(dir.includes('s')) dh = ddy;
        if(dir.includes('w')){ dw = -ddx; mx = ddx; }
        if(dir.includes('n')){ dh = -ddy; my = ddy; }
        const newW = Math.max(320, startW + dw);
        const newH = Math.max(400, startH + dh);
        // w방향이면 dx 보정
        const actualDx = dir.includes('w') ? (startW - newW) : 0;
        const actualDy = dir.includes('n') ? (startH - newH) : 0;
        if(window.electronAPI){
          window.electronAPI.resizeWidget(newW, newH, actualDx, actualDy);
        }
        startX = e2.screenX; startY = e2.screenY;
        startW = newW; startH = newH;
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.userSelect = '';
      };
// [app.js]
// [app.js]
    });
  });

})();


// ══════════════════════════════════════════
// ══════════════════════════════════════════
// ── 업무 댓글 ──
// ══════════════════════════════════════════
// [app.js: const commentsRef = ref(db, 'comments');]
// [state: let S.comments = {};]

// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]

function renderComments(entryId, el){
  if(!el) el = document.getElementById('cmts-'+entryId);
  if(!el) return;
  const cmts = Object.entries(S.comments[entryId]||{}).map(([id,c])=>({...c,id}));
  cmts.sort((a,b)=>(a.ts||0)-(b.ts||0));
  if(!cmts.length){ el.innerHTML=''; return; }
  const curUser = localStorage.getItem('currentUser')||'';
  el.innerHTML = cmts.map(c=>{
    const [bg,fg] = getColor(c.author||'?');
    const canDel = c.author===curUser||currentIsAdmin();
    const canEdit = c.author===curUser||currentIsAdmin();
    return `<div class="comment-item" id="cmt-item-${entryId}-${c.id}">
      <div class="comment-av" style="background:${bg};color:${fg}">${(c.author||'?').slice(0,2)}</div>
      <div class="comment-body" style="flex:1;">
        <div style="display:flex;align-items:center;gap:4px;">
          <span class="comment-name">${c.author||'?'}</span>
          <span class="comment-time"> · ${c.time||''}</span>
          <div style="margin-left:auto;display:flex;gap:2px;">
            ${canEdit?`<button class="act-btn" style="font-size:9px;padding:0 3px;" onclick="startEditComment('${entryId}','${c.id}')" title="수정">✏</button>`:''}
            ${canDel?`<button class="act-btn" style="font-size:9px;padding:0 3px;" onclick="deleteComment('${entryId}','${c.id}')">✕</button>`:''}
          </div>
        </div>
        <div id="cmt-text-${entryId}-${c.id}" class="comment-text">${c.text.replace(/</g,'&lt;')}</div>
        <div id="cmt-edit-${entryId}-${c.id}" style="display:none;margin-top:4px;">
          <input type="text" id="cmt-edit-inp-${entryId}-${c.id}" value="${c.text.replace(/"/g,'&quot;')}"
            style="width:100%;padding:4px 7px;border-radius:6px;border:1px solid var(--blue);font-size:12px;font-family:var(--font);background:var(--bg);color:var(--text);"
            onkeydown="if(event.key==='Enter') saveEditComment('${entryId}','${c.id}'); if(event.key==='Escape') cancelEditComment('${entryId}','${c.id}');"/>
          <div style="display:flex;gap:4px;margin-top:3px;">
            <button onclick="saveEditComment('${entryId}','${c.id}')" style="font-size:11px;padding:2px 8px;border-radius:5px;background:var(--blue);color:#fff;border:none;cursor:pointer;font-family:var(--font);">저장</button>
            <button onclick="cancelEditComment('${entryId}','${c.id}')" style="font-size:11px;padding:2px 8px;border-radius:5px;background:var(--surface2);color:var(--text2);border:1px solid var(--border);cursor:pointer;font-family:var(--font);">취소</button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

window.addComment = function(entryId){
  const inp = document.getElementById('cmt-inp-'+entryId);
  if(!inp||!inp.value.trim()) return;
  const author = localStorage.getItem('currentUser')||'익명';
  const now = new Date();
  window._fb.push('comments/'+entryId,{
    author, text: inp.value.trim(),
    time: now.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}),
    ts: now.getTime()
  });
  inp.value='';
};

window.deleteComment = function(entryId, cid){
  if(!confirm('댓글을 삭제하시겠습니까?')) return;
  window._fb.remove('comments/'+entryId+'/'+cid);
};

// render() 후 댓글 렌더링 (render 재정의 대신 별도 함수)
function renderCommentsAll(){
  setTimeout(()=>{
    Object.keys(S.comments).forEach(entryId=>{
      const el = document.getElementById('cmts-'+entryId);
      if(el) renderComments(entryId, el);
    });
  }, 80);
}

// ══════════════════════════════════════════
// ── 메모 핀 토글 ──
// ══════════════════════════════════════════
window.toggleMemoPin = function(id){
  const m = S.memos[id];
  if(!m) return;
  window._fb.update('memos/'+id, { pinned: !m.pinned });
};

// ══════════════════════════════════════════
// ── 예약 알림 ──
// ══════════════════════════════════════════
// [app.js: const alertsRef = ref(db, 'userAlerts');]
// [state: let S.userAlerts = {};]

// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
