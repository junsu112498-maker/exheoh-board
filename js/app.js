// ── Firebase init ──
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, push, remove, update, set, off, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAxZez_Y9CDqKlRcP5S3Sl9XlcHKue6rdg",
  authDomain: "calendar-64524.firebaseapp.com",
  databaseURL: "https://calendar-64524-default-rtdb.firebaseio.com",
  projectId: "calendar-64524",
  storageBucket: "calendar-64524.firebasestorage.app",
  messagingSenderId: "768034165757",
  appId: "1:768034165757:web:c89976603bc2a7a93f3f94"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
// game script 접근용 노출
window.firebase_db = db;
window.firebase_fns = { ref, set, update, remove, push, onValue, off };
const entriesRef = ref(db,'entries');

// ── 공휴일 데이터 (2024~2026) ──
const HOLIDAYS = {
  '2024-01-01':'신정','2024-02-09':'설날연휴','2024-02-10':'설날','2024-02-11':'설날연휴',
  '2024-02-12':'대체공휴일','2024-03-01':'삼일절','2024-04-10':'국회의원선거',
  '2024-05-05':'어린이날','2024-05-06':'대체공휴일','2024-05-15':'부처님오신날',
  '2024-06-06':'현충일','2024-08-15':'광복절','2024-09-16':'추석연휴',
  '2024-09-17':'추석','2024-09-18':'추석연휴','2024-10-03':'개천절',
  '2024-10-09':'한글날','2024-12-25':'크리스마스',
  '2025-01-01':'신정','2025-01-28':'설날연휴','2025-01-29':'설날','2025-01-30':'설날연휴',
  '2025-03-01':'삼일절','2025-03-03':'대체공휴일','2025-05-05':'어린이날',
  '2025-05-06':'부처님오신날','2025-06-06':'현충일','2025-08-15':'광복절',
  '2025-10-05':'추석연휴','2025-10-06':'추석','2025-10-07':'추석연휴',
  '2025-10-08':'대체공휴일','2025-10-03':'개천절','2025-10-09':'한글날',
  '2025-12-25':'크리스마스',
  '2026-01-01':'신정','2026-02-16':'설날연휴','2026-02-17':'설날','2026-02-18':'설날연휴',
  '2026-03-01':'삼일절','2026-02-19':'대체공휴일','2026-05-05':'어린이날',
  '2026-05-25':'부처님오신날','2026-06-06':'현충일','2026-08-15':'광복절',
  '2026-09-24':'추석연휴','2026-09-25':'추석','2026-09-26':'추석연휴',
  '2026-10-03':'개천절','2026-10-09':'한글날','2026-12-25':'크리스마스',
  '2027-01-01':'신정',
  '2027-02-05':'설날연휴',
  '2027-02-06':'설날',
  '2027-02-07':'설날연휴',
  '2027-03-01':'삼일절',
  '2027-05-05':'어린이날',
  '2027-05-13':'부처님오신날',
  '2027-06-06':'현충일',
  '2027-08-15':'광복절',
  '2027-09-14':'추석연휴',
  '2027-09-15':'추석',
  '2027-09-16':'추석연휴',
  '2027-10-03':'개천절',
  '2027-10-09':'한글날',
  '2027-12-25':'크리스마스',
  '2028-01-01':'신정',
  '2028-01-25':'설날연휴',
  '2028-01-26':'설날',
  '2028-01-27':'설날연휴',
  '2028-03-01':'삼일절',
  '2028-05-02':'부처님오신날',
  '2028-05-05':'어린이날',
  '2028-06-06':'현충일',
  '2028-08-15':'광복절',
  '2028-10-02':'추석연휴',
  '2028-10-03':'추석',
  '2028-10-04':'추석연휴',
  '2028-10-09':'한글날',
  '2028-12-25':'크리스마스',
  '2029-01-01':'신정',
  '2029-02-12':'설날연휴',
  '2029-02-13':'설날',
  '2029-02-14':'설날연휴',
  '2029-03-01':'삼일절',
  '2029-05-05':'어린이날',
  '2029-05-20':'부처님오신날',
  '2029-06-06':'현충일',
  '2029-08-15':'광복절',
  '2029-09-22':'추석연휴',
  '2029-09-23':'추석',
  '2029-09-24':'추석연휴',
  '2029-10-03':'개천절',
  '2029-10-09':'한글날',
  '2029-12-25':'크리스마스',
  '2030-01-01':'신정',
  '2030-02-02':'설날연휴',
  '2030-02-03':'설날',
  '2030-02-04':'설날연휴',
  '2030-03-01':'삼일절',
  '2030-05-05':'어린이날',
  '2030-05-11':'부처님오신날',
  '2030-06-06':'현충일',
  '2030-08-15':'광복절',
  '2030-09-11':'추석연휴',
  '2030-09-12':'추석',
  '2030-09-13':'추석연휴',
  '2030-10-03':'개천절',
  '2030-10-09':'한글날',
  '2030-12-25':'크리스마스',
  '2031-01-01':'신정',
  '2031-01-22':'설날연휴',
  '2031-01-23':'설날',
  '2031-01-24':'설날연휴',
  '2031-03-01':'삼일절',
  '2031-05-01':'부처님오신날',
  '2031-05-05':'어린이날',
  '2031-06-06':'현충일',
  '2031-08-15':'광복절',
  '2031-10-01':'추석연휴',
  '2031-10-02':'추석',
  '2031-10-03':'추석연휴',
  '2031-10-09':'한글날',
  '2031-12-25':'크리스마스',
  '2032-01-01':'신정',
  '2032-02-10':'설날연휴',
  '2032-02-11':'설날',
  '2032-02-12':'설날연휴',
  '2032-03-01':'삼일절',
  '2032-05-05':'어린이날',
  '2032-05-18':'부처님오신날',
  '2032-06-06':'현충일',
  '2032-08-15':'광복절',
  '2032-09-18':'추석연휴',
  '2032-09-19':'추석',
  '2032-09-20':'추석연휴',
  '2032-10-03':'개천절',
  '2032-10-09':'한글날',
  '2032-12-25':'크리스마스',
  '2033-01-01':'신정',
  '2033-01-30':'설날연휴',
  '2033-01-31':'설날',
  '2033-02-01':'설날연휴',
  '2033-03-01':'삼일절',
  '2033-05-05':'어린이날',
  '2033-05-07':'부처님오신날',
  '2033-06-06':'현충일',
  '2033-08-15':'광복절',
  '2033-09-07':'추석연휴',
  '2033-09-08':'추석',
  '2033-09-09':'추석연휴',
  '2033-10-03':'개천절',
  '2033-10-09':'한글날',
  '2033-12-25':'크리스마스',
  '2034-01-01':'신정',
  '2034-02-18':'설날연휴',
  '2034-02-19':'설날',
  '2034-02-20':'설날연휴',
  '2034-03-01':'삼일절',
  '2034-05-05':'어린이날',
  '2034-05-26':'부처님오신날',
  '2034-06-06':'현충일',
  '2034-08-15':'광복절',
  '2034-09-27':'추석연휴',
  '2034-09-28':'추석',
  '2034-09-29':'추석연휴',
  '2034-10-03':'개천절',
  '2034-10-09':'한글날',
  '2034-12-25':'크리스마스',
  '2035-01-01':'신정',
  '2035-02-07':'설날연휴',
  '2035-02-08':'설날',
  '2035-02-09':'설날연휴',
  '2035-03-01':'삼일절',
  '2035-05-05':'어린이날',
  '2035-05-15':'부처님오신날',
  '2035-06-06':'현충일',
  '2035-08-15':'광복절',
  '2035-09-16':'추석연휴',
  '2035-09-17':'추석',
  '2035-09-18':'추석연휴',
  '2035-10-03':'개천절',
  '2035-10-09':'한글날',
  '2035-12-25':'크리스마스',
  '2036-01-01':'신정',
  '2036-01-27':'설날연휴',
  '2036-01-28':'설날',
  '2036-01-29':'설날연휴',
  '2036-03-01':'삼일절',
  '2036-05-04':'부처님오신날',
  '2036-05-05':'어린이날',
  '2036-06-06':'현충일',
  '2036-08-15':'광복절',
  '2036-10-03':'개천절',
  '2036-10-04':'추석연휴',
  '2036-10-05':'추석',
  '2036-10-06':'추석연휴',
  '2036-10-09':'한글날',
  '2036-12-25':'크리스마스',
  '2037-01-01':'신정',
  '2037-02-14':'설날연휴',
  '2037-02-15':'설날',
  '2037-02-16':'설날연휴',
  '2037-03-01':'삼일절',
  '2037-05-05':'어린이날',
  '2037-05-22':'부처님오신날',
  '2037-06-06':'현충일',
  '2037-08-15':'광복절',
  '2037-09-24':'추석연휴',
  '2037-09-25':'추석',
  '2037-09-26':'추석연휴',
  '2037-10-03':'개천절',
  '2037-10-09':'한글날',
  '2037-12-25':'크리스마스',
  '2038-01-01':'신정',
  '2038-02-03':'설날연휴',
  '2038-02-04':'설날',
  '2038-02-05':'설날연휴',
  '2038-03-01':'삼일절',
  '2038-05-05':'어린이날',
  '2038-05-12':'부처님오신날',
  '2038-06-06':'현충일',
  '2038-08-15':'광복절',
  '2038-09-13':'추석연휴',
  '2038-09-14':'추석',
  '2038-09-15':'추석연휴',
  '2038-10-03':'개천절',
  '2038-10-09':'한글날',
  '2038-12-25':'크리스마스',
  '2039-01-01':'신정',
  '2039-01-23':'설날연휴',
  '2039-01-24':'설날',
  '2039-01-25':'설날연휴',
  '2039-03-01':'삼일절',
  '2039-05-01':'부처님오신날',
  '2039-05-05':'어린이날',
  '2039-06-06':'현충일',
  '2039-08-15':'광복절',
  '2039-10-02':'추석연휴',
  '2039-10-03':'추석',
  '2039-10-04':'추석연휴',
  '2039-10-09':'한글날',
  '2039-12-25':'크리스마스',
  '2040-01-01':'신정',
  '2040-02-11':'설날연휴',
  '2040-02-12':'설날',
  '2040-02-13':'설날연휴',
  '2040-03-01':'삼일절',
  '2040-05-05':'어린이날',
  '2040-05-19':'부처님오신날',
  '2040-06-06':'현충일',
  '2040-08-15':'광복절',
  '2040-09-20':'추석연휴',
  '2040-09-21':'추석',
  '2040-09-22':'추석연휴',
  '2040-10-03':'개천절',
  '2040-10-09':'한글날',
  '2040-12-25':'크리스마스',
  '2041-01-01':'신정',
  '2041-01-31':'설날연휴',
  '2041-02-01':'설날',
  '2041-02-02':'설날연휴',
  '2041-03-01':'삼일절',
  '2041-05-05':'어린이날',
  '2041-05-09':'부처님오신날',
  '2041-06-06':'현충일',
  '2041-08-15':'광복절',
  '2041-09-09':'추석연휴',
  '2041-09-10':'추석',
  '2041-09-11':'추석연휴',
  '2041-10-03':'개천절',
  '2041-10-09':'한글날',
  '2041-12-25':'크리스마스',
  '2042-01-01':'신정',
  '2042-02-21':'설날연휴',
  '2042-02-22':'설날',
  '2042-02-23':'설날연휴',
  '2042-03-01':'삼일절',
  '2042-05-05':'어린이날',
  '2042-05-28':'부처님오신날',
  '2042-06-06':'현충일',
  '2042-08-15':'광복절',
  '2042-09-29':'추석연휴',
  '2042-09-30':'추석',
  '2042-10-01':'추석연휴',
  '2042-10-03':'개천절',
  '2042-10-09':'한글날',
  '2042-12-25':'크리스마스',
  '2043-01-01':'신정',
  '2043-02-09':'설날연휴',
  '2043-02-10':'설날',
  '2043-02-11':'설날연휴',
  '2043-03-01':'삼일절',
  '2043-05-05':'어린이날',
  '2043-05-17':'부처님오신날',
  '2043-06-06':'현충일',
  '2043-08-15':'광복절',
  '2043-09-18':'추석연휴',
  '2043-09-19':'추석',
  '2043-09-20':'추석연휴',
  '2043-10-03':'개천절',
  '2043-10-09':'한글날',
  '2043-12-25':'크리스마스',
  '2044-01-01':'신정',
  '2044-01-29':'설날연휴',
  '2044-01-30':'설날',
  '2044-01-31':'설날연휴',
  '2044-03-01':'삼일절',
  '2044-05-05':'어린이날',
  '2044-05-06':'부처님오신날',
  '2044-06-06':'현충일',
  '2044-08-15':'광복절',
  '2044-09-06':'추석연휴',
  '2044-09-07':'추석',
  '2044-09-08':'추석연휴',
  '2044-10-03':'개천절',
  '2044-10-09':'한글날',
  '2044-12-25':'크리스마스',
  '2045-01-01':'신정',
  '2045-02-16':'설날연휴',
  '2045-02-17':'설날',
  '2045-02-18':'설날연휴',
  '2045-03-01':'삼일절',
  '2045-05-05':'어린이날',
  '2045-05-24':'부처님오신날',
  '2045-06-06':'현충일',
  '2045-08-15':'광복절',
  '2045-09-26':'추석연휴',
  '2045-09-27':'추석',
  '2045-09-28':'추석연휴',
  '2045-10-03':'개천절',
  '2045-10-09':'한글날',
  '2045-12-25':'크리스마스',
  '2046-01-01':'신정',
  '2046-02-05':'설날연휴',
  '2046-02-06':'설날',
  '2046-02-07':'설날연휴',
  '2046-03-01':'삼일절',
  '2046-05-05':'어린이날',
  '2046-05-13':'부처님오신날',
  '2046-06-06':'현충일',
  '2046-08-15':'광복절',
  '2046-09-15':'추석연휴',
  '2046-09-16':'추석',
  '2046-09-17':'추석연휴',
  '2046-10-03':'개천절',
  '2046-10-09':'한글날',
  '2046-12-25':'크리스마스',
  '2047-01-01':'신정',
  '2047-01-25':'설날연휴',
  '2047-01-26':'설날',
  '2047-01-27':'설날연휴',
  '2047-03-01':'삼일절',
  '2047-05-03':'부처님오신날',
  '2047-05-05':'어린이날',
  '2047-06-06':'현충일',
  '2047-08-15':'광복절',
  '2047-10-03':'개천절',
  '2047-10-04':'추석연휴',
  '2047-10-05':'추석',
  '2047-10-06':'추석연휴',
  '2047-10-09':'한글날',
  '2047-12-25':'크리스마스',
  '2048-01-01':'신정',
  '2048-02-13':'설날연휴',
  '2048-02-14':'설날',
  '2048-02-15':'설날연휴',
  '2048-03-01':'삼일절',
  '2048-05-05':'어린이날',
  '2048-05-21':'부처님오신날',
  '2048-06-06':'현충일',
  '2048-08-15':'광복절',
  '2048-09-22':'추석연휴',
  '2048-09-23':'추석',
  '2048-09-24':'추석연휴',
  '2048-10-03':'개천절',
  '2048-10-09':'한글날',
  '2048-12-25':'크리스마스',
  '2049-01-01':'신정',
  '2049-02-01':'설날연휴',
  '2049-02-02':'설날',
  '2049-02-03':'설날연휴',
  '2049-03-01':'삼일절',
  '2049-05-05':'어린이날',
  '2049-05-10':'부처님오신날',
  '2049-06-06':'현충일',
  '2049-08-15':'광복절',
  '2049-09-11':'추석연휴',
  '2049-09-12':'추석',
  '2049-09-13':'추석연휴',
  '2049-10-03':'개천절',
  '2049-10-09':'한글날',
  '2049-12-25':'크리스마스',
  '2050-01-01':'신정',
  '2050-01-22':'설날연휴',
  '2050-01-23':'설날',
  '2050-01-24':'설날연휴',
  '2050-03-01':'삼일절',
  '2050-04-30':'부처님오신날',
  '2050-05-05':'어린이날',
  '2050-06-06':'현충일',
  '2050-08-15':'광복절',
  '2050-09-30':'추석연휴',
  '2050-10-01':'추석',
  '2050-10-02':'추석연휴',
  '2050-10-03':'개천절',
  '2050-10-09':'한글날',
  '2050-12-25':'크리스마스'
};

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

// ── 공유 상태 참조 ──
const S = window.S;

// ── Feature 파일용 Firebase 헬퍼 ──
window._fb = {
  update    : (path, data) => update(ref(db, path), data),
  updateMulti: (data)      => update(ref(db), data),
  push      : (path, data) => push(ref(db, path), data),
  remove    : (path)       => remove(ref(db, path)),
  set       : (path, data) => set(ref(db, path), data),
  get       : async(path)  => (await get(ref(db, path))).val(),
  onValue   : (path, cb)   => onValue(ref(db, path), cb),
};

// ── Firebase refs + onValue 리스너 ──
// ── Firebase refs ──
const calEventsRef = ref(db,'calEvents');
const projectsRef  = ref(db,'projects');
const membersRef   = ref(db,'members');
const pinsRef      = ref(db,'pins');

// ── onValue 리스너 등록 ──
onValue(calEventsRef,(snap)=>{
  S.calEvents=snap.val()||{};
  renderCal();
  if(S.calView==='schedule') renderScheduleGrid();
});

// settings 리스너: 멤버/PIN 실시간 동기화
onValue(ref(db,'settings'), (snap)=>{
  const data = snap.val()||{};
  if(data.members && Array.isArray(data.members)){
    S._memberListCache = data.members;
    localStorage.setItem('memberList', JSON.stringify(data.members));
  } else {
    const cur = getMemberList();
    update(ref(db,'settings'), { members: cur });
  }
  if(data.pins){
    S._pinDataCache = data.pins;
    localStorage.setItem('pinData', JSON.stringify(data.pins));
  }
  if(data.groups){
    S._groupsCache = data.groups;
    window._groupsCache = data.groups;
    localStorage.setItem('groupsData', JSON.stringify(data.groups));
  }
  window._memberListCache = S._memberListCache;
  renderUserButtons();
  renderTeamFilterBars();
});

// 팀 필터 전역 상태는 위에서 선언됨

// [state: let S._userInitDone=false;]

// ── applyUser / updateMemoProj: initUserSelect() 호출 전에 정의 필요 ──
window._applyUser = window.applyUser = function applyUser(name){
  localStorage.setItem('currentUser', name);
  const _ov3=document.getElementById('user-select-overlay'); _ov3.classList.remove('open'); _ov3.style.display='';
  const ov=document.getElementById('user-select-overlay'); ov.classList.remove('open'); ov.style.display='';
  const inp = document.getElementById('inp-name');
  if(inp) inp.value = isAdminUser(name)?'':name;
  const nameDisplay = document.getElementById('inp-name-display');
  if(nameDisplay) nameDisplay.textContent = isAdminUser(name)?'이름':name;
  const lbl = document.getElementById('current-user-lbl');
  if(lbl){
    lbl.textContent = name;
    lbl.style.background = isAdminUser(name)?'var(--amber-bg)':'var(--blue-bg)';
    lbl.style.color = isAdminUser(name)?'var(--amber-txt)':'var(--blue-txt)';
    lbl.style.borderColor = isAdminUser(name)?'var(--amber-bd)':'var(--blue-bd)';
  }
  render(); renderCal();
  renderMemoTabs();
};
window._changeUser=window.changeUser=function(){
  localStorage.removeItem('currentUser');
  const ov=document.getElementById('user-select-overlay'); ov.classList.add('open'); ov.style.display='flex';
  renderUserButtons();
};
window._updateMemoProj = window.updateMemoProj = function updateMemoProj(){
  const sel = document.getElementById('memo-proj-sel');
  if(!sel) return;
  const sorted = Object.entries(S.projects).sort((a,b)=>(a[1].name||'').localeCompare(b[1].name||'','ko'));
  const opts = sorted.map(([id,p])=>`<option value="${id}">${p.name}</option>`).join('');
  sel.innerHTML = '<option value="">프로젝트 (선택)</option>' + opts;
  const curVal = sel.value;
  const sinp = document.getElementById('memo-proj-search-input');
  if(sinp && curVal && S.projects[curVal]) sinp.value = S.projects[curVal].name;
};

document.getElementById('inp-date').value = todayStr();
S.viewDate = todayStr();
setTimeout(updateViewDateLabel, 0);

// 즉시 화면 표시 — Firebase 응답 기다리지 않음
S._userInitDone = true;
initUserSelect();

// ── Firebase 리스너 ──
onValue(entriesRef,(snap)=>{
  const newEntries=snap.val()||{};
  checkNewEntries(newEntries);
  S.entries=newEntries;
  window._entries = S.entries;
  // 이름/team 필드 자동 보정 - 실제 변경 필요한 것만
  const _members = getMemberList();
  const _teamUpdates = {};
  Object.entries(newEntries).forEach(([id, e]) => {
    if(!e.name) return;
    if(!_members.includes(e.name)){
      const matched = _members.find(m => m && e.name && (m.startsWith(e.name) || e.name.startsWith(m.split(' ')[0])));
      if(matched) _teamUpdates['entries/'+id+'/name'] = matched;
    }
    if(!e.team){
      const realName = _teamUpdates['entries/'+id+'/name'] || e.name;
      const grp = getMemberGroup(realName);
      if(grp) _teamUpdates['entries/'+id+'/team'] = grp;
    }
  });
  if(Object.keys(_teamUpdates).length > 0) update(ref(db), _teamUpdates);
  render(); renderCal();
  if(document.getElementById('panel-stats').classList.contains('active')) renderStats();
});
onValue(projectsRef,(snap)=>{
  S.projects=snap.val()||{};
  updateProjSelects(); renderProjList();
  renderUserButtons(); updateMemoProj();
});

// 등록 후 이름 유지 (submitEntry 직접 패치 대신 훅 방식)
window._afterSubmitHook = function(){
  const saved = localStorage.getItem('currentUser');
  if(saved) setTimeout(()=>{
    const inp = document.getElementById('inp-name');
    const display = document.getElementById('inp-name-display');
    if(inp) inp.value = saved;
    if(display) display.textContent = saved;
  },100);
};


// ── 메모 ──
const memosRef = ref(db,'memos');
const historyRef = ref(db,'history');

onValue(memosRef,(snap)=>{ S.memos=snap.val()||{}; renderMemoList(); });
onValue(historyRef,(snap)=>{
  S.historyData=snap.val()||{};
  // 열려있는 히스토리 패널 자동 갱신
  Object.keys(S.historyData).forEach(projId=>{
    const el = document.getElementById('hist-'+projId);
    if(el && el.classList.contains('open')) renderHistoryList(projId);
  });
});

window._submitMemo=window.submitMemo=function(){
  const text = document.getElementById('memo-text').value.trim();
  const projId = document.getElementById('memo-proj-sel').value||'';
  const author = localStorage.getItem('currentUser')||'익명';
  if(!text) return;
  const now = new Date();
  const secret = document.getElementById('memo-secret-chk')?.checked||false;
  push(memosRef,{
    author, text, projId,
    date: now.toISOString().slice(0,10),
    time: now.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}),
    ts: now.getTime(),
    secret: secret||false
  });
  document.getElementById('memo-text').value='';
  document.getElementById('memo-proj-sel').value='';
  const msi=document.getElementById('memo-proj-search-input'); if(msi) msi.value='';
  const chk=document.getElementById('memo-secret-chk'); if(chk) chk.checked=false;
}

window._deleteMemo=window.deleteMemo=function(id){
  const curUser=localStorage.getItem('currentUser')||'';
  const memo=S.memos[id];
  if(memo && memo.author !== curUser && !currentIsAdmin()){
    alert('본인이 작성한 메모만 삭제할 수 있어요.');
    return;
  } if(!confirm('메모를 삭제하시겠습니까?')) return; remove(ref(db,'memos/'+id)); }


// ── feature 파일에서 추출된 top-level 코드 ──
      document.addEventListener('click',handler);
const _favRef = ref(db, 'favorites');
onValue(_favRef, snap=>{
  S._favCache = snap.val()||{};
  renderFavChips();
  updateFavStars();
});
    document.addEventListener('mousemove', e => {
      if(!dragging) return;
      const dx = e.screenX - lastX;
      const dy = e.screenY - lastY;
      lastX = e.screenX;
      lastY = e.screenY;
      if((dx !== 0 || dy !== 0) && window.electronAPI){
        window.electronAPI.dragMove(dx, dy);
      }
    });
    document.addEventListener('mouseup', () => {
      if(dragging){
        dragging = false;
        document.body.style.userSelect = '';
        titlebar.style.cursor = '';
      }
    });
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
const commentsRef = ref(db, 'comments');
onValue(commentsRef, snap=>{
  S.comments = snap.val()||{};
  // 현재 렌더된 카드들의 댓글 업데이트
  Object.keys(S.comments).forEach(entryId=>{
    const el = document.getElementById('cmts-'+entryId);
    if(el) renderComments(entryId, el);
  });
});
const alertsRef = ref(db, 'userAlerts');
onValue(alertsRef, snap=>{
  S.userAlerts = snap.val()||{};
  renderAlertList();
  checkAlerts();
});

    document.addEventListener('click',handler);
onValue(historyRef,(snap)=>{
  const newHistData=snap.val()||{};
  Object.keys(newHistData).forEach(projId=>checkNewHistory(projId, newHistData[projId]));
  S.historyData=newHistData;
});
const progLogRef = ref(db, 'progressLog');
onValue(progLogRef, snap => {
  S._progLogCache = snap.val() || {};
  document.querySelectorAll('.prog-timeline-wrap').forEach(el => {
    const pid = el.id.replace('prog-timeline-wrap-','');
    if(pid && document.getElementById('hist-'+pid)?.classList.contains('open')){
      renderProjTimeline(pid);
    }
  });
});
document.addEventListener('keydown', function(e){
  const adminPinVisible = document.getElementById('admin-pin-overlay').style.display==='flex';
  const adminEditVisible = document.getElementById('admin-edit-overlay').style.display==='flex';
  const pinVisible = document.getElementById('pin-overlay').classList.contains('open');
  const nameEditVisible = document.getElementById('name-edit-overlay').style.display==='flex';

  if(nameEditVisible){
    if(e.key==='Enter') saveNameEdit();
    if(e.key==='Escape') closeNameEdit();
    return;
  }
  if(adminPinVisible){
    if(e.key>='0'&&e.key<='9') adminPinInput(e.key);
    if(e.key==='Backspace') adminPinDel();
    if(e.key==='Escape') closeAdminPinOverlay();
    return;
  }
  if(adminEditVisible){
    if(e.key>='0'&&e.key<='9') adminEditInput(e.key);
    if(e.key==='Backspace') adminEditDel();
    if(e.key==='Escape') closeAdminEdit();
    return;
  }
  const alVisible = document.getElementById('admin-login-overlay').style.display==='flex';
  if(alVisible){ if(e.key>='0'&&e.key<='9') alInput(e.key); if(e.key==='Backspace') alDel(); if(e.key==='Escape') closeAdminLoginOverlay(); return; }
  const cpOldVisible = document.getElementById('change-pin-old-overlay').style.display==='flex';
  const cpNewVisible = document.getElementById('change-pin-new-overlay').style.display==='flex';
  if(cpOldVisible){
    if(e.key>='0'&&e.key<='9') cpInput(e.key);
    if(e.key==='Backspace') cpDel();
    if(e.key==='Escape') backToChangePinSelect();
    return;
  }
  if(cpNewVisible){
    if(e.key>='0'&&e.key<='9') cpNewInput(e.key);
    if(e.key==='Backspace') cpNewDel();
    if(e.key==='Escape') backToOldPin();
    return;
  }
  if(pinVisible){
    if(e.key>='0'&&e.key<='9') pinInput(e.key);
    if(e.key==='Backspace') pinDelete();
    if(e.key==='Escape') pinBack();
    return;
  }
});
  onValue(ref(db,'appVersion'), (snap)=>{
    const data = snap.val();
    if(!data) return;
    const latestVersion = data.version||'';
    const downloadUrl = data.url||'';
    const releaseNote = data.note||'';
    if(latestVersion && latestVersion !== APP_VERSION){
      // 버전이 다르면 알림
      showUpdateBanner(latestVersion, downloadUrl, releaseNote);
    }
  }, {onlyOnce: false});
setInterval(checkAlerts, 15000);
const callsRef = ref(db, 'calls');
const dndRef   = ref(db, 'dndStatus');
document.addEventListener('mousemove', ()=>{ S._lastMouseMove = Date.now(); });
setInterval(()=>{
  const curUser = localStorage.getItem('currentUser')||'';
  if(!curUser) return;
  const isAbsent = (Date.now() - S._lastMouseMove) > 5 * 60 * 1000;
  window._fb.update('absenceStatus/'+curUser, { absent: isAbsent, ts: Date.now() });
}, 30000);
onValue(ref(db,'absenceStatus'), snap=>{
  S._absenceCache = snap.val()||{};
});
onValue(dndRef, snap=>{
  S._dndCache = snap.val()||{};
  // 내 DND 상태 복원
  const curUser = localStorage.getItem('currentUser')||'';
  if(curUser && S._dndCache[curUser] !== undefined){
    S._dndMode = !!S._dndCache[curUser];
    updateDndBtn();
  }
});
onValue(callsRef, snap=>{
  const all = snap.val()||{};
  const curUser = localStorage.getItem('currentUser')||'';
  if(!curUser) return;
  Object.entries(all).forEach(([id, c])=>{
    // 수신자 = 나 && 아직 응답 안 함 && 호출자 ≠ 나
    if(c.to === curUser && !c.response && c.from !== curUser){
      showIncomingCall(id, c);
    }
    // 발신자 = 나 && 응답 왔음 && 아직 안 읽음
    if(c.from === curUser && c.response && !c.responseRead){
      showCallResponse(id, c);
    }
  });
});
window.openCallModal = function(){
  const curUser = localStorage.getItem('currentUser')||'';
  if(!curUser){ alert('먼저 로그인하세요'); return; }
  // DND 상태 버튼 동기화
  updateDndBtn();
  // 그룹 목록 렌더
  renderCallGroups();
  // step1 보이기
  document.getElementById('call-step-groups').style.display='';
  document.getElementById('call-step-members').style.display='none';
  document.getElementById('call-step-reason').style.display='none';
  document.getElementById('call-modal-bg').style.display='flex';
};
window.closeCallModal = function(){
  document.getElementById('call-modal-bg').style.display='none';
};
window.toggleDndMode = function(){
  const curUser = localStorage.getItem('currentUser')||'';
  if(!curUser) return;
  S._dndMode = !S._dndMode;
  update(dndRef, { [curUser]: S._dndMode });
  updateDndBtn();
};
const memberStatusRef = ref(db,'memberStatus');
onValue(memberStatusRef, snap=>{
  S._memberStatusCache = snap.val()||{};
  // 타이틀바 이름 옆 상태 표시 갱신
  const curUser = localStorage.getItem('currentUser')||'';
  const myStatus = S._memberStatusCache[curUser]||'';
  const lbl = document.getElementById('current-user-lbl');
  if(lbl){
    lbl.textContent = myStatus ? `${curUser} (${myStatus})` : curUser;
  }
});
      document.addEventListener('click',h);
const ganttRef = ref(db,'ganttSchedules');
onValue(ganttRef, snap => {
  ganttSchedules = snap.val() || {};
  if(document.getElementById('panel-gantt').classList.contains('active')) ganttRender();
  // 열려있는 타임라인도 즉시 갱신 (진행상태 변경 반영)
  document.querySelectorAll('.prog-timeline-wrap').forEach(el => {
    const pid = el.id.replace('prog-timeline-wrap-','');
    if(pid && document.getElementById('hist-'+pid)?.classList.contains('open')){
      renderProjTimeline(pid);
    }
  });
});
document.addEventListener('click', function(e){
  const wrap = document.getElementById('gantt-proj-wrap');
  if(wrap && !wrap.contains(e.target)){
    const dd = document.getElementById('gantt-proj-dd');
    if(dd) dd.classList.remove('open');
  }
});
      document.addEventListener('click', handler);
document.addEventListener('click', function(e){
  const projWrap = document.getElementById('proj-search-wrap');
  const memoWrap = document.getElementById('memo-proj-search-wrap');
  const ganttWrap = document.getElementById('gantt-proj-wrap');
  if(projWrap && !projWrap.contains(e.target)){
    const dd = document.getElementById('proj-search-dropdown');
    if(dd) dd.classList.remove('open');
  }
  if(memoWrap && !memoWrap.contains(e.target)){
    const dd = document.getElementById('memo-proj-search-dropdown');
    if(dd) dd.classList.remove('open');
  }
  if(ganttWrap && !ganttWrap.contains(e.target)){
    const dd = document.getElementById('gantt-proj-dd');
    if(dd) dd.classList.remove('open');
  }
});
const todosRef = ref(db, 'todos');
onValue(todosRef, snap => {
  _todos = snap.val() || {};
  renderTodoTeamTabs();
  renderTodoList();
});
document.addEventListener('click', e => {
  const dd = document.getElementById('todo-assignee-dropdown');
  const btn = document.getElementById('todo-assignee-btn');
  if(dd && btn && !btn.contains(e.target) && !dd.contains(e.target)) dd.style.display = 'none';
});
setInterval(fetchWeather, 30 * 60 * 1000); // 30분마다 갱신
window.addEventListener('storage', (e)=>{
  if(e.key==='currentUser') syncInpName();
});