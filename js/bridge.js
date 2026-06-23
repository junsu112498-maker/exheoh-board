function closeWidget(){ if(window._closeWidget) window._closeWidget(); else if(window.electronAPI) window.electronAPI.closeWidget(); }
function minimizeWidget(){ if(window._minimizeWidget) window._minimizeWidget(); else if(window.electronAPI) window.electronAPI.minimizeWidget(); }
function submitEntry(){ if(window._submitEntry) window._submitEntry(); }
function deleteEntry(id){ if(window._deleteEntry) window._deleteEntry(id); }
function openEdit(id){ if(window._openEdit) window._openEdit(id); }
function closeModal(){ if(window._closeModal) window._closeModal(); }
function saveEdit(){ if(window._saveEdit) window._saveEdit(); }
function switchTab(id,btn){ if(window._switchTab) window._switchTab(id,btn); }
function goToProject(projId){ if(window.goToProject) window.goToProject(projId); }
function setFilter(f,btn){ if(window._setFilter) window._setFilter(f,btn); }
function changeViewDate(d){ if(window._changeViewDate) window._changeViewDate(d); }
function goToViewToday(){ if(window._goToViewToday) window._goToViewToday(); }
function changeMonth(d){ if(window._changeMonth) window._changeMonth(d); }
function goToToday(){ if(window._goToToday) window._goToToday(); }
function showCalDetail(ds){ if(window._showCalDetail) window._showCalDetail(ds); }
function deleteCalEntry(id,ds){ if(window._deleteCalEntry) window._deleteCalEntry(id,ds); }
function addProject(){ if(window._addProject) window._addProject(); }
function deleteProject(id){ if(window._deleteProject) window._deleteProject(id); }
function startEditProj(id){ if(window._startEditProj) window._startEditProj(id); }
function saveEditProj(id){ if(window._saveEditProj) window._saveEditProj(id); }
function filterProjList(){ if(window._filterProjList) window._filterProjList(); }
function toggleProjSort(){ if(window._toggleProjSort) window._toggleProjSort(); }
function statsFilterProj(){ if(window.statsFilterProj) window.statsFilterProj(); }
function statsOpenProjDd(){ if(window.statsOpenProjDd) window.statsOpenProjDd(); }
function statsCloseProjDd(){ if(window.statsCloseProjDd) window.statsCloseProjDd(); }
function statsSelectProj(e,name){ if(window.statsSelectProj) window.statsSelectProj(e,name); }
function toggleHistory(id){ if(window._toggleHistory) window._toggleHistory(id); }
function addHistory(id){ if(window._addHistory) window._addHistory(id); }
function deleteHistory(pid,hid){ if(window._deleteHistory) window._deleteHistory(pid,hid); }
function editHistory(hid){ if(window._editHistory) window._editHistory(hid); }
function saveHistory(pid,hid){ if(window._saveHistory) window._saveHistory(pid,hid); }
function cancelEditHistory(hid){ if(window._cancelEditHistory) window._cancelEditHistory(hid); }
function selectUser(name){ if(window._selectUser) window._selectUser(name); }
function openAdminModal(){ if(window._openAdminModal) window._openAdminModal(); }
function adminDeletePin(name){ if(window._adminDeletePin) window._adminDeletePin(name); }
function pinInput(n){ if(window._pinInput) window._pinInput(n); }
function pinDelete(){ if(window._pinDelete) window._pinDelete(); }
function pinBack(){ if(window._pinBack) window._pinBack(); }
function changePin(){ if(window._changePin) window._changePin(); }
function toggleAcc(id){ if(window.toggleAcc) window.toggleAcc(id); }
function closeAdminModal(){ if(window._closeAdminModal) window._closeAdminModal(); }
function adminResetPin(name){ if(window._adminResetPin) window._adminResetPin(name); }
function adminSetPin(name){ if(window._adminSetPin) window._adminSetPin(name); }
function addMember(){ if(window._addMember) window._addMember(); }
function editMember(i,n){ if(window._editMember) window._editMember(i,n); }
function deleteMember(i){ if(window._deleteMember) window._deleteMember(i); }
function changeUser(){ if(window._changeUser) window._changeUser(); }
function submitMemo(){ if(window._submitMemo) window._submitMemo(); }
function deleteMemo(id){ if(window._deleteMemo) window._deleteMemo(id); }
function submitTodo(){ if(window.submitTodo) window.submitTodo(); }
function openTodoProjSearch(){ if(window.openTodoProjSearch) window.openTodoProjSearch(); }
function filterTodoProjSearch(){ if(window.filterTodoProjSearch) window.filterTodoProjSearch(); }
function selectTodoProjSearch(id,n){ if(window.selectTodoProjSearch) window.selectTodoProjSearch(id,n); }
function toggleTodoDone(id){ if(window.toggleTodoDone) window.toggleTodoDone(id); }
function deleteTodo(id){ if(window.deleteTodo) window.deleteTodo(id); }
function openTodoEdit(id){ if(window.openTodoEdit) window.openTodoEdit(id); }
function closeTodoEdit(){ if(window.closeTodoEdit) window.closeTodoEdit(); }
function saveTodoEdit(){ if(window.saveTodoEdit) window.saveTodoEdit(); }
function toggleTodoEditAssigneeDropdown(){ if(window.toggleTodoEditAssigneeDropdown) window.toggleTodoEditAssigneeDropdown(); }
function selectEditAssignee(n,s){ if(window.selectEditAssignee) window.selectEditAssignee(n,s); }
function setTodoTeam(n){ if(window.setTodoTeam) window.setTodoTeam(n); }
function setTodoFilter(f,el){ if(window.setTodoFilter) window.setTodoFilter(f,el); }
function clearDoneTodos(){ if(window.clearDoneTodos) window.clearDoneTodos(); }
function renderTodoAssigneeDropdown(s){ if(window.renderTodoAssigneeDropdown) window.renderTodoAssigneeDropdown(s); }
function toggleTodoAssigneeDropdown(){ if(window.toggleTodoAssigneeDropdown) window.toggleTodoAssigneeDropdown(); }
function selectTodoAssignee(n,s){ if(window.selectTodoAssignee) window.selectTodoAssignee(n,s); }
function setMemoFilter(n){ if(window._setMemoFilter) window._setMemoFilter(n); }
function openAdminPanel(){ if(window.openAdminPanel) window.openAdminPanel(); }
function closeAdminPanel(){ if(window.closeAdminPanel) window.closeAdminPanel(); }
function closeAdminPinOverlay(){ if(window.closeAdminPinOverlay) window.closeAdminPinOverlay(); }
function adminPinInput(n){ if(window.adminPinInput) window.adminPinInput(n); }
function adminPinDel(){ if(window.adminPinDel) window.adminPinDel(); }
function adminEditPin(n){ if(window.adminEditPin) window.adminEditPin(n); }
function adminEditInput(n){ if(window.adminEditInput) window.adminEditInput(n); }
function adminEditDel(){ if(window.adminEditDel) window.adminEditDel(); }
function adminDelPin(n){ if(window.adminDelPin) window.adminDelPin(n); }
function closeAdminEdit(){ if(window.closeAdminEdit) window.closeAdminEdit(); }
function saveNameEdit(){ if(window.saveNameEdit) window.saveNameEdit(); }
function closeNameEdit(){ if(window.closeNameEdit) window.closeNameEdit(); }
function openChangePinScreen(){ if(window.openChangePinScreen) window.openChangePinScreen(); }
function closeChangePinScreen(){ if(window.closeChangePinScreen) window.closeChangePinScreen(); }
function selectChangePinUser(n){ if(window.selectChangePinUser) window.selectChangePinUser(n); }
function backToChangePinSelect(){ if(window.backToChangePinSelect) window.backToChangePinSelect(); }
function backToOldPin(){ if(window.backToOldPin) window.backToOldPin(); }
function cpInput(n){ if(window.cpInput) window.cpInput(n); }
function cpDel(){ if(window.cpDel) window.cpDel(); }
function cpNewInput(n){ if(window.cpNewInput) window.cpNewInput(n); }
function cpNewDel(){ if(window.cpNewDel) window.cpNewDel(); }
function showAdminLoginOverlay(){ if(window.showAdminLoginOverlay) window.showAdminLoginOverlay(); }
function closeAdminLoginOverlay(){ if(window.closeAdminLoginOverlay) window.closeAdminLoginOverlay(); }
function alInput(n){ if(window.alInput) window.alInput(n); }
function alDel(){ if(window.alDel) window.alDel(); }
function toggleNotify(){ if(
window.toggleNotify) 
window.toggleNotify(); }
function openProjSearch(){ if(window.openProjSearch) window.openProjSearch(); }
function closeProjSearch(){ if(window.closeProjSearch) window.closeProjSearch(); }
function filterProjSearch(){ if(window.filterProjSearch) window.filterProjSearch(); }
function selectProjSearch(id,name){ if(window.selectProjSearch) window.selectProjSearch(id,name); }
function openMemoProjSearch(){ if(window.openMemoProjSearch) window.openMemoProjSearch(); }
function closeMemoProjSearch(){ if(window.closeMemoProjSearch) window.closeMemoProjSearch(); }
function filterMemoProjSearch(){ if(window.filterMemoProjSearch) window.filterMemoProjSearch(); }
function selectMemoProjSearch(id,name){ if(window.selectMemoProjSearch) window.selectMemoProjSearch(id,name); }
function openAddEvent(ds){ if(window.openAddEvent) window.openAddEvent(ds); }
function closeCalEventModal(){ if(window.closeCalEventModal) window.closeCalEventModal(); }
function saveCalEvent(){ if(window.saveCalEvent) window.saveCalEvent(); }
function showEventDetail(ds){ if(window.showEventDetail) window.showEventDetail(ds); }
function closeEventDetail(){ if(window.closeEventDetail) window.closeEventDetail(); }
function editCalEvent(id){ if(window.editCalEvent) window.editCalEvent(id); }
function deleteCalEventItem(id,ds){ if(window.deleteCalEventItem) window.deleteCalEventItem(id,ds); }
function ganttCellClick(sid,ds){ if(window.ganttCellClick) window.ganttCellClick(sid,ds); }
function closeGanttCellModal(){ if(window.closeGanttCellModal) window.closeGanttCellModal(); }
function ganttCellSave(){ if(window.ganttCellSave) window.ganttCellSave(); }
function ganttCellDelete(){ if(window.ganttCellDelete) window.ganttCellDelete(); }
function openCalMonthPicker(){ if(window.openCalMonthPicker) window.openCalMonthPicker(); }
function closeCalMonthPicker(){ if(window.closeCalMonthPicker) window.closeCalMonthPicker(); }
function cmpChangeYear(d){ if(window.cmpChangeYear) window.cmpChangeYear(d); }
function cmpSelectMonth(m){ if(window.cmpSelectMonth) window.cmpSelectMonth(m); }
function openBoardDatePicker(){ if(window.openBoardDatePicker) window.openBoardDatePicker(); }
function closeBoardDatePicker(){ if(window.closeBoardDatePicker) window.closeBoardDatePicker(); }
function bdpChangeMonth(d){ if(window.bdpChangeMonth) window.bdpChangeMonth(d); }
function bdpSelectToday(){ if(window.bdpSelectToday) window.bdpSelectToday(); }
function bdpSelectDate(ds){ if(window.bdpSelectDate) window.bdpSelectDate(ds); }
function toggleMaximize(){ if(window._toggleMaximize){ window._toggleMaximize(); } }
function setProjFilter(f,v){ if(window.setProjFilter) window.setProjFilter(f,v); }
function clearProjFilter(){ if(window.clearProjFilter) window.clearProjFilter(); }

function ganttOpenProj(){ if(window._ganttOpenProj) window._ganttOpenProj(); }
function ganttFilterProj(){ if(window._ganttFilterProj) window._ganttFilterProj(); }
function ganttSelectProj(id,name){ if(window._ganttSelectProj) window._ganttSelectProj(id,name); }
function ganttAdd(){ if(window._ganttAdd) window._ganttAdd(); }
function ganttAddOrEdit(){ if(window.ganttAddOrEdit) window.ganttAddOrEdit(); }
function ganttDelete(id){ if(window._ganttDelete) window._ganttDelete(id); }
function ganttEdit(id){ if(window._ganttEdit) window._ganttEdit(id); }
function ganttNavPrev(){ if(window._ganttNavPrev) window._ganttNavPrev(); }
function ganttNavNext(){ if(window._ganttNavNext) window._ganttNavNext(); }
function ganttGoToday(){ if(window._ganttGoToday) window._ganttGoToday(); }
function ganttSetView(v,btn){ if(window._ganttSetView) window._ganttSetView(v,btn); }
function ganttRender(){ if(window._ganttRender) window._ganttRender(); }
function openAlertAddModal(id){ if(window.openAlertAddModal) window.openAlertAddModal(id); }
function closeAlertModal(){ if(window.closeAlertModal) window.closeAlertModal(); }
function saveAlert(){ if(window.saveAlert) window.saveAlert(); }
function deleteAlert(id){ if(window.deleteAlert) window.deleteAlert(id); }
function addComment(id){ if(window.addComment) window.addComment(id); }
function deleteComment(eid,cid){ if(window.deleteComment) window.deleteComment(eid,cid); }
function toggleCardCollapse(id){ if(window.toggleCardCollapse) window.toggleCardCollapse(id); }
function toggleCardMore(id){ if(window.toggleCardMore) window.toggleCardMore(id); }
function toggleTagDropdown(id,e){ if(window.toggleTagDropdown) window.toggleTagDropdown(id,e); }
function changeEntryTag(id,tag,e){ if(window.changeEntryTag) window.changeEntryTag(id,tag,e); }
function toggleMyOnly(btn){ if(window.toggleMyOnly) window.toggleMyOnly(btn); }
function goToSearchDate(id,date,e){ if(window.goToSearchDate) window.goToSearchDate(id,date,e); }
function startEditComment(eid,cid){ if(window.startEditComment) window.startEditComment(eid,cid); }
function saveEditComment(eid,cid){ if(window.saveEditComment) window.saveEditComment(eid,cid); }
function cancelEditComment(eid,cid){ if(window.cancelEditComment) window.cancelEditComment(eid,cid); }
function filterEditProjSearch(){ if(window.filterEditProjSearch) window.filterEditProjSearch(); }
function openEditProjSearch(){ if(window.openEditProjSearch) window.openEditProjSearch(); }
function selectEditProjSearch(id,name){ if(window.selectEditProjSearch) window.selectEditProjSearch(id,name); }
function toggleMemoPin(id){ if(window.toggleMemoPin) window.toggleMemoPin(id); }
function ganttPrint(){ if(window.ganttPrint) window.ganttPrint(); }
function ganttCellProgressToggle(e,id){ if(window.ganttCellProgressToggle) window.ganttCellProgressToggle(e,id); }
function ganttCellProgressSelect(val){ if(window.ganttCellProgressSelect) window.ganttCellProgressSelect(val); }
function progStepClick(e,projId,stepKey){ if(window.progStepClick) window.progStepClick(e,projId,stepKey); }
function progCalNav(dir){ if(window.progCalNav) window.progCalNav(dir); }
function progCalSelect(day){ if(window.progCalSelect) window.progCalSelect(day); }
function progCalClear(){ if(window.progCalClear) window.progCalClear(); }
// 그룹/팀 필터 브리지
function toggleGroupExpand(id){ if(window.toggleGroupExpand) window.toggleGroupExpand(id); }
function openAddGroupModal(){ if(window.openAddGroupModal) window.openAddGroupModal(); }
function editGroup(id){ if(window.editGroup) window.editGroup(id); }
function deleteGroup(id){ if(window.deleteGroup) window.deleteGroup(id); }
function addMemberToGroup(gid){ if(window.addMemberToGroup) window.addMemberToGroup(gid); }
function removeMemberFromGroup(gid,name){ if(window.removeMemberFromGroup) window.removeMemberFromGroup(gid,name); }
function setTeamFilter(name){ if(window.setTeamFilter) window.setTeamFilter(name); }
function toggleCalTeamFilter(name){ if(window.toggleCalTeamFilter) window.toggleCalTeamFilter(name); }
function setSchTeamFilter(name){ if(window.setSchTeamFilter) window.setSchTeamFilter(name); }
function setSchMemberFilter(name){ if(window.setSchMemberFilter) window.setSchMemberFilter(name); }
function switchCalView(v){ if(window.switchCalView) window.switchCalView(v); }
function onCalAddBtn(){ if(window.onCalAddBtn) window.onCalAddBtn(); }
function showScheduleDetail(ds){ if(window.showScheduleDetail) window.showScheduleDetail(ds); }
function deleteCalEvent(id,ds){ if(window.deleteCalEvent) window.deleteCalEvent(id,ds); }
function editCalEvent(id){ if(window.editCalEvent) window.editCalEvent(id); }
function setGanttTeamFilter(name){ if(window.setGanttTeamFilter) window.setGanttTeamFilter(name); }
function setMemoGroupFilter(name){ if(window.setMemoGroupFilter) window.setMemoGroupFilter(name); }
function memoSearchFilter(){ if(window.memoSearchFilter) window.memoSearchFilter(); }
function ganttTeamDropToggle(){ if(window.ganttTeamDropToggle) window.ganttTeamDropToggle(); }
function ganttTeamSelect(val,label){ if(window.ganttTeamSelect) window.ganttTeamSelect(val,label); }
function ganttProgressToggle(){ if(window.ganttProgressToggle) window.ganttProgressToggle(); }
function ganttProgressSelect(val){ if(window.ganttProgressSelect) window.ganttProgressSelect(val); }
// 어드민 관리
function boardSearch(){ if(window.boardSearch) window.boardSearch(); }
function clearBoardSearch(){ if(window.clearBoardSearch) window.clearBoardSearch(); }
function openAIChat(){ if(window.openAIChat) window.openAIChat(); }
function closeAIChat(){ if(window.closeAIChat) window.closeAIChat(); }
function sendAIMessage(){ if(window.sendAIMessage) window.sendAIMessage(); }
function aiQuickSend(msg){ if(window.aiQuickSend) window.aiQuickSend(msg); }
function toggleTimer(){ if(window.toggleTimer) window.toggleTimer(); }
function toggleFavorite(id){ if(window.toggleFavorite) window.toggleFavorite(id); }
function selectFavProj(id){ if(window.selectFavProj) window.selectFavProj(id); }
function adminAddGroup(){ if(window.adminAddGroup) window.adminAddGroup(); }
function adminRenameGroup(id){ if(window.adminRenameGroup) window.adminRenameGroup(id); }
function adminDeleteGroup(id){ if(window.adminDeleteGroup) window.adminDeleteGroup(id); }
function removeFromGroup(gid,name){ if(window.removeFromGroup) window.removeFromGroup(gid,name); }
function adminRenameMember(name){ if(window.adminRenameMember) window.adminRenameMember(name); }
function adminDeleteMember(name){ if(window.adminDeleteMember) window.adminDeleteMember(name); }
function adminChangeMemberGroup(name,gid){ if(window.adminChangeMemberGroup) window.adminChangeMemberGroup(name,gid); }
function toggleNewMemberGroupDd(){ if(window.toggleNewMemberGroupDd) window.toggleNewMemberGroupDd(); }
function selectNewMemberGroup(id,name){ if(window.selectNewMemberGroup) window.selectNewMemberGroup(id,name); }
function confirmCustomPrompt(){ if(window.confirmCustomPrompt) window.confirmCustomPrompt(); }
function cancelCustomPrompt(){ if(window.cancelCustomPrompt) window.cancelCustomPrompt(); }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── 카드 접기/펼치기 ──
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window._collapsedCards = new Set();
window.toggleCardCollapse = function(id) {
  const detail = document.getElementById('card-detail-'+id);
  const btn = document.getElementById('collapse-btn-'+id);
  if(!detail) return;
  const isCollapsed = window._collapsedCards.has(id);
  if(isCollapsed) {
    window._collapsedCards.delete(id);
    detail.style.display = '';
    if(btn) btn.textContent = '▲';
  } else {
    window._collapsedCards.add(id);
    detail.style.display = 'none';
    if(btn) btn.textContent = '▼';
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── 업무 내용 더보기 ──
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window.toggleCardMore = function(id) {
  const body = document.getElementById('card-body-'+id);
  const btn = document.getElementById('more-btn-'+id);
  if(!body) return;
  if(body.classList.contains('expanded')) {
    body.classList.remove('expanded');
    if(btn) btn.textContent = '더보기 ▼';
  } else {
    body.classList.add('expanded');
    if(btn) btn.textContent = '접기 ▲';
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── 상태 원클릭 변경 ──
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window.toggleTagDropdown = function(id, event) {
  event.stopPropagation();
  // 다른 드롭다운 모두 닫기
  document.querySelectorAll('.tag-dropdown.open').forEach(dd => {
    if(dd.id !== 'tagdd-'+id) dd.classList.remove('open');
  });
  const dd = document.getElementById('tagdd-'+id);
  if(dd) dd.classList.toggle('open');
};
window.changeEntryTag = function(id, newTag, event) {
  event.stopPropagation();
  const {ref, update} = window.firebase_fns||{};
  const db = window.firebase_db;
  if(!ref||!update||!db) return;
  update(ref(db,'entries/'+id), {tag: newTag});
  const dd = document.getElementById('tagdd-'+id);
  if(dd) dd.classList.remove('open');
};
// 다른 곳 클릭 시 드롭다운 닫기
document.addEventListener('click', ()=>{
  document.querySelectorAll('.tag-dropdown.open').forEach(dd=>dd.classList.remove('open'));
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── 나만 보기 토글 ──
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window._myOnlyMode = false;
window.toggleMyOnly = function(btn) {
  window._myOnlyMode = !window._myOnlyMode;
  btn.classList.toggle('on', window._myOnlyMode);
  btn.textContent = window._myOnlyMode ? '👤 나만 ON' : '👤 나만';
  render();
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── 오프라인 모드 ──
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const OFFLINE_KEY = 'exheoh_offline_queue';
function getOfflineQueue() {
  try { return JSON.parse(localStorage.getItem(OFFLINE_KEY)||'[]'); } catch(e){ return []; }
}
function saveOfflineQueue(q) {
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(q));
}
function showOfflineBanner(msg, type='offline') {
  const b = document.getElementById(type==='sync'?'sync-banner':'offline-banner');
  if(!b) return;
  if(msg) b.textContent = msg;
  b.classList.add('show');
  setTimeout(()=>b.classList.remove('show'), 3500);
}

// 온/오프라인 감지
window.addEventListener('online', ()=>{
  const q = getOfflineQueue();
  if(q.length > 0) {
    showOfflineBanner(`✅ 온라인 복구 — 저장된 업무 ${q.length}건 동기화 중...`, 'sync');
    const {ref: fbRef, push: fbPush} = window.firebase_fns||{};
    const db = window.firebase_db;
    if(fbRef && fbPush && db) {
      q.forEach(entry => {
        const entriesRef = fbRef(db, 'entries');
        fbPush(entriesRef, entry);
      });
      saveOfflineQueue([]);
    }
  }
});
window.addEventListener('offline', ()=>{
  showOfflineBanner('📡 오프라인 — 업무가 로컬에 저장됩니다');
});

// submitEntry 오프라인 처리 패치
const _origSubmit = window.submitEntry;
window._submitEntry = window.submitEntry = function() {
  if(!navigator.onLine) {
    const nameEl = document.getElementById('inp-name');
    const saved = localStorage.getItem('currentUser');
    if(saved && !nameEl.value.trim()) nameEl.value = saved;
    const name = nameEl.value.trim();
    const tag = document.getElementById('inp-tag').value;
    const task = document.getElementById('inp-task').value.trim();
    const date = document.getElementById('inp-date').value;
    const startTime = document.getElementById('inp-start').value;
    const endTime = document.getElementById('inp-end').value;
    const projectId = document.getElementById('inp-proj').value||'';
    if(!name || !task) { if(!name) nameEl.focus(); else document.getElementById('inp-task').focus(); return; }
    const q = getOfflineQueue();
    q.push({name,tag,task,date,startTime,endTime,projectId,ts:Date.now(),_offline:true});
    saveOfflineQueue(q);
    document.getElementById('inp-task').value='';
    document.getElementById('inp-start').value='';
    document.getElementById('inp-end').value='';
    document.getElementById('inp-proj').value='';
    const si = document.getElementById('proj-search-input'); if(si) si.value='';
    if(saved) setTimeout(()=>{ nameEl.value=saved; },100);
    showOfflineBanner(`📡 오프라인 저장 완료 (대기 ${q.length}건)`);
    return;
  }
  _origSubmit();
};


// ── 검색결과 클릭 → 해당 날짜로 이동 ──
window.goToSearchDate = function(entryId, date, event) {
  if(!date) return;
  // 클릭 이벤트가 버튼에서 온 경우 무시
  if(event && (event.target.classList.contains('act-btn') || 
     event.target.classList.contains('tag-clickable') ||
     event.target.closest('.tag-dropdown'))) return;
  
  // 검색 초기화
  const inp = document.getElementById('board-search-input');
  if(inp) inp.value = '';
  if(window.clearBoardSearch) window.clearBoardSearch();
  
  // 해당 날짜로 이동
  viewDate = date;
  updateViewDateLabel();
  render();
  
  // 해당 카드로 스크롤 + 하이라이트
  setTimeout(() => {
    const card = document.getElementById('card-' + entryId);
    if(card) {
      card.scrollIntoView({behavior:'smooth', block:'center'});
      card.style.transition = 'box-shadow 0.2s, background 0.2s';
      card.style.boxShadow = '0 0 0 2px var(--blue)';
      card.style.background = 'var(--blue-bg)';
      setTimeout(() => {
        card.style.boxShadow = '';
        card.style.background = '';
      }, 1500);
    }
  }, 300);
};


// ── 수정모달 프로젝트 검색 ──
window.filterEditProjSearch = function(){
  const q = document.getElementById('edit-proj-search-input').value;
  renderEditProjSearchList(q);
  document.getElementById('edit-proj-search-dropdown').classList.add('open');
};
window.openEditProjSearch = function(){
  const q = document.getElementById('edit-proj-search-input').value;
  renderEditProjSearchList(q);
  document.getElementById('edit-proj-search-dropdown').classList.add('open');
};
function renderEditProjSearchList(q){
  const dd = document.getElementById('edit-proj-search-dropdown');
  if(!dd) return;
  const sorted = Object.entries(projects).sort((a,b)=>(a[1].name||'').localeCompare(b[1].name||'','ko'));
  const filtered = q
    ? sorted.filter(([id,p])=>(p.name||'').includes(q)||(p.code||'').includes(q))
    : sorted;
  const curVal = document.getElementById('edit-proj').value;
  const items = [['','없음'],...filtered.map(([id,p])=>[id,p.name])];
  dd.innerHTML = items.map(([id,name])=>`
    <div class="proj-search-item${id===curVal?' selected':''}" onmousedown="selectEditProjSearch('${id}','${(name||'').replace(/'/g,"\'")}')">
      ${name}
    </div>`).join('');
}
window.selectEditProjSearch = function(id, name){
  document.getElementById('edit-proj').value = id;
  document.getElementById('edit-proj-search-input').value = id ? name : '';
  document.getElementById('edit-proj-search-dropdown').classList.remove('open');
};
// 모달 외부 클릭시 드롭다운 닫기
document.addEventListener('click', (e)=>{
  const wrap = document.getElementById('edit-proj-search-wrap');
  if(wrap && !wrap.contains(e.target)){
    const dd = document.getElementById('edit-proj-search-dropdown');
    if(dd) dd.classList.remove('open');
  }
});


// ── 댓글 인라인 수정 ──
window.startEditComment = function(entryId, cid){
  const textEl = document.getElementById('cmt-text-'+entryId+'-'+cid);
  const editEl = document.getElementById('cmt-edit-'+entryId+'-'+cid);
  const inp = document.getElementById('cmt-edit-inp-'+entryId+'-'+cid);
  if(!textEl||!editEl) return;
  textEl.style.display = 'none';
  editEl.style.display = 'block';
  if(inp){ inp.focus(); inp.select(); }
};
window.saveEditComment = function(entryId, cid){
  const inp = document.getElementById('cmt-edit-inp-'+entryId+'-'+cid);
  if(!inp||!inp.value.trim()) return;
  const {ref: fbRef, update: fbUpdate} = window.firebase_fns||{};
  const db = window.firebase_db;
  if(!fbRef||!fbUpdate||!db) return;
  fbUpdate(fbRef(db, 'comments/'+entryId+'/'+cid), { text: inp.value.trim() });
};
window.cancelEditComment = function(entryId, cid){
  const textEl = document.getElementById('cmt-text-'+entryId+'-'+cid);
  const editEl = document.getElementById('cmt-edit-'+entryId+'-'+cid);
  if(!textEl||!editEl) return;
  textEl.style.display = '';
  editEl.style.display = 'none';
};

// ── 할일 완료 토글 애니메이션 ──
const _origToggleTodoDone = window.toggleTodoDone;
window.toggleTodoDone = function(id){
  const t = window._todos ? window._todos[id] : null;
  if(!t) return;
  // 완료로 바꿀 때 애니메이션
  if(!t.done){
    const card = document.querySelector(`[data-todo-id="${id}"]`);
    if(card){
      card.style.transition = 'opacity 0.3s, transform 0.3s';
      card.style.opacity = '0.5';
      card.style.transform = 'scale(0.98)';
      setTimeout(()=>{ card.style.opacity=''; card.style.transform=''; }, 400);
    }
  }
  if(_origToggleTodoDone) _origToggleTodoDone(id);
  else {
    const {ref: fbRef, update: fbUpdate} = window.firebase_fns||{};
    const db = window.firebase_db;
    if(fbRef&&fbUpdate&&db) fbUpdate(fbRef(db, 'todos/'+id), { done: !t.done });
  }
};

// ── 검색어 없으면 즉시 일반뷰 복귀 ──
document.addEventListener('DOMContentLoaded', ()=>{
  const inp = document.getElementById('board-search-input');
  if(inp){
    inp.addEventListener('input', ()=>{
      if(!inp.value.trim()) {
        if(window.clearBoardSearch) window.clearBoardSearch();
      }
    });
    inp.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape') {
        inp.value = '';
        if(window.clearBoardSearch) window.clearBoardSearch();
      }
    });
  }
});


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ── AI비서 어시스턴트 ──
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const OLLAMA_URL = 'http://192.168.1.55:11434';
const OLLAMA_MODEL = 'llama3.1';
let aiChatHistory = [];
let aiIsTyping = false;

// Ollama 상태 확인
async function checkOllamaStatus(){
  try {
    const res = await fetch(OLLAMA_URL + '/api/tags', { method:'GET', signal: AbortSignal.timeout(3000) });
    if(res.ok){
      const el = document.getElementById('ai-status');
      if(el){ el.innerHTML = '<span class="ai-status-dot"></span>온라인'; el.className = 'ai-status online'; }
      return true;
    }
  } catch(e) {}
  const el = document.getElementById('ai-status');
  if(el){ el.innerHTML = '<span class="ai-status-dot"></span>오프라인'; el.className = 'ai-status offline'; }
  return false;
}

// 현재 업무 데이터를 컨텍스트로 변환
function buildContext(){
  const today = new Date().toISOString().slice(0,10);
  const curUser = localStorage.getItem('currentUser')||'';
  const projData = window._projects || {};

  // 오늘 업무
  const todayEntries = Object.values(window._entries||{})
    .filter(e=>e.date===today)
    .map(e=>`- ${e.name}(${e.tag}): ${e.task} ${e.startTime?e.startTime+'~'+e.endTime:''}`)
    .join('\n');

  // 프로젝트 목록
  const projList = Object.values(projData)
    .map(p=>p.name).join(', ');

  return `당신은 건축 설계 회사 EXHEOH의 업무 어시스턴트 AI비서입니다.
현재 사용자: ${curUser}
오늘 날짜: ${today}
오늘 등록된 업무:
${todayEntries || '없음'}
프로젝트 목록: ${projList || '없음'}
한국어로 친절하게 답변해주세요. 업무 등록이 필요하면 구체적인 정보를 물어보세요.`;
}

// 업무 등록 파싱
async function parseAndRegisterEntry(text){
  const curUser = localStorage.getItem('currentUser')||'';
  const today = new Date().toISOString().slice(0,10);

  const prompt = `다음 텍스트에서 업무 정보를 추출해서 JSON으로만 답해주세요. 다른 텍스트 없이 JSON만:
텍스트: "${text}"
형식: {"name":"${curUser}","task":"업무내용","date":"${today}","startTime":"HH:MM","endTime":"HH:MM","tag":"작업중","projectId":""}
tag는 작업중 또는 작업완료만 가능. 시간 없으면 빈 문자열. JSON만 출력하세요.`;

  try {
    const res = await fetch(OLLAMA_URL + '/api/generate', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false })
    });
    const data = await res.json();
    const jsonStr = data.response.match(/\{[\s\S]*\}/)?.[0];
    if(!jsonStr) return null;
    return JSON.parse(jsonStr);
  } catch(e) { return null; }
}

// 메시지 추가
function addAIMessage(role, text){
  const container = document.getElementById('ai-chat-messages');
  if(!container) return;
  const isUser = role === 'user';
  const div = document.createElement('div');
  div.className = `ai-msg ${role}`;
  div.innerHTML = `
    <div class="ai-msg-avatar">${isUser ? '👤' : '🤖'}</div>
    <div class="ai-msg-bubble">${text.replace(/</g,'&lt;')}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  aiChatHistory.push({ role: isUser ? 'user' : 'assistant', content: text });
}

// 타이핑 인디케이터
function showTyping(){
  const container = document.getElementById('ai-chat-messages');
  if(!container) return;
  const div = document.createElement('div');
  div.className = 'ai-msg assistant';
  div.id = 'ai-typing-indicator';
  div.innerHTML = `<div class="ai-msg-avatar">🤖</div><div class="ai-msg-bubble"><div class="ai-typing"><span></span><span></span><span></span></div></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}
function hideTyping(){
  const el = document.getElementById('ai-typing-indicator');
  if(el) el.remove();
}

// AI에게 메시지 전송
async function sendToOllama(userMsg){
  const context = buildContext();
  const prompt = context + '\n\n사용자: ' + userMsg + '\nAI비서:';

  try {
    const res = await fetch(OLLAMA_URL + '/api/generate', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false })
    });
    const data = await res.json();
    return data.response || '죄송해요, 답변을 생성하지 못했어요.';
  } catch(e) {
    return '❌ Ollama 서버에 연결할 수 없어요. 서버가 실행 중인지 확인해주세요.';
  }
}

// 메시지 전송
window.sendAIMessage = async function(){
  if(aiIsTyping) return;
  const inp = document.getElementById('ai-chat-input');
  const msg = inp.value.trim();
  if(!msg) return;
  inp.value = '';
  addAIMessage('user', msg);
  aiIsTyping = true;
  document.getElementById('ai-chat-send-btn').disabled = true;
  showTyping();

  // 업무 등록 감지
  const isRegister = msg.includes('등록') || msg.includes('업무') && (msg.includes('했어') || msg.includes('했습니다') || msg.includes('완료'));

  let reply;
  if(isRegister){
    const parsed = await parseAndRegisterEntry(msg);
    if(parsed && parsed.task){
      // Firebase에 등록
      const {ref: fbRef, push: fbPush} = window.firebase_fns||{};
      const db = window.firebase_db;
      if(fbRef && fbPush && db){
        const entriesRef = fbRef(db, 'entries');
        fbPush(entriesRef, { ...parsed, ts: Date.now() });
        reply = `✅ 업무 등록 완료!\n\n이름: ${parsed.name}\n내용: ${parsed.task}\n날짜: ${parsed.date}\n상태: ${parsed.tag}${parsed.startTime ? '\n시간: '+parsed.startTime+'~'+parsed.endTime : ''}`;
      } else {
        reply = '❌ Firebase 연결 오류예요.';
      }
    } else {
      reply = await sendToOllama(msg);
    }
  } else {
    reply = await sendToOllama(msg);
  }

  hideTyping();
  addAIMessage('assistant', reply);
  aiIsTyping = false;
  document.getElementById('ai-chat-send-btn').disabled = false;
};

window.aiQuickSend = function(msg){
  const inp = document.getElementById('ai-chat-input');
  if(inp) inp.value = msg;
  window.sendAIMessage();
};

window.openAIChat = function(){
  // Electron IPC로 새 AI 창 열기
  if(window.electronAPI && window.electronAPI.openAIWindow){
    window.electronAPI.openAIWindow();
  } else {
    // 폴백: 패널 방식
    const panel = document.getElementById('ai-chat-modal-bg');
    if(panel) panel.style.display = 'flex';
    checkOllamaStatus();
    const container = document.getElementById('ai-chat-messages');
    if(container && container.children.length === 0){
      addAIMessage('assistant', '안녕하세요! 저는 AI비서예요 🤖\n\n업무 등록, 팀 현황 조회, 프로젝트 확인 등 무엇이든 도와드릴게요!');
    }
    setTimeout(()=>document.getElementById('ai-chat-input')?.focus(), 200);
  }
};

window.closeAIChat = function(){
  const panel = document.getElementById('ai-chat-modal-bg');
  if(panel) panel.style.display = 'none';
  
  // 창 원래 크기로 복구 (840 → 460)
  if(window.electronAPI && window.electronAPI.resizeWidget){
    window.electronAPI.resizeWidget(460, window.innerHeight||720, 0, 0);
  }
  window._aiChatOpen = false;
};

// 모달 외부 클릭 시 닫기
document.getElementById('ai-chat-modal-bg')?.addEventListener('click', (e)=>{
  if(e.target.id === 'ai-chat-modal-bg') window.closeAIChat();
});

// 30초마다 상태 확인
setInterval(checkOllamaStatus, 30000);


// AI 모드 초기화
if(new URLSearchParams(window.location.search).get('mode') === 'ai'){
  document.documentElement.setAttribute('data-ai-mode', 'true');
  // DOM 준비되면 실행
  function initAIMode(){
    const shell = document.getElementById('widget-shell');
    if(shell) shell.style.setProperty('display','none','important');
    const overlay = document.getElementById('user-select-overlay');
    if(overlay) overlay.style.setProperty('display','none','important');
    const panel = document.getElementById('ai-chat-modal-bg');
    if(panel){
      panel.style.cssText = 'display:flex!important;position:fixed!important;top:0!important;left:0!important;width:100%!important;height:100vh!important;border:none!important;border-radius:12px!important;';
    }
    if(window.checkOllamaStatus) window.checkOllamaStatus();
    if(window.addAIMessage){
      const container = document.getElementById('ai-chat-messages');
      if(container && container.children.length === 0){
        window.addAIMessage('assistant', '안녕하세요! 저는 AI비서예요 🤖\n\n업무 등록, 팀 현황 조회, 프로젝트 확인 등 무엇이든 도와드릴게요!');
      }
    }
    document.getElementById('ai-chat-input')?.focus();
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>setTimeout(initAIMode, 300));
  } else {
    setTimeout(initAIMode, 300);
  }
}

// ── 호출 기능 브리지 ──
function openCallModal(){ if(window.openCallModal) window.openCallModal(); }
function closeCallModal(){ if(window.closeCallModal) window.closeCallModal(); }
function toggleDndMode(){ if(window.toggleDndMode) window.toggleDndMode(); }
function callSelectGroup(gid,gname){ if(window.callSelectGroup) window.callSelectGroup(gid,gname); }
function callBackToGroups(){ if(window.callBackToGroups) window.callBackToGroups(); }
function callBackToMembers(){ if(window.callBackToMembers) window.callBackToMembers(); }
function callMemberDirect(name){ if(window.callMemberDirect) window.callMemberDirect(name); }
function sendCall(){ if(window.sendCall) window.sendCall(); }
function respondCall(r){ if(window.respondCall) window.respondCall(r); }
function dismissCallIncoming(){ if(window.dismissCallIncoming) window.dismissCallIncoming(); }</script>

<!-- 진행상태 셀 팝업 -->
<div id="gantt-prog-popup" style="display:none;position:fixed;z-index:9999;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);box-shadow:0 6px 20px rgba(0,0,0,.14);min-width:108px;overflow:hidden;">
  <div class="gantt-prog-item" onclick="ganttCellProgressSelect('')"        data-val=""><span style="font-size:11px;color:var(--text3);">− 없음</span></div>
  <div class="gantt-prog-item" onclick="ganttCellProgressSelect('1차송부')" data-val="1차송부"><span class="prog-badge prog-1차송부">1차 송부</span></div>
  <div class="gantt-prog-item" onclick="ganttCellProgressSelect('2차송부')" data-val="2차송부"><span class="prog-badge prog-2차송부">2차 송부</span></div>
  <div class="gantt-prog-item" onclick="ganttCellProgressSelect('납품')"    data-val="납품"><span class="prog-badge prog-납품">납품</span></div>
  <div class="gantt-prog-item" onclick="ganttCellProgressSelect('리비전')"  data-val="리비전"><span class="prog-badge prog-리비전">리비전</span></div>
</div>

