import {app, BrowserWindow, clipboard, dialog, ipcMain, screen, shell, MessageChannelMain} from 'electron'
import path from 'path';
import {fileURLToPath} from 'url';
import * as fs from "node:fs";
import {checkFolders, checkResources, startKugouServer, startNcmServer} from "./utils/utils.js";
import express from "express";
import {WBI} from "./utils/WBI.js";
import axios from "axios";
import {initTray} from "./utils/tray.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow = null;

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
        const surl = commandLine.pop()
        mainWindow.webContents.send('urlScheme', surl.substring(9, surl.length - 1));
    })

    if (process.defaultApp) {
        if (process.argv.length >= 2) {
            app.setAsDefaultProtocolClient('yumuzk', process.execPath, [path.resolve(process.argv[1])])
        }else {
            app.setAsDefaultProtocolClient('yumuzk')
        }
    }
    startNcmServer()
    startKugouServer()
    const appServer = express();
    appServer.get('/api/bg', (req, res) => {
        res.sendFile(path.resolve('./res', req.query.fn));
    })
    appServer.listen(35652)
    const bilibiliClient = axios.create({
        headers: {
            "User-Agent": 'Mozilla',
            referer: 'https://www.bilibili.com',
        }
    });
    bilibiliClient.get('https://api.bilibili.com/x/web-interface/nav').then(res => {
        const {data: {data: { wbi_img: { img_url, sub_url } } } } = res;
        let wbi = {
            img_key: img_url.slice(
                img_url.lastIndexOf('/') + 1,
                img_url.lastIndexOf('.')
            ),
            sub_key: sub_url.slice(
                sub_url.lastIndexOf('/') + 1,
                sub_url.lastIndexOf('.')
            )
        }
        bilibiliClient.interceptors.request.use((config) => {
            config.params = WBI(wbi, config.params);
            return config;
        })
    }).catch(err => {console.log(err);})

    checkFolders(['./res', './res/lists'])
    checkResources()

    function getLocalPlaylists() {
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
    function showChoosePlaylistDialog(_, options) {
        return dialog.showOpenDialogSync(options)
    }
    function showAskDialog(_, options) {
        return dialog.showMessageBoxSync({
            buttons: ['取消', '确认'],
            ...options
        })
    }
    function writePlaylistFile(_, {fn, t}) {
        return fs.writeFileSync(path.resolve('./res/lists', fn), t)
    }
    function deletePlaylistFile(_, fn) {
        return fs.rmSync(path.resolve('./res/lists', fn))
    }
    function getConfig() {
        return JSON.parse(fs.readFileSync(path.resolve('./res', 'config.json')).toString())
    }
    function writeConfig(_, config) {
        return fs.writeFileSync(path.resolve('./res', 'config.json'), config)
    }
    function getSpecificConfig(_, fn) {
        return JSON.parse(fs.readFileSync(path.resolve('./res', `${fn}.json`)).toString())
    }
    function writeSpecificConfig(_, fn, config) {
        return fs.writeFileSync(path.resolve('./res', `${fn}.json`), config)
    }
    function readClipboard() {
        return clipboard.readText();
    }
    async function getBilibiliVideoView(_, bv) {
        return (await bilibiliClient.get('https://api.bilibili.com/x/web-interface/view', {
            params: {
                bvid: bv,
            }
        })).data
    }
    async function getBilibiliVideoPlayurl(_, params) {
        return (await bilibiliClient.get('https://api.bilibili.com/x/player/wbi/playurl', {
            params
        })).data
    }
    async function getBilibiliFav(_, params) {
        return (await bilibiliClient.get('https://api.bilibili.com/x/v3/fav/resource/list', {params})).data;
    }
    async function axiosRequestGet(_, url, config) {
        return (await axios.get(url, config)).data;
    }
    function getCursorPos() {
        let sp = screen.getCursorScreenPoint();
        let wp = mainWindow.getPosition()
        return {
            left: sp.x - wp[0],
            top: sp.y - wp[1],
        };
    }
    function openUrl(_, url) {
        shell.openExternal(url)
    }
    function showImportPlaylistDialog() {
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

    const createWindow = () => {
        mainWindow = new BrowserWindow({
            menuBarVisible: false,
            titleBarStyle: 'hidden',
            height: 720,
            width: 1080,
            webPreferences: {
                preload: path.resolve(__dirname, './preload.js'),
                webSecurity: false,
            },
            resizable: false,
        })
        ipcMain.handle('getLocalPlaylists', getLocalPlaylists)
        ipcMain.handle('showAskDialog', showAskDialog)
        ipcMain.handle('showChoosePlaylistDialog', showChoosePlaylistDialog)
        ipcMain.handle('deletePlaylistFile', deletePlaylistFile)
        ipcMain.handle('writePlaylistFile', writePlaylistFile)
        ipcMain.handle('getConfig', getConfig)
        ipcMain.handle('writeConfig', writeConfig)
        ipcMain.handle('getSpecificConfig', getSpecificConfig)
        ipcMain.handle('writeSpecificConfig', writeSpecificConfig)
        ipcMain.handle('readClipboard', readClipboard)
        ipcMain.handle('isMinimized', () => mainWindow.isMinimized())
        ipcMain.handle('getBilibiliVideoView', getBilibiliVideoView)
        ipcMain.handle('getBilibiliVideoPlayurl', getBilibiliVideoPlayurl)
        ipcMain.handle('getBilibiliFav', getBilibiliFav)
        ipcMain.handle('axiosRequestGet', axiosRequestGet)
        ipcMain.handle('getCursorPos', getCursorPos)
        ipcMain.handle('openUrl', openUrl)
        ipcMain.handle('showImportPlaylistDialog', showImportPlaylistDialog);
        ipcMain.on('minimize', () => mainWindow.minimize())
        ipcMain.on('exit', () => mainWindow.close())
        mainWindow.on('restore', () => mainWindow.webContents.send('restore'))

        initTray(mainWindow, app, __dirname)

        if (app.isPackaged) {
            mainWindow.loadFile(path.resolve(__dirname, './dist', 'index.html'))
        }else {
            mainWindow.loadURL('http://localhost:5173')
        }
    }

    app.whenReady().then(() => {
        createWindow();
        app.on('activate', ()=>{
            if (BrowserWindow.getAllWindows().length === 0) createWindow()
        })
    })

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })


}