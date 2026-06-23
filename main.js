const { app, BrowserWindow, ipcMain, screen, Tray, Menu, shell, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

let win;
let tray = null;

// ══════════════════════════════════════
// 자동 업데이트 설정 (멀티파일 원자적 업데이트)
// ══════════════════════════════════════
const REMOTE_BASE = 'https://junsu112498-maker.github.io/exheoh-board';

// 업데이트 대상 파일 목록 (상대 경로)
const UPDATE_FILES = [
  'index.html',
  'css/fonts.css', 'css/style.css',
  'js/state.js',   'js/utils.js',    'js/filters.js',
  'js/board.js',   'js/stats.js',    'js/calendar.js',
  'js/members.js', 'js/memo.js',     'js/history.js',
  'js/auth.js',    'js/notify.js',   'js/bridge.js',
  'js/games.js',   'js/app.js',
];

const LOCAL_BASE    = () => app.getPath('userData');
const ORIGINAL_BASE = __dirname;
const LOCAL_INDEX   = () => path.join(LOCAL_BASE(), 'index.html');
const ORIGINAL_INDEX = path.join(ORIGINAL_BASE, 'index.html');

function fetchRemote(relPath) {
  return new Promise((resolve, reject) => {
    https.get(`${REMOTE_BASE}/${relPath}`, (res) => {
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode} for ${relPath}`)); return; }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function readLocal(relPath) {
  const local    = path.join(LOCAL_BASE(), relPath);
  const original = path.join(ORIGINAL_BASE, relPath);
  if (fs.existsSync(local))    return fs.readFileSync(local, 'utf8');
  if (fs.existsSync(original)) return fs.readFileSync(original, 'utf8');
  return null;
}

async function checkAndUpdate() {
  try {
    console.log('[업데이트] index.html 버전 확인 중...');
    const remoteIndex = await fetchRemote('index.html');
    const localIndex  = readLocal('index.html');

    if (remoteIndex === localIndex) {
      console.log('[업데이트] 최신 버전입니다.');
      return false;
    }

    console.log('[업데이트] 새 버전 감지 - 전체 파일 다운로드 중...');

    // 1) 모든 파일 다운로드 (실패 시 업데이트 중단)
    const downloaded = {};
    for (const relPath of UPDATE_FILES) {
      downloaded[relPath] = await fetchRemote(relPath);
    }

    // 2) 임시 디렉터리에 저장
    const tempDir = path.join(LOCAL_BASE(), '_update_temp');
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
    fs.mkdirSync(tempDir, { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'css'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'js'),  { recursive: true });

    for (const [relPath, content] of Object.entries(downloaded)) {
      fs.writeFileSync(path.join(tempDir, relPath), content, 'utf8');
    }

    // 3) 실제 위치로 이동 (원자적 교체)
    fs.mkdirSync(path.join(LOCAL_BASE(), 'css'), { recursive: true });
    fs.mkdirSync(path.join(LOCAL_BASE(), 'js'),  { recursive: true });

    for (const relPath of UPDATE_FILES) {
      const dest = path.join(LOCAL_BASE(), relPath);
      fs.copyFileSync(path.join(tempDir, relPath), dest);
    }

    // 4) 임시 디렉터리 정리
    fs.rmSync(tempDir, { recursive: true });

    console.log('[업데이트] 업데이트 완료!');
    return true;

  } catch (err) {
    console.log('[업데이트] 확인/다운로드 실패:', err.message);
    return false;
  }
}

function getIndexToLoad() {
  const local = LOCAL_INDEX();
  if (fs.existsSync(local)) return local;
  return ORIGINAL_INDEX;
}

function getInitialPos() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  return { x: width - 480, y: height - 750 };
}

function createWindow() {
  const pos = getInitialPos();
  win = new BrowserWindow({
    width: 460, height: 720, x: pos.x, y: pos.y,
    frame: false, transparent: true, alwaysOnTop: false,
    skipTaskbar: false, resizable: true, show: true,
    focusable: true, hasShadow: false,
    webPreferences: {
      nodeIntegration: false, contextIsolation: true,
      webSecurity: false, allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('blob:') || url === 'about:blank') {
      return { action: 'allow', overrideBrowserWindowOptions: {
        width: 1400, height: 900,
        webPreferences: { nodeIntegration: false, contextIsolation: false, webSecurity: false }
      }};
    }
    if (url.startsWith('http://') || url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });

  const indexPath = getIndexToLoad();
  const fileUrl = 'file:///' + indexPath.replace(/\\/g, '/') + '?t=' + Date.now();
  console.log('Loading:', fileUrl);
  win.loadURL(fileUrl);

  win.webContents.on('did-fail-load', (e, code, desc) => {
    console.error('did-fail-load:', code, desc);
    if (fs.existsSync(ORIGINAL_INDEX)) {
      win.loadURL('file:///' + ORIGINAL_INDEX.replace(/\\/g, '/'));
    }
  });

  win.webContents.on('did-finish-load', () => { win.show(); win.focus(); sendWinState(); });
  win.webContents.on('dom-ready', () => { win.show(); });
  setTimeout(() => { if (win && !win.isDestroyed()) { win.show(); win.focus(); } }, 2000);
  win.on('focus', () => win.webContents.focus());
  win.on('close', (event) => { if (!app.isQuitting) { event.preventDefault(); win.hide(); } });
  win.on('move', sendWinState);
  win.on('resize', sendWinState);
}

function sendWinState() {
  if (!win || !win.webContents || win.isDestroyed()) return;
  const [x, y] = win.getPosition();
  const [w, h] = win.getSize();
  const display = screen.getDisplayNearestPoint({ x, y });
  win.webContents.send('win-state', { x, y, width: w, height: h, displayBounds: display.bounds, displayWorkArea: display.workArea });
}

function createTray() {
  const iconPath = path.join(__dirname, 'icon.png');
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: '위젯 열기', click: () => { win.show(); win.focus(); } },
    { type: 'separator' },
    { label: '종료', click: () => { app.isQuitting = true; app.quit(); } }
  ]);
  tray.setToolTip('EXHEOH 업무보드');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => { win.show(); win.focus(); });
  tray.on('click', () => { win.show(); win.focus(); });
}

app.whenReady().then(async () => {
  // Google Fonts 등 외부 리소스 허용
  const { session } = require('electron');
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({ requestHeaders: { ...details.requestHeaders, 'Origin': '*' } });
  });
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['*'],
        'Content-Security-Policy': ["default-src * 'unsafe-inline' 'unsafe-eval' data: blob:"]
      }
    });
  });

  // 시작프로그램 자동 등록
  app.setLoginItemSettings({
    openAtLogin: true,
    name: 'EXHEOH 업무보드'
  });

  protocol.registerFileProtocol('file', (request, callback) => {
    const url = request.url.replace('file:///', '').replace(/\//g, path.sep);
    try { return callback(url); } catch (e) { console.error('Protocol error:', e); }
  });

  await checkAndUpdate();
  await checkAndUpdateAI();
  createWindow();
  createTray();

  // 24시간마다 백그라운드 업데이트 확인
  setInterval(async () => {
    const updated = await checkAndUpdate();
    if (updated && win && !win.isDestroyed()) {
      const fileUrl = 'file:///' + getIndexToLoad().replace(/\\/g, '/') + '?t=' + Date.now();
      win.loadURL(fileUrl);
      console.log('[업데이트] 자동 리로드 완료');
    }
  }, 24 * 60 * 60 * 1000);

  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => { if (tray) { tray.destroy(); tray = null; } });
app.on('quit', () => { if (tray) { tray.destroy(); tray = null; } });

ipcMain.on('close-widget', () => win.hide());
ipcMain.on('minimize-widget', () => win.minimize());
ipcMain.on('show-widget', () => { win.show(); win.focus(); });

ipcMain.on('notify', (event, { title, body }) => {
  const { Notification } = require('electron');
  if (Notification.isSupported()) {
    const n = new Notification({ title: title || 'EXHEOH 업무보드', body: body || '', icon: path.join(__dirname, 'icon.png'), silent: false });
    n.on('click', () => { win.show(); win.focus(); });
    n.show();
  }
});

ipcMain.on('drag-move', (event, { dx, dy }) => {
  const [x, y] = win.getPosition();
  win.setPosition(x + dx, y + dy);
});

ipcMain.on('resize-widget', (event, { width, height, dx, dy }) => {
  const [cx, cy] = win.getPosition();
  if (width && height) win.setSize(Math.max(320, width), Math.max(400, height));
  if (dx !== undefined) win.setPosition(cx + dx, cy + dy);
});

ipcMain.on('toggle-maximize', () => {
  const isMax = win.__isMax || false;
  if (isMax) {
    win.__isMax = false;
    const saved = win.__savedBounds || {};
    const pos = getInitialPos();
    win.setBounds({ x: saved.x ?? pos.x, y: saved.y ?? pos.y, width: saved.width ?? 460, height: saved.height ?? 720 });
  } else {
    win.__isMax = true;
    const [x, y] = win.getPosition();
    const [w, h] = win.getSize();
    win.__savedBounds = { x, y, width: w, height: h };
    const display = screen.getDisplayNearestPoint({ x, y });
    const wa = display.workArea;
    win.setBounds({ x: wa.x, y: wa.y, width: wa.width, height: wa.height });
  }
  setTimeout(sendWinState, 50);
});

ipcMain.handle('get-win-state', () => {
  const [x, y] = win.getPosition();
  const [w, h] = win.getSize();
  const display = screen.getDisplayNearestPoint({ x, y });
  return { x, y, width: w, height: h, displayBounds: display.bounds, displayWorkArea: display.workArea };
});

ipcMain.on('open-external', (event, url) => {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) shell.openExternal(url);
});

ipcMain.on('reload-app', () => {
  if (win && !win.isDestroyed()) {
    win.loadURL('file:///' + getIndexToLoad().replace(/\\/g, '/') + '?t=' + Date.now());
  }
});
// ── AI 채팅 창 ──
const AI_REMOTE_URL = 'https://junsu112498-maker.github.io/exheoh-board/ai.html';
const LOCAL_AI = path.join(app.getPath('userData'), 'ai.html');
const ORIGINAL_AI = path.join(__dirname, 'ai.html');

async function checkAndUpdateAI() {
  try {
    const remoteHtml = await new Promise((resolve, reject) => {
      https.get(AI_REMOTE_URL, (res) => {
        if (res.statusCode !== 200) { reject(new Error('HTTP '+res.statusCode)); return; }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
    let localHtml = '';
    if (fs.existsSync(LOCAL_AI)) localHtml = fs.readFileSync(LOCAL_AI, 'utf8');
    else if (fs.existsSync(ORIGINAL_AI)) localHtml = fs.readFileSync(ORIGINAL_AI, 'utf8');
    if (remoteHtml !== localHtml) {
      fs.writeFileSync(LOCAL_AI, remoteHtml, 'utf8');
      console.log('[AI업데이트] ai.html 업데이트 완료');
    }
  } catch(e) {
    console.log('[AI업데이트] 실패:', e.message);
  }
}

function getAIIndexToLoad() {
  if (fs.existsSync(LOCAL_AI)) return LOCAL_AI;
  if (fs.existsSync(ORIGINAL_AI)) return ORIGINAL_AI;
  return null;
}

let aiWin = null;
ipcMain.on('open-ai-window', () => {
  if (aiWin && !aiWin.isDestroyed()) {
    aiWin.show(); aiWin.focus(); return;
  }
  const [x, y] = win.getPosition();
  const [w, h] = win.getSize();
  const { width: sw } = screen.getPrimaryDisplay().workAreaSize;
  const aiWidth = 420;
  let aiX = x + w + 8;
  if (aiX + aiWidth > sw) aiX = Math.max(0, x - aiWidth - 8);
  aiWin = new BrowserWindow({
    width: aiWidth, height: h,
    x: aiX, y: y,
    frame: false, transparent: false,
    alwaysOnTop: false, resizable: true,
    skipTaskbar: false, hasShadow: true,
    show: false,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      nodeIntegration: false, contextIsolation: true,
      webSecurity: false, allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  const aiPath = getAIIndexToLoad();
  if (!aiPath) { console.error('[AI창] ai.html 없음'); return; }
  const fileUrl = 'file:///' + aiPath.replace(/\\/g, '/') + '?t=' + Date.now();
  aiWin.loadURL(fileUrl);
  aiWin.on('closed', () => { aiWin = null; });
  aiWin.on('close', (e) => { e.preventDefault(); aiWin.hide(); });
  aiWin.webContents.on('did-finish-load', () => { aiWin.show(); aiWin.focus(); });
  aiWin.webContents.on('did-fail-load', (e, code, desc) => {
    console.error('[AI창] 로드 실패:', code, desc);
  });
});

ipcMain.on('close-ai-window', () => {
  if (aiWin && !aiWin.isDestroyed()) aiWin.hide();
});
