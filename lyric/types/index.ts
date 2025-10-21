export type Lyric = {
    text: LyricText;
    type: LyricType;
    none: boolean;
}
export enum LyricType {
    Mix,
    Oirginal,
    Translated,
}
export type LyricText = {
    original: string;
    translated: string;
}