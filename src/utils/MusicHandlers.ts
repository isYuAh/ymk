import axios, {AxiosError, type AxiosResponse} from "axios";
import type {song_bilibili, song_kugou, song_netease, song_qq, song_siren, songInPlay, songTypeMap} from "@/types";
import {proceedLrcText, replacePicSizeParam} from "@/utils/u";
import {kugouAxios, neteaseAxios, qqAxios} from "@/utils/axiosInstances";
import {LyricHandlers} from "@/utils/LyricHandlers";
const {getBilibiliVideoView, getBilibiliVideoPlayurl, axiosRequestGet} = window.ymkAPI;

interface MusicHandlerFunctionParams<T> {
    tasks: Promise<void>[],
    tmpSong: songInPlay,
    song: T,
}

function MusicHandlerBilibili({tasks, tmpSong, song}: MusicHandlerFunctionParams<song_bilibili>) {
    tasks.push(new Promise((resolve, reject) => {
        getBilibiliVideoView(song.BV).then((res: any) => {
            if (res.data.pic) {
                tmpSong.pic = res.data.pic;
            }
            let rawDetail = res.data
            let cid
            if (song.p !== undefined && 'pages' in res.data) {
                cid = res.data.pages[song.p - 1].cid;
            }else {
                cid = res.data.cid;
            }
            tmpSong.title = tmpSong.title || rawDetail.title;
            tmpSong.singer = tmpSong.singer || rawDetail.owner.name;

            getBilibiliVideoPlayurl({
                bvid: song.BV,
                cid,
                platform: "html5"
            }).then((res: AxiosResponse) => {
                tmpSong.url = res.data.durl[0].url;
                resolve();
            }).catch(() => reject(new Error('获取视频播放地址失败')))
        }).catch(() => reject(new Error('获取视频信息失败')));
    }))
}

function MusicHandlerSiren({tasks, tmpSong, song}: MusicHandlerFunctionParams<song_siren>) {
    tasks.push(new Promise((resolve, reject) => {
        let subTasks = <Promise<void>[]>[]
        axios.get(`https://monster-siren.hypergryph.com/api/song/${song.cid}`).then(res => {
            if (res.data.data.lyricUrl) {
                subTasks.push(new Promise((resolve, reject) => {
                    axiosRequestGet(res.data.data.lyricUrl).then((res: any) => {
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
function MusicHandlerQQ({tasks, tmpSong, song}: MusicHandlerFunctionParams<song_qq>) {
    tasks.push(new Promise((resolve, reject) => {
        qqAxios.post("/api/y/get_song", {
            type: "qq",
            mid: song.mid,
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

function MusicHandlerNetease({tasks, tmpSong, song}: MusicHandlerFunctionParams<song_netease>) {
    tasks.push(new Promise((resolve, reject) => {
        neteaseAxios.get('/song/detail', {params: {ids: song.id}}).then((res: AxiosResponse) => {
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
    LyricHandlers.LyricHandlerNetease({tasks, tmpSong, unique: song.id})
    tasks.push(new Promise((resolve, reject) => {
        neteaseAxios.get('/song/url/v1', {
            params: {
                id: song.id,
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

function MusicHandlerKugou({tasks, tmpSong, song}: MusicHandlerFunctionParams<song_kugou>) {
    tasks.push(new Promise((resolve, reject) => {
        kugouAxios.get('/song/url', {params: {hash: song.hash}}).then((res: AxiosResponse) => {
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
    LyricHandlers.LyricHandlerKugou({tasks, tmpSong, unique: song.hash});
    tasks.push(new Promise((resolve, reject) => {
        kugouAxios.get('/privilege/lite', {params: {hash: song.hash}}).then((res: AxiosResponse) => {
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
    record: <{[K in songTypes]: (params: MusicHandlerFunctionParams<songTypeMap[K]>) => void}>{
        bilibili: MusicHandlerBilibili,
        siren: MusicHandlerSiren,
        qq: MusicHandlerQQ,
        netease: MusicHandlerNetease,
        kugou: MusicHandlerKugou,
    }
}