import axios, {AxiosError, type AxiosResponse} from "axios";
import type {SongTypes} from "@/types/song";
import {proceedLrcText, replacePicSizeParam} from "@/utils/u";
import {kugouAxios, neteaseAxios, qqAxios} from "@/utils/axiosInstances";
import {LyricHandlers} from "@/utils/LyricHandlers";
import type { songInPlay } from "@/types";
import {getBilibiliVideoView, getBilibiliVideoPlayurl} from '@/utils/bilibiliAPI'
import { proxyRequest } from "./proxyRequest";
import { useUserStore } from "@/stores/modules/user";
interface MusicHandlerFunctionParams<T> {
    tasks: Promise<void>[],
    tmpSong: songInPlay,
    song: T,
}

function MusicHandlerBilibili({tasks, tmpSong, song}: MusicHandlerFunctionParams<SongTypes.bilibili>) {
    tasks.push(new Promise((resolve, reject) => {
        getBilibiliVideoView(song.symbol).then((res: any) => {
            const data = res.data
            if (data.data.pic) {
                tmpSong.pic = data.data.pic;
            }
            let rawDetail = data.data
            let cid
            if (song.p !== undefined && 'pages' in data.data) {
                cid = data.data.pages[song.p - 1].cid;
            }else {
                cid = data.data.cid;
            }
            tmpSong.title = tmpSong.title || rawDetail.title;
            tmpSong.singer = tmpSong.singer || rawDetail.owner.name;
            const par: any = {
                bvid: song.symbol,
                cid,
                platform: "html5",
            }
            if (useUserStore().isLogin.bilibili) {
                par.high_quality = 1
            }
            getBilibiliVideoPlayurl(par).then((res: AxiosResponse) => {
                tmpSong.url = res.data.data.durl[0].url;
                resolve();
            }).catch(() => reject(new Error('获取视频播放地址失败')))
        }).catch(() => reject(new Error('获取视频信息失败')));
    }))
    LyricHandlers.ProceedLyric(song, {tasks, tmpSong, unique: song.symbol});
}

function MusicHandlerSiren({tasks, tmpSong, song}: MusicHandlerFunctionParams<SongTypes.siren>) {
    tasks.push(new Promise((resolve, reject) => {
        let subTasks = <Promise<void>[]>[]
        axios.get(`https://monster-siren.hypergryph.com/api/song/${song.symbol}`).then(res => {
            if (res.data.data.lyricUrl) {
                subTasks.push(new Promise((resolve, reject) => {
                    proxyRequest.get(res.data.data.lyricUrl).then((res: any) => {
                        const {result, enableAutoScroll} = proceedLrcText(res)
                        tmpSong.lrcs['origin'] = {
                            items: result,
                            enableAutoScroll
                        }
                    })
                    resolve();
                }))
            }
            tmpSong.title = tmpSong.title || res.data.data.name;
            tmpSong.singer = tmpSong.singer || res.data.data.artists.join(" & ");
            tmpSong.url = res.data.data.sourceUrl;
            subTasks.push(new Promise((resolve, reject) => {
                axios.get(`https://monster-siren.hypergryph.com/api/album/${res.data.data.albumCid}/detail`).then((res) => {
                    tmpSong.pic = res.data.data.coverUrl;
                    resolve();
                }).catch(() => reject());
            }))
            Promise.all(subTasks).then((() => resolve())).catch(() => reject())
        })
    }))
}

//TODO: 可空title singer支持
function MusicHandlerQQ({tasks, tmpSong, song}: MusicHandlerFunctionParams<SongTypes.qq>) {
    tasks.push(new Promise((resolve, reject) => {
        qqAxios.post("/api/y/get_song", {
            type: "qq",
            mid: song.symbol,
        }).then((res: AxiosResponse) => {
            let result = res.data.data[0];
            if (result.pic) {
                tmpSong.pic = res.data.data.pic;
            }
            tmpSong.url = result.url;
            resolve();
        }).catch((err: AxiosError) => {reject(err.message)})
    }))
}

function MusicHandlerNetease({tasks, tmpSong, song}: MusicHandlerFunctionParams<SongTypes.netease>) {
    tasks.push(new Promise((resolve, reject) => {
        neteaseAxios.get('/song/detail', {params: {ids: song.symbol}}).then((res: AxiosResponse) => {
            if (res.data.songs[0].al.picUrl) {
                tmpSong.pic = res.data.songs[0].al.picUrl;
            }
            tmpSong.title = tmpSong.title || res.data.songs[0].name;
            tmpSong.singer = tmpSong.singer || res.data.songs[0].ar.map((a: any) => (a.name)).join(' & ');
            resolve();
        }).catch((err) => {
            reject(err.message);
        })
    }))
    LyricHandlers.ProceedLyric(song, {tasks, tmpSong, unique: song.symbol});
    tasks.push(new Promise((resolve, reject) => {
        neteaseAxios.get('/song/url/v1', {
            params: {
                id: song.symbol,
                level: 'standard'
            }
        }).then(res => {
            if (res.data.data[0]) {
                tmpSong.url = res.data.data[0].url;
                resolve();
            }else {
                reject('数据有误');
            }
        }).catch((err: AxiosError) => {
            reject(err.message);
        })
    }))
}

function MusicHandlerKugou({tasks, tmpSong, song}: MusicHandlerFunctionParams<SongTypes.kugou>) {
    tasks.push(new Promise((resolve, reject) => {
        kugouAxios.get('/song/url', {params: {hash: song.symbol}}).then((res: AxiosResponse) => {
            if (res.data.status === 1) {
                tmpSong.url = res.data.url[0]
                resolve();
            }else if (res.data.status === 2) {
                reject('无VIP');
            }
        }).catch((err) => {
            reject(err.message);
        })
    }))
    LyricHandlers.LyricHandlerKugou({tasks, tmpSong, unique: song.symbol});
    tasks.push(new Promise((resolve, reject) => {
        kugouAxios.get('/privilege/lite', {params: {hash: song.symbol}}).then((res: AxiosResponse) => {
            if (res.data.error_code !== 0) reject(res)
            const d = res.data.data[0]
            tmpSong.pic = replacePicSizeParam(d.trans_param.union_cover)
            tmpSong.title = tmpSong.title || d.name
            tmpSong.singer = tmpSong.singer || d.singername
            resolve();
        }).catch((err) => {
            reject(err.message);
        })
    }))
}
type songTypes = 'bilibili' | 'local' | 'web' | 'netease' | 'siren' | 'qq' | 'kugou'
export const MusicHandlers = {
    MusicHandlerBilibili,
    MusicHandlerSiren,
    MusicHandlerQQ,
    MusicHandlerNetease,
    MusicHandlerKugou,
    record: <{[K in songTypes]: (params: MusicHandlerFunctionParams<any>) => void}>{
        bilibili: MusicHandlerBilibili,
        siren: MusicHandlerSiren,
        qq: MusicHandlerQQ,
        netease: MusicHandlerNetease,
        kugou: MusicHandlerKugou,
    }
}