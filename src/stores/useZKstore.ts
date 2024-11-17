import { defineStore } from 'pinia';
import type {
  list,
  messageController,
  song,
  songInPlay,
  playlistPart,
  mouseMenuItem,
  playlistComponent, list_trace_bilibili_fav
} from '@/types'
import {type Component, computed, ref, shallowRef, toRaw, watch} from 'vue';
import router from "@/router";
import type {config, User} from "@/types/config";
import {kugouAxios, neteaseAxios} from "@/utils/axiosInstances";
import {replacePicSizeParam} from "@/utils/u";

const {writePlaylistFile, getLocalPlaylists, onShowMessage, onRefreshPlaylists} = window.ymkAPI;

export const useZKStore = defineStore('ZK', () => {
  const {writeConfig, getConfig, writeSpecificConfig, getSpecificConfig} = window.ymkAPI;
  const zks = ref({
    playlists: <list[]>[],
    playlistsParts: <playlistPart[]>[],
    nowTab: '',
    loading: {
      text: '',
    },
    dialog: {
      show: false,
      dialogEl: <any>null,
      data: <any>null,
    },
    message: <messageController>{
      show: false,
      text: '',
      timer: null as any,
    },
    resourceDir: '',
    showFullPlay: false,
    showPlaylistSonglist: false,
    playlist: {
      listIndex: -1, //-1:无 -2:非本地
      raw: <list>{},
      songs: <song[]>[],
      extraInfo: {
        type: '',
        infos: <Record<string, any>>{},
      }
    },
    albumPreview: {
      songs: <song[]>[],
      info: {
        title: "",
        creator: "",
        pic: "",
      }
    },
    play: {
      playlist: <song[]>([]),
      indexInPlaylist: -1,
      song: <songInPlay>{
        pic: '',
        title: '',
        singer: '',
        type: '',
        url: '',
        lrcs: {},
        origin: null as any
      },
      curTime: '',
      lang: 'origin',
      curTimeNum: 0,
      durationTime: '',
      duration: 0,
      status: 'pause',
      mode: 'list',
      activeLrc: -1,
      show_songface: false,
      volume: 1,
      progress: 0,
      highlightLrcIndex: -1,
    },
    wbi: {},
    history: [],
    mouseMenu: {
      menu: <mouseMenuItem[]>[{
        title: 'test1',
        action: () => console.log('test')
      },{
        title: 'test2',
        action: () => console.log('TTTTT')
      }],
      args: <any>null,
      show: false,
      position: {
        left: 0,
        top: 0
      }
    },
  });
  router.beforeEach((to, from) => {
    if (to.path === '/playlistDetail' && zks.value.playlist.listIndex === -1) return {path: '/playlist'};
    if (to.path === '/albumPreview' && zks.value.albumPreview.info.title === "") return {path: '/search'};
    if (to.path !== '/') zks.value.nowTab = to.path.substring(1)
    return true
  })
  const config = ref<config>({} as any);
  const colors = ref<Record<string, string>>({});
  const neteaseUser = ref<User>({} as any);
  const kugouUser = ref<User>({} as any);
  const isLogin = computed(() => ({
    netease: neteaseUser.value.auth && neteaseUser.value.auth != '',
    kugou: kugouUser
  }))
  const neteaseLikeList = ref([])

  watch(() => neteaseUser.value.auth, (nv) => {
    if (nv) {
      neteaseAxios.get(`/likelist?uid=${neteaseUser.value.uid}`).then((res) => {
        neteaseLikeList.value = res.data.code === 200 ? res.data.ids : []
      })
    }
  })


  function saveConfig() {
    writeConfig(JSON.stringify({config: config.value, neteaseUser: neteaseUser.value, kugouUser: kugouUser.value}))
  }
  function saveColors() {
    writeSpecificConfig('colors', JSON.stringify(colors.value))
  }
  getConfig().then((res: any) => {
    if (res) {
      let jp = res;
      config.value = jp.config;
      neteaseUser.value = jp.neteaseUser || {};
      kugouUser.value = jp.kugouUser || {};
      if (config.value.mode) {
        zks.value.play.mode = config.value.mode;
      }
    }
    watch([() => zks.value.play.mode, neteaseUser, config, kugouUser], () => {config.value.mode = zks.value.play.mode as any; saveConfig()}, {deep: true});
  })
  getSpecificConfig('colors').then((res: any) => {
    if (res) {
      colors.value = res;
    }
  })

  async function showMouseMenu(menu?: mouseMenuItem[], arg: any = null) {
    if (menu) {
      zks.value.mouseMenu.menu = menu;
    }
    zks.value.mouseMenu.args = arg;
    zks.value.mouseMenu.position = await window.ymkAPI.getCursorPos()
    zks.value.mouseMenu.show = true;
  }

  function showDialog(dialogComponent: Component, data?: any) {
    if (data) {
      zks.value.dialog.data = data;
    }
    zks.value.dialog.dialogEl = shallowRef(dialogComponent);
    zks.value.dialog.show = true;
  }

  function checkSongPlayableByData(song: any, privilege?: any) {
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
      if (!(isLogin.value.netease && neteaseUser.value.vipType === 11)) {
        status.playable = false
        status.reason = '仅限 VIP 会员'
      }
    } else if ((song.fee === 4 || privilege?.fee === 4) && song?.st < 0) {
      status.playable = false
      status.reason = '付费专辑'
    } else if (song.noCopyrightRcmd !== null && song.noCopyrightRcmd !== undefined) {
      status.playable = false
      status.reason = '无版权'
    } else if ( privilege?.st < 0 && isLogin.value.netease) {
      status.playable = false
      status.reason = '已下架'
    }
    return status
  }
  function mapCheckSongPlayable (songs: any, privilegeList = []) {
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
  function showMessage(message: string, time: number = 4000) {
    zks.value.message.text = message;
    zks.value.message.show = true;
    clearTimeout(zks.value.message.timer);
    zks.value.message.timer = setTimeout(() => zks.value.message.show = false, time);
  }
  onShowMessage((m: any) => showMessage(m))
  async function refreshPlaylists({notReset}: {notReset: boolean}) {
    zks.value.playlists = <list[]>[];
    zks.value.playlistsParts = [];
    zks.value.playlist.listIndex = -1;
    if (!notReset) {
      Object.assign(zks.value.playlist, {
        songs: <song[]>[],
        raw: {}
      })
    }
    const ps = await getLocalPlaylists();
    pushPlaylistPart('本地', ps)
    if (neteaseUser.value.auth) {
      let res = await neteaseAxios.post(`/user/playlist?uid=${neteaseUser.value.uid}`, {})
      pushPlaylistPart('网易云', res.data.playlist.map((playlist: any) => ({
        title: playlist.name,
        pic: playlist.coverImgUrl,
        intro: 'FROM NETEASE',
        originFilename: 'REMOTE',
        playlist: [{
          type: 'trace_netease_playlist',
          id: playlist.id
        }]
      })))
    }
    if (kugouUser.value.auth) {
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
        })))
      }
    }
  }
  onRefreshPlaylists(() => refreshPlaylists({notReset: false}))
  function pushPlaylistPart(title: string, playlists: list[], begin = -1, other = {}) {
    if (begin === -1) {
      begin = zks.value.playlistsParts.length === 0 ? 0 : zks.value.playlistsParts[zks.value.playlistsParts.length - 1].begin + zks.value.playlistsParts[zks.value.playlistsParts.length - 1].count
    }
    zks.value.playlists.push(...playlists)
    zks.value.playlistsParts.push({
      title: title,
      begin: begin,
      count: playlists.length,
      other,
    })
  }

  async function parseComponent(comIndex: number, components: playlistComponent[]) {
    const {PlaylistHandlers} = await import('@/utils/PlaylistHandlers')
    let component = components[comIndex];
    if (comIndex >= components.length) {
      router.push('/playlistDetail')
      return;
    }
    const defaultParam = {
      zks,
      parseComponent,
      comIndex,
      component,
      components
    }
    if (component.type === 'data') {
      PlaylistHandlers.PlaylistHandlerData(defaultParam)
    }else if (component.type === 'trace_bilibili_fav') {
      PlaylistHandlers.PlaylistHandlerBilibili(defaultParam)
    }else if (component.type === 'trace_siren') {
      PlaylistHandlers.PlaylistHandlerSiren(defaultParam)
    } else if (component.type === 'trace_netease_playlist') {
      PlaylistHandlers.PlaylistHandlerNetease(defaultParam)
    }else if (component.type === 'trace_qq_playlist') {
      PlaylistHandlers.PlaylistHandlerQQ(defaultParam)
    }else if (component.type === 'trace_kugou_playlist') {
      PlaylistHandlers.PlaylistHandlerKugou(defaultParam)
    }
  }
  function checkDetail(index: number, raw?: list) {
    router.push('/loading')
    zks.value.loading.text = '';
    if (index >= 0) {
      if (zks.value.playlist.listIndex === index) {
        router.push('/playlistDetail')
      }else {
        let list = zks.value.playlists[index];
        zks.value.playlist.listIndex = index
        zks.value.playlist.raw = list;
        zks.value.playlist.songs = [];
        let components = list.playlist;
        let comIndex = 0;
        zks.value.playlist.extraInfo.type = 'unknown';
        parseComponent(comIndex, components);
      }
    }else {
      if (JSON.stringify(zks.value.playlist.raw) === JSON.stringify(raw)) {
        router.push('/playlistDetail')
      }else {
        zks.value.playlist.listIndex = -2;
        zks.value.playlist.songs = [];
        zks.value.playlist.raw = raw!;
        let components = raw!.playlist;
        let comIndex = 0;
        zks.value.playlist.extraInfo.type = 'unknown';
        parseComponent(comIndex, components);
      }
    }
  }
  function addSongTo({song, playlistIndex, save = true} : {song: song, playlistIndex: number, save?: boolean}) {
    let pi;
    if (playlistIndex != undefined && playlistIndex >= 0) {
      pi = playlistIndex;
    }else return;
    let pl = zks.value.playlists[pi];
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
    if (pi === zks.value.playlist.listIndex) {
      zks.value.playlist.songs.unshift(song)
    }
    if (save) {
      writePlaylistFile(originFn, JSON.stringify(toRaw(zks.value.playlists[zks.value.mouseMenu.args.pi]))).then(() => {
        showMessage('添加成功');
      }).catch(() => {
        showMessage(`写入文件${originFn}失败`);
      })
    }
  }
  async function checkMusicPlayable(song: song) {
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

  function saveSpecificPlaylist(playlist: list) {
    if (!playlist.originFilename.endsWith(".json")) return;
    writePlaylistFile(playlist.originFilename, JSON.stringify(toRaw(playlist))).then(() => {
      showMessage(`保存成功${playlist.originFilename}`);
    }).catch(() => {
      showMessage(`写入文件${playlist.originFilename}失败`);
    })
  }
  function neteaseSongToSongType(s: any) {
    return <song>{
      id: s.id,
      pic: s.al.picUrl,
      singer: s.ar.map((a: any) => a.name).join(" & "),
      type: 'netease',
      title: s.name,
    }
  }
  function neteaseSongsToSongType(ss: any) {
    return <song[]>ss.map((s: any) => neteaseSongToSongType(s))
  }

  return {
    zks,
    config,
    colors,
    neteaseUser,
    kugouUser,
    neteaseLikeList,
    saveConfig,
    saveColors,
    showMouseMenu,
    showMessage,
    showDialog,
    playlistToolkit: {
      pushPlaylistPart,
      checkDetail,
      refreshPlaylists,
      addSongTo,
      saveSpecificPlaylist,
    },
    songToolkit: {
      checkMusicPlayable,
      mapCheckSongPlayable,
      neteaseSongToSongType,
      neteaseSongsToSongType,
    },
  };
});
