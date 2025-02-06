import fs from "node:fs";
import path from "path";
import {clipboard, dialog, screen, shell} from "electron";
import axios from "axios";

export function getLocalPlaylists() {
  const lists = fs.readdirSync(path.resolve('./res/lists')).filter(file => file.endsWith('.json'))
  let results = []
  for (let f of lists) {
    results.push({
      originFilename: f,
      ...JSON.parse(fs.readFileSync(path.resolve('./res/lists', f)).toString()),
    })
  }
  return results;
}
export function showChoosePlaylistDialog(_, options) {
  return dialog.showOpenDialogSync(options)
}
export function showAskDialog(_, options) {
  return dialog.showMessageBoxSync({
    buttons: ['取消', '确认'],
    ...options
  })
}
export function writePlaylistFile(_, {fn, t}) {
  return fs.writeFileSync(path.resolve('./res/lists', fn), t)
}
export function deletePlaylistFile(_, fn) {
  return fs.rmSync(path.resolve('./res/lists', fn))
}
export function getConfig() {
  return JSON.parse(fs.readFileSync(path.resolve('./res', 'config.json')).toString())
}
export function writeConfig(_, config) {
  return fs.writeFileSync(path.resolve('./res', 'config.json'), config)
}
export function getSpecificConfig(_, fn) {
  return JSON.parse(fs.readFileSync(path.resolve('./res', `${fn}.json`)).toString())
}
export function writeSpecificConfig(_, fn, config) {
  return fs.writeFileSync(path.resolve('./res', `${fn}.json`), config)
}
export function readClipboard() {
  return clipboard.readText();
}
export async function getBilibiliVideoView(_, bv) {
  return (await bilibiliClient.get('https://api.bilibili.com/x/web-interface/view', {
    params: {
      bvid: bv,
    }
  })).data
}
export async function getBilibiliVideoPlayurl(_, params) {
  return (await bilibiliClient.get('https://api.bilibili.com/x/player/wbi/playurl', {
    params
  })).data
}
export async function getBilibiliFav(_, params) {
  return (await bilibiliClient.get('https://api.bilibili.com/x/v3/fav/resource/list', {params})).data;
}
export async function axiosRequestGet(_, url, config) {
  return (await axios.get(url, config)).data;
}
export function getCursorPos() {
  let sp = screen.getCursorScreenPoint();
  let wp = mainWindow.getPosition()
  return {
    left: sp.x - wp[0],
    top: sp.y - wp[1],
  };
}
export function openUrl(_, url) {
  shell.openExternal(url)
}
export function showImportPlaylistDialog() {
  dialog.showOpenDialog({
    title: '请选择歌单文件',
    filters: [{
      name: 'JSON',
      extensions: ['json']
    }],
    properties : ['multiSelections']
  }).then(({canceled, filePaths}) => {
    if (canceled) return;
    let tasks = filePaths.map(fp => new Promise((resolve, reject) => {
      try {
        fs.copyFileSync(fp, path.resolve('./res/lists', path.basename(fp)))
        resolve();
      } catch(err) {
        reject(err)
      }
    }))
    Promise.all(tasks).catch((e) => mainWindow.webContents.send('showMessage', e.message)).finally(() => {
      mainWindow.webContents.send('refreshPlaylists')
    })
  })
}