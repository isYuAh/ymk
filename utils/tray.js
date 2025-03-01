import {ipcMain, nativeImage} from 'electron'
import path from "path";
export function initTray(window, app, __dirname) {
    const thumbarButtons = [
        {
            icon: nativeImage.createFromPath(path.resolve(__dirname, './src/assets/controlBtnIcon/last.png')),
            tooltip: "上一首",
            click() {
                window.webContents.send('tray_play', 'last')
            }
        },
        {
            icon: nativeImage.createFromPath(path.resolve(__dirname, './src/assets/controlBtnIcon/play.png')),
            tooltip: "播放",
            click() {
                window.webContents.send('tray_playPause', true)
            }
        },
        {
            icon: nativeImage.createFromPath(path.resolve(__dirname, './src/assets/controlBtnIcon/pause.png')),
            tooltip: "暂停",
            flags: ['hidden'],
            click() {
                window.webContents.send('tray_playPause', false)
            }
        },
        {
            icon: nativeImage.createFromPath(path.resolve(__dirname, './src/assets/controlBtnIcon/next.png')),
            tooltip: "下一首",
            click() {
                window.webContents.send('tray_play', 'next')
            }
        }
    ]
    window.setThumbarButtons(thumbarButtons);
    ipcMain.on('playPauseStatusUpdate', (e, playing) => {
        if(playing) {
            thumbarButtons[1].flags = ['hidden']
            thumbarButtons[2].flags = []
        }
        else {
            thumbarButtons[1].flags = []
            thumbarButtons[2].flags = ['hidden']
        }
        window.setThumbarButtons(thumbarButtons)
    })
}