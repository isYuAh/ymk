const {contextBridge, ipcRenderer} = require('electron')

function getLocalPlaylists() {
    return ipcRenderer.invoke('getLocalPlaylists')
}
function showAskDialog(options) {
    return ipcRenderer.invoke('showAskDialog', options)
}
function showChoosePlaylistDialog(options) {
    return ipcRenderer.invoke('showChoosePlaylistDialog', options)
}
function deletePlaylistFile(fn) {
    return ipcRenderer.invoke('deletePlaylistFile', fn)
}
function writePlaylistFile(fn, t) {
    return ipcRenderer.invoke('writePlaylistFile', {fn, t})
}
function getConfig() {
    return ipcRenderer.invoke('getConfig')
}
function writeConfig(t) {
    return ipcRenderer.invoke('writeConfig', t)
}
function getSpecificConfig(fn) {
    return ipcRenderer.invoke('getSpecificConfig', fn)
}
function writeSpecificConfig(fn, t) {
    return ipcRenderer.invoke('writeSpecificConfig', fn, t)
}
function readClipboard() {
    return ipcRenderer.invoke('readClipboard')
}
function minimize() {
    ipcRenderer.send('minimize')
}
function exit(arg) {
    ipcRenderer.send('exit', arg)
}
function isMinimized() {
    return ipcRenderer.invoke('isMinimized')
}
function showImportPlaylistDialog() {
    return ipcRenderer.invoke('showImportPlaylistDialog')
}
function getBilibiliVideoView(bv, p) {
    return ipcRenderer.invoke('getBilibiliVideoView', bv)
}
function getBilibiliVideoPlayurl(params) {
    return ipcRenderer.invoke('getBilibiliVideoPlayurl', params)
}
function getBilibiliFav(params) {
    return ipcRenderer.invoke('getBilibiliFav', params)
}
function axiosRequestGet(url, config) {
    return ipcRenderer.invoke('axiosRequestGet', url, config)
}
function getCursorPos() {
    return ipcRenderer.invoke('getCursorPos')
}
function openUrl(url) {
    return ipcRenderer.invoke('openUrl', url)
}

function playPauseStatusUpdate(playing) {
    ipcRenderer.send('playPauseStatusUpdate', playing)
}

function onTrayControl_PlayPause(callback) {
    ipcRenderer.on('tray_playPause', callback)
}
function onTrayControl_PlaySong(callback) {
    ipcRenderer.on('tray_play', callback)
}
const apis = {
    onTrayControl_PlayPause,
    onTrayControl_PlaySong,
    playPauseStatusUpdate,
    getLocalPlaylists,
    showAskDialog,
    showChoosePlaylistDialog,
    deletePlaylistFile,
    writePlaylistFile,
    readClipboard,
    writeConfig,
    minimize,
    exit,
    getConfig,
    isMinimized,
    onRestore: callback => ipcRenderer.on('resize', (_event, value) => callback(value)),
    onRefreshPlaylists: callback => ipcRenderer.on('refreshPlaylists', (_event) => callback()),
    onShowMessage: callback => ipcRenderer.on('showMessage', (_event, m) => callback(m)),
    offRestore: callback => ipcRenderer.off('restore', callback),
    offRefreshPlaylists: callback => ipcRenderer.off('refreshPlaylists', callback),
    offShowMessage: callback => ipcRenderer.off('showMessage', callback),
    onUrlScheme: callback => ipcRenderer.on('urlScheme', callback),
    offUrlScheme: callback => ipcRenderer.off('urlScheme', callback),
    showImportPlaylistDialog,
    getBilibiliVideoView,
    getBilibiliVideoPlayurl,
    getBilibiliFav,
    axiosRequestGet,
    getCursorPos,
    getSpecificConfig,
    writeSpecificConfig,
    openUrl,
}
contextBridge.exposeInMainWorld('ymkAPI', apis)