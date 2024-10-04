import { defineStore } from 'pinia';
import type {
  list,
  messageController,
  song,
  songInPlay,
  song_lrc_item,
  playlistPart,
  mouseMenuItem,
  playlistComponent, list_trace_bilibili_fav
} from '@/types'
import CollectDialog from '@/components/Dialogs/CollectDialog.vue';
import {computed, ref, shallowRef, toRaw, watch} from 'vue';
import emitter from "@/emitter";
import {minmax} from "@/utils/u";
import axios, {type AxiosResponse} from "axios";

const {getBilibiliFav, writePlaylistFile} = (window as any).ymkAPI;

export const useZKStore = defineStore('ZK', () => {
  const {writeConfig, getConfig, writeSpecificConfig, getSpecificConfig} = (window as any).ymkAPI;
  const zks = ref({
    playlists: <list[]>[],
    playlistsParts: <playlistPart[]>[],
    nowTab: 'Playlist',
    loading: {
      text: '',
    },
    dialog: {
      show: false,
      dialogEl: <any>shallowRef(CollectDialog),
    },
    dialogData: {
      waitCollect: <song>(null as any)
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
    play: {
      playlist: <song[]>([]),
      indexInPlaylist: -1,
      song: <songInPlay>{
        pic: '',
        title: '',
        singer: '',
        type: '',
        url: '',
        lrc: {
          status: 'disabled',
          type: 'local',
          path: '',
          lrc: [],
        },
        translationLrc: {
          status: 'disabled',
          type: 'local',
          path: '',
          lrc: [],
        },
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
      lrcConfig: <song_lrc_item[]>[],
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
  const config = ref<any>({});
  const colors = ref<any>({});
  const neteaseUser = ref<any>({});
  const isLogin = computed(() => neteaseUser.value.cookie && neteaseUser.value.cookie != '')
  function saveConfig() {
    writeConfig(JSON.stringify({config: config.value, neteaseUser: neteaseUser.value}))
  }
  function saveColors() {
    writeSpecificConfig('colors', JSON.stringify(colors.value))
  }
  getConfig().then((res: any) => {
    if (res) {
      let jp = res;
      config.value = jp.config;
      neteaseUser.value = jp.neteaseUser;
      if (config.value.volume != undefined) {
        emitter.emit('changeVolumeTo', minmax(config.value.volume, 0, 1));
      }
      if (config.value.mode) {
        zks.value.play.mode = config.value.mode;
      }
    }
    watch([() => zks.value.play.mode, neteaseUser, config], () => {config.value.mode = zks.value.play.mode; saveConfig()}, {deep: true});
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
    zks.value.mouseMenu.position = await (window as any).ymkAPI.getCursorPos()
    zks.value.mouseMenu.show = true;
  }

  function checkSongPlayable(song: any, privilege?: any) {
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
      if (!(isLogin.value && neteaseUser.value.vipType === 11)) {
        status.playable = false
        status.reason = '仅限 VIP 会员'
      }
    } else if ((song.fee === 4 || privilege?.fee === 4) && song?.st < 0) {
      status.playable = false
      status.reason = '付费专辑'
    } else if (song.noCopyrightRcmd !== null && song.noCopyrightRcmd !== undefined) {
      status.playable = false
      status.reason = '无版权'
    } else if ( privilege?.st < 0 && isLogin.value) {
      status.playable = false
      status.reason = '已下架'
    }
    return status
  }
  function mapCheckSongPlayable (songs: any, privilegeList = []) {
    if(songs?.length === undefined) return
    if(privilegeList.length === 0){
      return songs.map((song: any) => {
        Object.assign(song, { ...checkSongPlayable(song) })
        return song
      })
    }
    return songs.map((song: any, i: number) => {
      Object.assign(song, { ...checkSongPlayable(song, privilegeList[i]) })
      return song
    })
  }
  function showMessage(message: string, time: number = 4000) {
    zks.value.message.text = message;
    zks.value.message.show = true;
    clearTimeout(zks.value.message.timer);
    zks.value.message.timer = setTimeout(() => zks.value.message.show = false, time);
  }

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

  function parseComponent(comIndex: number, components: playlistComponent[]) {
    let component = components[comIndex];
    if (comIndex >= components.length) {
      zks.value.nowTab = 'PlaylistDetail';
      return;
    }
    if (component.type === 'data') {
      zks.value.loading.text = `加载 Data 数据 ${comIndex + 1} / ${components.length}`;
      zks.value.playlist.songs.push(...component.songs);
      comIndex++;
      parseComponent(comIndex, components);
    }else if (component.type === 'trace_bilibili_fav') {
      let pn = 0;
      let getNextPage = function() {
        zks.value.loading.text = `Bilibili 已加载 ${Math.max(pn)} 页 ${comIndex + 1} / ${components.length}`;
        pn++;
        getBilibiliFav({
          media_id: (component as list_trace_bilibili_fav).favid,
          pn: pn,
          ps: 20,
        }).then((res: any) => {
          zks.value.playlist.songs.push(...res.data.data.medias.map((m: any) => ({
            type: 'bilibili',
            BV: m.bvid,
            title: m.title,
            pic: m.cover,
            singer: m.upper.name})))
          console.log(res.data.data.has_more, pn);
          if (res.data.data.has_more) {
            getNextPage()
          }else {
            comIndex++;
            parseComponent(comIndex, components);
          }
        })
      }
      getNextPage()
    }else if (component.type === 'trace_siren') {
      let songsApi = 'https://monster-siren.hypergryph.com/api/songs';
      zks.value.loading.text = `加载 塞壬唱片 ${comIndex + 1} / ${components.length}`;
      axios.get(songsApi).then(res => {
        zks.value.playlist.songs.push(...res.data.data.list.map((s: any) => {
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
    }else if (component.type === 'trace_netease_playlist') {
      axios.get(config.value.neteaseApi.url + 'playlist/detail', {
        params: {
          timestamp: new Date().getTime(),
          id: component.id,
          cookie: neteaseUser.value.cookie
        }
      }).then(res => {
        if (components.length === 1) {
          zks.value.playlist.extraInfo.type = 'pureNeteasePlaylist';
          if (res.data.playlist.subscribed) {
            zks.value.playlist.extraInfo.infos.subscribe = 1; //已收藏
          }else if (res.data.playlist.creator.userId == neteaseUser.value.uid) {
            zks.value.playlist.extraInfo.infos.subscribe = 0; //自己的歌单
          }else {
            zks.value.playlist.extraInfo.infos.subscribe = 2; //未收藏
          }
        }
        zks.value.playlist.songs.push(...res.data.playlist.tracks.map((track: any) => {
          return <song>{
            pic: track.al.picUrl,
            title: track.name,
            type: 'netease',
            singer: track.ar.map((ar: any) => (ar.name)).join(' & '),
            id: track.id,
          }
        }))
        comIndex++;
        parseComponent(comIndex, components);
      })
    }else if (component.type === 'trace_qq_playlist') {
      if (!config.value.qqApi.enable) {
        comIndex++;
        parseComponent(comIndex, components);
        return;
      }
      axios.post(config.value.qqApi.url + 'api/y/get_playlistDetail', {
        type: "qq",
        id: component.id
      }).then((res: AxiosResponse) => {
        let result = res.data.data[0];
        zks.value.playlist.songs.push(...result.songlist.map((r: any) => ({...r, type: 'qq'})));
        comIndex++;
        parseComponent(comIndex, components);
      })
    }
  }
  function checkDetail(index: number, raw?: list) {
    zks.value.nowTab = 'Loading';
    zks.value.loading.text = '';
    if (index >= 0) {
      if (zks.value.playlist.listIndex === index) {
        zks.value.nowTab = 'PlaylistDetail';
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
      zks.value.playlist.listIndex = -2;
      zks.value.playlist.songs = [];
      zks.value.playlist.raw = raw!;
      let components = raw!.playlist;
      let comIndex = 0;
      zks.value.playlist.extraInfo.type = 'unknown';
      parseComponent(comIndex, components);
    }
  }
  function addSongTo({song, playlistIndex, save = true} : {song: song, playlistIndex: number, save?: boolean}) {
    let pi;
    if (playlistIndex != undefined && playlistIndex > 0) {
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
        useZKStore().showMessage('添加成功');
      }).catch(() => {
        useZKStore().showMessage(`写入文件${originFn}失败`);
      })
    }
  }

  return {
    zks,
    config,
    colors,
    neteaseUser,
    saveConfig,
    saveColors,
    showMouseMenu,
    checkSongPlayable,
    mapCheckSongPlayable,
    showMessage,
    playlistToolkit: {
      pushPlaylistPart,
      checkDetail,
      addSongTo,
    }
  };
});
