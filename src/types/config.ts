export type apiConfig = {
    enable: boolean,
    url: string,
}

export type config = {
    volume: number,
    api: {
        neteaseApi: apiConfig,
        qqApi: apiConfig
    },
    mode: 'list' | 'pause' | 'loop' | 'rand',
    bg: string,
    langPreferences: string[]
}

export type User = {
    auth: string,
    nickname: string,
    avatarUrl: string,
    uid: number,
    vipType: number,
    signature: string,
}
export type BilibiliUser = {
    auth: string[],
    nickname: string,
    avatarUrl: string,
    uid: number,
    vipType: number,
    signature: string,
}