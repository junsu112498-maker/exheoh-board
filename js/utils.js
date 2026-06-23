const S = window.S;

// ── 색상 · 헬퍼 (onValue 콜백보다 먼저 선언) ──
const COLORS=[
  ['#dbeafe','#1e40af'],['#d1fae5','#065f46'],['#fef3c7','#92400e'],['#ede9fe','#4c1d95'],
  ['#fce7f3','#831843'],['#ffedd5','#7c2d12'],['#dcfce7','#14532d'],['#fef9c3','#713f12'],
  ['#e0f2fe','#075985'],['#f3e8ff','#581c87'],['#ffe4e6','#9f1239'],['#cffafe','#164e63'],
  ['#f0fdf4','#166534'],['#fdf4ff','#701a75'],['#fff7ed','#9a3412'],['#ecfdf5','#064e3b'],
  ['#eef2ff','#3730a3'],['#fdf2f8','#9d174d'],['#f0f9ff','#0c4a6e'],['#fefce8','#854d0e'],
  ['#f7fee7','#3f6212'],['#fff1f2','#881337'],['#f0fdfa','#134e4a'],['#faf5ff','#6b21a8'],
  ['#fff8f1','#7c2d12'],['#e8f5e9','#1b5e20'],['#e3f2fd','#0d47a1'],['#fce4ec','#880e4f'],
  ['#e8eaf6','#1a237e'],['#e0f7fa','#006064']
];
const PROJ_COLORS=['#2563eb','#16a34a','#d97706','#7c3aed','#dc2626','#0891b2','#ea580c','#65a30d'];
// 멤버 인덱스 기반 색상 - 겹치지 않게 고유 배정
function getColor(n){
  const members = (typeof getMemberList === 'function') ? getMemberList() : [];
  const idx = members.indexOf(n);
  if(idx >= 0) return COLORS[idx % COLORS.length];
  // fallback: 해시
  let h=0; for(let c of n) h=(h*31+c.charCodeAt(0))%COLORS.length; return COLORS[Math.abs(h)];
}
function getProjColor(id){ const keys=Object.keys(S.projects); const i=keys.indexOf(id); return i>=0?PROJ_COLORS[i%PROJ_COLORS.length]:'#9ca3af'; }
// 이름 표시: 성 제외 이름 2글자 (3글자 이상이면 뒤 2글자, 2글자 이하면 그대로)
function initials(n){ if(!n) return '?'; return n.length >= 3 ? n.slice(1, 3) : n; }
function todayStr(){ return new Date().toISOString().slice(0,10); }
function toMin(t){ const[h,m]=t.split(':').map(Number); return h*60+m; }
function fmtDur(min){ return min>0 ? Math.floor(min/60)+'h '+(min%60)+'m' : '—'; }

// ── 전역 데이터 (onValue 콜백보다 먼저 선언) ──
// [state: let S.entries={}, S.projects={}, S.filterTag='전체', S.editId=]
// [state: let S.projSortOrder='asc';]
// [state: let S.calYear=new Date().getFullYear(), S.calMonth=new Date(]
// [state: let S.calView='work';]
// [state: let S.schTeamFilters=new Set(['전체']);]
// [state: let S.schMemberFilter='';]
// [state: let S.viewDate=todayStr();]
// [state: let S.memos={}, S.memoPersonFilter='전체';]
// [state: let S.teamFilter='전체';]
// [state: let S.calTeamFilters=new Set(['전체']);]
// [state: let S.calMemberFilter='';]
// [state: let S.ganttTeamFilter='전체';]
// [state: let S.memoGroupFilter='전체';]
// [state: let S.calEvents = {};]

// ── 캐시 변수 (반드시 onValue 등록 전에 선언) ──
// [state: let S._memberListCache = JSON.parse(localStorage.getItem('me]
// [state: let S._pinDataCache    = JSON.parse(localStorage.getItem('pi]
// [state: let S._groupsCache     = JSON.parse(localStorage.getItem('gr]
window._memberListCache = S._memberListCache;
window._groupsCache     = S._groupsCache;

// ── 그룹 시스템 헬퍼 (onValue 전에 선언) ──
function getGroups(){ return S._groupsCache||{}; }
function saveGroups(obj){
  S._groupsCache = obj;
  window._groupsCache = obj;
  localStorage.setItem('groupsData', JSON.stringify(obj));
  window._fb.update('settings', { groups: obj });
}
function getGroupList(){
  return Object.entries(getGroups()).map(([id,g])=>({id,...g}))
    .sort((a,b)=>a.name.localeCompare(b.name,'ko'));
}
function getMemberGroup(name){
  for(const [id,g] of Object.entries(getGroups())){
    if((g.members||[]).includes(name)) return g.name;
  }
  return '';
}
function getMembersOfGroup(groupId){
  const g = getGroups()[groupId];
  return g ? (g.members||[]) : [];
}

function getMemberList(){
  return S._memberListCache;
}
function saveMemberList(arr){
  S._memberListCache = arr;
  localStorage.setItem('memberList', JSON.stringify(arr));
  window._fb.update('settings', { members: arr });
  // game script에서 접근 가능하도록 노출
  window._memberListCache = S._memberListCache;
  window._groupsCache = S._groupsCache;
}

function initUserSelect(){
  const saved = localStorage.getItem('currentUser');
  if(saved){ applyUser(saved); return; }
  renderUserButtons();
  const _ov2=document.getElementById('user-select-overlay'); _ov2.classList.add('open'); _ov2.style.display='flex';
  // widget-shell always visible
}
