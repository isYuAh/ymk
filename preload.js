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
function getBilibiliVideoView(bv) {
    return ipcRenderer.invoke('getBilibiliVideoView', bv)
}
function getBilibiliVideoPlayurl(params) {
    return ipcRenderer.invoke('getBilibiliVideoPlayurl', params)
}
function getBilibiliFav(params) {
    return ipcRenderer.invoke('getBilibiliFav', params)
}
function getCursorPos() {
    return ipcRenderer.invoke('getCursorPos')
}
function openUrl(url) {
    return ipcRenderer.invoke('openUrl', url)
}

contextBridge.exposeInMainWorld('ymkAPI', {
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
    onResize: callback => ipcRenderer.on('resize', (_event, value) => callback(value)),
    showImportPlaylistDialog,
    getBilibiliVideoView,
    getBilibiliVideoPlayurl,
    getBilibiliFav,
    getCursorPos,
    getSpecificConfig,
    writeSpecificConfig,
    openUrl,
})