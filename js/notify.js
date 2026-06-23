const S = window.S;

function updateNotifyBtn(){
  const btn = document.getElementById('notify-toggle-btn');
  if(!btn) return;
  btn.textContent = S._notifyEnabled ? '🔔' : '🔕';
  btn.style.opacity = S._notifyEnabled ? '1' : '0.4';
  btn.title = S._notifyEnabled ? '알림 켜짐 (클릭하면 끔)' : '알림 꺼짐 (클릭하면 켬)';
}


window.toggleNotify = function(){
  S._notifyEnabled = !S._notifyEnabled;
  localStorage.setItem('notifyEnabled', S._notifyEnabled);
  updateNotifyBtn();
}

function sendNotify(title, body){
  if(!S._notifyEnabled) return;
  if(window.electronAPI && window.electronAPI.notify){
    window.electronAPI.notify(title, body);
  }
}

// 업무 새 글 감지
function checkNewEntries(newEntries){
  const curUser = localStorage.getItem('currentUser')||'';
  const newKeys = Object.keys(newEntries);
  if(S._prevEntryKeys === null){ S._prevEntryKeys = new Set(newKeys); return; }
  newKeys.forEach(k=>{
    if(!S._prevEntryKeys.has(k)){
      const e = newEntries[k];
      if(e.name !== curUser){
        const projName = e.projectId&&S.projects[e.projectId]?` [${S.projects[e.projectId].name}]`:'';
        sendNotify(`📋 ${e.name}님이 업무를 등록했어요${projName}`, e.task?e.task.slice(0,60):'');
      }
    }
  });
  S._prevEntryKeys = new Set(newKeys);
}

// 이슈/히스토리 새 글 감지
function checkNewHistory(projId, newItems){
  const curUser = localStorage.getItem('currentUser')||'';
  const prevKeys = S._prevHistorySnap[projId] || null;
  const newKeys = Object.keys(newItems||{});
  if(prevKeys === null){ S._prevHistorySnap[projId] = new Set(newKeys); return; }
  newKeys.forEach(k=>{
    if(!prevKeys.has(k)){
      const h = newItems[k];
      if(h.author !== curUser){
        const projName = S.projects[projId]?S.projects[projId].name:'프로젝트';
        sendNotify(`💬 ${h.author}님이 이슈를 등록했어요 [${projName}]`, h.text?h.text.slice(0,60):'');
      }
    }
  });
  S._prevHistorySnap[projId] = new Set(newKeys);
}

// 초기 버튼 상태 설정
setTimeout(updateNotifyBtn, 500);

// ── 프로젝트 검색 ──
window.openProjSearch = function(){
  renderProjSearchList('');
  document.getElementById('proj-search-dropdown').classList.add('open');
}
window.closeProjSearch = function(){
  document.getElementById('proj-search-dropdown').classList.remove('open');
}
window.filterProjSearch = function(){
  const q = document.getElementById('proj-search-input').value;
  renderProjSearchList(q);
  document.getElementById('proj-search-dropdown').classList.add('open');
}
function renderProjSearchList(q){
  const dd = document.getElementById('proj-search-dropdown');
  if(!dd) return;
  const sorted = Object.entries(S.projects).sort((a,b)=>(a[1].name||'').localeCompare(b[1].name||'','ko'));
  const filtered = q
    ? sorted.filter(([id,p])=>(p.name||'').includes(q)||(p.code||'').includes(q))
    : sorted;
  if(!filtered.length){
    dd.innerHTML = '<div class="proj-search-empty">검색 결과 없음</div>';
    return;
  }
  const curVal = document.getElementById('inp-proj').value;
  dd.innerHTML = [['','프로젝트 선택'],...filtered.map(([id,p])=>[id,p.name])].map(([id,name])=>`
    <div class="proj-search-item${id===curVal?' selected':''}" onmousedown="selectProjSearch('${id}','${name.replace(/'/g,"\'")}')">
      ${name}
    </div>`).join('');
}
window.selectProjSearch = function(id, name){
  document.getElementById('inp-proj').value = id;
  document.getElementById('proj-search-input').value = id ? name : '';
  document.getElementById('proj-search-dropdown').classList.remove('open');
}
// updateProjSelects 후 검색창 초기화
const _origUpdateProjSelects = updateProjSelects;

// ── 자동 업데이트 체크 ──
const APP_VERSION = '1.0.0';

function checkForUpdate(){
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

function showUpdateBanner(version, url, note){
  // 이미 배너 있으면 제거
  const existing = document.getElementById('update-banner');
  if(existing) existing.remove();

  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.style.cssText = `position:fixed;top:0;left:0;right:0;z-index:99999;background:var(--blue);color:#fff;padding:8px 14px;display:flex;align-items:center;gap:8px;font-size:12px;font-family:var(--font);border-radius:16px 16px 0 0;`;
  banner.innerHTML = `
    <span style="flex:1">🆕 새 버전 ${version}이 출시되었어요! ${note?'<span style="opacity:.8;font-size:10px">'+note+'</span>':''}`;
  if(url){
    banner.innerHTML += `<button onclick="window.open('${url}')" style="background:#fff;color:var(--blue);border:none;border-radius:5px;padding:3px 10px;font-size:11px;cursor:pointer;font-family:var(--font);font-weight:700;">다운로드</button>`;
  }
  banner.innerHTML += `<button onclick="document.getElementById('update-banner').remove()" style="background:none;border:none;color:#fff;font-size:14px;cursor:pointer;opacity:.7;padding:0 4px;">✕</button>`;
  document.body.appendChild(banner);
}

// 앱 시작 시 업데이트 체크
setTimeout(checkForUpdate, 2000);

// ── 메모 프로젝트 검색 ──
window.openMemoProjSearch = function(){
  renderMemoProjSearchList('');
  document.getElementById('memo-proj-search-dropdown').classList.add('open');
}
window.closeMemoProjSearch = function(){
  document.getElementById('memo-proj-search-dropdown').classList.remove('open');
}
window.filterMemoProjSearch = function(){
  const q = document.getElementById('memo-proj-search-input').value;
  renderMemoProjSearchList(q);
  document.getElementById('memo-proj-search-dropdown').classList.add('open');
}
function renderAlertList(){
  const el = document.getElementById('alert-list');
  if(!el) return;
  const curUser = localStorage.getItem('currentUser')||'';
  const all = Object.entries(S.userAlerts)
    .map(([id,a])=>({...a,id}))
    .filter(a=>a.author===curUser)
    .sort((a,b)=>(a.datetime||'').localeCompare(b.datetime||''));
  if(!all.length){ el.innerHTML='<div class="empty">예약된 알림이 없습니다</div>'; updateAlertBadge([]); return; }
  const now = new Date().toISOString().slice(0,16);
  el.innerHTML = all.map(a=>{
    const isPast = (a.datetime||'') < now || a.notified;
    return `<div class="alert-card${isPast?' past':''}">
      <div style="font-size:18px;flex-shrink:0;">⏰</div>
      <div class="alert-info">
        <div class="alert-time">${(a.datetime||'').replace('T',' ')}</div>
        <div class="alert-content">${a.content.replace(/</g,'&lt;')}</div>
      </div>
      <div class="alert-acts">
        <button class="act-btn" onclick="openAlertAddModal('${a.id}')" title="수정">✏</button>
        <button class="act-btn" onclick="deleteAlert('${a.id}')" title="삭제">✕</button>
      </div>
    </div>`;
  }).join('');

  // 뱃지: notified 아님 + 아직 시간 안 된 것만
  const upcoming = all.filter(a => !a.notified && (a.datetime||'') >= now);
  updateAlertBadge(upcoming);
}

function updateAlertBadge(upcoming){
  const badge = document.getElementById('alert-tab-badge');
  if(!badge) return;
  if(upcoming.length){
    badge.style.display='inline-flex';
    badge.textContent = upcoming.length;
  } else {
    badge.style.display='none';
    badge.textContent = '0';
  }
}

function checkAlerts(){
  const curUser = localStorage.getItem('currentUser')||'';
  if(!curUser) return;
  const now = new Date();
  const nowMs = now.getTime();
  Object.entries(S.userAlerts).forEach(([id,a])=>{
    if(a.author !== curUser) return;
    if(a.notified) return;
    const dt = a.datetime||'';
    if(!dt) return;
    // 날짜 파싱: "YYYY-MM-DDTHH:mm" 형식
    const alertMs = new Date(dt).getTime();
    // 알림 시각 지났고 2분 이내면 발동 (놓친 알림 포함)
    if(alertMs <= nowMs && nowMs - alertMs < 2 * 60 * 1000){
      if(window.electronAPI) window.electronAPI.notify('⏰ 알림', a.content);
      window._fb.update('userAlerts/'+id, { notified: true });
    }
  });
}

// 15초마다 체크 (1분 간격 → 놓침 방지)
// [app.js]

// ══════════════════════════════════════════
// ── 📣 호출 기능 ──
// ══════════════════════════════════════════
// [app.js: const callsRef = ref(db, 'calls');]
// [app.js: const dndRef   = ref(db, 'dndStatus');]
// [state: let S._dndMode = false;]
// [state: let S._callTargetName = '';]
// [state: let S._callTargetGroup = '';]
// [state: let S._incomingCallId = '';]
// [state: let S._dndCache = {};]
// [state: let S._absenceCache = {}; // 부재중 상태 (마우스 비활성)]
// [state: let S._lastMouseMove = Date.now();]

// 마우스 움직임 추적 (5분 미사용 = 부재중)
// [app.js]

// 30초마다 부재중 상태를 Firebase에 업데이트
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]

// 부재중 상태 수신
// [app.js]
// [app.js]
// [app.js]

// DND 상태 수신
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]

// 호출 수신 감지
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

function updateDndBtn(){
  const btn = document.getElementById('dnd-toggle-btn');
  if(!btn) return;
  if(S._dndMode){
    btn.textContent='ON 🚫';
    btn.style.background='var(--red-bg)';
    btn.style.color='var(--red-txt)';
    btn.style.border='1px solid var(--red-bd)';
  } else {
    btn.textContent='OFF';
    btn.style.background='var(--surface)';
    btn.style.color='var(--text3)';
    btn.style.border='1px solid var(--border2)';
  }
}

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
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]

function renderCallGroups(){
  const el = document.getElementById('call-group-list');
  if(!el) return;
  const groups = getGroupList();
  if(!groups.length){ el.innerHTML='<div style="font-size:11px;color:var(--text3);">그룹이 없습니다</div>'; return; }
  el.innerHTML = groups.map(g=>{
    const safeName = g.name.replace(/'/g,"\\'").replace(/"/g,'&quot;');
    return `
    <button onclick="callSelectGroup('${g.id}','${safeName}')" style="width:100%;text-align:left;padding:8px 10px;border-radius:8px;background:var(--surface2);border:1px solid var(--border);cursor:pointer;font-size:12px;font-weight:600;color:var(--text);font-family:var(--font);transition:background .1s;" onmouseover="this.style.background='var(--blue-bg)'" onmouseout="this.style.background='var(--surface2)'">
      👥 ${g.name} <span style="font-size:10px;color:var(--text3);font-weight:400;">${(g.members||[]).length}명</span>
    </button>`;
  }).join('');
}

window.callSelectGroup = function(gid, gname){
  S._callTargetGroup = gid;
  document.getElementById('call-selected-group-name').textContent = gname;
  const groups = getGroups();
  const g = groups[gid];
  const members = g ? (g.members||[]) : [];
  const curUser = localStorage.getItem('currentUser')||'';
  const el = document.getElementById('call-member-list');
  if(!members.length){ el.innerHTML='<div style="font-size:11px;color:var(--text3);">멤버가 없습니다</div>'; }
  else {
    el.innerHTML = members.filter(n=>n!==curUser).map(name=>{
      const [bg,fg] = getColor(name);
      // 커스텀 상태 표시 (외근/회의/휴가)
      const _rawStatus = S._memberStatusCache[name]||'';
      const memberStatus = (typeof _rawStatus === 'object') ? (_rawStatus.status||'') : _rawStatus;
      const statusIcons = {'외근':'🚗','회의':'💬','휴가':'🏖'};
      let statusBadge = '';
      if(memberStatus){
        statusBadge = `<span style="font-size:9px;background:var(--amber-bg);color:var(--amber-txt);border:1px solid var(--amber-bd);border-radius:99px;padding:0 5px;">${statusIcons[memberStatus]||''} ${memberStatus}</span>`;
      }
      return `<button onclick="callMemberDirect('${name}')" style="width:100%;display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;background:var(--surface);border:1px solid var(--border);cursor:pointer;font-family:var(--font);transition:background .1s;"
        onmouseover="this.style.background='var(--blue-bg)'" onmouseout="this.style.background='var(--surface)'">
        <div class="av" style="background:${bg};color:${fg};width:24px;height:24px;font-size:10px;flex-shrink:0;">${name.slice(0,2)}</div>
        <span style="font-size:12px;font-weight:600;color:var(--text);flex:1;">${name}</span>
        ${statusBadge}
      </button>`;
    }).join('');
  }
  document.getElementById('call-step-groups').style.display='none';
  document.getElementById('call-step-members').style.display='';
};

window.callMemberDirect = function(name){
  S._callTargetName = name;
  document.getElementById('call-target-name-lbl').textContent = name;
  document.getElementById('call-reason-input').value = '';
  document.getElementById('call-step-members').style.display='none';
  document.getElementById('call-step-reason').style.display='';
};

window.callBackToGroups = function(){
  document.getElementById('call-step-members').style.display='none';
  document.getElementById('call-step-groups').style.display='';
};
window.callBackToMembers = function(){
  document.getElementById('call-step-reason').style.display='none';
  document.getElementById('call-step-members').style.display='';
};

// 상태 드롭다운
// [state: let S._memberStatusCache = {};]
// [app.js: const memberStatusRef = ref(db,'memberStatus');]
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
window.toggleMyStatusDd = function(){
  const dd = document.getElementById('my-status-dd');
  if(!dd) return;
  dd.style.display = dd.style.display==='none' ? 'block' : 'none';
  if(dd.style.display==='block'){
    setTimeout(()=>{
      const h = function(e){ if(!dd.contains(e.target) && e.target.id!=='my-status-btn'){ dd.style.display='none'; document.removeEventListener('click',h); } };
// [app.js]
    },0);
  }
};
window.setMyStatus = function(status){
  const curUser = localStorage.getItem('currentUser')||'';
  if(!curUser) return;
  const dd = document.getElementById('my-status-dd');
  if(dd) dd.style.display='none';
  const btn = document.getElementById('my-status-btn');
  const icons = {'외근':'🚗','회의':'💬','휴가':'🏖'};
  if(btn) btn.textContent = status ? `${icons[status]||''} ${status}` : '🟢 상태';
  window._fb.update('memberStatus', { [curUser]: status||null });
};

// 불가능 입력창 토글
window.toggleCallReplyInput = function(){
  const area = document.getElementById('call-reply-input-area');
  if(area) area.style.display = area.style.display==='none' ? 'block' : 'none';
};
// 불가능 + 사유 전송
window.respondCallWithReason = function(){
  const ta = document.getElementById('call-reply-text');
  const reason = ta ? ta.value.trim() : '';
  respondCall('불가능' + (reason ? ': '+reason : ''));
  if(ta) ta.value='';
};

window.sendCall = function(){
  const reason = document.getElementById('call-reason-input').value.trim();
  if(!reason){ document.getElementById('call-reason-input').focus(); return; }
  const curUser = localStorage.getItem('currentUser')||'';
  push(callsRef, {
    from: curUser,
    to: S._callTargetName,
    reason,
    ts: Date.now(),
    response: null,
    responseRead: false
  });
  closeCallModal();
  // 발신자 화면에 간단 토스트
  showToast('📣 ' + S._callTargetName + '님에게 호출을 전송했습니다.');
};

function showIncomingCall(id, c){
  if(S._incomingCallId === id) return; // 이미 표시 중
  S._incomingCallId = id;
  document.getElementById('call-incoming-from').textContent = c.from + '님이 호출했습니다';
  document.getElementById('call-incoming-reason').textContent = '사유: ' + c.reason;
  document.getElementById('call-incoming-popup').style.display='block';
  // Electron 알림
  if(window.electronAPI) window.electronAPI.notify('📣 호출', c.from + '님: ' + c.reason);
}

window.respondCall = function(response){
  if(!S._incomingCallId) return;
  window._fb.update('calls/'+S._incomingCallId, { response, responseRead: false });
  document.getElementById('call-incoming-popup').style.display='none';
  S._incomingCallId = '';
};

window.dismissCallIncoming = function(){
  document.getElementById('call-incoming-popup').style.display='none';
  S._incomingCallId = '';
};

function showCallResponse(id, c){
  // 읽음 처리
  window._fb.update('calls/'+id, { responseRead: true });
  const text = c.to + '님이 <b style="color:' + (c.response==='가능'?'var(--green-txt)':'var(--red-txt)') + ';">' + c.response + '</b>으로 응답했습니다.';
  document.getElementById('call-response-text').innerHTML = text;
  document.getElementById('call-response-popup').style.display='block';
  if(window.electronAPI) window.electronAPI.notify('📨 호출 응답', c.to + '님: ' + c.response);
}

// 토스트 메시지
function showToast(msg){
  let t = document.getElementById('call-toast');
  if(!t){
    t = document.createElement('div');
    t.id = 'call-toast';
    t.style.cssText = 'position:fixed;bottom:80px;right:20px;z-index:14000;background:var(--text);color:#fff;font-size:11px;padding:7px 14px;border-radius:99px;box-shadow:0 4px 14px rgba(0,0,0,.22);transition:opacity .3s;font-family:var(--font);pointer-events:none;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity='1';
  setTimeout(()=>{ t.style.opacity='0'; }, 2500);
}

// onclick 인라인에서 callMemberDirect 호출 가능하도록
window.callMemberDirect = window.callMemberDirect;

window.openAlertAddModal = function(S.editId){
  const modal = document.getElementById('alert-modal-bg');
  const editIdInp = document.getElementById('alert-edit-id');
  if(S.editId && S.userAlerts[S.editId]){
    const a = S.userAlerts[S.editId];
    const dt = (a.datetime||'').split('T');
    document.getElementById('alert-date').value = dt[0]||'';
    document.getElementById('alert-time').value = dt[1]||'09:00';
    document.getElementById('alert-content').value = a.content||'';
    editIdInp.value = S.editId;
  } else {
    document.getElementById('alert-date').value = todayStr();
    document.getElementById('alert-time').value = '09:00';
    document.getElementById('alert-content').value = '';
    editIdInp.value = '';
  }
  modal.classList.add('open');
};

window.closeAlertModal = function(){
  document.getElementById('alert-modal-bg').classList.remove('open');
};

window.saveAlert = function(){
  const date = document.getElementById('alert-date').value;
  const time = document.getElementById('alert-time').value;
  const content = document.getElementById('alert-content').value.trim();
  const S.editId = document.getElementById('alert-edit-id').value;
  if(!date||!content){ alert('날짜와 내용을 입력해주세요'); return; }
  const author = localStorage.getItem('currentUser')||'익명';
  const datetime = date + 'T' + (time||'09:00');
  if(S.editId){
    window._fb.update('userAlerts/'+S.editId, { datetime, content, notified: false });
  } else {
    push(alertsRef, { author, datetime, content, notified: false, ts: Date.now() });
  }
  closeAlertModal();
};

window.deleteAlert = function(id){
  if(!confirm('알림을 삭제하시겠습니까?')) return;
  window._fb.remove('userAlerts/'+id);
};

// ══════════════════════════════════════════
// ── 일정표 인쇄/PDF ──
// ══════════════════════════════════════════
window.ganttPrint = function(){
  const chartEl = document.getElementById('gantt-chart');
  if(!chartEl||!chartEl.innerHTML){ alert('일정표 데이터가 없습니다'); return; }

  // CSS 변수 → 실제 값 치환
  const styleMap = {
    'var(--blue-bg)':'#eff4ff','var(--blue-txt)':'#1d4ed8','var(--blue-bd)':'#bfdbfe',
    'var(--amber-bg)':'#fffbeb','var(--amber-txt)':'#b45309','var(--amber-bd)':'#fde68a',
    'var(--green-bg)':'#f0fdf4','var(--green-txt)':'#15803d','var(--green-bd)':'#bbf7d0',
    'var(--surface2)':'#f0efe9','var(--text3)':'#9e9b91','var(--border2)':'#c8c5ba',
    'var(--surface)':'#ffffff','var(--border)':'#e2e0d8','var(--text)':'#1a1916','var(--text2)':'#5a5750',
    'var(--radius)':'9px','var(--font)':'나눔스퀘어,sans-serif',
  };

  let chartHtml = chartEl.innerHTML;
  // style 속성 내 CSS 변수 치환
  chartHtml = chartHtml.replace(/style="([^"]*)"/g, (match, styleStr) => {
    let s = styleStr;
    Object.entries(styleMap).forEach(([k,v])=>{ s = s.split(k).join(v); });
    return `style="${s}"`;
  });

  const printHtml = `<!DOCTYPE html><html><head>
    <meta charset="UTF-8"/>
    <title>EXHEOH 일정표</title>
    
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { width: 100%; background: #fff; }
      body { font-family: 'Noto Sans KR', 'Noto Sans KR', sans-serif; font-size: 10px; color: #1a1916; padding: 10px 12px; }
      h3 { font-size: 12px; font-weight: 700; margin-bottom: 8px; }
      #scale-wrap { transform-origin: top left; }
      table { border-collapse: collapse; table-layout: fixed; font-size: 9px; }
      th, td { border: 1px solid #e2e0d8; padding: 2px 4px; white-space: nowrap; height: 36px; overflow: hidden; }
      thead th { background: #f0efe9 !important; font-weight: 700; color: #5a5750; text-align: center; vertical-align: middle; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tbody td { background: #fff; vertical-align: middle; }
      .gantt-th-fixed { background: #f0efe9 !important; font-weight: 700; color: #5a5750; text-align: center; vertical-align: middle; }
      .gantt-th-month { background: #e8e6de !important; font-weight: 700; text-align: center; color: #374151; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .gantt-th-time  { background: #f0efe9 !important; text-align: center; color: #6b7280; font-size: 8px; }
      .prog-badge  { display:inline-block; font-size:8px; padding:1px 4px; border-radius:3px; font-weight:700; border:1px solid transparent; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .prog-1차송부 { background:#eff4ff !important; color:#1d4ed8; border-color:#bfdbfe; }
      .prog-2차송부 { background:#f0fdf4 !important; color:#15803d; border-color:#bbf7d0; }
      .prog-납품    { background:#f5f3ff !important; color:#6d28d9; border-color:#ddd6fe; }
      .prog-리비전  { background:#fef2f2 !important; color:#b91c1c; border-color:#fecaca; }
      .prog-none    { background:#f3f4f6 !important; color:#9ca3af; border-color:#e5e7eb; }
      .gantt-cell  { background: #fff; padding: 0; }
      .gantt-bar-cell { padding: 12px 2px 2px; overflow: visible !important; position: relative; vertical-align: bottom; }
      .gantt-bar   { height: 15px; border-radius: 3px; display: flex; align-items: center; padding: 0 3px; font-size: 7px; font-weight: 700; color: #fff; overflow: hidden; width: 100%; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .today-col   { background: #fef9f0 !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .gantt-today-col-header { background: #fde68a !important; color: #92400e !important; font-weight: 700; }
      .gantt-del-btn, button { display: none !important; }
      @media print {
        @page { size: landscape; margin: 6mm 8mm; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    
/* ── 할일 완료 시각적 구분 ── */
.todo-card.done {
  opacity: 0.45;
  border-style: dashed !important;
}
.todo-card.done .todo-text {
  text-decoration: line-through;
  color: var(--text3);
}

/* ── 검색결과 카드 호버 ── */
#board-search-results .card:hover {
  border-color: var(--blue-bd) !important;
  box-shadow: 0 2px 8px rgba(37,99,235,.1) !important;
}

/* ── AI 채팅 패널 ── */
.ai-chat-panel {
  display:none !important; position:fixed; top:0; right:0; width:380px; height:100vh;
  background:var(--bg); border-left:1px solid var(--border);
  box-shadow:-4px 0 24px rgba(0,0,0,.1);
  z-index:1000; flex-direction:column;
  font-family:var(--font);
}
.ai-chat-panel-header {
  display:flex; align-items:center; gap:8px;
  padding:13px 14px; border-bottom:1px solid var(--border);
  background:var(--surface); flex-shrink:0;
}
.ai-chat-panel-avatar {
  width:32px; height:32px; border-radius:50%;
  background:linear-gradient(135deg,#2563eb,#7c3aed);
  display:flex; align-items:center; justify-content:center;
  font-size:16px; flex-shrink:0;
}
.ai-chat-panel-title { font-size:14px; font-weight:700; color:var(--text); }
.ai-chat-panel-sub { font-size:10px; color:var(--text3); }
.ai-chat-panel-close {
  margin-left:auto; background:none; border:none; cursor:pointer;
  width:28px; height:28px; border-radius:50%; display:flex; align-items:center;
  justify-content:center; color:var(--text3); font-size:14px;
  transition:background 0.15s;
}
.ai-chat-panel-close:hover { background:var(--surface2); }
.ai-chat-messages {
  flex:1; overflow-y:auto; padding:14px;
  display:flex; flex-direction:column; gap:12px;
}
.ai-chat-messages::-webkit-scrollbar { width:3px; }
.ai-chat-messages::-webkit-scrollbar-thumb { background:var(--border2); border-radius:2px; }
.ai-msg { display:flex; gap:8px; align-items:flex-end; max-width:88%; }
.ai-msg.user { align-self:flex-end; flex-direction:row-reverse; }
.ai-msg.assistant { align-self:flex-start; }
.ai-msg-avatar {
  width:26px; height:26px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  font-size:13px; flex-shrink:0; margin-bottom:2px;
}
.ai-msg.user .ai-msg-avatar { background:var(--blue); }
.ai-msg.assistant .ai-msg-avatar {
  background:linear-gradient(135deg,#2563eb,#7c3aed);
}
.ai-msg-bubble {
  padding:9px 13px; font-size:12.5px; line-height:1.6;
  font-family:var(--font); white-space:pre-wrap; word-break:break-word;
  max-width:100%;
}
.ai-msg.user .ai-msg-bubble {
  background:var(--blue); color:#fff;
  border-radius:16px 4px 16px 16px;
}
.ai-msg.assistant .ai-msg-bubble {
  background:var(--surface); color:var(--text);
  border-radius:4px 16px 16px 16px;
  border:1px solid var(--border);
}
.ai-chat-quick {
  display:flex; gap:5px; flex-wrap:wrap;
  padding:8px 14px; flex-shrink:0;
  border-top:1px solid var(--border);
  background:var(--surface);
}
.ai-quick-btn {
  font-size:11px; padding:4px 10px; border-radius:99px;
  border:1px solid var(--border2);
  background:var(--bg); color:var(--text2);
  cursor:pointer; font-family:var(--font); white-space:nowrap;
  transition:all 0.15s;
}
.ai-quick-btn:hover { background:var(--blue); color:#fff; border-color:var(--blue); }
.ai-chat-input-row {
  display:flex; gap:8px; padding:10px 12px;
  border-top:1px solid var(--border);
  background:var(--surface); flex-shrink:0;
}
.ai-chat-input {
  flex:1; padding:8px 14px; border-radius:99px;
  border:1px solid var(--border2);
  font-size:12.5px; font-family:var(--font);
  background:var(--bg); color:var(--text); outline:none;
  transition:border-color 0.15s;
}
.ai-chat-input:focus { border-color:var(--blue); }
.ai-chat-send {
  width:36px; height:36px; border-radius:50%;
  background:var(--blue); color:#fff; border:none;
  cursor:pointer; font-size:14px; display:flex;
  align-items:center; justify-content:center;
  flex-shrink:0; transition:opacity 0.15s;
}
.ai-chat-send:hover { opacity:0.85; }
.ai-chat-send:disabled { opacity:0.4; cursor:not-allowed; }
.ai-typing { display:flex; gap:4px; align-items:center; padding:4px 2px; }
.ai-typing span {
  width:5px; height:5px; border-radius:50%;
  background:var(--text3); animation:aiTyping 1.2s infinite;
}
.ai-typing span:nth-child(2) { animation-delay:0.2s; }
.ai-typing span:nth-child(3) { animation-delay:0.4s; }
@keyframes aiTyping { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-5px);opacity:1} }
.ai-status { font-size:10px; font-weight:600; display:flex; align-items:center; gap:3px; }
.ai-status.online { color:#16a34a; }
.ai-status.offline { color:#dc2626; }
.ai-status-dot { width:6px; height:6px; border-radius:50%; background:currentColor; }

/* ── AI 모드 ── */
html[data-ai-mode='true'] #widget-shell,
html[data-ai-mode='true'] .user-select-overlay,
html[data-ai-mode='true'] .modal-bg,
html[data-ai-mode='true'] #pin-modal,
html[data-ai-mode='true'] #admin-modal-bg {
  display:none !important;
}
html[data-ai-mode='true'] .ai-chat-panel {
  position:fixed !important;
  top:0 !important; left:0 !important;
  right:0 !important; bottom:0 !important;
  width:100vw !important; height:100vh !important;
  display:flex !important;
  border-left:none !important; box-shadow:none !important;
  border-radius:0 !important;
  overflow:hidden !important;
  flex-direction:column !important;
}
html[data-ai-mode='true'] .ai-chat-modal {
  width:100% !important;
  height:100% !important;
  max-height:100vh !important;
  border-radius:0 !important;
  display:flex !important;
  flex-direction:column !important;
  flex:1 !important;
}
html[data-ai-mode='true'] body {
  background:transparent;
  overflow:hidden;
}
</style>
  </head><body>
    <h3>EXHEOH 일정표 — ${new Date().toLocaleDateString('ko-KR')}</h3>
    <div id="scale-wrap">${chartHtml}</div>
    <script>
      function autoScale(){
        const wrap = document.getElementById('scale-wrap');
        const tbl  = wrap && wrap.querySelector('table');
        if(!tbl) return;
        const pageW = window.innerWidth || 1100;
        const tblW  = tbl.scrollWidth;
        if(tblW > pageW){
          const scale = pageW / tblW;
          wrap.style.transform = 'scale(' + scale + ')';
          wrap.style.transformOrigin = 'top left';
          wrap.style.width = tblW + 'px';
          document.body.style.height = (tbl.scrollHeight * scale + 40) + 'px';
        }
      }
      window.onload = function(){ autoScale(); setTimeout(()=>window.print(), 500); };
    <\/script>
  
<!-- 오프라인 배너 -->
<div id="offline-banner" class="offline-banner">📡 오프라인 — 업무가 로컬에 저장됩니다</div>
<div id="sync-banner" class="sync-banner">✅ 온라인 복구 — 저장된 업무 동기화 중...</div>

</body></html>`;

  // Electron 환경 감지: window.open 대신 blob URL 사용
  const blob = new Blob([printHtml], {type:'text/html'});
  const url  = URL.createObjectURL(blob);
  const printWin = window.open(url, '_blank', 'width=1400,height=900');
  if(!printWin){
    // window.open 막혔을 때 — 현재 탭에서 인쇄 오버레이
    const overlay = document.createElement('div');
    overlay.id = 'print-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#fff;overflow:auto;';
    overlay.innerHTML = `<div style="padding:10px;display:flex;gap:8px;border-bottom:1px solid #eee;">
      <button onclick="window.print()" style="padding:6px 16px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">🖨️ 인쇄</button>
      <button onclick="document.getElementById('print-overlay').remove()" style="padding:6px 16px;background:#f3f4f6;color:#374151;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;font-size:12px;">✕ 닫기</button>
    </div>
    <div id="print-overlay-body" style="padding:12px;">${chartHtml}</div>`;
    document.body.appendChild(overlay);

    // CSS 스타일 삽입
    const style = document.createElement('style');
    style.textContent = `@media print { #print-overlay > div:first-child { display:none; } * { -webkit-print-color-adjust:exact !important; } @page { size:landscape; margin:6mm 8mm; } }`;
    overlay.appendChild(style);
  }
  setTimeout(()=>URL.revokeObjectURL(url), 5000);
};

// ── 프로젝트 필터 ──
let _projFilter = null;

window.setProjFilter = function(field, value){
  _projFilter = {field, value};
  const bar = document.getElementById('proj-filter-bar');
  const label = document.getElementById('proj-filter-label');
  const fieldName = field==='client'?'건설사':field==='design'?'디자인담당':'설계담당';
  if(bar){ bar.style.display='flex'; }
  if(label){ label.textContent = `${fieldName}: ${value}`; }
  renderProjList();
}

window.clearProjFilter = function(){
  _projFilter = null;
  const bar = document.getElementById('proj-filter-bar');
  if(bar){ bar.style.display='none'; }
  renderProjList();
}


window._closeWidget=window.closeWidget=function(){ if(window.electronAPI) window.electronAPI.closeWidget(); };
window._minimizeWidget=window.minimizeWidget=function(){ if(window.electronAPI) window.electronAPI.minimizeWidget(); };

// ── 위젯 크기 저장 (Electron 환경 외에도 동작) ──
(function(){
  try {
    const saved = localStorage.getItem('widgetSize');
    if(saved){ const {w,h}=JSON.parse(saved); if(w&&h){ document.body.style.width=w+'px'; document.body.style.height=h+'px'; } }
    const ro=new ResizeObserver(S.entries=>{
      for(const entry of S.entries){
        const w=Math.round(entry.contentRect.width);
        const h=Math.round(entry.contentRect.height);
        if(w>100&&h>100) localStorage.setItem('widgetSize',JSON.stringify({w,h}));
      }
    });
    ro.observe(document.getElementById('widget-shell'));
  } catch(e){}
})();

// 누락 alias 등록
window._editHistory = function(hid){
  const t=document.getElementById('htext-'+hid);
  const e=document.getElementById('hedit-'+hid);
  if(t) t.style.display='none';
  if(e) e.style.display='block';
  const inp=document.getElementById('hinp-edit-'+hid);
  if(inp){ inp.focus(); inp.select(); }
};
window._cancelEditHistory = function(hid){
  const t=document.getElementById('htext-'+hid);
  const e=document.getElementById('hedit-'+hid);
  if(t) t.style.display='block';
  if(e) e.style.display='none';
};
window._saveHistory = function(projId, hid){
  const inp=document.getElementById('hinp-edit-'+hid);
  if(!inp||!inp.value.trim()) return;
  window._fb.update('history/'+projId+'/'+hid,{ text: inp.value.trim() });
  window._cancelEditHistory(hid);
  setTimeout(()=>renderHistoryList(projId), 300);
};
window._deleteCalEntry = function(id,ds){
  if(window._deleteEntry) window._deleteEntry(id);
  setTimeout(()=>{ if(window._showCalDetail) window._showCalDetail(ds); }, 300);
};
window._editHistory = function(hid){
  var t=document.getElementById('htext-'+hid);
  var e=document.getElementById('hedit-'+hid);
  if(t) t.style.display='none';
  if(e) e.style.display='block';
  var inp=document.getElementById('hinp-edit-'+hid);
  if(inp){ inp.focus(); inp.select(); }
};
window._cancelEditHistory = function(hid){
  var t=document.getElementById('htext-'+hid);
  var e=document.getElementById('hedit-'+hid);
  if(t) t.style.display='block';
  if(e) e.style.display='none';
};
window._saveHistory = function(projId, hid){
  var inp=document.getElementById('hinp-edit-'+hid);
  if(!inp||!inp.value.trim()) return;
  window._fb.update('history/'+projId+'/'+hid,{ text: inp.value.trim() });
  window._cancelEditHistory(hid);
  setTimeout(()=>renderHistoryList(projId), 300);
};

// ══════════════════════════════════════════
// ── 일정표 (간트) ──
// ══════════════════════════════════════════
// [app.js: const ganttRef = ref(db,'ganttSchedules');]
let ganttSchedules = {};
let ganttView = 'month';      // 'month' | 'week'
let ganttAnchor = new Date(); // 기준 날짜
ganttAnchor.setDate(1);

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

// ── 프로젝트 드롭다운 ──

// 외부 클릭 시 드롭다운 닫기
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]

// ── 추가 ──

// ── 공정표 프로젝트 검색 (업무탭과 동일한 방식) ──
window._ganttOpenProj = window.ganttOpenProj = function(){
  ganttRenderSearchList('');
  document.getElementById('gantt-proj-dd').classList.add('open');
}
window._ganttFilterProj = window.ganttFilterProj = function(){
  const q = document.getElementById('gantt-proj-input').value;
  ganttRenderSearchList(q);
  document.getElementById('gantt-proj-dd').classList.add('open');
}
function ganttRenderSearchList(q){
  const dd = document.getElementById('gantt-proj-dd');
  if(!dd) return;
  const sorted = Object.entries(S.projects).sort((a,b)=>(a[1].name||'').localeCompare(b[1].name||'','ko'));
  const filtered = q
    ? sorted.filter(([id,p])=>
        (p.name||'').toLowerCase().includes(q.toLowerCase()) ||
        (p.code||'').toLowerCase().includes(q.toLowerCase()) ||
        (p.client||'').toLowerCase().includes(q.toLowerCase()))
    : sorted;
  const curVal = document.getElementById('gantt-proj-id').value;
  if(!filtered.length){
    dd.innerHTML='<div class="proj-search-empty">검색 결과 없음</div>';
    return;
  }
  dd.innerHTML = [['','프로젝트 선택'],...filtered.map(([id,p])=>[id,p.name])].map(([id,name])=>`
    <div class="proj-search-item${id===curVal?' selected':''}" onmousedown="ganttSelectProj('${id}','${(name||'').replace(/'/g,"\'")}')">
      ${name}
    </div>`).join('');
}
window._ganttSelectProj = window.ganttSelectProj = function(id, name){
  document.getElementById('gantt-proj-id').value = id;
  document.getElementById('gantt-proj-input').value = id ? name : '';
  document.getElementById('gantt-proj-dd').classList.remove('open');
  // 프로젝트 정보 표시
  if(id && S.projects[id]){
    const p = S.projects[id];
    const box = document.getElementById('gantt-proj-info');
    if(box){
      box.style.display='flex';
      const setTxt = (elId, txt, show) => {
        const el=document.getElementById(elId);
        if(el){ el.textContent=txt; el.style.display=show&&txt?'':'none'; }
      };
      setTxt('gantt-info-code', p.code||'', true);
      setTxt('gantt-info-client', p.client ? '🏗 '+p.client : '', true);
      setTxt('gantt-info-design', p.design ? '디자인 '+p.design : '', true);
      setTxt('gantt-info-eng', p.eng ? '설계 '+p.eng : '', true);
    }
  } else {
    const box = document.getElementById('gantt-proj-info');
    if(box) box.style.display='none';
  }
}
window._ganttHideInfo = window.ganttHideInfo = function(){
  const box=document.getElementById('gantt-proj-info');
  if(box) box.style.display='none';
}

window.ganttAddOrEdit=function(){
  const btn=document.getElementById('gantt-add-btn');
  const S.editId=btn&&btn.getAttribute('data-edit-id');
  if(S.editId){
    const projId = document.getElementById('gantt-proj-id').value;
    const start  = document.getElementById('gantt-start').value;
    const end    = document.getElementById('gantt-end').value;
    const status = document.getElementById('gantt-status').value;
    const memo   = document.getElementById('gantt-memo').value.trim();
    const scale  = document.getElementById('gantt-scale').value.trim();
    const progress = document.getElementById('gantt-progress') ? document.getElementById('gantt-progress').value : '';
    const teamName = document.getElementById('gantt-team-value')?.value || '';
    if(!projId||!start||!end){ alert('프로젝트와 날짜를 입력해주세요'); return; }
    window._fb.update('ganttSchedules/'+S.editId,{projId,start,end,status,memo,scale,progress,teamName});
    if(progress && window.logProgressChange) window.logProgressChange(projId, progress, S.editId);
    btn.textContent='추가'; btn.removeAttribute('data-edit-id');
    document.getElementById('gantt-proj-id').value='';
    document.getElementById('gantt-proj-input').value='';
    document.getElementById('gantt-start').value='';
    document.getElementById('gantt-end').value='';
    document.getElementById('gantt-memo').value='';
    const _se=document.getElementById('gantt-scale'); if(_se) _se.value='';
    const _pg=document.getElementById('gantt-progress'); if(_pg) _pg.value='';
    if(window.ganttProgressSelect) window.ganttProgressSelect('');
    ganttHideInfo();
    return;
  }
  window._ganttAdd();
};
window._ganttAdd=window.ganttAdd=function(){
  const projId = document.getElementById('gantt-proj-id').value;
  const start  = document.getElementById('gantt-start').value;
  const end    = document.getElementById('gantt-end').value;
  const status = document.getElementById('gantt-status').value;
  const memo   = document.getElementById('gantt-memo').value.trim();
  const scale  = document.getElementById('gantt-scale').value.trim();
  const progress = document.getElementById('gantt-progress') ? document.getElementById('gantt-progress').value : '';
  const teamName = document.getElementById('gantt-team-value')?.value || '';
  if(!projId){ alert('프로젝트를 선택해주세요'); return; }
  if(!start||!end){ alert('시작일과 종료일을 입력해주세요'); return; }
  if(start>end){ alert('종료일이 시작일보다 앞에 있습니다'); return; }
  const newRef = push(ganttRef, { projId, start, end, status, memo, scale, progress, teamName, ts: Date.now() });
  if(progress && window.logProgressChange) window.logProgressChange(projId, progress, newRef.key||'');
  // 초기화
  document.getElementById('gantt-proj-id').value='';
  document.getElementById('gantt-proj-input').value='';
  document.getElementById('gantt-start').value='';
  document.getElementById('gantt-end').value='';
  document.getElementById('gantt-memo').value='';
  const scaleEl=document.getElementById('gantt-scale'); if(scaleEl) scaleEl.value='';
  const progEl=document.getElementById('gantt-progress'); if(progEl) progEl.value='';
  if(window.ganttProgressSelect) window.ganttProgressSelect('');
  ganttHideInfo();
};
window._ganttDelete=window.ganttDelete=function(id){ if(!confirm('삭제하시겠습니까?')) return; window._fb.remove('ganttSchedules/'+id); };
window._ganttEdit=window.ganttEdit=function(id){
  const s=ganttSchedules[id]; if(!s) return;
  const p=S.projects[s.projId]||{};
  document.getElementById('gantt-proj-id').value=s.projId||'';
  document.getElementById('gantt-proj-input').value=p.name||'';
  document.getElementById('gantt-start').value=s.start||'';
  document.getElementById('gantt-end').value=s.end||'';
  document.getElementById('gantt-status').value=s.status||'진행중';
  document.getElementById('gantt-memo').value=s.memo||'';
  const sedit=document.getElementById('gantt-scale'); if(sedit) sedit.value=s.scale||'';
  const pedit=document.getElementById('gantt-progress'); if(pedit) pedit.value=s.progress||'';
  if(window.ganttProgressSelect) window.ganttProgressSelect(s.progress||'');
  // 소속팀 복원
  const tedit=document.getElementById('gantt-team-value'); if(tedit) tedit.value=s.teamName||'';
  const tlabel=document.getElementById('gantt-team-label'); if(tlabel) tlabel.textContent=s.teamName||'소속팀 (선택)';
  if(s.projId&&p.name) window._ganttSelectProj(s.projId,p.name);
  // 수정 모드: 기존 항목 삭제 후 새로 추가
  const addBtn=document.getElementById('gantt-add-btn');
  if(addBtn){ addBtn.textContent='수정 완료'; addBtn.setAttribute('data-edit-id',id); }
  document.getElementById('gantt-proj-input').focus();
};

// ── 뷰 컨트롤 ──
window._ganttSetView=window.ganttSetView=function(v, btn){
  ganttView = v;
  document.querySelectorAll('#gantt-view-month,#gantt-view-week').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  ganttRender();
};
window.ganttNavPrev = window._ganttNavPrev = function(){
  if(ganttView==='month'){ ganttAnchor.setMonth(ganttAnchor.getMonth()-1); }
  else { ganttAnchor.setDate(ganttAnchor.getDate()-7); }
  ganttRender();
};
window.ganttNavNext = window._ganttNavNext = function(){
  if(ganttView==='month'){ ganttAnchor.setMonth(ganttAnchor.getMonth()+1); }
  else { ganttAnchor.setDate(ganttAnchor.getDate()+7); }
  ganttRender();
};
window.ganttGoToday = function(){
  ganttAnchor = new Date();
  if(ganttView==='month') ganttAnchor.setDate(1);
  ganttRender();
};

// ── 진행상태 드롭다운 (입력폼) ──
const PROG_LABEL = {'':'−','1차송부':'1차 송부','2차송부':'2차 송부','납품':'납품','리비전':'리비전'};
const PROG_CLASS = {'':'prog-none','1차송부':'prog-1차송부','2차송부':'prog-2차송부','납품':'prog-납품','리비전':'prog-리비전'};
window.ganttProgressToggle = function(){
  const dd = document.getElementById('gantt-progress-dd');
  if(!dd) return;
  const isOpen = dd.style.display !== 'none';
  dd.style.display = isOpen ? 'none' : 'block';
  if(!isOpen){
    // 바깥 클릭 시 닫기
    setTimeout(()=>{
      const handler = function(e){
        if(!document.getElementById('gantt-progress-dd').contains(e.target) &&
           !document.getElementById('gantt-progress-btn').contains(e.target)){
          document.getElementById('gantt-progress-dd').style.display='none';
          document.removeEventListener('click', handler);
        }
      };
// [app.js]
    }, 0);
  }
};
window.ganttProgressSelect = function(val){
  const hidden = document.getElementById('gantt-progress');
  const lbl    = document.getElementById('gantt-progress-label');
  const btn    = document.getElementById('gantt-progress-btn');
  const dd     = document.getElementById('gantt-progress-dd');
  if(hidden) hidden.value = val;
  if(lbl){
    if(val){
      lbl.innerHTML = `<span class="prog-badge ${PROG_CLASS[val]||''}">${PROG_LABEL[val]||val}</span>`;
    } else {
      lbl.textContent = '-';
      lbl.style.color = 'var(--text3)';
    }
  }
  if(btn){
    // 선택된 항목 하이라이트
    document.querySelectorAll('#gantt-progress-dd .gantt-prog-item').forEach(el=>{
      el.style.background = el.getAttribute('data-val')===val ? 'var(--surface2)' : '';
    });
  }
  if(dd) dd.style.display = 'none';
};

// ── 렌더 ──
window._ganttRender=function ganttRender(){
  const todayStr2 = new Date().toISOString().slice(0,10);

  // 스케줄 필터
  const filterStatus = document.getElementById('gantt-filter-status').value;

  // 일정표 팀 필터용 멤버 목록
  let schArr = Object.entries(ganttSchedules).filter(([id,s])=>{
    if(filterStatus && s.status!==filterStatus) return false;
    // 팀 필터: teamName 필드 기반 순수 필터 (전체면 모두 표시)
    if(S.ganttTeamFilter && S.ganttTeamFilter!=='전체'){
      if(!s.teamName || s.teamName !== S.ganttTeamFilter) return false;
    }
    return true;
  }).sort((a,b)=>{
    const statusOrder = {'진행중':0,'진행예정(확정)':1,'진행예정(미정)':2,'대기':3,'완료':4};
    const sa = statusOrder[a[1].status] ?? 9;
    const sb = statusOrder[b[1].status] ?? 9;
    if(sa !== sb) return sa - sb;
    const pa = S.projects[a[1].projId], pb = S.projects[b[1].projId];
    const ca = (pa&&pa.code)||''; const cb = (pb&&pb.code)||'';
    return ca.localeCompare(cb, undefined, {numeric:true, sensitivity:'base'});
  });

  if(!schArr.length){
    document.getElementById('gantt-chart').innerHTML=`<div class="gantt-empty">등록된 일정이 없습니다<br><span style="font-size:10px;color:var(--text3)">위에서 프로젝트를 선택하고 기간을 입력해주세요</span></div>`;
    return;
  }

  // 날짜 범위: 뷰에 따라 다르게
  let cols = [];
  let lastMonth = '';

  if(ganttView==='week'){
    // 주간 뷰: ganttAnchor 기준 해당 주 월~일
    const anchor = new Date(ganttAnchor);
    const dow = anchor.getDay(); // 0=일
    const monday = new Date(anchor);
    monday.setDate(anchor.getDate() - (dow===0?6:dow-1)); // 월요일
    for(let i=0;i<7;i++){
      const d = new Date(monday);
      d.setDate(monday.getDate()+i);
      const ds = d.toISOString().slice(0,10);
      const mo = `${d.getFullYear()}년 ${d.getMonth()+1}월`;
      cols.push({ dateStr:ds, label:String(d.getDate()), isToday:ds===todayStr2, monthLabel: mo!==lastMonth?mo:null, dow:d.getDay() });
      lastMonth=mo;
    }
    const wd = monday;
    const we = new Date(monday); we.setDate(we.getDate()+6);
    const weekNum = Math.ceil((wd.getDate()+new Date(wd.getFullYear(),wd.getMonth(),1).getDay())/7);
    document.getElementById('gantt-range-lbl').textContent =
      `${wd.getFullYear()}년 ${wd.getMonth()+1}월 ${weekNum}주차 (${wd.getMonth()+1}/${wd.getDate()}~${we.getMonth()+1}/${we.getDate()})`;
  } else {
    // 월간 뷰: 등록된 프로젝트 데이터 전체 범위
    const allStarts = schArr.map(([,s])=>s.start).filter(Boolean).sort();
    const allEnds   = schArr.map(([,s])=>s.end).filter(Boolean).sort();
    const dataStart = allStarts[0];
    const dataEnd   = allEnds[allEnds.length-1];
    if(!dataStart||!dataEnd){
      document.getElementById('gantt-chart').innerHTML='<div class="gantt-empty">날짜 없는 항목이 있습니다</div>';
      return;
    }
    let cur = new Date(dataStart);
    const endDate = new Date(dataEnd);
    const todayDate = new Date();
    const visEnd = endDate > todayDate ? endDate : todayDate;
    while(cur <= visEnd){
      const ds = cur.toISOString().slice(0,10);
      const mo = `${cur.getFullYear()}년 ${cur.getMonth()+1}월`;
      cols.push({ dateStr:ds, label:String(cur.getDate()), isToday:ds===todayStr2, monthLabel: mo!==lastMonth?mo:null, dow:cur.getDay() });
      lastMonth = mo;
      cur.setDate(cur.getDate()+1);
    }
    document.getElementById('gantt-range-lbl').textContent =
      `${new Date(dataStart).getFullYear()}년 ${new Date(dataStart).getMonth()+1}월 ~ ${new Date(dataEnd).getMonth()+1}월`;
  }

  const colStart = cols[0].dateStr;
  const colEnd   = cols[cols.length-1].dateStr;

  // 월 헤더 그룹
  const monthGroups = []; let curGroup=null;
  cols.forEach(c=>{
    if(c.monthLabel){ curGroup={label:c.monthLabel,span:1}; monthGroups.push(curGroup); }
    else if(curGroup){ curGroup.span++; }
  });

  // 상태별 바 색상 (요청사항: 진행중=노랑, 진행예정(확정)=핑크, 진행예정(미정)=연보라, 대기/완료=회색)
  const STATUS_BAR_COLORS = {
    '진행중':        '#eab308',
    '진행예정(확정)': '#ec4899',
    '진행예정(미정)': '#a78bfa',
    '대기':          '#9ca3af',
    '완료':          '#9ca3af',
  };

  // 셀 너비 (날짜 수에 따라 조정)
  const cellW = cols.length > 60 ? 18 : cols.length > 30 ? 22 : 28;

  // 테이블 생성
  let ganttHtml = `<table class="gantt-table" style="table-layout:fixed;font-size:11px;">`;

  // colgroup
  ganttHtml += `<colgroup>
    <col style="width:88px;min-width:84px;">
    <col style="width:46px;min-width:42px;">
    <col style="width:72px;min-width:66px;">
    <col style="width:220px;min-width:180px;">
    <col style="width:70px;min-width:62px;">
    <col style="width:88px;min-width:78px;">
    <col style="width:88px;min-width:78px;">
    <col style="width:76px;min-width:72px;">`;
  cols.forEach(()=>ganttHtml+=`<col style="width:${cellW}px;min-width:${cellW-2}px;">`);
  ganttHtml += `</colgroup>`;

  // 헤더 행1: 월 그룹
  ganttHtml += `<thead><tr>
    <th class="gantt-th-fixed" rowspan="2" style="text-align:center;vertical-align:middle;font-size:10px;">상태</th>
    <th class="gantt-th-fixed" rowspan="2" style="text-align:center;vertical-align:middle;font-size:10px;">코드</th>
    <th class="gantt-th-fixed" rowspan="2" style="text-align:center;vertical-align:middle;font-size:10px;">건설사</th>
    <th class="gantt-th-fixed" rowspan="2" style="text-align:center;vertical-align:middle;font-size:10px;">프로젝트명</th>
    <th class="gantt-th-fixed" rowspan="2" style="text-align:center;vertical-align:middle;font-size:10px;">규모</th>
    <th class="gantt-th-fixed" rowspan="2" style="text-align:center;vertical-align:middle;font-size:10px;">디자인</th>
    <th class="gantt-th-fixed" rowspan="2" style="text-align:center;vertical-align:middle;font-size:10px;">설계</th>
    <th class="gantt-th-fixed" rowspan="2" style="text-align:center;vertical-align:middle;font-size:10px;">진행상태</th>`;
  monthGroups.forEach(g=>{
    ganttHtml+=`<th class="gantt-th-month" colspan="${g.span}">${g.label}</th>`;
  });
  ganttHtml += `</tr>`;

  // 헤더 행2: 일
  ganttHtml += `<tr>`;
  cols.forEach(c=>{
    const isSun = c.dow===0, isSat = c.dow===6;
    const color = isSun?'#ef4444':isSat?'#3b82f6':'';
    ganttHtml+=`<th class="gantt-th-time${c.isToday?' today-col gantt-today-col-header':''}" style="${c.isToday?'':''}${color&&!c.isToday?'color:'+color+';':''}">${c.label}${c.isToday?'<div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-bottom:4px solid #dc2626;"></div>':''}</th>`;
  });
  ganttHtml+=`</tr></thead><tbody>`;

  // 데이터 행
  schArr.forEach(([id,s])=>{
    const p = S.projects[s.projId] || {};
    const barColor = STATUS_BAR_COLORS[s.status] || '#9ca3af';

    const barStart = s.start > colEnd || s.end < colStart ? null : s.start;
    const startIdx = barStart ? cols.findIndex(c=>c.dateStr>=s.start) : -1;
    const endIdx   = barStart ? (()=>{ let i=cols.length-1; while(i>=0&&cols[i].dateStr>s.end) i--; return i; })() : -1;
    const barSpan  = (startIdx>=0&&endIdx>=startIdx) ? endIdx-startIdx+1 : 0;

    // 상태별 색상
    const statusStyle = {
      '진행중':        'background:#fef9c3;color:#854d0e;border:1px solid #fde047',
      '진행예정(확정)': 'background:#fce7f3;color:#9d174d;border:1px solid #fbcfe8',
      '진행예정(미정)': 'background:#ede9fe;color:#5b21b6;border:1px solid #ddd6fe',
      '대기':          'background:#f3f4f6;color:#6b7280;border:1px solid #e5e7eb',
      '완료':          'background:#f3f4f6;color:#6b7280;border:1px solid #e5e7eb',
    }[s.status||''] || 'background:#f3f4f6;color:#6b7280;border:1px solid #e5e7eb';
    ganttHtml += `<tr>
      <td class="gantt-row-label" style="font-size:12px;text-align:center;">
        <span style="font-size:8px;padding:2px 4px;border-radius:4px;font-weight:700;white-space:nowrap;display:inline-block;max-width:84px;overflow:visible;${statusStyle}" title="${s.status||'-'}">${s.status||'-'}</span>
      </td>
      <td class="gantt-row-label" style="font-size:12px;text-align:center;">${p.code||'-'}</td>
      <td class="gantt-row-label" style="font-size:12px;text-align:center;overflow:hidden;" title="${p.client||''}"><span style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.client||'-'}</span></td>
      <td class="gantt-row-label" style="font-size:12px;" title="${p.name||''}">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:2px;overflow:hidden;">
          <span onclick="goToProject('${s.projId}')" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700;flex:1;min-width:0;cursor:pointer;color:var(--blue-txt);text-decoration:underline;text-underline-offset:2px;" title="클릭: 프로젝트 이슈/히스토리 보기">${p.name||'삭제된 프로젝트'}</span>
          <button class="gantt-del-btn" onclick="ganttEdit('${id}')" style="flex-shrink:0;color:var(--blue-txt);" title="수정">✎</button><button class="gantt-del-btn" onclick="ganttDelete('${id}')" style="flex-shrink:0;">✕</button>
        </div>
        ${s.memo?`<span style="font-size:9px;color:var(--text3);display:block;overflow:hidden;text-overflow:ellipsis;">${s.memo}</span>`:''}
      </td>
      <td class="gantt-row-label" style="font-size:12px;text-align:center;" title="${s.scale||''}">${s.scale||'-'}</td>
      <td class="gantt-row-label" style="font-size:12px;text-align:center;" title="${p.design||''}">${p.design||'-'}</td>
      <td class="gantt-row-label" style="font-size:12px;text-align:center;" title="${p.eng||''}">${p.eng||'-'}</td>
      <td class="gantt-row-label" style="font-size:12px;text-align:center;position:relative;cursor:pointer;" onclick="ganttCellProgressToggle(event,'${id}')">
        <span id="prog-cell-${id}" class="prog-badge ${s.progress ? 'prog-'+s.progress : 'prog-none'}" style="cursor:pointer;">${s.progress==='1차송부'?'1차 송부':s.progress==='2차송부'?'2차 송부':s.progress||'-'}</span>
      </td>`;

    if(barSpan>0){
      for(let i=0;i<startIdx;i++) ganttHtml+=`<td class="gantt-cell${cols[i].isToday?' today-col gantt-today-cell':''}" onclick="ganttCellClick('`+id+`','`+cols[i].dateStr+`')" style="cursor:pointer;"></td>`;

      // 진행상태 마커 계산 (1차송부·2차송부·납품·리비전 날짜 → 바 위 위치)
      const projLogs = S._progLogCache[s.projId] || {};
      const markerSteps = [
        { key:'1차송부', label:'1차', color:'#93c5fd' },
        { key:'2차송부', label:'2차', color:'#6ee7b7' },
        { key:'납품',    label:'납품', color:'#fde68a' },
        { key:'리비전',  label:'리비전', color:'#fca5a5' },
      ];
      // 날짜 "M/D" → "YYYY-MM-DD" (바 시작 연도 기준)
      const barYear = cols[startIdx].dateStr.slice(0,4);
      const markers = markerSteps.map(ms => {
        // design_, eng_, 접두사 없는 키 모두 확인
        const log = projLogs[ms.key]
          || projLogs['design_'+ms.key]
          || projLogs['eng_'+ms.key];
        if(!log?.date) return null;
        const parts = log.date.split('/');
        if(parts.length !== 2) return null;
        const mm = String(parts[0]).padStart(2,'0');
        const dd = String(parts[1]).padStart(2,'0');
        const fullDate = `${barYear}-${mm}-${dd}`;
        if(fullDate < s.start || fullDate > s.end) return null;
        const markerIdx = cols.findIndex(c => c.dateStr === fullDate);
        if(markerIdx < startIdx || markerIdx > endIdx) return null;
        const relCol = markerIdx - startIdx;
        const leftPx = relCol * cellW + cellW / 2;
        return { ...ms, leftPx, fullDate };
      }).filter(Boolean);

      // 마커 HTML — left를 px로 정확히 지정
      const markersHtml = markers.map(m => `
        <div style="position:absolute;top:0;left:${m.leftPx}px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;z-index:5;pointer-events:none;">
          <div style="background:${m.color};color:#1f2937;font-size:7px;font-weight:800;padding:1px 4px;border-radius:3px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.25);line-height:1.4;">${m.label}</div>
          <div style="width:1.5px;height:18px;background:rgba(0,0,0,0.5);margin-top:1px;"></div>
        </div>`).join('');

      ganttHtml+=`<td class="gantt-cell gantt-bar-cell" colspan="${barSpan}">
        <div style="position:relative;height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:3px;">
          ${markersHtml}
          <div class="gantt-bar" style="background:${barColor};width:100%;opacity:0.85;" title="${p.name||''} ${s.start}~${s.end}">
            ${barSpan>3?`<span style="font-size:9px;color:#fff;white-space:nowrap;overflow:hidden;">${s.start.slice(5)}~${s.end.slice(5)}</span>`:''}
          </div>
        </div>
      </td>`;
      for(let i=endIdx+1;i<cols.length;i++) ganttHtml+=`<td class="gantt-cell${cols[i].isToday?' today-col gantt-today-cell':''}" onclick="ganttCellClick('`+id+`','`+cols[i].dateStr+`')" style="cursor:pointer;"></td>`;
    } else {
      cols.forEach(c=>ganttHtml+=`<td class="gantt-cell${c.isToday?' today-col gantt-today-cell':''}" onclick="ganttCellClick('`+id+`','`+c.dateStr+`')" style="cursor:pointer;"></td>`);
    }
    ganttHtml+=`</tr>`;
  });

  ganttHtml += `</tbody></table>`;
  document.getElementById('gantt-chart').innerHTML = ganttHtml;
};
function getWeekOfMonth(date){
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return Math.ceil((date.getDate()+firstDay)/7);
}



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

document.getElementById('modal-bg').addEventListener('click',e=>{if(e.target===document.getElementById('modal-bg'))closeModal();});
document.getElementById('board-date-picker-bg').addEventListener('click',e=>{if(e.target===document.getElementById('board-date-picker-bg'))closeBoardDatePicker();});
document.getElementById('cal-month-picker-bg').addEventListener('click',e=>{if(e.target===document.getElementById('cal-month-picker-bg'))closeCalMonthPicker();});
document.getElementById('gantt-cell-modal-bg').addEventListener('click',e=>{if(e.target===document.getElementById('gantt-cell-modal-bg'))closeGanttCellModal();});
document.getElementById('alert-modal-bg').addEventListener('click',e=>{if(e.target===document.getElementById('alert-modal-bg'))closeAlertModal();});
document.getElementById('cal-event-modal-bg').addEventListener('click',e=>{if(e.target===document.getElementById('cal-event-modal-bg'))closeCalEventModal();});
document.getElementById('cal-event-detail-bg').addEventListener('click',e=>{if(e.target===document.getElementById('cal-event-detail-bg'))closeEventDetail();});

// ── 진행상태 셀 인라인 드롭다운 ──
{
  const PROG_LABEL_C = {'':'−','1차송부':'1차 송부','2차송부':'2차 송부','납품':'납품','리비전':'리비전'};
  const PROG_CLASS_C = {'':'prog-none','1차송부':'prog-1차송부','2차송부':'prog-2차송부','납품':'prog-납품','리비전':'prog-리비전'};
  let _cpId = null, _cpHandler = null;

  window.ganttCellProgressToggle = function(e, id){
    e.stopPropagation();
    const popup = document.getElementById('gantt-prog-popup');
    if(_cpId === id && popup.style.display !== 'none'){ popup.style.display='none'; _cpId=null; return; }
    _cpId = id;
    const s = ganttSchedules[id] || {};
    const cur = s.progress || '';
    popup.querySelectorAll('.gantt-prog-item').forEach(el=>{
      el.style.background = el.getAttribute('data-val')===cur ? 'var(--surface2)' : '';
    });
    popup.style.display = 'block';
    const rect = e.currentTarget.getBoundingClientRect();
    const pw = popup.offsetWidth || 110;
    let left = rect.left;
    if(left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
    popup.style.left = left + 'px';
    popup.style.top  = (rect.bottom + 3) + 'px';
    if(_cpHandler) document.removeEventListener('click', _cpHandler);
    _cpHandler = function(ev){
      if(!popup.contains(ev.target)){ popup.style.display='none'; _cpId=null; document.removeEventListener('click',_cpHandler); _cpHandler=null; }
    };
    setTimeout(()=> document.addEventListener('click', _cpHandler), 0);
  };

  window.ganttCellProgressSelect = function(val){
    if(!_cpId) return;
    const id = _cpId;
    document.getElementById('gantt-prog-popup').style.display='none';
    _cpId = null;
    window._fb.update('ganttSchedules/'+id, { progress: val });
    const cell = document.getElementById('prog-cell-'+id);
    if(cell){ cell.className='prog-badge '+(PROG_CLASS_C[val]||'prog-none'); cell.textContent=PROG_LABEL_C[val]||'-'; }
    // 진행상태 타임라인 로그 기록
    if(val && window.logProgressChange){
      const s = ganttSchedules[id]||{};
      window.logProgressChange(s.projId, val, id);
    }
  };
}

// ══════════════════════════════════════
// ✅ 할일(Todo) 기능
// ══════════════════════════════════════
// [app.js: const todosRef = ref(db, 'todos');]
let _todos = {};
let _todoTeamFilter = '';
let _todoStatusFilter = 'all';
let _todoAssignee = '';
let _todoAssigneeIsSupport = false;

// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]

function renderTodoTeamTabs(){
  const container = document.getElementById('todo-team-tabs');
  if(!container) return;
  const groups = getGroupList();
  const curTeam = _todoTeamFilter;
  container.innerHTML = groups.map(g =>
    `<button class="fbtn${g.name===curTeam?' on':''}" onclick="setTodoTeam('${g.name}')">${g.name}</button>`
  ).join('');
  if(!curTeam && groups.length) { _todoTeamFilter = groups[0].name; renderTodoTeamTabs(); }
}

window.setTodoTeam = function(name){
  _todoTeamFilter = name;
  _todoAssignee = '';
  _todoAssigneeIsSupport = false;
  document.getElementById('todo-assignee-label').textContent = '담당자 선택';
  renderTodoTeamTabs();
  window.renderTodoAssigneeDropdown();
  renderTodoList();
};

// 디자인팀 여부 확인 (이름에 '디자인' 포함)
function _isDesignTeam(name){ return name && name.includes('디자인'); }

window.renderTodoAssigneeDropdown = function(subMode){
  const dd = document.getElementById('todo-assignee-dropdown');
  if(!dd) return;
  const groups = getGroupList();
  const g = groups.find(g => g.name === _todoTeamFilter);
  const members = g ? (g.members||[]) : getMemberList().filter(n=>n!=='어드민');

  const memberItem = (name) => {
    const [bg,fg] = getColor(name);
    return `<div onmousedown="event.preventDefault();selectTodoAssignee('${name.replace(/'/g,"\\'")}',false)" style="padding:7px 12px;font-size:12px;color:var(--text);cursor:pointer;font-family:var(--font);display:flex;align-items:center;gap:7px;" onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background=''">
      <div style="width:20px;height:20px;border-radius:50%;background:${bg};color:${fg};font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${initials(name)}</div>
      ${name}
    </div>`;
  };

  if(subMode === 'support'){
    // 지원 선택됨 → 다른 디자인팀 멤버 표시
    const otherDesignMembers = groups
      .filter(g => _isDesignTeam(g.name) && g.name !== _todoTeamFilter)
      .map(g => ({ teamName: g.name, members: g.members||[] }));

    let html = `<div onmousedown="event.preventDefault();event.stopPropagation();renderTodoAssigneeDropdown()" style="padding:6px 12px;font-size:11px;font-weight:800;color:var(--blue-txt);cursor:pointer;font-family:var(--font);display:flex;align-items:center;gap:4px;border-bottom:1px solid var(--border);" onmouseover="this.style.background='var(--blue-bg)'" onmouseout="this.style.background=''">← 뒤로</div>`;

    otherDesignMembers.forEach(({teamName, members}) => {
      html += `<div style="padding:4px 12px 2px;font-size:10px;font-weight:800;color:var(--text3);">${teamName}</div>`;
      members.forEach(name => {
        const [bg,fg] = getColor(name);
        html += `<div onmousedown="event.preventDefault();selectTodoAssignee('${name.replace(/'/g,"\\'")}',true)" style="padding:7px 12px 7px 20px;font-size:12px;color:var(--text);cursor:pointer;font-family:var(--font);display:flex;align-items:center;gap:7px;" onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background=''">
          <div style="width:20px;height:20px;border-radius:50%;background:${bg};color:${fg};font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${initials(name)}</div>
          ${name}
        </div>`;
      });
    });
    dd.innerHTML = html;
    return;
  }

  // 기본 모드
  let html = `<div onmousedown="event.preventDefault();selectTodoAssignee('',false)" style="padding:7px 12px;font-size:12px;color:var(--text2);cursor:pointer;font-family:var(--font);" onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background=''">전체</div>`;
  html += members.map(name => memberItem(name)).join('');

  // 디자인팀이면 맨 마지막에 지원 항목 추가
  if(_isDesignTeam(_todoTeamFilter)){
    html += `<div style="border-top:1px solid var(--border);margin-top:2px;"></div>
    <div onmousedown="event.preventDefault();event.stopPropagation();renderTodoAssigneeDropdown('support')" style="padding:7px 12px;font-size:12px;font-weight:800;color:var(--blue-txt);cursor:pointer;font-family:var(--font);display:flex;align-items:center;justify-content:space-between;" onmouseover="this.style.background='var(--blue-bg)'" onmouseout="this.style.background=''">
      지원 <span style="font-size:10px;">›</span>
    </div>`;
  }
  dd.innerHTML = html;
}

window.toggleTodoAssigneeDropdown = function(){
  const dd = document.getElementById('todo-assignee-dropdown');
  if(!dd) return;
  const isOpen = dd.style.display === 'block';
  if(!isOpen){ window.renderTodoAssigneeDropdown(); dd.style.display = 'block'; }
  else dd.style.display = 'none';
};

window.selectTodoAssignee = function(name, isSupport){
  _todoAssignee = name;
  _todoAssigneeIsSupport = !!isSupport;
  const label = document.getElementById('todo-assignee-label');
  if(name){
    if(isSupport){
      label.innerHTML = `<span style="font-size:10px;font-weight:800;color:var(--blue-txt);background:var(--blue-bg);border:1px solid var(--blue-bd);border-radius:4px;padding:0 5px;margin-right:4px;">지원</span>${name}`;
    } else {
      label.textContent = name;
    }
  } else {
    label.textContent = '담당자 선택';
  }
  document.getElementById('todo-assignee-dropdown').style.display = 'none';
};

// [app.js]
// [app.js]
// [app.js]
// [app.js]
// [app.js]

window.openTodoProjSearch = function(){
  _renderTodoProjList('');
  document.getElementById('todo-proj-dropdown').classList.add('open');
};
window.filterTodoProjSearch = function(){
  const q = document.getElementById('todo-inp-proj').value;
  _renderTodoProjList(q);
  document.getElementById('todo-proj-dropdown').classList.add('open');
};
function _renderTodoProjList(q){
  const dd = document.getElementById('todo-proj-dropdown');
  if(!dd) return;
  const sorted = Object.entries(S.projects).sort((a,b)=>(a[1].name||'').localeCompare(b[1].name||'','ko'));
  const filtered = q ? sorted.filter(([id,p])=>(p.name||'').includes(q)||(p.code||'').includes(q)) : sorted;
  const curId = (document.getElementById('todo-inp-proj-id')||{}).value||'';
  if(!filtered.length){ dd.innerHTML='<div class="proj-search-empty">검색 결과 없음</div>'; return; }
  dd.innerHTML = [['','프로젝트 없음'],...filtered.map(([id,p])=>[id,p.name])].map(([id,name])=>
    `<div class="proj-search-item${id===curId?' selected':''}" onmousedown="selectTodoProjSearch('${id}','${(name||'').replace(/'/g,"\\'")}')">
      ${id ? name : '<span style="color:var(--text3);">프로젝트 없음</span>'}
    </div>`
  ).join('');
}
window.selectTodoProjSearch = function(id, name){
  const idEl = document.getElementById('todo-inp-proj-id');
  const inpEl = document.getElementById('todo-inp-proj');
  const dd = document.getElementById('todo-proj-dropdown');
  if(idEl) idEl.value = id;
  if(inpEl) inpEl.value = id ? name : '';
  if(dd) dd.classList.remove('open');
};

window.submitTodo = function(){
  const proj = (document.getElementById('todo-inp-proj')?.value||'').trim();
  const projId = document.getElementById('todo-inp-proj-id')?.value||'';
  const text = (document.getElementById('todo-inp-text')?.value||'').trim();
  if(!text) return;
  const due = document.getElementById('todo-inp-due')?.value||'';
  const priority = document.getElementById('todo-inp-priority')?.value||'medium';
  const assignee = _todoAssignee;
  const assigneeIsSupport = _todoAssigneeIsSupport;
  const curUser = localStorage.getItem('currentUser')||'';
  const groups = getGroupList();
  const teamName = _todoTeamFilter || (groups[0]?.name||'');
  push(todosRef, { proj, projId, text, due, priority, assignee, assigneeIsSupport, teamName, createdBy: curUser, done: false, createdAt: Date.now() });
  document.getElementById('todo-inp-proj').value = '';
  if(document.getElementById('todo-inp-proj-id')) document.getElementById('todo-inp-proj-id').value = '';
  document.getElementById('todo-inp-text').value = '';
  document.getElementById('todo-inp-due').value = '';
  document.getElementById('todo-inp-priority').value = 'medium';
  _todoAssignee = '';
  _todoAssigneeIsSupport = false;
  document.getElementById('todo-assignee-label').textContent = '담당자 선택';
};

window.toggleTodoDone = function(id){
  const t = _todos[id]; if(!t) return;
  window._fb.update(`todos/${id}`, { done: !t.done });
};

window.deleteTodo = function(id){
  const t = _todos[id]; if(!t) return;
  const curUser = localStorage.getItem('currentUser')||'';
  if(!currentIsAdmin() && t.createdBy !== curUser) return;
  window._fb.remove(`todos/${id}`);
};

window.openTodoEdit = function(id){
  const t = _todos[id]; if(!t) return;
  document.getElementById('todo-edit-id').value = id;
  document.getElementById('todo-edit-proj').value = t.proj||'';
  document.getElementById('todo-edit-text').value = t.text||'';
  document.getElementById('todo-edit-due').value = t.due||'';
  document.getElementById('todo-edit-assignee-val').value = t.assignee||'';
  document.getElementById('todo-edit-assignee-support').value = t.assigneeIsSupport ? '1' : '';
  // 담당자 라벨 설정
  const lbl = document.getElementById('todo-edit-assignee-label');
  if(t.assignee){
    lbl.innerHTML = t.assigneeIsSupport
      ? `<span style="font-size:10px;font-weight:800;color:var(--blue-txt);background:var(--blue-bg);border:1px solid var(--blue-bd);border-radius:4px;padding:0 5px;margin-right:4px;">지원</span>${t.assignee}`
      : t.assignee;
  } else { lbl.textContent = '담당자 선택'; }
  const bg = document.getElementById('todo-edit-bg');
  if(bg) bg.style.display='flex';
  // 드롭다운 렌더
  _renderEditAssigneeDropdown(t.teamName||_todoTeamFilter);
};

window.closeTodoEdit = function(){
  const bg = document.getElementById('todo-edit-bg');
  if(bg) bg.style.display='none';
  const dd = document.getElementById('todo-edit-assignee-dropdown');
  if(dd) dd.style.display='none';
};

window.saveTodoEdit = function(){
  const id = document.getElementById('todo-edit-id').value;
  if(!id) return;
  const proj = document.getElementById('todo-edit-proj').value.trim();
  const text = document.getElementById('todo-edit-text').value.trim();
  const due  = document.getElementById('todo-edit-due').value;
  const assignee = document.getElementById('todo-edit-assignee-val').value;
  const assigneeIsSupport = document.getElementById('todo-edit-assignee-support').value === '1';
  if(!text) return;
  window._fb.update(`todos/${id}`, { proj, text, due, assignee, assigneeIsSupport });
  window.closeTodoEdit();
};

function _renderEditAssigneeDropdown(teamName, subMode){
  const dd = document.getElementById('todo-edit-assignee-dropdown');
  if(!dd) return;
  const groups = getGroupList();

  if(subMode === 'support'){
    const others = groups.filter(g => _isDesignTeam(g.name) && g.name !== teamName);
    let html = `<div onmousedown="event.preventDefault();_renderEditAssigneeDropdown('${teamName}')" style="padding:6px 12px;font-size:11px;font-weight:800;color:var(--blue-txt);cursor:pointer;font-family:var(--font);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:4px;" onmouseover="this.style.background='var(--blue-bg)'" onmouseout="this.style.background=''">← 뒤로</div>`;
    others.forEach(({name, members=[]}) => {
      html += `<div style="padding:4px 12px 2px;font-size:10px;font-weight:800;color:var(--text3);">${name}</div>`;
      members.forEach(m => {
        const [bg,fg] = getColor(m);
        html += `<div onmousedown="event.preventDefault();selectEditAssignee('${m.replace(/'/g,"\\'")}',true)" style="padding:7px 12px 7px 20px;font-size:12px;color:var(--text);cursor:pointer;font-family:var(--font);display:flex;align-items:center;gap:7px;" onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background=''">
          <div style="width:18px;height:18px;border-radius:50%;background:${bg};color:${fg};font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;">${initials(m)}</div>${m}</div>`;
      });
    });
    dd.innerHTML = html;
    return;
  }

  const g = groups.find(g => g.name === teamName);
  const members = g ? (g.members||[]) : getMemberList().filter(n=>n!=='어드민');
  let html = `<div onmousedown="event.preventDefault();selectEditAssignee('',false)" style="padding:7px 12px;font-size:12px;color:var(--text2);cursor:pointer;font-family:var(--font);" onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background=''">담당자 없음</div>`;
  members.forEach(m => {
    const [bg,fg] = getColor(m);
    html += `<div onmousedown="event.preventDefault();selectEditAssignee('${m.replace(/'/g,"\\'")}',false)" style="padding:7px 12px;font-size:12px;color:var(--text);cursor:pointer;font-family:var(--font);display:flex;align-items:center;gap:7px;" onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background=''">
      <div style="width:18px;height:18px;border-radius:50%;background:${bg};color:${fg};font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;">${initials(m)}</div>${m}</div>`;
  });
  if(_isDesignTeam(teamName)){
    html += `<div style="border-top:1px solid var(--border);margin-top:2px;"></div>
    <div onmousedown="event.preventDefault();_renderEditAssigneeDropdown('${teamName}','support')" style="padding:7px 12px;font-size:12px;font-weight:800;color:var(--blue-txt);cursor:pointer;font-family:var(--font);display:flex;align-items:center;justify-content:space-between;" onmouseover="this.style.background='var(--blue-bg)'" onmouseout="this.style.background=''">지원 <span style="font-size:10px;">›</span></div>`;
  }
  dd.innerHTML = html;
}
window._renderEditAssigneeDropdown = _renderEditAssigneeDropdown;

window.toggleTodoEditAssigneeDropdown = function(){
  const dd = document.getElementById('todo-edit-assignee-dropdown');
  if(!dd) return;
  dd.style.display = dd.style.display==='block' ? 'none' : 'block';
};

window.selectEditAssignee = function(name, isSupport){
  document.getElementById('todo-edit-assignee-val').value = name;
  document.getElementById('todo-edit-assignee-support').value = isSupport ? '1' : '';
  const lbl = document.getElementById('todo-edit-assignee-label');
  if(name){
    lbl.innerHTML = isSupport
      ? `<span style="font-size:10px;font-weight:800;color:var(--blue-txt);background:var(--blue-bg);border:1px solid var(--blue-bd);border-radius:4px;padding:0 5px;margin-right:4px;">지원</span>${name}`
      : name;
  } else { lbl.textContent = '담당자 선택'; }
  document.getElementById('todo-edit-assignee-dropdown').style.display='none';
};

window.setTodoFilter = function(f, el){
  _todoStatusFilter = f;
  document.querySelectorAll('#panel-todo .fbtn').forEach(b => b.classList.remove('on'));
  if(el) el.classList.add('on');
  renderTodoList();
};

window.clearDoneTodos = function(){
  const curUser = localStorage.getItem('currentUser')||'';
  Object.entries(_todos).forEach(([id, t]) => {
    if(!t.done || t.teamName !== _todoTeamFilter) return;
    if(currentIsAdmin() || t.createdBy === curUser) window._fb.remove(`todos/${id}`);
  });
};

function renderTodoList(){
  const el = document.getElementById('todo-list');
  if(!el) return;
  const now = new Date();
  const today = now.toISOString().slice(0,10);
  const tomorrow = new Date(Date.now()+86400000).toISOString().slice(0,10);
  const nowTs = now.getTime();
  const priorityOrder = { high:0, medium:1, low:2 };
  const curUser = localStorage.getItem('currentUser')||'';

  let items = Object.entries(_todos)
    .map(([id,t]) => ({id,...t}))
    .filter(t => t.teamName === _todoTeamFilter)
    .filter(t => _todoStatusFilter==='all' ? true : _todoStatusFilter==='done' ? t.done : !t.done)
    .sort((a,b) => {
      if(a.done !== b.done) return a.done ? 1 : -1;
      const pa = priorityOrder[a.priority]??1, pb = priorityOrder[b.priority]??1;
      if(pa !== pb) return pa - pb;
      return (a.createdAt||0) - (b.createdAt||0);
    });

  if(!items.length){
    el.innerHTML = `<div style="text-align:center;padding:30px;font-size:12px;color:var(--text3);">할일이 없어요 ✅</div>`;
    return;
  }

  const priorityIcon = { high:'🔴', medium:'🟡', low:'🟢' };
  const canEdit = (t) => currentIsAdmin() || t.createdBy === curUser;
  const canDone = (t) => true; // 완료 버튼 항상 표시, 권한 체크는 toggleTodoDone에서

  el.innerHTML = items.map(t => {
    const [bg,fg] = t.assignee ? getColor(t.assignee) : ['var(--surface2)','var(--text3)'];
    let dueClass = '', dueLabel = '';
    if(t.due){
      const dueTs = new Date(t.due).getTime();
      const dueDate = t.due.slice(0,10);
      // 시간 포함 여부 확인 (datetime-local은 'YYYY-MM-DDTHH:mm' 형식)
      const hasTime = t.due.includes('T') || t.due.includes(' ');
      const displayStr = hasTime
        ? t.due.replace('T',' ').slice(0,16)  // "2026-05-01 14:30"
        : t.due;
      if(dueTs < nowTs){ dueClass='overdue'; dueLabel=`⚠ ${displayStr} 마감 지남`; }
      else if(dueDate === today){ dueClass='today'; dueLabel=`🔥 오늘 ${hasTime ? t.due.slice(11,16) : '마감'}`; }
      else if(dueDate === tomorrow){ dueClass='upcoming'; dueLabel=`⏰ 내일 ${hasTime ? t.due.slice(11,16) : '마감'}`; }
      else { dueClass='upcoming'; dueLabel=`📅 ${displayStr}`; }
    }
    return `<div class="todo-card${t.done?' done':''}" data-todo-id="${t.id}">
      <!-- 상단: 프로젝트명 + 우선순위 + 액션 -->
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap;">
        ${t.proj ? `<span class="todo-proj">${t.proj}</span>` : ''}
        <span class="todo-priority">${priorityIcon[t.priority]||'🟡'}</span>
        <div style="flex:1;"></div>
        ${canEdit(t) ? `<button class="todo-action-btn" onclick="openTodoEdit('${t.id}')">✏️</button>` : ''}
        ${canEdit(t) ? `<button class="todo-action-btn" onclick="deleteTodo('${t.id}')">🗑</button>` : ''}
      </div>
      <!-- 중간: 업무 내용 -->
      <div class="todo-text" style="margin-bottom:7px;">${t.text}</div>
      <!-- 하단: 담당자 + 기한 + 완료버튼 -->
      <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
        ${t.assignee ? `<div style="display:flex;align-items:center;gap:4px;">
          ${t.assigneeIsSupport ? `<span style="font-size:9px;font-weight:800;color:var(--blue-txt);background:var(--blue-bg);border:1px solid var(--blue-bd);border-radius:4px;padding:0 5px;white-space:nowrap;">지원</span>` : ''}
          <div style="width:18px;height:18px;border-radius:50%;background:${bg};color:${fg};font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${initials(t.assignee)}</div>
          <span style="font-size:11px;color:var(--text2);">${t.assignee}</span>
        </div>` : ''}
        ${dueLabel ? `<span class="todo-due ${dueClass}">${dueLabel}</span>` : ''}
        <div style="flex:1;"></div>
        ${canDone(t) ? `<button class="todo-done-btn ${t.done?'active':'inactive'}" onclick="toggleTodoDone('${t.id}')">${t.done ? '✅ 완료' : '완료'}</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

window._renderTodoList = renderTodoList;

// ══════════════════════════════════════
// 🌤️ 날씨 (서울시 서초구 고정)
// ══════════════════════════════════════
const WEATHER_LAT = 37.4837;
const WEATHER_LON = 127.0324;

const WEATHER_ICONS = {
  0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️',
  45:'🌫️', 48:'🌫️',
  51:'🌦️', 53:'🌦️', 55:'🌧️',
  61:'🌧️', 63:'🌧️', 65:'🌧️',
  71:'🌨️', 73:'🌨️', 75:'🌨️',
  80:'🌦️', 81:'🌧️', 82:'⛈️',
  85:'🌨️', 86:'🌨️',
  95:'⛈️', 96:'⛈️', 99:'⛈️',
};

async function fetchWeather(){
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_LAT}&longitude=${WEATHER_LON}&current=temperature_2m,weathercode&timezone=Asia%2FSeoul`;
    const res = await fetch(url);
    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weathercode;
    const icon = WEATHER_ICONS[code] || '🌡️';
    const el = document.getElementById('weather-display');
    if(el) el.textContent = `${icon} ${temp}°C`;
  } catch(e) {
    const el = document.getElementById('weather-display');
    if(el) el.textContent = '';
  }
}

fetchWeather();
// [app.js]

// ── inp-name 자동 동기화 ──
function syncInpName(){
  const cur = localStorage.getItem('currentUser')||'';
  const hidden = document.getElementById('inp-name');
  const display = document.getElementById('inp-name-display');
  if(hidden) hidden.value = cur;
  if(display) display.textContent = cur || '이름';
}
// 초기 세팅
setTimeout(syncInpName, 500);
// currentUser 변경 감지 (storage 이벤트)
// [app.js]
// [app.js]
// [app.js]
window._syncInpName = syncInpName;

// ── AI 패널 강제 숨김 (업무보드 모드) ──
if(!new URLSearchParams(window.location.search).get('mode')) {
  setTimeout(()=>{
    const p = document.getElementById('ai-chat-modal-bg');
    if(p) p.style.setProperty('display','none','important');
  }, 100);
}

// ── 외부 접근용 window 노출 ──
window._render = render;
window.checkOllamaStatus = checkOllamaStatus;
window.addAIMessage = addAIMessage;
window._entries = S.entries;
window._updateViewDateLabel = updateViewDateLabel;
window._getViewDate = () => S.viewDate;
window._setViewDate = (d) => { S.viewDate = d; };
window._projects = S.projects;
