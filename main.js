const { app, BrowserWindow, ipcMain, screen, Tray, Menu, shell, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

let win;
let tray = null;

// ══════════════════════════════════════
// 자동 업데이트 설정
// 배포 URL을 여기서만 바꾸면 됩니다
// ══════════════════════════════════════
const REMOTE_URL = 'https://famous-medovik-04a698.netlify.app/index.html';
const LOCAL_INDEX = path.join(__dirname, 'index.html');
const BACKUP_INDEX = path.join(__dirname, 'index.backup.html');

function fetchRemoteIndex() {
  return new Promise((resolve, reject) => {
    https.get(REMOTE_URL, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function checkAndUpdate() {
  try {
    console.log('[업데이트] 최신 버전 확인 중...');
    const remoteHtml = await fetchRemoteIndex();

    // 현재 로컬 파일과 비교
    let localHtml = '';
    if (fs.existsSync(LOCAL_INDEX)) {
      localHtml = fs.readFileSync(LOCAL_INDEX, 'utf8');
    }

    if (remoteHtml === localHtml) {
      console.log('[업데이트] 최신 버전입니다.');
      return false;
    }

    // 기존 파일 백업
    if (fs.existsSync(LOCAL_INDEX)) {
      fs.copyFileSync(LOCAL_INDEX, BACKUP_INDEX);
    }

    // 새 버전 저장
    fs.writeFileSync(LOCAL_INDEX, remoteHtml, 'utf8');
    console.log('[업데이트] 새 버전으로 업데이트 완료!');
    return true;

  } catch (err) {
    console.log('[업데이트] 확인 실패 (오프라인이거나 서버 문제):', err.message);
    // 실패해도 기존 로컬 파일로 정상 실행
    return false;
  }
}

function getInitialPos() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  return { x: width - 480, y: height - 750 };
}

function createWindow() {
  const pos = getInitialPos();

  win = new BrowserWindow({
    width: 460,
    height: 720,
    x: pos.x,
    y: pos.y,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    resizable: true,
    show: true,
    focusable: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 인쇄용 새 창 허용
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('blob:') || url === 'about:blank') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 1400,
          height: 900,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: false,
            webSecurity: false,
          }
        }
      };
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  const indexPath = path.join(__dirname, 'index.html');
  const fileUrl = 'file:///' + indexPath.replace(/\\/g, '/');
  console.log('Loading:', fileUrl);
  win.loadURL(fileUrl);

  win.webContents.on('did-fail-load', (e, code, desc, url) => {
    console.error('did-fail-load:', code, desc, url);
    // 로컬 파일 로드 실패 시 백업 파일 시도
    if (fs.existsSync(BACKUP_INDEX)) {
      const backupUrl = 'file:///' + BACKUP_INDEX.replace(/\\/g, '/');
      win.loadURL(backupUrl);
    } else {
      win.loadURL('data:text/html,<h1>로딩 실패: ' + code + ' ' + desc + '</h1>');
    }
  });

  win.webContents.on('did-finish-load', () => {
    console.log('did-finish-load OK');
    win.show();
    win.focus();
    sendWinState();
  });

  win.webContents.on('dom-ready', () => {
    console.log('dom-ready OK');
    win.show();
  });

  setTimeout(() => {
    if (win && !win.isDestroyed()) {
      win.show();
      win.focus();
    }
  }, 2000);

  win.on('focus', () => win.webContents.focus());
  win.on('close', (event) => {
    if (!app.isQuitting) { event.preventDefault(); win.hide(); }
  });
  win.on('move', sendWinState);
  win.on('resize', sendWinState);
}

function sendWinState() {
  if (!win || !win.webContents || win.isDestroyed()) return;
  const [x, y] = win.getPosition();
  const [w, h] = win.getSize();
  const display = screen.getDisplayNearestPoint({ x, y });
  win.webContents.send('win-state', {
    x, y, width: w, height: h,
    displayBounds: display.bounds,
    displayWorkArea: display.workArea
  });
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
  protocol.registerFileProtocol('file', (request, callback) => {
    const url = request.url.replace('file:///', '').replace(/\//g, path.sep);
    try {
      return callback(url);
    } catch (e) {
      console.error('Protocol error:', e);
    }
  });

  // 업데이트 확인 후 창 생성
  await checkAndUpdate();
  createWindow();
  createTray();

  // 24시간마다 백그라운드 업데이트 확인
  setInterval(async () => {
    const updated = await checkAndUpdate();
    if (updated && win && !win.isDestroyed()) {
      win.webContents.send('update-available');
    }
  }, 24 * 60 * 60 * 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('close-widget', () => win.hide());
ipcMain.on('minimize-widget', () => win.minimize());
ipcMain.on('show-widget', () => { win.show(); win.focus(); });

ipcMain.on('notify', (event, { title, body }) => {
  const { Notification } = require('electron');
  if (Notification.isSupported()) {
    const n = new Notification({
      title: title || 'EXHEOH 업무보드', body: body || '',
      icon: path.join(__dirname, 'icon.png'), silent: false
    });
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
    win.setBounds({
      x: saved.x ?? pos.x,
      y: saved.y ?? pos.y,
      width: saved.width ?? 460,
      height: saved.height ?? 720
    });
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
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    shell.openExternal(url);
  }
});

// 앱에서 수동 업데이트 요청
ipcMain.on('reload-app', () => {
  if (win && !win.isDestroyed()) {
    const indexPath = path.join(__dirname, 'index.html');
    const fileUrl = 'file:///' + indexPath.replace(/\\/g, '/');
    win.loadURL(fileUrl);
  }
});
