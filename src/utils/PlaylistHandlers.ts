import type {
    list_data,
    list_trace_bilibili_fav, list_trace_kugou_playlist,
    list_trace_netease_playlist, list_trace_qq_playlist,
    list_trace_siren,
    playlistComponent,
    song, song_kugou,
} from "@/types";
const {getBilibiliFav} = window.ymkAPI;
import axios, {type AxiosResponse} from "axios";
import {kugouAxios, neteaseAxios} from "@/utils/axiosInstances";
import {useUserStore} from "@/stores/modules/user";
import {useConfigStore} from "@/stores/modules/config";
import {usePlayerStore} from "@/stores/modules/player";
import {useRuntimeDataStore} from "@/stores/modules/runtimeData";

interface PlaylistHandlersParams<T> {
    component: T,
    parseComponent: (a: number, b: playlistComponent[]) => void,
    comIndex: number,
    components: playlistComponent[]
}
const runtimeData = useRuntimeDataStore()
const user = useUserStore()
const config = useConfigStore()
const player = usePlayerStore()

function PlaylistHandlerData({component, parseComponent, comIndex, components}: PlaylistHandlersParams<list_data>) {
    runtimeData.loading.text = `加载 Data 数据 ${comIndex + 1} / ${components.length}`;
    runtimeData.playlist.songs.push(...component.songs);
    comIndex++;
    parseComponent(comIndex, components);
}

function PlaylistHandlerBilibili({component, parseComponent, components, comIndex}: PlaylistHandlersParams<list_trace_bilibili_fav>) {
    let pn = 0;
    let getNextPage = function() {
        runtimeData.loading.text = `Bilibili 已加载 ${Math.max(pn)} 页 ${comIndex + 1} / ${components.length}`;
        pn++;
        getBilibiliFav({
            media_id: (component as list_trace_bilibili_fav).favid,
            pn: pn,
            ps: 20,
        }).then((res: any) => {
            if (component.expandAll) {
                for (let m of res.data.medias) {
                    if (m.page > 1) {
                        for (let i = 1; i <= m.page;i++) {
                            runtimeData.playlist.songs.push({
                                type: 'bilibili',
                                BV: m.bvid,
                                title: `P${i} ${m.title}`,
                                pic: m.cover,
                                singer: m.upper.name,
                                p: i
                            })
                        }
                    }else {
                        runtimeData.playlist.songs.push({
                            type: 'bilibili',
                            BV: m.bvid,
                            title: m.title,
                            pic: m.cover,
                            singer: m.upper.name})
                    }
                }
            }else {
                runtimeData.playlist.songs.push(...res.data.medias.map((m: any) => ({
                    type: 'bilibili',
                    BV: m.bvid,
                    title: m.title,
                    pic: m.cover,
                    singer: m.upper.name})))
            }
            if (res.data.has_more) {
                getNextPage()
            }else {
                comIndex++;
                parseComponent(comIndex, components);
            }
        })
    }
    getNextPage()
}

function PlaylistHandlerSiren({component, parseComponent, comIndex, components}: PlaylistHandlersParams<list_trace_siren>) {
    let songsApi = 'https://monster-siren.hypergryph.com/api/songs';
    runtimeData.loading.text = `加载 塞壬唱片 ${comIndex + 1} / ${components.length}`;
    axios.get(songsApi).then(res => {
        runtimeData.playlist.songs.push(...res.data.data.list.map((s: any) => {
            return <song>{
                title: s.name,
                singer: s.artists.join(' / '),
                type: 'siren',
                cid: s.cid
            }
        }))
        comIndex++;
        parseComponent(comIndex, components);
    })
}

function PlaylistHandlerNetease({component, parseComponent, comIndex, components}: PlaylistHandlersParams<list_trace_netease_playlist>) {
    runtimeData.loading.text = `加载 网易云歌单#${component.id}`;
    neteaseAxios.get('/playlist/detail', {
        params: {
            timestamp: new Date().getTime(),
            id: component.id
        }
    }).then(async (res) => {
        if (components.length === 1) {
            runtimeData.playlist.extraInfo.type = 'pureNeteasePlaylist';
            if (res.data.playlist.subscribed) {
                runtimeData.playlist.extraInfo.infos.subscribe = 1; //已收藏
            }else if (res.data.playlist.creator.userId == user.neteaseUser.uid) {
                runtimeData.playlist.extraInfo.infos.subscribe = 0; //自己的歌单
            }else {
                runtimeData.playlist.extraInfo.infos.subscribe = 2; //未收藏
            }
        }
        let totalSongCount = res.data.playlist.trackCount;
        // if (totalSongCount <= 1000 && neteaseUser.value.auth !== '') {
        //     runtimeData.value.playlist.songs.push(...res.data.playlist.tracks.map((track: any) => {
        //         return <song>{
        //             pic: track.al.picUrl,
        //             title: track.name,
        //             type: 'netease',
        //             singer: track.ar.map((ar: any) => (ar.name)).join(' & '),
        //             id: track.id,
        //         }
        //     }))
        //     comIndex++;
        //     parseComponent(comIndex, components);
        // }else {
            const sliceSize = 500;
            const spliceCount = Math.ceil(totalSongCount / sliceSize);
            let completeCount = 0, tasks = <Promise<song[]>[]>[];
            runtimeData.loading.text = `加载 网易云歌单#${component.id} | 分片 ${completeCount} / ${spliceCount}`;
            for (let c = 0, i = 0; i < totalSongCount; i+=sliceSize, c++) {
                tasks.push(new Promise((resolve, reject) => {
                    neteaseAxios.get('/playlist/track/all', {
                        params: {
                            id: component.id,
                            limit: sliceSize,
                            offset: i
                        }
                    }).then((res) => {
                        if (res.data.code === 200) {
                            completeCount++;
                            runtimeData.loading.text = `加载 网易云歌单#${component.id} | 分片 ${completeCount} / ${spliceCount}`;
                            resolve(res.data.songs.map((s: any) => {
                                return {
                                    pic: s.al.picUrl,
                                    title: s.name,
                                    type: 'netease',
                                    singer: s.ar.map((ar: any) => (ar.name)).join(' & '),
                                    id: s.id,
                                }
                            }));
                        }else {
                            completeCount++;
                            runtimeData.loading.text = `加载 网易云歌单#${component.id} | 分片 ${completeCount} / ${spliceCount}`;
                            reject()
                        }
                    }).catch((e) => {reject(e)})
                }))
            }
            Promise.all(tasks).then((results) => {
                runtimeData.playlist.songs.push(...(<song[]>[]).concat(...results));
                comIndex++;
                parseComponent(comIndex, components);
            })
        // }
    })
}

function PlaylistHandlerQQ({component, parseComponent, comIndex, components}: PlaylistHandlersParams<list_trace_qq_playlist>) {
    if (!config.api.qqApi.enable) {
        comIndex++;
        parseComponent(comIndex, components);
        return;
    }
    axios.post(config.api.qqApi.url + 'api/y/get_playlistDetail', {
        type: "qq",
        id: component.id
    }).then((res: AxiosResponse) => {
        let result = res.data.data[0];
        runtimeData.playlist.songs.push(...result.songlist.map((r: any) => ({...r, type: 'qq'})));
        comIndex++;
        parseComponent(comIndex, components);
    })
}

function PlaylistHandlerKugou({component, parseComponent, comIndex, components}: PlaylistHandlersParams<list_trace_kugou_playlist>) {
    const ps= 100;
    const tasks = <Promise<void>[]>[];
    runtimeData.loading.text = `加载 酷狗歌单#${component.id}`;
    let now = 0;
    let total = 0;
    const refreshLoadingText = () => {
        runtimeData.loading.text = `加载 酷狗歌单#${component.id} ${now}/${total}`;
    }
    kugouAxios.get('/playlist/track/all', {
        params: {
            page: 1,
            pagesize: ps,
            id: component.id
        }
    }).then((res: AxiosResponse) => {
        if (res.data.status === 1) {
            const data = res.data.data;
            const result = Array(data.count)
            const times = Math.ceil(data.count / ps);
            const AssignSongs = (start: number, idealEnd: number, songs: song_kugou[]) => {
                for (let i = start; i <= idealEnd && i < data.count; i++) {
                    result[i] = songs[i - start]
                }
            }
            console.log(data)
            if (!(data.info instanceof Array)) data.info = []
            AssignSongs(0, 99, data.info.map((d: any) => {
                const info = d.name.split(' - ');
                return <song_kugou>{
                    type: 'kugou',
                    hash: d.hash,
                    pic: d.cover,
                    title: info.slice(1).join(' - ') || "",
                    singer: info[0],
                }
            }))
            now++;
            total = data.count;
            refreshLoadingText();
            for (let i = 0; i < times - 1; i++) {
                tasks.push(new Promise((resolve, reject) => {
                    kugouAxios.get('/playlist/track/all', {
                        params: {
                            page: i+2,
                            pagesize: ps,
                            id: component.id
                        }
                    }).then(() => {
                        AssignSongs((i+1) * 100, (i+1) * 100 + 199, data.info.map((d: any) => {
                            const info = d.name.split(' - ');
                            return <song_kugou>{
                                type: 'kugou',
                                hash: d.hash,
                                pic: d.cover,
                                title: info.slice(1).join(' - '),
                                singer: info[0],
                            }
                        }))
                        now++;
                        refreshLoadingText();
                        resolve();
                    }).catch((e) => {reject(e)})
                }))
            }
            Promise.all(tasks).then(() => {
                runtimeData.playlist.songs.push(...result);
                console.log(runtimeData.playlist.songs)
                comIndex++;
                parseComponent(comIndex, components);
            })
        }
    })
}

export const PlaylistHandlers = {
    PlaylistHandlerData,
    PlaylistHandlerBilibili,
    PlaylistHandlerSiren,
    PlaylistHandlerNetease,
    PlaylistHandlerQQ,
    PlaylistHandlerKugou
}