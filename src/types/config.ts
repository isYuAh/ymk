type apiConfig = {
    enable: boolean,
    url: string,
}

export type config = {
    volume: number,
    neteaseApi: apiConfig,
    qqApi: apiConfig,
    mode: 'list' | 'pause' | 'loop' | 'rand',
    bg: string,
    langPreferences: string[]
}

export type neteaseUser = {
    cookie: string,
    nickname: string,
    avatarUrl: string,
    uid: number,
    vipType: number,
    signature: string,
}