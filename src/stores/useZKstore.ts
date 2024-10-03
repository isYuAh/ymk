import { defineStore } from 'pinia';
import type {list, messageController, song, songInPlay, song_lrc_item, playlistPart, mouseMenuItem} from '@/types'
import CollectDialog from '@/components/Dialogs/CollectDialog.vue';
import {computed, ref, shallowRef, watch} from 'vue';
import emitter from "@/emitter";
import {minmax} from "@/utils/u";

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
      listIndex: -1,
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
    writeConfig(JSON.stringify({config: config.value, neteaseUser: neteaseUser.value, colors: colors.value}))
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
    showMessage};
});
