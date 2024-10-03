import { type AxiosInstance } from "axios";
import { type InjectionKey } from "vue";
export type list_basic = {
    pic: string,
    title: string,
    intro?: string,
    originFilename: string
}
export type list_data = {
    type: 'data'
    songs: song[],
}
export type list_trace_bilibili_fav = {
    type: 'trace_bilibili_fav',
    favid: string,
}
export type list_trace_siren = {
    type: 'trace_siren',
}
export type list_trace_netease_playlist = {
    type: 'trace_netease_playlist',
    id: string
}
export type list_trace_qq_playlist = {
    type: 'trace_qq_playlist',
    id: string
}
export type playlistPart = {
    title: string,
    begin: number,
    count: number,
    other?: any
}
export type playlistComponent = list_data | list_trace_bilibili_fav | list_trace_siren | list_trace_netease_playlist | list_trace_qq_playlist;
export type list = {
    playlist: playlistComponent[]
} & list_basic;

export type song_lrcConfig_basic = {
    status: string,
    lrc: song_lrc,
    offset?: number
}
export type song_lrcConfig_web = {
    type: 'web',
    path: string,
} & song_lrcConfig_basic
export type song_lrcConfig_local = {
    type: 'local',
    path: string,
} & song_lrcConfig_basic
export type song_lrcConfig_content = {
    type: 'content',
    content: string,
} & song_lrcConfig_basic
export type song_lrc_item = {
    time: number,
    text: string
}
export type song_lrcConfig = song_lrcConfig_web | song_lrcConfig_local | song_lrcConfig_content;
export type song_lrc = song_lrc_item[];
export type song_basic = {
    title: string,
    singer: string,
    pic?: string,
    lrc?: song_lrcConfig,
    translationLrc?: song_lrcConfig
}

export type song_bilibili = {
    type: 'bilibili',
    BV: string
} & song_basic;
export type song_local = {
    type: 'local',
    path: string
} & song_basic;
export type song_web = {
    type: 'web',
    url: string,
} & song_basic;
export type song_netease = {
    type: 'netease',
    id: string,
    playable: boolean,
    reason: string
} & song_basic;
export type song_netease_outer = {
    type: 'netease_outer',
    id: string
} & song_basic;
export type song_netease_other = {
    type: 'netease_other',
    id: string
} & song_basic;
export type song_siren = {
    type: 'siren',
    cid: string
} & song_basic;
export type song_qq = {
    type: 'qq',
    mid: string
} & song_basic;

export type song = song_bilibili |
                    song_local |
                    song_web |
                    song_netease |
                    song_netease_outer |
                    song_netease_other |
                    song_siren |
                    song_qq
export type songInPlay = {
    pic: string,
    title: string,
    singer: string,
    type: string,
    url: string,
    lrc: song_lrcConfig,
    origin: song,
    translationLrc: song_lrcConfig
}

export type playSongParams = {
    song: song,
    justtry?: boolean
}
export type checkDetailParams = {
    index: number,
    remote?: boolean,
    raw?: list
}
export type refreshPlaylistsParams = {
    notReset: boolean
}
export type addSongToParams = {
    song: song,
    save: boolean
}

export type messageController = {
    show: boolean,
    text: string,
    timer: number,
}

export type mouseMenuItem = {
    title: string,
    action: (...args: any[]) => void,
    show?: boolean
}