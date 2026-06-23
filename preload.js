const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  closeWidget:    () => ipcRenderer.send('close-widget'),
  minimizeWidget: () => ipcRenderer.send('minimize-widget'),
  notify:         (title, body) => ipcRenderer.send('notify', { title, body }),
  toggleMaximize: () => ipcRenderer.send('toggle-maximize'),

  // 외부 링크 열기
  openExternal:   (url) => ipcRenderer.send('open-external', url),

  // 드래그: 델타 전송
  dragMove: (dx, dy) => ipcRenderer.send('drag-move', { dx, dy }),

  // 리사이즈
  resizeWidget: (width, height, dx, dy) => ipcRenderer.send('resize-widget', { width, height, dx, dy }),

  // 창 상태 수신
  onWinState: (cb) => ipcRenderer.on('win-state', (e, data) => cb(data)),
  getWinState: () => ipcRenderer.invoke('get-win-state'),

  // 전체화면 toggle 결과 수신
  onDoToggleMaximize: (cb) => ipcRenderer.on('do-toggle-maximize', cb),

  getScreenSize: () => ipcRenderer.invoke('get-win-state'),

  // AI 채팅 창 열기/닫기
  openAIWindow: () => ipcRenderer.send('open-ai-window'),
  closeAIWindow: () => ipcRenderer.send('close-ai-window'),
});
