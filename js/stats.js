const S = window.S;

function renderStats(){
  const all=Object.values(S.entries);
  const curUser=localStorage.getItem('currentUser')||'';
  // 통계에서 '사내 행사 및 기타' 프로젝트 제외
  const STAT_EXCLUDE_PROJ = '사내 행사 및 기타';
  function isExcludedFromStats(e){
    if(!e.projectId) return false;
    const p = S.projects[e.projectId];
    return p && p.name === STAT_EXCLUDE_PROJ;
  }

  // ── 팀별 ──
  const personEl=document.getElementById('stats-person');
  const groupList = getGroupList();
  const members = getMemberList().filter(n=>n!=='어드민');

  // 멤버별 통계 먼저 계산
  const personMap={};
  all.forEach(e=>{
    if(isExcludedFromStats(e)) return;
    if(!e.name) return;
    if(!personMap[e.name]) personMap[e.name]={total:0,S.projects:{},totalMin:0};
    const pm=personMap[e.name]; pm.total++;
    const projName=e.projectId&&S.projects[e.projectId]?S.projects[e.projectId].name:'미지정';
    if(!pm.projects[projName]) pm.projects[projName]={count:0,dur:0};
    pm.projects[projName].count++;
    if(e.startTime&&e.endTime){
      const dur=Math.max(0,toMin(e.endTime)-toMin(e.startTime));
      pm.projects[projName].dur+=dur; pm.totalMin+=dur;
    }
  });

  // 팀별로 묶기
  const membersInGroups = new Set(groupList.flatMap(g=>g.members||[]));
  const ungroupedMembers = members.filter(n=>!membersInGroups.has(n));

  const renderMemberStats = (name, midx, prefix) => {
    const pm = personMap[name]||{total:0,S.projects:{},totalMin:0};
    const [bg,fg]=getColor(name);
    const projRows=Object.entries(pm.projects).map(([pname,pd])=>`
      <div class="proj-row">
        <span class="proj-row-name">${pname}</span>
        <span class="proj-row-cnt">${pd.count}건</span>
        <span class="proj-row-time">⏱ ${fmtDur(pd.dur)}</span>
      </div>`).join('');
    return `<div>
      <div class="acc-sub-header" onclick="toggleAcc('${prefix}m${midx}')">
        <div class="av" style="background:${bg};color:${fg};width:20px;height:20px;font-size:9px;flex-shrink:0">${initials(name)}</div>
        <span class="acc-sub-title">${name}</span>
        <span style="font-size:10px;color:var(--text3);font-family:var(--mono)">${pm.total}건 · ${fmtDur(pm.totalMin)}</span>
        <span class="acc-arrow" style="font-size:9px">▶</span>
      </div>
      <div class="acc-sub-body" id="acc-${prefix}m${midx}">
        ${projRows||'<div class="empty" style="font-size:10px">기록 없음</div>'}
      </div>
    </div>`;
  };

  let teamHtml = groupList.map((g,gi)=>{
    const gMembers = (g.members||[]).filter(n=>members.includes(n));
    const gTotal = gMembers.reduce((s,n)=>s+(personMap[n]?.total||0),0);
    const gMin   = gMembers.reduce((s,n)=>s+(personMap[n]?.totalMin||0),0);
    const memberHtml = gMembers.map((name,mi)=>renderMemberStats(name,mi,`g${gi}`)).join('');
    const [gbg] = COLORS[gi%COLORS.length]||['#2563eb'];
    return `<div>
      <div class="acc-header" onclick="toggleAcc('sg${gi}')">
        <div style="width:10px;height:10px;border-radius:3px;background:${gbg};flex-shrink:0"></div>
        <span class="acc-title">${g.name}</span>
        <span class="acc-sub">${gTotal}건 · ${fmtDur(gMin)}</span>
        <span class="acc-arrow">▶</span>
      </div>
      <div class="acc-body" id="acc-sg${gi}">
        ${memberHtml||'<div class="empty" style="font-size:10px">멤버 없음</div>'}
      </div>
    </div>`;
  }).join('');

  if(ungroupedMembers.length){
    const ugHtml = ungroupedMembers.map((name,mi)=>renderMemberStats(name,mi,'ug')).join('');
    teamHtml += `<div>
      <div class="acc-header" onclick="toggleAcc('sug')">
        <div style="width:10px;height:10px;border-radius:3px;background:var(--text3);flex-shrink:0"></div>
        <span class="acc-title" style="color:var(--text3)">미배정</span>
        <span class="acc-arrow">▶</span>
      </div>
      <div class="acc-body" id="acc-sug">${ugHtml}</div>
    </div>`;
  }

  personEl.innerHTML = teamHtml||'<div class="empty">그룹을 먼저 생성해주세요</div>';

  // ── 프로젝트별 ──
  const projMap={};
  all.forEach(e=>{
    if(isExcludedFromStats(e)) return;
    const pid=e.projectId||'__none__';
    const pname=e.projectId&&S.projects[e.projectId]?S.projects[e.projectId].name:'미지정';
    if(!projMap[pid]) projMap[pid]={name:pname,persons:{},totalMin:0,count:0};
    const pm=projMap[pid]; pm.count++;
    if(!pm.persons[e.name]) pm.persons[e.name]={count:0,dur:0};
    pm.persons[e.name].count++;
    if(e.startTime&&e.endTime){
      const dur=Math.max(0,toMin(e.endTime)-toMin(e.startTime));
      pm.persons[e.name].dur+=dur; pm.totalMin+=dur;
    }
  });
  const projEl=document.getElementById('stats-proj');
  if(projEl) projEl.style.display='block';
  const projArr=Object.entries(projMap).sort((a,b)=>b[1].totalMin-a[1].totalMin);
  window._statsProjArr = projArr; // 검색 필터용 전역 저장
  renderStatsProjList(projArr);

  // ── 월별 ──
  const monthMap={};
  all.forEach(e=>{
    if(!e.date) return;
    if(isExcludedFromStats(e)) return;
    const ym=e.date.slice(0,7);
    if(!monthMap[ym]) monthMap[ym]={};
    const mData=monthMap[ym];
    if(!mData[e.name]) mData[e.name]={S.projects:{},days:new Set(),totalMin:0};
    const pd=mData[e.name];
    pd.days.add(e.date);
    const pname=e.projectId&&S.projects[e.projectId]?S.projects[e.projectId].name:'미지정';
    if(!pd.projects[pname]) pd.projects[pname]=0;
    if(e.startTime&&e.endTime){
      const dur=Math.max(0,toMin(e.endTime)-toMin(e.startTime));
      pd.projects[pname]+=dur; pd.totalMin+=dur;
    } else { pd.projects[pname]+=0; }
  });
  const monthEl=document.getElementById('stats-month');
  const monthArr=Object.entries(monthMap).sort((a,b)=>b[0].localeCompare(a[0]));
  if(!monthArr.length){monthEl.innerHTML='<div class="empty">데이터가 없습니다</div>';}
  else monthEl.innerHTML=monthArr.map(([ym,persons],midx)=>{
    const[y,m]=ym.split('-');
    const totalPeople=Object.keys(persons).length;

    // 그룹별로 멤버 묶기
    const groups = getGroupList();
    // 각 그룹에 속한 persons 모으기
    const groupPersonMap = {};
    groups.forEach(g=>{
      groupPersonMap[g.id]={ name: g.name, members: {} };
    });
    groupPersonMap['__none__'] = { name: '미배정', members: {} };

    Object.entries(persons).forEach(([name, pd])=>{
      let placed = false;
      for(const g of groups){
        if((g.members||[]).includes(name)){
          groupPersonMap[g.id].members[name] = pd;
          placed = true; break;
        }
      }
      if(!placed) groupPersonMap['__none__'].members[name] = pd;
    });

    const groupItems = Object.entries(groupPersonMap).filter(([gid,gd])=>Object.keys(gd.members).length>0).map(([gid,gd],gidx)=>{
      const memberItems = Object.entries(gd.members).map(([name,pd],pidx)=>{
        const[bg,fg]=getColor(name);
        const projRows=Object.entries(pd.projects).map(([pname,dur])=>`
          <div class="proj-row">
            <span class="proj-row-name">${pname}</span>
            <span class="proj-row-cnt">${pd.days.size}일</span>
            <span class="proj-row-time">⏱ ${fmtDur(dur)}</span>
          </div>`).join('');
        return `<div>
          <div class="acc-sub-header" onclick="toggleAcc('mo${midx}g${gidx}p${pidx}')">
            <div class="av" style="background:${bg};color:${fg};width:20px;height:20px;font-size:9px;flex-shrink:0">${initials(name)}</div>
            <span class="acc-sub-title">${name}</span>
            <span style="font-size:10px;color:var(--text3);font-family:var(--mono)">${pd.days.size}일 · ${fmtDur(pd.totalMin)}</span>
            <span class="acc-arrow" style="font-size:9px">▶</span>
          </div>
          <div class="acc-sub-body" id="acc-mo${midx}g${gidx}p${pidx}">
            ${projRows}
          </div>
        </div>`;
      }).join('');
      const groupTotalMin = Object.values(gd.members).reduce((s,pd)=>s+pd.totalMin,0);
      const groupTotalDays = new Set(Object.values(gd.members).flatMap(pd=>[...pd.days])).size;
      return `<div>
        <div class="acc-sub-header" onclick="toggleAcc('mo${midx}g${gidx}')" style="background:var(--surface2);border-radius:6px;margin-bottom:2px;">
          <span style="font-size:10px;font-weight:700;color:var(--text);">👥 ${gd.name}</span>
          <span style="font-size:10px;color:var(--text3);font-family:var(--mono);margin-left:auto;">${Object.keys(gd.members).length}명 · ${fmtDur(groupTotalMin)}</span>
          <span class="acc-arrow" style="font-size:9px">▶</span>
        </div>
        <div class="acc-sub-body" id="acc-mo${midx}g${gidx}" style="padding-left:8px;">
          ${memberItems}
        </div>
      </div>`;
    }).join('');

    return `<div>
      <div class="acc-header" onclick="toggleAcc('mo${midx}')">
        <span class="acc-title">${parseInt(y)}년 ${parseInt(m)}월</span>
        <span class="acc-sub">${totalPeople}명</span>
        <span class="acc-arrow">▶</span>
      </div>
      <div class="acc-body" id="acc-mo${midx}">
        ${groupItems}
      </div>
    </div>`;
  }).join('');
}

// ── 팀 필터 바 일괄 렌더 ──
function renderStatsProjList(arr){
  const projEl = document.getElementById('stats-proj');
  if(!projEl) return;
  if(!arr.length){ projEl.innerHTML='<div class="empty">데이터가 없습니다</div>'; return; }
  projEl.innerHTML = arr.map(([pid,pm],idx)=>{
    const color=pid==='__none__'?'#9ca3af':PROJ_COLORS[Object.keys(S.projects).indexOf(pid)%PROJ_COLORS.length]||'#9ca3af';
    const personRows=Object.entries(pm.persons).sort((a,b)=>b[1].dur-a[1].dur).map(([name,pd])=>`
      <div class="proj-row">
        <span class="proj-row-name">${name}</span>
        <span class="proj-row-cnt">${pd.count}건</span>
        <span class="proj-row-time">⏱ ${fmtDur(pd.dur)}</span>
      </div>`).join('');
    return `<div>
      <div class="acc-header" onclick="toggleAcc('pj${idx}')">
        <div style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0"></div>
        <span class="acc-title">${pm.name}</span>
        <span class="acc-sub">${pm.count}건 · ${fmtDur(pm.totalMin)}</span>
        <span class="acc-arrow">▶</span>
      </div>
      <div class="acc-body" id="acc-pj${idx}">
        <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:3px">담당자별</div>
        ${personRows}
      </div>
    </div>`;
  }).join('');
}

// ── 통계 프로젝트 검색 ──
window.statsFilterProj = function(){
  const q = (document.getElementById('stats-proj-search')?.value||'').trim().toLowerCase();
  const all = window._statsProjArr || [];
  const dd = document.getElementById('stats-proj-dd');
  if(!dd) return;
  if(!q){
    // 검색어 없으면 드롭다운 목록 전체 표시
    dd.innerHTML = all.map(([pid,pm])=>
      `<div class="proj-search-item" onmousedown="statsSelectProj(event,'${pm.name.replace(/'/g,"\\'")}')">${pm.name}</div>`
    ).join('') || '<div class="proj-search-empty">데이터 없음</div>';
    renderStatsProjList(all);
    return;
  }
  const filtered = all.filter(([pid,pm])=>pm.name.toLowerCase().includes(q));
  dd.innerHTML = filtered.map(([pid,pm])=>
    `<div class="proj-search-item" onmousedown="statsSelectProj(event,'${pm.name.replace(/'/g,"\\'")}')">${pm.name}</div>`
  ).join('') || '<div class="proj-search-empty">검색 결과 없음</div>';
  renderStatsProjList(filtered);
};
window.statsOpenProjDd = function(){
  const dd = document.getElementById('stats-proj-dd');
  const all = window._statsProjArr || [];
  if(!dd || !all.length) return;
  dd.innerHTML = all.map(([pid,pm])=>
    `<div class="proj-search-item" onmousedown="statsSelectProj(event,'${pm.name.replace(/'/g,"\\'")}')">${pm.name}</div>`
  ).join('');
  dd.style.display = 'block';
};
window.statsCloseProjDd = function(){
  const dd = document.getElementById('stats-proj-dd');
  if(dd) dd.style.display = 'none';
  // 검색어 없으면 전체 목록 복원
  const inp = document.getElementById('stats-proj-search');
  if(inp && !inp.value.trim()){
    const all = window._statsProjArr || [];
    renderStatsProjList(all);
  }
};
window.statsSelectProj = function(e, name){
  e.preventDefault();
  const inp = document.getElementById('stats-proj-search');
  if(inp) inp.value = name;
  const all = window._statsProjArr || [];
  const filtered = all.filter(([pid,pm])=>pm.name === name);
  renderStatsProjList(filtered.length ? filtered : all);
  const dd = document.getElementById('stats-proj-dd');
  if(dd) dd.style.display = 'none';
};


// ── 달력 ──
function renderCmpMonths(){
  document.getElementById('cmp-year').textContent=S._cmpYear+'년';
  const months=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  document.getElementById('cmp-months').innerHTML=months.map((m,i)=>{
    const isCur=S._cmpYear===S.calYear&&i===S.calMonth;
    return `<button onclick="cmpSelectMonth(${i})" style="padding:6px 2px;border-radius:6px;border:1px solid ${isCur?'var(--blue)':'var(--border)'};background:${isCur?'var(--blue)':'var(--surface)'};color:${isCur?'#fff':'var(--text)'};font-size:11px;cursor:pointer;font-family:var(--font);font-weight:${isCur?700:400};transition:all .1s;">${m}</button>`;
  }).join('');
}
window.cmpSelectMonth = function(m){
  S.calYear=S._cmpYear; S.calMonth=m;
  renderCal();
  closeCalMonthPicker();
};

// ── 업무탭 날짜 선택 달력 ──
// [state: let S._bdpYear = new Date().getFullYear();]
// [state: let S._bdpMonth = new Date().getMonth();]
window.openBoardDatePicker = function(){
  // 현재 선택된 S.viewDate 기준으로 열기
  const vd = window._getViewDate ? window._getViewDate() : (S.viewDate || todayStr());
  const cur = new Date(vd);
  S._bdpYear = cur.getFullYear();
  S._bdpMonth = cur.getMonth();
  renderBdpGrid();
  const bg = document.getElementById('board-date-picker-bg');
  bg.style.display='flex';
};
window.closeBoardDatePicker = function(){
  document.getElementById('board-date-picker-bg').style.display='none';
};
window.bdpChangeMonth = function(d){
  S._bdpMonth+=d;
  if(S._bdpMonth>11){S._bdpMonth=0;S._bdpYear++;}
  if(S._bdpMonth<0){S._bdpMonth=11;S._bdpYear--;}
  renderBdpGrid();
};
window.bdpSelectToday = function(){
  S.viewDate=todayStr(); updateViewDateLabel(); render();
  closeBoardDatePicker();
};