import {useUserStore} from "@/stores/modules/user";
import type {list, list_data, playlistComponent} from "@/types";
import type {song} from '@/types/song'
import router from "@/router";
import {kugouAxios, neteaseAxios} from "@/utils/axiosInstances";
import {replacePicSizeParam} from "@/utils/u";
import {toRaw} from "vue";
import {showMessage} from "@/utils/message";
import {useRuntimeDataStore} from "@/stores/modules/runtimeData";
import { isSongInPlaylist } from "./checkSongExist";

const {getLocalPlaylists, writePlaylistFile} = window.ymkAPI

export function checkSongPlayableByData(song: any, privilege?: any) {
  const user = useUserStore();
  if(privilege === undefined){
    privilege = song?.privilege
  }
  let status = <any>{
    playable: true,
    reason: ''
  }
  if (song?.privilege?.pl > 0)
    return status
  if (song.fee === 1 || privilege?.fee === 1) {
    status.vipOnly = true
    // 非VIP会员
    if (!(user.isLogin.netease && user.neteaseUser.vipType === 11)) {
      status.playable = false
      status.reason = '仅限 VIP 会员'
    }
  } else if ((song.fee === 4 || privilege?.fee === 4) && song?.st < 0) {
    status.playable = false
    status.reason = '付费专辑'
  } else if (song.noCopyrightRcmd !== null && song.noCopyrightRcmd !== undefined) {
    status.playable = false
    status.reason = '无版权'
  } else if ( privilege?.st < 0 && user.isLogin.netease) {
    status.playable = false
    status.reason = '已下架'
  }
  return status
}

export function mapCheckSongPlayable (songs: any, privilegeList = []) {
  if(songs?.length === undefined) return
  if(privilegeList.length === 0){
    return songs.map((song: any) => {
      Object.assign(song, { ...checkSongPlayableByData(song) })
      return song
    })
  }
  return songs.map((song: any, i: number) => {
    Object.assign(song, { ...checkSongPlayableByData(song, privilegeList[i]) })
    return song
  })
}


export async function parseComponent(comIndex: number, components: playlistComponent[]) {
  const {PlaylistHandlers} = await import('@/utils/PlaylistHandlers')
  let component = components[comIndex];
  if (comIndex >= components.length) {
    router.push('/playlistDetail')
    return;
  }
  const defaultParam = {
    parseComponent,
    comIndex,
    component,
    components
  }
  if (component.type === 'data') {
    PlaylistHandlers.PlaylistHandlerData(defaultParam as any)
  }else if (component.type === 'trace_bilibili_fav') {
    PlaylistHandlers.PlaylistHandlerBilibili(defaultParam as any)
  }else if (component.type === 'trace_siren') {
    PlaylistHandlers.PlaylistHandlerSiren(defaultParam as any)
  } else if (component.type === 'trace_netease_playlist') {
    PlaylistHandlers.PlaylistHandlerNetease(defaultParam as any)
  }else if (component.type === 'trace_qq_playlist') {
    PlaylistHandlers.PlaylistHandlerQQ(defaultParam as any)
  }else if (component.type === 'trace_kugou_playlist') {
    PlaylistHandlers.PlaylistHandlerKugou(defaultParam as any)
  }
}

export function checkDetail(index: number, raw?: list) {
  router.push('/loading')
  const runtimeData = useRuntimeDataStore()
  runtimeData.loading.text = '';
  if (index >= 0) {
    if (runtimeData.playlist.listIndex === index) {
      router.push('/playlistDetail')
    }else {
      let list = runtimeData.playlists[index];
      runtimeData.playlist.listIndex = index
      runtimeData.playlist.raw = list;
      runtimeData.playlist.songs = [];
      let components = list.playlist;
      let comIndex = 0;
      runtimeData.playlist.extraInfo.type = 'unknown';
      parseComponent(comIndex, components);
    }
  }else {
    if (JSON.stringify(runtimeData.playlist.raw) === JSON.stringify(raw)) {
      router.push('/playlistDetail')
    }else {
      runtimeData.playlist.listIndex = -2;
      runtimeData.playlist.songs = [];
      runtimeData.playlist.raw = raw!;
      let components = raw!.playlist;
      let comIndex = 0;
      runtimeData.playlist.extraInfo.type = 'unknown';
      parseComponent(comIndex, components);
    }
  }
}

interface PlaylistPartArg {
  title: string,
  playlists: list[],
  begin?: number,
  type?: string,
  other?: any
}

export function pushPlaylistPart(...parts: PlaylistPartArg[]) {
  const runtimeData = useRuntimeDataStore()
  runtimeData.$patch((state) => {
    parts.forEach((value) => {
      let {title, playlists, begin = -1, type = "", other = {}} = value
      if (begin === -1) {
        begin = runtimeData.playlistsParts.length === 0 ? 0 : runtimeData.playlistsParts[runtimeData.playlistsParts.length - 1].begin + runtimeData.playlistsParts[runtimeData.playlistsParts.length - 1].count
      }
      state.playlists.push(...playlists)
      state.playlistsParts.push({
        title: title,
        begin: begin,
        count: playlists.length,
        type,
        other,
      })
    })
  })
}

export async function refreshPlaylists({notReset}: {notReset: boolean}) {
  const runtimeData = useRuntimeDataStore()
  const user = useUserStore()
  
  // 将所有状态重置操作合并到一个$patch调用中
  runtimeData.$patch((state) => {
    state.playlists = <list[]>[];
    state.playlistsParts = [];
    state.playlist.listIndex = -1;
    
    if (!notReset) {
      state.playlist.songs = <song[]>[];
      state.playlist.raw = {} as any;
    }
  })
  
  // 创建所有播放列表获取任务
  const playlistTasks: Promise<PlaylistPartArg | null>[] = [];
  
  // 本地播放列表
  const localPlaylistTask = getLocalPlaylists().then((ps: any) => {
    ps = ps.map((p: any) => {
      if (!('type' in p)) {
        p.type = 'local'
      }
      return p
    })
    return {
      title: '本地',
      playlists: ps,
      begin: undefined,
      type: "local",
    }
  });
  playlistTasks.push(localPlaylistTask);
  
  // 网易云播放列表
  if (user.isLogin.netease) {
    // 每日推荐
    const dailyRecommendTask = neteaseAxios.post(`/recommend/resource`).then(res => ({
      title: '每日推荐',
      playlists: res.data.recommend.map((playlist: any) => (<list>{
        title: playlist.name,
        pic: playlist.picUrl,
        intro: 'Netease Daily Recommendation',
        originFilename: 'REMOTE',
        type: 'netease_daily_recommend',
        playlist: [{
          type: 'trace_netease_playlist',
          id: playlist.id
        }]
      })),
      begin: undefined,
      type: "netease_daily_recommend"
    }));
    playlistTasks.push(dailyRecommendTask);
    
    // 用户歌单
    const userPlaylistTask = neteaseAxios.post(`/user/playlist?uid=${user.neteaseUser.uid}`, {}).then(res => ({
      title: '网易云',
      playlists: res.data.playlist.map((playlist: any) => (<list>{
        title: playlist.name,
        pic: playlist.coverImgUrl,
        intro: 'FROM NETEASE',
        originFilename: 'REMOTE',
        type: `netease${playlist.creator.userId === user.neteaseUser.uid ? '_self' : ''}`,
        playlist: [{
          type: 'trace_netease_playlist',
          id: playlist.id
        }]
      })),
      begin: undefined,
      type: "netease"
    }));
    playlistTasks.push(userPlaylistTask);
  }
  
  // 酷狗播放列表
  if (user.isLogin.kugou) {
    const kugouPlaylistTask = kugouAxios.post('/user/playlist').then(res => {
      if ('status' in res.data && res.data.status === 1) {
        const data = res.data.data;
        return {
          title: '酷狗',
          type: "kugou",
          playlists: data.info.map((playlist: any) => (<list>{
            title: playlist.name,
            pic: replacePicSizeParam(playlist.pic || "https://c1.kgimg.com/custom/"),
            intro: playlist.intro || 'FROM KUGOU',
            originFilename: 'REMOTE',
            type: 'kugou',
            playlist: [{
              type: 'trace_kugou_playlist',
              id: playlist.global_collection_id
            }]
          })),
          begin: undefined,
        };
      }
      return null;
    });
    playlistTasks.push(kugouPlaylistTask);
  }
  
  const results = await Promise.allSettled(playlistTasks);
  const validResults = results.filter(result => result.status === "fulfilled" && result.value !== null) as PromiseFulfilledResult<PlaylistPartArg>[];
  if (validResults.length > 0) {
    pushPlaylistPart(...validResults.map(r => r.value!));
  }
}

export function addSongTo({song, playlistIndex, save = true} : {song: song, playlistIndex: number, save?: boolean}) {
  const runtimeData = useRuntimeDataStore()
  let pi;
  if (playlistIndex != undefined && playlistIndex >= 0) {
    pi = playlistIndex;
  }else return;
  let pl = runtimeData.playlists[pi];
  let components = pl.playlist;
  let first = components[0];
  let originFn = pl.originFilename;
  if (first && first.type === 'data') {
    first.songs.unshift(song);
  }else {
    components.unshift({
      type: "data",
      songs: [song],
    })
  }
  if (pi === runtimeData.playlist.listIndex) {
    runtimeData.playlist.songs.unshift(song)
  }
  if (save) {
    writePlaylistFile(originFn, JSON.stringify(toRaw(runtimeData.playlists[pi]))).then(() => {
      showMessage('添加成功');
    }).catch(() => {
      showMessage(`写入文件${originFn}失败`);
    })
  }
}
export async function checkMusicPlayable(song: song) {
  if (song.type === 'netease') {
    let res = await neteaseAxios.get(`/check/music`, {
      params: {
        id: song.symbol
      }
    })
    return {result: res.data.success, msg: res.data.message}
  }else {
    return {result: true, msg: ''}
  }
}

function neteaseSongToSongType(s: any) {
  return <song>{
    symbol: s.id,
    pic: s.al.picUrl,
    singer: s.ar.map((a: any) => a.name).join(" & "),
    type: 'netease',
    title: s.name,
  }
}
export function neteaseSongsToSongType(ss: any) {
  return <song[]>ss.map((s: any) => neteaseSongToSongType(s))
}

export function saveSpecificPlaylist(playlist: list) {
  if (!playlist.originFilename.endsWith(".json")) return;
  writePlaylistFile(playlist.originFilename, JSON.stringify(toRaw(playlist))).then(() => {
    showMessage(`保存成功${playlist.originFilename}`);
  }).catch(() => {
    showMessage(`写入文件${playlist.originFilename}失败`);
  })
}

export function addSongToPlaylist(song?: song, playlist?: list, save = false) {
  if (!song || !playlist || playlist.type !== 'local') return;
  let components = playlist.playlist;
  let first = components[0];
  if (first && first.type === 'data') {
    first.songs.unshift(song);
  }else {
    components.unshift({
      type: "data",
      songs: [song],
    })
  }
  if (save) {
    writePlaylistFile(playlist.originFilename, JSON.stringify(toRaw(playlist))).then(() => {
      showMessage('添加成功');
    }).catch(() => {
      showMessage(`写入文件${playlist.originFilename}失败`);
    })
  }
}

export function removeSongFromPlaylist(song?: song, playlist?: list, save = false) {
  if (!song || !playlist || playlist.type !== 'local') return;
  const runtimeData = useRuntimeDataStore()
  let components = playlist.playlist;
  const result = isSongInPlaylist(song, playlist);
  if (playlist.originFilename === runtimeData.playlist.raw.originFilename) {
    runtimeData.playlist.songs.splice(result[2], 1)
  }
  if (!result[0]) return;
  else {
    (components[result[1]] as list_data).songs.splice(result[2], 1)
  }
  if (save) {
    saveSpecificPlaylist(playlist)
  }
}