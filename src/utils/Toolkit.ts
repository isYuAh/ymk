import {useUserStore} from "@/stores/modules/user";
import type {list, playlistComponent, song} from "@/types";
import router from "@/router";
import {useZKStore} from "@/stores/useZKstore";
import {kugouAxios, neteaseAxios} from "@/utils/axiosInstances";
import {replacePicSizeParam} from "@/utils/u";
import {toRaw} from "vue";
import {showMessage} from "@/utils/message";

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
    if (!(user.isLogin().netease && user.neteaseUser.vipType === 11)) {
      status.playable = false
      status.reason = '仅限 VIP 会员'
    }
  } else if ((song.fee === 4 || privilege?.fee === 4) && song?.st < 0) {
    status.playable = false
    status.reason = '付费专辑'
  } else if (song.noCopyrightRcmd !== null && song.noCopyrightRcmd !== undefined) {
    status.playable = false
    status.reason = '无版权'
  } else if ( privilege?.st < 0 && user.isLogin().netease) {
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
  const zks = useZKStore()
  zks.zks.loading.text = '';
  if (index >= 0) {
    if (zks.zks.playlist.listIndex === index) {
      router.push('/playlistDetail')
    }else {
      let list = zks.zks.playlists[index];
      zks.zks.playlist.listIndex = index
      zks.zks.playlist.raw = list;
      zks.zks.playlist.songs = [];
      let components = list.playlist;
      let comIndex = 0;
      zks.zks.playlist.extraInfo.type = 'unknown';
      parseComponent(comIndex, components);
    }
  }else {
    if (JSON.stringify(zks.zks.playlist.raw) === JSON.stringify(raw)) {
      router.push('/playlistDetail')
    }else {
      zks.zks.playlist.listIndex = -2;
      zks.zks.playlist.songs = [];
      zks.zks.playlist.raw = raw!;
      let components = raw!.playlist;
      let comIndex = 0;
      zks.zks.playlist.extraInfo.type = 'unknown';
      parseComponent(comIndex, components);
    }
  }
}


export function pushPlaylistPart(title: string, playlists: list[], begin = -1, type = "", other = {}) {
  const zks = useZKStore()
  if (begin === -1) {
    begin = zks.zks.playlistsParts.length === 0 ? 0 : zks.zks.playlistsParts[zks.zks.playlistsParts.length - 1].begin + zks.zks.playlistsParts[zks.zks.playlistsParts.length - 1].count
  }
  zks.zks.playlists.push(...playlists)
  zks.zks.playlistsParts.push({
    title: title,
    begin: begin,
    count: playlists.length,
    type,
    other,
  })
}
export async function refreshPlaylists({notReset}: {notReset: boolean}) {
  const zks = useZKStore()
  const user = useUserStore()
  zks.zks.playlists = <list[]>[];
  zks.zks.playlistsParts = [];
  zks.zks.playlist.listIndex = -1;
  if (!notReset) {
    Object.assign(zks.zks.playlist, {
      songs: <song[]>[],
      raw: {}
    })
  }
  const ps = await getLocalPlaylists();
  pushPlaylistPart('本地', ps, undefined, "init")
  if (user.isLogin().netease) {
    let res = await neteaseAxios.post(`/user/playlist?uid=${user.neteaseUser.uid}`, {})
    pushPlaylistPart('网易云', res.data.playlist.map((playlist: any) => ({
      title: playlist.name,
      pic: playlist.coverImgUrl,
      intro: 'FROM NETEASE',
      originFilename: 'REMOTE',
      playlist: [{
        type: 'trace_netease_playlist',
        id: playlist.id
      }]
    })), undefined, "init")
  }
  if (user.isLogin().kugou) {
    let res = await kugouAxios.post('/user/playlist')
    if ('status' in res.data && res.data.status === 1) {
      const data = res.data.data;
      pushPlaylistPart('酷狗', data.info.map((playlist: any) => ({
        title: playlist.name,
        pic: replacePicSizeParam(playlist.pic || "https://c1.kgimg.com/custom/"),
        intro: playlist.intro || 'FROM KUGOU',
        originFilename: 'REMOTE',
        playlist: [{
          type: 'trace_kugou_playlist',
          id: playlist.global_collection_id
        }]
      })), undefined, "init")
    }
  }
}

export function addSongTo({song, playlistIndex, save = true} : {song: song, playlistIndex: number, save?: boolean}) {
  const zks = useZKStore()
  let pi;
  if (playlistIndex != undefined && playlistIndex >= 0) {
    pi = playlistIndex;
  }else return;
  let pl = zks.zks.playlists[pi];
  let components = pl.playlist;
  let first = components[0];
  let originFn = pl.originFilename;
  if (first.type === 'data') {
    first.songs.unshift(song);
  }else {
    components.unshift({
      type: "data",
      songs: [song],
    })
  }
  if (pi === zks.zks.playlist.listIndex) {
    zks.zks.playlist.songs.unshift(song)
  }
  if (save) {
    writePlaylistFile(originFn, JSON.stringify(toRaw(zks.zks.playlists[pi]))).then(() => {
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
        id: song.id
      }
    })
    return {result: res.data.success, msg: res.data.message}
  }else {
    return {result: true, msg: ''}
  }
}