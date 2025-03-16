import fs from "node:fs";
import path from "path";
import {clipboard, dialog, shell} from "electron";

export function getLocalPlaylists() {
  const lists = fs.readdirSync(path.resolve('./res/lists')).filter(file => file.endsWith('.json'))
  let results = []
  for (let f of lists) {
    results.push({
      ...JSON.parse(fs.readFileSync(path.resolve('./res/lists', f)).toString()),
      originFilename: f,
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
export function openUrl(_, url) {
  shell.openExternal(url)
}
