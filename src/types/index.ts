import type { song } from "./song"

export type list_basic = {
    pic: string,
    title: string,
    intro?: string,
    originFilename: string,
    type: string
}
export type list_data = {
    type: 'data'
    songs: song[],
}
export type list_trace_bilibili_fav = {
    type: 'trace_bilibili_fav',
    favid: string,
    expandAll?: boolean
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
export type list_trace_kugou_playlist = {
    type: 'trace_kugou_playlist',
    id: string
}
export type playlistPart = {
    title: string,
    begin: number,
    count: number,
    type?: string,
    other?: any
}
export type playlistComponent = list_data |
    list_trace_bilibili_fav |
    list_trace_siren |
    list_trace_netease_playlist |
    list_trace_qq_playlist |
    list_trace_kugou_playlist;
export type list = {
    playlist: playlistComponent[]
} & list_basic;

export type song_lrcConfig_basic = {
    status: string,
    lrc: song_lrc,
    enableAutoScroll: boolean,
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
    text: string[],
}
export type song_lrcConfig = song_lrcConfig_web | song_lrcConfig_local | song_lrcConfig_content;
export type song_lrc = {
    enableAutoScroll: boolean,
    items: song_lrc_item[],
};

export type songInPlay = {
    pic: string,
    title: string,
    singer: string,
    type: string,
    url: string,
    lrcs: Record<string, song_lrc>,
    origin: song,
    lyricConfig: {
        offset: number,
    }
}

export type playSongParams = {
    song: song,
    justtry?: boolean,
    noEffectWhenNotPlayable?:boolean
}
export type refreshPlaylistsParams = {
    notReset: boolean
}

export type mouseMenuItem = {
    title: string,
    action: (...args: any[]) => void,
    show?: boolean
}

export enum PlaylistType {
    local = 'local',
    preview = 'preview'
}