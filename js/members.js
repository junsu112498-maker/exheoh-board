const S = window.S;

function renderUserButtons(){
  const list = document.getElementById('user-btn-list');
  const members = getMemberList();
  const isAdmin = currentIsAdmin();
  const groupList = getGroupList();
  const membersInGroups = new Set(groupList.flatMap(g=>g.members||[]));
  // 그룹에 속하지 않은 멤버
  const ungrouped = members.filter(n=>n!=='어드민'&&!membersInGroups.has(n));

  let html = '';

  // 그룹 섹션
  groupList.forEach(g=>{
    const gMembers = (g.members||[]).filter(n=>members.includes(n));
    const [gbg] = COLORS[groupList.indexOf(g)%COLORS.length]||['#2563eb'];
    html += `<div class="group-section">
      <div class="group-header" id="ghdr-${g.id}" onclick="toggleGroupExpand('${g.id}')">
        <div class="group-header-left">
          <div class="group-icon" style="background:${gbg}">${g.name.slice(0,1)}</div>
          <span class="group-name-text">${g.name}</span>
          <span class="group-count">${gMembers.length}명</span>
        </div>
        <div style="display:flex;align-items:center;gap:4px;">
          ${isAdmin?`<div class="group-admin-btns">
            <button class="group-admin-btn" onclick="event.stopPropagation();editGroup('${g.id}')" title="그룹 수정">✏</button>
            <button class="group-admin-btn" onclick="event.stopPropagation();deleteGroup('${g.id}')" title="그룹 삭제" style="color:var(--red-txt)">✕</button>
          </div>`:''}
          <span class="group-arrow">▶</span>
        </div>
      </div>
      <div class="group-members" id="gmem-${g.id}">
        ${gMembers.map((name,i)=>{
          const [bg,fg]=getColor(name);
          return `<div class="group-member-item" onclick="selectUser('${name}')">
            <div class="user-av" style="background:${bg};color:${fg};width:24px;height:24px;font-size:10px">${initials(name)}</div>
            <span style="font-size:12px;font-weight:600;color:var(--text);flex:1">${name}</span>
          </div>`;
        }).join('')}
        ${isAdmin?`<div class="group-add-member-row">
          <input type="text" placeholder="멤버 추가..." id="gadd-${g.id}" maxlength="10" onkeydown="if(event.key==='Enter')addMemberToGroup('${g.id}')"/>
          <button onclick="addMemberToGroup('${g.id}')">+</button>
        </div>`:''}
      </div>
    </div>`;
  });

  // 그룹 미배정 멤버
  if(ungrouped.length){
    html += `<div class="group-section">
      <div class="group-header" id="ghdr-__none__" onclick="toggleGroupExpand('__none__')">
        <div class="group-header-left">
          <div class="group-icon" style="background:var(--text3)">?</div>
          <span class="group-name-text" style="color:var(--text3)">미배정</span>
          <span class="group-count">${ungrouped.length}명</span>
        </div>
        <span class="group-arrow">▶</span>
      </div>
      <div class="group-members" id="gmem-__none__">
        ${ungrouped.map(name=>{
          const [bg,fg]=getColor(name);
          return `<div class="group-member-item" onclick="selectUser('${name}')">
            <div class="user-av" style="background:${bg};color:${fg};width:24px;height:24px;font-size:10px">${initials(name)}</div>
            <span style="font-size:12px;font-weight:600;color:var(--text);flex:1">${name}</span>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  // 어드민
  html += `<div style="margin-top:6px;border-top:1px solid var(--border);padding-top:6px;width:100%;max-width:260px;">
    <button class="user-btn" onclick="selectUser('어드민')" style="border-color:var(--amber-bd);background:var(--amber-bg);">
      <div class="user-av" style="background:var(--amber-bg);color:var(--amber-txt);">관</div>
      <span class="user-btn-name" style="color:var(--amber-txt);">어드민</span>
      <span style="font-size:9px;color:var(--amber-txt);margin-left:auto;">🔐</span>
    </button>
    ${isAdmin?`<button onclick="openAddGroupModal()" style="margin-top:6px;width:100%;font-size:11px;padding:6px;border-radius:7px;background:var(--blue);color:#fff;border:none;cursor:pointer;font-family:var(--font);font-weight:600;">＋ 그룹 추가</button>`:''}
  </div>`;

  list.innerHTML = html;
}

// 그룹 펼치기/접기
window.toggleGroupExpand = function(id){
  const hdr = document.getElementById('ghdr-'+id);
  const mem = document.getElementById('gmem-'+id);
  if(!hdr||!mem) return;
  hdr.classList.toggle('open');
  mem.classList.toggle('open');
};

// 그룹 추가 모달
window.openAddGroupModal = function(){
  showCustomPrompt('새 그룹 이름을 입력하세요', '', function(name){
    if(!name||!name.trim()) return;
    const groups = getGroups();
    const id = 'g_'+Date.now();
    groups[id] = { name: name.trim(), members: [] };
    saveGroups(groups);
    renderUserButtons();
    renderTeamFilterBars();
  });
};

// 그룹 수정
window.editGroup = function(id){
  const groups = getGroups();
  if(!groups[id]) return;
  showCustomPrompt('그룹 이름 변경', groups[id].name, function(newName){
    if(!newName||!newName.trim()) return;
    groups[id].name = newName.trim();
    saveGroups(groups);
    renderUserButtons();
    renderTeamFilterBars();
  });
};

// 그룹 삭제
window.deleteGroup = function(id){
  if(!confirm('그룹을 삭제하시겠습니까? (멤버는 미배정으로 이동됩니다)')) return;
  const groups = getGroups();
  delete groups[id];
  saveGroups(groups);
  renderUserButtons();
  renderTeamFilterBars();
};

// 그룹에 멤버 추가
window.addMemberToGroup = function(groupId){
  const inp = document.getElementById('gadd-'+groupId);
  if(!inp) return;
  const name = inp.value.trim();
  if(!name) return;
  const members = getMemberList();
  const groups = getGroups();
  // 멤버가 없으면 멤버 목록에도 추가
  if(!members.includes(name)){
    members.push(name);
    saveMemberList(members);
  }
  // 다른 그룹에서 제거 후 이 그룹에 추가
  Object.keys(groups).forEach(gid=>{
    if(gid!==groupId && groups[gid].members){
      groups[gid].members = groups[gid].members.filter(m=>m!==name);
    }
  });
  if(!groups[groupId].members) groups[groupId].members=[];
  if(!groups[groupId].members.includes(name)) groups[groupId].members.push(name);
  saveGroups(groups);
  inp.value='';
  renderUserButtons();
  renderTeamFilterBars();
};

// 그룹에서 멤버 제거
window.removeMemberFromGroup = function(groupId, name){
  const groups = getGroups();
  if(!groups[groupId]) return;
  groups[groupId].members = (groups[groupId].members||[]).filter(m=>m!==name);
  saveGroups(groups);
  renderUserButtons();
};


window._addMember=window.addMember=function(){
  const inp = document.getElementById('user-new-input');
  const name = inp.value.trim();
  if(!name) return;
  const members = getMemberList();
  if(members.includes(name)){ inp.value=''; return; }
  members.push(name);
  saveMemberList(members);
  // 선택한 그룹에 배정
  const selectedGroupId = window._newMemberGroupId||'';
  if(selectedGroupId){
    const groups = getGroups();
    if(groups[selectedGroupId]){
      if(!groups[selectedGroupId].members) groups[selectedGroupId].members=[];
      if(!groups[selectedGroupId].members.includes(name)) groups[selectedGroupId].members.push(name);
      saveGroups(groups);
    }
  }
  inp.value='';
  // 드롭다운 초기화
  window._newMemberGroupId = '';
  const btn = document.getElementById('new-member-group-btn');
  if(btn) btn.textContent='소속 ▾';
  renderUserButtons();
  renderTeamFilterBars();
};

// 로그인 화면 소속 드롭다운
window._newMemberGroupId = '';
window.toggleNewMemberGroupDd = function(){
  const dd = document.getElementById('new-member-group-dd');
  if(!dd) return;
  const isOpen = dd.style.display !== 'none';
  if(isOpen){ dd.style.display='none'; return; }
  // 그룹 목록 채우기
  const groups = getGroupList();
  dd.innerHTML = `<div class="gantt-prog-item" onclick="selectNewMemberGroup('','소속 없음')" data-val="">소속 없음</div>`
    + groups.map(g=>`<div class="gantt-prog-item" onclick="selectNewMemberGroup('${g.id}','${g.name}')" data-val="${g.id}">${g.name}</div>`).join('');
  dd.style.display='block';
  setTimeout(()=>{
    const handler = function(e){
      if(!dd.contains(e.target) && e.target.id!=='new-member-group-btn'){
        dd.style.display='none';
        document.removeEventListener('click',handler);
      }
    };
// [app.js]
  },0);
};
window.selectNewMemberGroup = function(id, name){
  window._newMemberGroupId = id;
  const btn = document.getElementById('new-member-group-btn');
  if(btn) btn.textContent = (name||'소속 없음')+' ▾';
  const dd = document.getElementById('new-member-group-dd');
  if(dd) dd.style.display='none';
};

// editMember는 아래 새 버전으로 대체됨

window._deleteMember=window.deleteMember=function(idx){
  if(!confirm('멤버를 삭제하시겠습니까?')) return;
  const members = getMemberList();
  members.splice(idx,1);
  saveMemberList(members);
  renderUserButtons();
}

window._selectUser=window.selectUser=function(name){
  if(!name||!name.trim()) return;
  localStorage.setItem('currentUser', name.trim());
  applyUser(name.trim());
}
