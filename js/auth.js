const S = window.S;

function getPinData(){
  return S._pinDataCache;
}
function savePinData(data){
  S._pinDataCache = data;
  localStorage.setItem('pinData', JSON.stringify(data));
  // Firebase에도 저장
  window._fb.update('settings', { pins: data });
}

// 사용자 선택 → PIN 있으면 입력, 없으면 바로 로그인
window._selectUser=window.selectUser=function(name){
  if(!name||!name.trim()) return;
  if(name === '어드민'){
    // 어드민은 ADMIN_PIN으로 인증
    showAdminLoginOverlay();
    return;
  }
  const pinData = getPinData();
  if(pinData[name]){
    showPinOverlay(name, 'login');
  } else {
    localStorage.setItem('currentUser', name.trim());
    applyUser(name.trim());
    setTimeout(()=>{
      if(confirm('"'+name+'" PIN이 설정되어 있지 않아요.\nPIN을 지금 설정하시겠어요?')){
        showPinOverlay(name, 'set');
      }
    }, 300);
  }
}

function showPinOverlay(name, mode){
  S._pinBuffer = '';
  S._pinTargetUser = name;
  S._pinMode = mode;
  S._pinOldVerified = '';
  updatePinDots();
  document.getElementById('pin-error').textContent = '';

  const members = getMemberList();
  const [bg,fg] = COLORS[members.indexOf(name)%COLORS.length]||COLORS[0];
  const av = document.getElementById('pin-av');
  av.style.background = bg; av.style.color = fg;
  av.textContent = name.slice(0,2);

  const titles = {
    login: name,
    set: 'PIN 설정',
    change_old: 'PIN 변경',
    change_new: '새 PIN 입력'
  };
  const subs = {
    login: '4자리 PIN을 입력하세요',
    set: '사용할 4자리 PIN을 입력하세요',
    change_old: '현재 PIN을 먼저 입력하세요',
    change_new: '새로운 4자리 PIN을 입력하세요'
  };
  document.getElementById('pin-title').textContent = titles[mode]||name;
  document.getElementById('pin-sub').textContent = subs[mode]||'';

  const uov = document.getElementById('user-select-overlay');
  uov.classList.remove('open'); uov.style.display='';
  const pov = document.getElementById('pin-overlay');
  pov.classList.add('open'); pov.style.display='flex';
}

function updatePinDots(){
  for(let i=0;i<4;i++){
    const d = document.getElementById('pd'+i);
    if(d) d.classList.toggle('filled', i < S._pinBuffer.length);
  }
}

window._pinInput=window.pinInput=function(num){
  if(S._pinBuffer.length >= 4) return;
  S._pinBuffer += num;
  updatePinDots();
  if(S._pinBuffer.length === 4) setTimeout(()=> checkPin(), 150);
}

window._pinDelete=window.pinDelete=function(){
  S._pinBuffer = S._pinBuffer.slice(0,-1);
  updatePinDots();
  document.getElementById('pin-error').textContent = '';
}

window._pinBack=window.pinBack=function(){
  S._pinBuffer='';
  const pov = document.getElementById('pin-overlay');
  pov.classList.remove('open'); pov.style.display='';
  if(S._pinMode==='change_old'||S._pinMode==='change_new'){
    // 변경 중이면 그냥 닫기
    return;
  }
  const uov = document.getElementById('user-select-overlay');
  uov.classList.add('open'); uov.style.display='flex';
  renderUserButtons();
}

function checkPin(){
  const pinData = getPinData();
  if(S._pinMode === 'set'){
    pinData[S._pinTargetUser] = S._pinBuffer;
    savePinData(pinData);
    document.getElementById('pin-overlay').classList.remove('open');
    document.getElementById('pin-overlay').style.display='';
    S._pinBuffer='';
    if(localStorage.getItem('currentUser') !== S._pinTargetUser){
      localStorage.setItem('currentUser', S._pinTargetUser);
      applyUser(S._pinTargetUser);
    }
    return;
  }
  if(S._pinMode === 'change_old'){
    if(pinData[S._pinTargetUser] === S._pinBuffer){
      S._pinOldVerified = S._pinBuffer;
      S._pinBuffer = '';
      updatePinDots();
      S._pinMode = 'change_new';
      document.getElementById('pin-title').textContent = '새 PIN 입력';
      document.getElementById('pin-sub').textContent = '새로운 4자리 PIN을 입력하세요';
      document.getElementById('pin-error').textContent = '';
    } else {
      document.getElementById('pin-error').textContent = '❌ 현재 PIN이 틀렸어요.';
      S._pinBuffer=''; updatePinDots();
    }
    return;
  }
  if(S._pinMode === 'change_new'){
    pinData[S._pinTargetUser] = S._pinBuffer;
    savePinData(pinData);
    document.getElementById('pin-overlay').classList.remove('open');
    document.getElementById('pin-overlay').style.display='';
    S._pinBuffer='';
    alert('PIN이 변경되었어요!');
    return;
  }
  // login
  if(pinData[S._pinTargetUser] === S._pinBuffer){
    document.getElementById('pin-overlay').classList.remove('open');
    document.getElementById('pin-overlay').style.display='';
    localStorage.setItem('currentUser', S._pinTargetUser);
    applyUser(S._pinTargetUser);
    S._pinBuffer='';
  } else {
    document.getElementById('pin-error').textContent = '❌ PIN이 틀렸어요. 다시 입력하세요.';
    S._pinBuffer=''; updatePinDots();
  }
}

// PIN 변경 진입 (타이틀바 이름 클릭 → 메뉴 대신 바로)
window._changePin=window.changePin=function(){
  const curUser = localStorage.getItem('currentUser');
  if(!curUser) return;
  const pinData = getPinData();
  if(pinData[curUser]){
    showPinOverlay(curUser, 'change_old');
  } else {
    showPinOverlay(curUser, 'set');
  }
}



window.toggleAcc=function(id){
  const bodies = document.querySelectorAll('[id^="acc-'+id+'"]');
  const body = document.getElementById('acc-'+id);
  if(!body) return;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  // 헤더도 토글
  document.querySelectorAll('.acc-header, .acc-sub-header').forEach(h=>{
    const oc = h.getAttribute('onclick');
    if(oc && oc.includes("'"+id+"'")) h.classList.toggle('open', !isOpen);
  });
}
// ── 어드민 (완전 독립 오버레이) ──
const ADMIN_PIN = '0000'; // ← 여기서 변경 가능
// [state: let S._adminPinBuf = '';]
// [state: let S._adminEditTarget = '';]
// [state: let S._adminEditBuf = '';]

window.openAdminPanel = function(){
  S._adminPinBuf = '';
  updateAdminPinDots();
  document.getElementById('admin-pin-err').textContent = '';
  document.getElementById('admin-pin-overlay').style.display = 'flex';
}
window.closeAdminPinOverlay = function(){
  document.getElementById('admin-pin-overlay').style.display = 'none';
  S._adminPinBuf = '';
}
window.closeAdminPanel = function(){
  document.getElementById('admin-panel').style.display = 'none';
}
window.openAdminModal = window.openAdminPanel; // 하위 호환

function updateAdminPinDots(){
  for(let i=0;i<4;i++){
    const d=document.getElementById('apd'+i);
    if(d){ d.style.background=i<S._adminPinBuf.length?'var(--blue)':'transparent'; d.style.borderColor=i<S._adminPinBuf.length?'var(--blue)':'var(--border2)'; }
  }
}
window.adminPinInput = function(n){
  if(S._adminPinBuf.length>=4) return;
  S._adminPinBuf+=n; updateAdminPinDots();
  if(S._adminPinBuf.length===4){
    setTimeout(()=>{
      if(S._adminPinBuf===ADMIN_PIN){
        document.getElementById('admin-pin-overlay').style.display='none';
        document.getElementById('admin-panel').style.display='flex';
        switchAdminTab('pin');
      } else {
        document.getElementById('admin-pin-err').textContent='❌ PIN이 틀렸어요.';
      }
      S._adminPinBuf=''; updateAdminPinDots();
    },150);
  }
}
window.adminPinDel = function(){
  S._adminPinBuf=S._adminPinBuf.slice(0,-1); updateAdminPinDots();
  document.getElementById('admin-pin-err').textContent='';
}

function renderAdminPanel(){
  const members=getMemberList(), pinData=getPinData();
  const el=document.getElementById('admin-panel-list');
  if(!members.length){el.innerHTML='<div class="empty">멤버 없음</div>';return;}
  el.innerHTML=members.map((name,i)=>{
    const[bg,fg]=COLORS[i%COLORS.length], pin=pinData[name];
    return `<div style="display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid var(--border);">
      <div class="av" style="background:${bg};color:${fg};width:28px;height:28px;font-size:10px;flex-shrink:0">${name.slice(0,2)}</div>
      <span style="flex:1;font-size:12px;font-weight:700;color:var(--text)">${name}</span>
      ${pin
        ?`<span style="font-family:var(--mono);font-size:13px;color:var(--blue-txt);background:var(--blue-bg);border:1px solid var(--blue-bd);border-radius:5px;padding:2px 8px;letter-spacing:3px">${pin}</span>
          <button onclick="adminEditPin('${name}')" style="font-size:10px;padding:2px 8px;border-radius:5px;background:var(--amber-bg);color:var(--amber-txt);border:1px solid var(--amber-bd);cursor:pointer;font-family:var(--font)">수정</button>
          <button onclick="adminDelPin('${name}')" style="font-size:10px;padding:2px 8px;border-radius:5px;background:var(--red-bg);color:var(--red-txt);border:1px solid var(--red-bd);cursor:pointer;font-family:var(--font)">삭제</button>`
        :`<span style="font-size:11px;color:var(--text3)">PIN 없음</span>
          <button onclick="adminEditPin('${name}')" style="font-size:10px;padding:2px 8px;border-radius:5px;background:var(--blue-bg);color:var(--blue-txt);border:1px solid var(--blue-bd);cursor:pointer;font-family:var(--font)">설정</button>`
      }
    </div>`;
  }).join('');
}

// ── 어드민 탭 전환 ──
// [state: let S._adminTab = 'pin';]
window.switchAdminTab = function(tab){
  S._adminTab = tab;
  ['pin','group','member'].forEach(t=>{
    const btn = document.getElementById('admin-tab-'+t);
    const panel = document.getElementById('admin-tab-panel-'+t);
    if(btn) btn.classList.toggle('on', t===tab);
    if(panel) panel.style.display = t===tab ? 'block' : 'none';
  });
  if(tab==='pin') renderAdminPanel();
  if(tab==='group') renderAdminGroupList();
  if(tab==='member') renderAdminMemberList();
};

// ── 커스텀 프롬프트 (Electron에서 prompt() 대체) ──
// [state: let S._promptCallback = null;]
window.showCustomPrompt = function(title, defaultVal, callback){
  S._promptCallback = callback;
  const modal = document.getElementById('custom-prompt-modal');
  const inp   = document.getElementById('custom-prompt-input');
  const ttl   = document.getElementById('custom-prompt-title');
  if(!modal||!inp||!ttl) return;
  ttl.textContent = title;
  inp.value = defaultVal||'';
  modal.style.display = 'flex';
  setTimeout(()=>inp.focus(), 50);
};
window.confirmCustomPrompt = function(){
  const inp = document.getElementById('custom-prompt-input');
  const val = inp ? inp.value.trim() : '';
  document.getElementById('custom-prompt-modal').style.display='none';
  if(S._promptCallback) { S._promptCallback(val||null); S._promptCallback=null; }
};
window.cancelCustomPrompt = function(){
  document.getElementById('custom-prompt-modal').style.display='none';
  if(S._promptCallback) { S._promptCallback(null); S._promptCallback=null; }
};

// ── 어드민 그룹 관리 ──
window.renderAdminGroupList = function(){
  const el = document.getElementById('admin-group-list');
  if(!el) return;
  const groups = getGroupList();
  const members = getMemberList().filter(n=>n!=='어드민');
  if(!groups.length){ el.innerHTML='<div class="empty">그룹 없음. 위 버튼으로 추가하세요.</div>'; return; }
  el.innerHTML = groups.map(g=>{
    const gMembers = (g.members||[]).filter(n=>members.includes(n));
    const chipsHtml = gMembers.map(name=>`
      <span class="admin-group-chip">
        ${name}
        <button onclick="removeFromGroup('${g.id}','${name}')" title="그룹에서 제거">✕</button>
      </span>`).join('');
    return `<div class="admin-group-row">
      <div class="admin-group-header">
        <span style="font-size:13px;font-weight:700;color:var(--text);flex:1">${g.name}</span>
        <button onclick="adminRenameGroup('${g.id}')" style="font-size:10px;padding:2px 8px;border-radius:5px;background:var(--amber-bg);color:var(--amber-txt);border:1px solid var(--amber-bd);cursor:pointer;font-family:var(--font)">이름 변경</button>
        <button onclick="adminDeleteGroup('${g.id}')" style="font-size:10px;padding:2px 8px;border-radius:5px;background:var(--red-bg);color:var(--red-txt);border:1px solid var(--red-bd);cursor:pointer;font-family:var(--font)">삭제</button>
      </div>
      <div class="admin-group-members">${chipsHtml||'<span style="font-size:10px;color:var(--text3)">멤버 없음</span>'}</div>
    </div>`;
  }).join('');
};

window.adminAddGroup = function(){
  showCustomPrompt('새 그룹 이름을 입력하세요', '', function(name){
    if(!name||!name.trim()) return;
    const groups = getGroups();
    const id = 'g_'+Date.now();
    groups[id] = { name: name.trim(), members: [] };
    saveGroups(groups);
    renderAdminGroupList();
    renderUserButtons();
    renderTeamFilterBars();
  });
};

window.adminRenameGroup = function(id){
  const groups = getGroups();
  if(!groups[id]) return;
  showCustomPrompt('그룹 이름 변경', groups[id].name, function(newName){
    if(!newName||!newName.trim()) return;
    groups[id].name = newName.trim();
    saveGroups(groups);
    renderAdminGroupList();
    renderUserButtons();
    renderTeamFilterBars();
  });
};

window.adminDeleteGroup = function(id){
  if(!confirm('그룹을 삭제할까요? 소속 멤버는 미배정으로 이동됩니다.')) return;
  const groups = getGroups();
  delete groups[id];
  saveGroups(groups);
  renderAdminGroupList();
  renderUserButtons();
  renderTeamFilterBars();
};

window.removeFromGroup = function(groupId, name){
  const groups = getGroups();
  if(!groups[groupId]) return;
  groups[groupId].members = (groups[groupId].members||[]).filter(m=>m!==name);
  saveGroups(groups);
  renderAdminGroupList();
  renderUserButtons();
};

// ── 어드민 멤버 관리 ──
window.renderAdminMemberList = function(){
  const el = document.getElementById('admin-member-list');
  if(!el) return;
  const members = getMemberList().filter(n=>n!=='어드민');
  const groups = getGroupList();
  if(!members.length){ el.innerHTML='<div class="empty">멤버 없음</div>'; return; }
  el.innerHTML = members.map((name,i)=>{
    const [bg,fg] = COLORS[i%COLORS.length];
    const curGroup = getMemberGroup(name);
    const groupSelect = `<select onchange="adminChangeMemberGroup('${name}',this.value)" style="font-size:10px;padding:2px 5px;border-radius:5px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-family:var(--font);">
      <option value="">미배정</option>
      ${groups.map(g=>`<option value="${g.id}" ${curGroup===g.name?'selected':''}>${g.name}</option>`).join('')}
    </select>`;
    return `<div class="admin-member-row">
      <div class="av" style="background:${bg};color:${fg};width:26px;height:26px;font-size:10px;flex-shrink:0">${name.slice(0,2)}</div>
      <span style="flex:1;font-size:12px;font-weight:700;color:var(--text)">${name}</span>
      ${groupSelect}
      <button onclick="adminRenameMember('${name}')" style="font-size:10px;padding:2px 8px;border-radius:5px;background:var(--amber-bg);color:var(--amber-txt);border:1px solid var(--amber-bd);cursor:pointer;font-family:var(--font)">이름</button>
      <button onclick="adminDeleteMember('${name}')" style="font-size:10px;padding:2px 7px;border-radius:5px;background:var(--red-bg);color:var(--red-txt);border:1px solid var(--red-bd);cursor:pointer;font-family:var(--font)">삭제</button>
    </div>`;
  }).join('');
};

window.adminChangeMemberGroup = function(name, groupId){
  const groups = getGroups();
  // 모든 그룹에서 제거
  Object.keys(groups).forEach(gid=>{
    if(groups[gid].members) groups[gid].members = groups[gid].members.filter(m=>m!==name);
  });
  // 선택 그룹에 추가
  if(groupId && groups[groupId]){
    if(!groups[groupId].members) groups[groupId].members=[];
    groups[groupId].members.push(name);
  }
  saveGroups(groups);
  renderUserButtons();
  renderTeamFilterBars();
};

async function migrateUserName(oldName, newName){
  try {
    const updates = {};
    Object.entries(S.entries).forEach(([id, e]) => {
      if(e.name === oldName) updates['entries/'+id+'/name'] = newName;
    });
    const memosSnap = await window._fb.get('memos');
    if(memosSnap.exists()) memosSnap.forEach(c=>{ if(c.val().author===oldName) updates['memos/'+c.key+'/author']=newName; });
    const calSnap = await window._fb.get('calEvents');
    if(calSnap.exists()) calSnap.forEach(c=>{ if(c.val().author===oldName) updates['calEvents/'+c.key+'/author']=newName; });
    const commSnap = await window._fb.get('comments');
    if(commSnap.exists()) commSnap.forEach(entry=>entry.forEach(c=>{ if(c.val().author===oldName) updates['comments/'+entry.key+'/'+c.key+'/author']=newName; }));
    const statusSnap = await window._fb.get('memberStatus/'+oldName);
    if(statusSnap.exists()){ updates['memberStatus/'+newName]=statusSnap.val(); updates['memberStatus/'+oldName]=null; }
    const favSnap = await window._fb.get('favorites/'+oldName);
    if(favSnap.exists()){ updates['favorites/'+newName]=favSnap.val(); updates['favorites/'+oldName]=null; }
    if(Object.keys(updates).length > 0) await window._fb.updateMulti(updates);
  } catch(err) { console.error('[이름변경] 오류:', err); }
}

window.adminRenameMember = function(oldName){
  showCustomPrompt('이름 변경', oldName, function(newName){
    if(!newName||!newName.trim()||newName===oldName) return;
    const n = newName.trim();
    const members = getMemberList();
    const idx = members.indexOf(oldName);
    if(idx<0) return;
    members[idx] = n;
    saveMemberList(members);
    const groups = getGroups();
    Object.keys(groups).forEach(gid=>{
      if(groups[gid].members){
        const mi = groups[gid].members.indexOf(oldName);
        if(mi>=0) groups[gid].members[mi] = n;
      }
    });
    saveGroups(groups);
    const pins = getPinData();
    if(pins[oldName]){ pins[n]=pins[oldName]; delete pins[oldName]; savePinData(pins); }
    migrateUserName(oldName, n);
    renderAdminMemberList();
    renderUserButtons();
    renderTeamFilterBars();
  });
};

window.adminDeleteMember = function(name){
  if(!confirm('"'+name+'"을 삭제할까요?')) return;
  const members = getMemberList().filter(m=>m!==name);
  saveMemberList(members);
  // 그룹에서도 제거
  const groups = getGroups();
  Object.keys(groups).forEach(gid=>{
    if(groups[gid].members) groups[gid].members = groups[gid].members.filter(m=>m!==name);
  });
  saveGroups(groups);
  renderAdminMemberList();
  renderUserButtons();
  renderTeamFilterBars();
};

window.adminEditPin = function(name){
  S._adminEditTarget=name; S._adminEditBuf='';
  updateAdminEditDots();
  document.getElementById('admin-edit-name').textContent='"'+name+'" 새 PIN 입력';
  document.getElementById('admin-edit-overlay').style.display='flex';
}
window.closeAdminEdit = function(){
  document.getElementById('admin-edit-overlay').style.display='none';
  S._adminEditBuf='';
}
window.adminDelPin = function(name){
  if(!confirm('"'+name+'"의 PIN을 삭제할까요?')) return;
  const d=getPinData(); delete d[name]; savePinData(d); renderAdminPanel();
}
function updateAdminEditDots(){
  for(let i=0;i<4;i++){
    const d=document.getElementById('aed'+i);
    if(d){ d.style.background=i<S._adminEditBuf.length?'var(--blue)':'transparent'; d.style.borderColor=i<S._adminEditBuf.length?'var(--blue)':'var(--border2)'; }
  }
}
window.adminEditInput = function(n){
  if(S._adminEditBuf.length>=4) return;
  S._adminEditBuf+=n; updateAdminEditDots();
  if(S._adminEditBuf.length===4){
    setTimeout(()=>{
      const d=getPinData(); d[S._adminEditTarget]=S._adminEditBuf; savePinData(d);
      document.getElementById('admin-edit-overlay').style.display='none';
      S._adminEditBuf='';
      renderAdminPanel();
    },150);
  }
}
window.adminEditDel = function(){
  S._adminEditBuf=S._adminEditBuf.slice(0,-1); updateAdminEditDots();
}

// ── 이름 수정 오버레이 ──
window._editMember=window.editMember=function(idx,oldName){
  document.getElementById('name-edit-idx').value=idx;
  document.getElementById('name-edit-old').value=oldName;
  document.getElementById('name-edit-input').value=oldName;
  document.getElementById('name-edit-overlay').style.display='flex';
  setTimeout(()=>document.getElementById('name-edit-input').focus(),100);
}
window.saveNameEdit=function(){
  const newName=document.getElementById('name-edit-input').value.trim();
  const idx=parseInt(document.getElementById('name-edit-idx').value);
  const oldName=document.getElementById('name-edit-old').value;
  if(!newName){closeNameEdit();return;}
  const members=getMemberList(); members[idx]=newName; saveMemberList(members);
  if(localStorage.getItem('currentUser')===oldName){
    localStorage.setItem('currentUser',newName);
    const lbl=document.getElementById('current-user-lbl'); if(lbl) lbl.textContent=newName;
  }
  closeNameEdit(); renderUserButtons();
}
window.closeNameEdit=function(){
  document.getElementById('name-edit-overlay').style.display='none';
}

// 키보드 지원 (어드민 PIN 패드, 사용자 PIN 패드 모두)
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


// ── 비밀번호 변경 ──
// [state: let S._cpTarget = '';]
// [state: let S._cpOldBuf = '';]
// [state: let S._cpNewBuf = '';]

window.openChangePinScreen = function(){
  const members = getMemberList();
  const pinData = getPinData();
  const el = document.getElementById('change-pin-user-list');
  el.innerHTML = members.map((name,i)=>{
    const [bg,fg] = COLORS[i%COLORS.length];
    const hasPin = !!pinData[name];
    return `<button onclick="selectChangePinUser('${name}')" style="display:flex;align-items:center;gap:8px;padding:9px 12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;font-family:var(--font);width:100%;transition:background .12s;" onmouseover="this.style.background='var(--blue-bg)'" onmouseout="this.style.background='var(--surface)'">
      <div class="av" style="background:${bg};color:${fg};width:26px;height:26px;font-size:10px;flex-shrink:0">${name.slice(0,2)}</div>
      <span style="flex:1;font-size:12px;font-weight:700;color:var(--text);text-align:left">${name}</span>
      <span style="font-size:10px;color:${hasPin?'var(--green)':'var(--text3)'}">${hasPin?'PIN 있음':'PIN 없음'}</span>
    </button>`;
  }).join('');
  document.getElementById('change-pin-overlay').style.display = 'flex';
}

window.closeChangePinScreen = function(){
  document.getElementById('change-pin-overlay').style.display = 'none';
  S._cpTarget=''; S._cpOldBuf=''; S._cpNewBuf='';
}

window.selectChangePinUser = function(name){
  S._cpTarget = name;
  S._cpOldBuf = '';
  updateCpDots('old');
  document.getElementById('cp-err').textContent = '';
  const pinData = getPinData();
  const [bg,fg] = COLORS[getMemberList().indexOf(name)%COLORS.length];
  // 아바타 설정
  ['cp-av','cp-av2'].forEach(id=>{
    const el=document.getElementById(id);
    if(el){el.style.background=bg;el.style.color=fg;el.textContent=name.slice(0,2);}
  });
  document.getElementById('change-pin-overlay').style.display = 'none';
  if(pinData[name]){
    // PIN 있으면 기존 PIN 먼저 확인
    document.getElementById('change-pin-old-overlay').style.display = 'flex';
  } else {
    // PIN 없으면 바로 새 PIN 설정
    document.getElementById('cp-new-err').textContent = '새 PIN을 설정해주세요';
    document.getElementById('change-pin-new-overlay').style.display = 'flex';
    updateCpDots('new');
  }
}

window.backToChangePinSelect = function(){
  document.getElementById('change-pin-old-overlay').style.display = 'none';
  S._cpOldBuf = '';
  openChangePinScreen();
}

window.backToOldPin = function(){
  document.getElementById('change-pin-new-overlay').style.display = 'none';
  S._cpNewBuf = '';
  const pinData = getPinData();
  if(pinData[S._cpTarget]){
    updateCpDots('old');
    document.getElementById('cp-err').textContent = '';
    document.getElementById('change-pin-old-overlay').style.display = 'flex';
  } else {
    openChangePinScreen();
  }
}

function updateCpDots(type){
  const buf = type==='old'?S._cpOldBuf:S._cpNewBuf;
  const prefix = type==='old'?'cpd':'cpn';
  for(let i=0;i<4;i++){
    const d=document.getElementById(prefix+i);
    if(d){d.style.background=i<buf.length?'var(--blue)':'transparent';d.style.borderColor=i<buf.length?'var(--blue)':'var(--border2)';}
  }
}

window.cpInput = function(n){
  if(S._cpOldBuf.length>=4) return;
  S._cpOldBuf+=n; updateCpDots('old');
  if(S._cpOldBuf.length===4){
    setTimeout(()=>{
      const pinData=getPinData();
      if(pinData[S._cpTarget]===S._cpOldBuf){
        document.getElementById('change-pin-old-overlay').style.display='none';
        S._cpNewBuf=''; updateCpDots('new');
        document.getElementById('cp-new-err').textContent='';
        document.getElementById('change-pin-new-overlay').style.display='flex';
      } else {
        document.getElementById('cp-err').textContent='❌ 비밀번호가 틀렸어요.';
        S._cpOldBuf=''; updateCpDots('old');
      }
    },150);
  }
}
window.cpDel = function(){
  S._cpOldBuf=S._cpOldBuf.slice(0,-1); updateCpDots('old');
  document.getElementById('cp-err').textContent='';
}

window.cpNewInput = function(n){
  if(S._cpNewBuf.length>=4) return;
  S._cpNewBuf+=n; updateCpDots('new');
  if(S._cpNewBuf.length===4){
    setTimeout(()=>{
      const d=getPinData(); d[S._cpTarget]=S._cpNewBuf; savePinData(d);
      document.getElementById('change-pin-new-overlay').style.display='none';
      S._cpTarget=''; S._cpOldBuf=''; S._cpNewBuf='';
      // 성공 메시지 후 로그인화면 복귀
      const uov=document.getElementById('user-select-overlay');
      uov.classList.add('open'); uov.style.display='flex';
      renderUserButtons();
      alert('비밀번호가 변경되었어요! ✅');
    },150);
  }
}
window.cpNewDel = function(){
  S._cpNewBuf=S._cpNewBuf.slice(0,-1); updateCpDots('new');
}

// ── 어드민 권한 체크 ──
function isAdminUser(name){
  return name === '어드민';
}
function currentIsAdmin(){
  return isAdminUser(localStorage.getItem('currentUser')||'');
}

// ── 어드민 로그인 ──
// [state: let S._alBuf = '';]
window.showAdminLoginOverlay = function(){
  S._alBuf = '';
  updateAlDots();
  document.getElementById('al-err').textContent = '';
  const uov = document.getElementById('user-select-overlay');
  uov.classList.remove('open'); uov.style.display='';
  document.getElementById('admin-login-overlay').style.display = 'flex';
}
window.closeAdminLoginOverlay = function(){
  document.getElementById('admin-login-overlay').style.display = 'none';
  S._alBuf = '';
  const uov = document.getElementById('user-select-overlay');
  uov.classList.add('open'); uov.style.display='flex';
  renderUserButtons();
}
function updateAlDots(){
  for(let i=0;i<4;i++){
    const d=document.getElementById('ald'+i);
    if(d){d.style.background=i<S._alBuf.length?'var(--amber)':'transparent';d.style.borderColor=i<S._alBuf.length?'var(--amber)':'var(--border2)';}
  }
}
window.alInput = function(n){
  if(S._alBuf.length>=4) return;
  S._alBuf+=n; updateAlDots();
  if(S._alBuf.length===4){
    setTimeout(()=>{
      if(S._alBuf===ADMIN_PIN){
        document.getElementById('admin-login-overlay').style.display='none';
        localStorage.setItem('currentUser','어드민');
        applyUser('어드민');
      } else {
        document.getElementById('al-err').textContent='❌ PIN이 틀렸어요.';
        S._alBuf=''; updateAlDots();
      }
    },150);
  }
}
window.alDel = function(){
  S._alBuf=S._alBuf.slice(0,-1); updateAlDots();
  document.getElementById('al-err').textContent='';
}

// ── PC 알림 시스템 ──
// [state: let S._prevEntryKeys = null;]
// [state: let S._prevHistorySnap = {};]
// [state: let S._notifyEnabled = localStorage.getItem('notifyEnabled')]
