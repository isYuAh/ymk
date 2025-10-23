const {contextBridge, ipcRenderer} = require('electron')

const apis = {
    onLyric: (callback) => ipcRenderer.on('lyric', callback),
    setIgnoreMouseEvents: (ignore) => ipcRenderer.invoke('setIgnoreMouseEvents', ignore),
    closeLyricWindow: () => ipcRenderer.invoke('closeLyricWindow'),
    unlock: (cb) => ipcRenderer.on('unlock', cb),
}


contextBridge.exposeInMainWorld('ymkAPI', apis)