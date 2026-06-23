const S = window.S;

function renderCal(){
  const y=S.calYear, m=S.calMonth;
  document.getElementById('cal-title').textContent=`${y}년 ${m+1}월`;
  const first=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();
  const todayD=new Date();
  const dows=['일','월','화','수','목','금','토'];
  let html=dows.map(d=>`<div class="cal-dow">${d}</div>`).join('');
  const all=Object.values(S.entries);
  // 달력 팀 필터 + 팀원 필터
  const calFiltered = S.calTeamFilters.has('전체')
    ? (S.calMemberFilter ? all.filter(e=>e.name===S.calMemberFilter) : all)
    : all.filter(e=>{
        const grp = e.team||getMemberGroup(e.name);
        if(!S.calTeamFilters.has(grp)) return false;
        if(S.calMemberFilter && e.name!==S.calMemberFilter) return false;
        return true;
      });
  for(let i=0;i<first;i++){const pd=new Date(y,m,-(first-1-i));html+=`<div class="cal-cell other-month"><div class="cal-num">${pd.getDate()}</div></div>`;}
  for(let d=1;d<=days;d++){
    const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dow=new Date(y,m,d).getDay();
    const isToday=todayD.getFullYear()===y&&todayD.getMonth()===m&&todayD.getDate()===d;
    const isHoliday=!!HOLIDAYS[ds];
    const holidayName=HOLIDAYS[ds]||'';
    const de=calFiltered.filter(e=>e.date===ds);
    // 이름만 표시 (업무내용 제거) - 클릭 시 하단에 상세
    const dots=de.slice(0,3).map(e=>`<div class="cal-dot t${e.tag.replace(/ /g,'')}">${e.name}</div>`).join('');
    const more=de.length>3?`<div style="font-size:9px;color:var(--text3)">+${de.length-3}</div>`:'';
    // 21시 이후 빨간 동그라미
    const lateWorkers=de.filter(e=>{ if(!e.endTime) return false; const h=parseInt(e.endTime.split(':')[0]); return h>=21; });
    const lateCircles=lateWorkers.map(()=>`<div style="width:7px;height:7px;border-radius:50%;background:#ef4444;flex-shrink:0;display:inline-block;"></div>`).join('');
    // 요일 색상
    const numClass = isHoliday||dow===0 ? 'sunday' : dow===6 ? 'saturday' : '';
    // 일일업무 뷰에서는 S.calEvents(일정) 표시 안 함
    html+=`<div class="cal-cell${isToday?' today':''}" onclick="showCalDetail('${ds}')">
      <div class="cal-num ${numClass}">${d}${lateCircles?`<span style="display:inline-flex;gap:1px;margin-left:2px;vertical-align:middle">${lateCircles}</span>`:''}
      </div>
      ${holidayName?`<div class="cal-holiday-name">${holidayName}</div>`:''}
      <div class="cal-dots">${dots}${more}</div>
    </div>`;
  }
  const trail=(7-((first+days)%7))%7;
  for(let i=1;i<=trail;i++) html+=`<div class="cal-cell other-month"><div class="cal-num">${i}</div></div>`;
  document.getElementById('cal-grid').innerHTML=html;
}

window._showCalDetail=window.showCalDetail=function(ds){
  const curUser = localStorage.getItem('currentUser')||'';
  const all=Object.entries(S.entries).map(([id,e])=>({...e,id}));
  // 날짜의 전체 항목 (팀 필터 적용)
  let de=all.filter(e=>e.date===ds);

  // 팀 필터 적용
  if(!S.calTeamFilters.has('전체')){
    de = de.filter(e=>{
      const grp = e.team||getMemberGroup(e.name);
      return S.calTeamFilters.has(grp);
    });
  }
  // 팀원 필터 적용
  if(S.calMemberFilter){
    de = de.filter(e=>e.name===S.calMemberFilter);
  }
  // 전체 필터이고 팀원 필터도 없으면 → 본인 것만 표시
  if(S.calTeamFilters.has('전체') && !S.calMemberFilter){
    de = de.filter(e=>e.name===curUser);
  }

  const det=document.getElementById('cal-detail');
  if(!de.length){det.style.display='none';return;}
  const[y,mo,d]=ds.split('-');
  document.getElementById('cal-detail-title').textContent=`${parseInt(mo)}월 ${parseInt(d)}일 (${de.length}건)`;
  document.getElementById('cal-detail-body').innerHTML=de.map(e=>{
    const proj=e.projectId&&S.projects[e.projectId];
    const timeStr=e.startTime&&e.endTime?e.startTime+' ~ '+e.endTime:e.startTime?e.startTime+' 시작':'';
    return `<div class="cal-entry">
      <div class="cal-entry-info">
        <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:2px">
          <span class="cal-entry-name">${e.name}</span>
          <span class="tag t${e.tag.replace(/ /g,'')}" style="font-size:9px">${e.tag}</span>
          ${proj?`<span style="font-size:9px;color:var(--blue-txt);background:var(--blue-bg);border:1px solid var(--blue-bd);border-radius:3px;padding:0 4px">${proj.name}</span>`:''}
        </div>
        ${timeStr?`<div style="font-size:9px;color:var(--text3);font-family:var(--mono);margin-bottom:2px">⏱ ${timeStr}</div>`:''}
        <div class="cal-entry-body">${e.task.replace(/</g,'&lt;')}</div>
      </div>
      <div class="cal-entry-acts">
        ${(e.name===localStorage.getItem('currentUser')||currentIsAdmin())?`
        <button class="act-btn" onclick="openEdit('${e.id}')">✏</button>
        <button class="act-btn" onclick="deleteEntry('${e.id}');showCalDetail('${ds}')">✕</button>`:''}
      </div>
    </div>`;
  }).join('');
  det.style.display='block';
}

window._goToToday=window.goToToday=function(){
  S.calYear=new Date().getFullYear(); S.calMonth=new Date().getMonth();
  renderCal(); showCalDetail(todayStr());
}
window._changeMonth=window.changeMonth=function(d){
  S.calMonth+=d;
  if(S.calMonth>11){S.calMonth=0;S.calYear++;}
  if(S.calMonth<0){S.calMonth=11;S.calYear--;}
  renderCal();
  if(S.calView==='schedule') renderScheduleGrid();
}
window._setFilter=window.setFilter=function(f,btn){
  S.filterTag=f;
  document.querySelectorAll('.fbtn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on'); render();
}
window._switchTab=window.switchTab=function(id,btn){
  document.querySelectorAll('.panel').forEach(p=>{ p.classList.remove('active'); p.style.display=''; });
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
  const targetPanel = document.getElementById('panel-'+id);
  targetPanel.classList.add('active');
  if(id==='board')    targetPanel.style.display='flex';
  if(id==='projects') targetPanel.style.display='flex';
  if(id==='todo')     targetPanel.style.display='flex';
  btn.classList.add('active');
  if(id==='stats') renderStats();
  if(id==='projects') renderProjList();
  if(id==='memo'){ updateMemoProj(); renderMemoTabs(); }
  if(id==='gantt') ganttRender();
  if(id==='alerts'){ renderAlertList(); }
  if(id==='todo'){ renderTodoTeamTabs(); renderTodoList(); }
}

// ── 일정표 → 프로젝트 탭 이동 + 이슈/히스토리 자동 열기 ──
window.goToProject = function(projId){
  if(!projId) return;
  // 프로젝트 탭 버튼 찾아서 switchTab 호출
  const tabBtn = document.querySelector('.tab[onclick*="projects"]');
  if(tabBtn) switchTab('projects', tabBtn);
  // renderProjList 완료 후 스크롤 & 히스토리 열기
  setTimeout(()=>{
    // 검색창 초기화해서 모든 항목 보이게
    const searchEl = document.getElementById('proj-search');
    if(searchEl){ searchEl.value=''; filterProjList(); }
    const item = document.getElementById('proj-item-'+projId);
    if(item){
      item.scrollIntoView({ behavior:'smooth', block:'center' });
      // 잠깐 하이라이트 효과
      item.style.transition = 'box-shadow 0.2s';
      item.style.boxShadow = '0 0 0 2px var(--blue)';
      setTimeout(()=>{ item.style.boxShadow=''; }, 1200);
    }
    // 이슈/히스토리 패널 열기
    const hist = document.getElementById('hist-'+projId);
    if(hist && !hist.classList.contains('open')){
      if(window._toggleHistory) window._toggleHistory(projId);
    }
    // 이미 열려있으면 타임라인만 갱신
    if(hist && hist.classList.contains('open')) renderProjTimeline(projId);
    // hist 패널로 추가 스크롤
    setTimeout(()=>{
      const histEl = document.getElementById('hist-'+projId);
      if(histEl && histEl.classList.contains('open')){
        histEl.scrollIntoView({ behavior:'smooth', block:'nearest' });
      }
    }, 200);
  }, 80);
};

window._filterProjList=window.filterProjList=function(){
  const q = document.getElementById('proj-search').value.trim().toLowerCase();
  document.querySelectorAll('.proj-item').forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = (!q || text.includes(q)) ? '' : 'none';
  });
}

// ── 사용자 선택 ──
// 멤버 목록 - Firebase 저장 (로컬 캐시 병행)