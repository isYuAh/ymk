import {type AxiosResponse} from "axios";
import type {song_kugou, song_netease, songInPlay} from "@/types";
import {proceedKrcText, proceedLrcText} from "@/utils/u";
import {kugouAxios, neteaseAxios} from "@/utils/axiosInstances";

interface LyricHandlerParams<T> {
    tasks: Promise<void>[],
    tmpSong: songInPlay,
    unique: T,
    offset ?: number,
}

function LyricHandlerKugou({tasks, tmpSong, unique, offset}: LyricHandlerParams<string>) {
    offset = offset || 0;
    tasks.push(new Promise((resolve, reject) => {
        kugouAxios.get('/search/lyric', {
            params: {
                hash: unique
            }
        }).then(res => {
            const {id, accesskey} = res.data.candidates[0]
            if (id && accesskey) {
                kugouAxios.get('/lyric', {
                    params: {
                        accesskey,
                        id,
                        fmt: 'krc',
                        decode: true,
                    }
                }).then(res => {
                    const {
                        languageSign,
                        translationResult,
                        originResult,
                        mixedLrc
                    } = proceedKrcText(res.data.decodeContent)
                    tmpSong.lrcs['origin'] = {
                        enableAutoScroll: true,
                        items: originResult
                    }
                    if (languageSign) {
                        tmpSong.lrcs['translation'] = {
                            enableAutoScroll: true,
                            items: translationResult
                        }
                        tmpSong.lrcs['mixed'] = {
                            enableAutoScroll: true,
                            items: mixedLrc
                        }
                    }
                    tmpSong.lyricConfig.offset = offset;
                    resolve()
                }).catch(() => reject())
            }else {
                reject()
            }
        })
    }))
}

function LyricHandlerNetease({tasks, tmpSong, unique, offset}: LyricHandlerParams<string>) {
    offset = offset || 0;
    tasks.push(new Promise((resolve, reject) => {
        neteaseAxios.get('/lyric', {params: {id: unique}}).then((res: AxiosResponse) => {
            let sign1 = false, sign2 = false;
            console.log('$lyricResponse', res)
            if ('lrc' in res.data && res.data.lrc.lyric) {
                const {result, enableAutoScroll} = proceedLrcText(res.data.lrc.lyric)
                tmpSong.lrcs['origin'] = {
                    items: result,
                    enableAutoScroll
                }
                enableAutoScroll && (sign1 = true);
                tmpSong.lyricConfig.offset = offset;
            }
            if ('tlyric' in res.data && res.data.tlyric.lyric) {
                const {result, enableAutoScroll} = proceedLrcText(res.data.tlyric.lyric)
                tmpSong.lrcs['translation'] = {
                    items: result,
                    enableAutoScroll
                }
                enableAutoScroll && (sign2 = true);
            }
            if (sign1 && sign2) {
                let pointerA = 0, pointerB = 0;
                let origin = tmpSong.lrcs['origin'].items,
                    translation = tmpSong.lrcs['translation'].items;
                let result = [];
                while (pointerA < origin.length) {
                    if (pointerB >= translation.length) {
                        result.push(origin[pointerA]);
                        pointerA++;
                    } else {
                        // console.log(pointerA, origin[pointerA], pointerB, translation[pointerB])
                        if (origin[pointerA].time > translation[pointerB].time) {
                            pointerB++;
                        }else if (origin[pointerA].time < translation[pointerB].time) {
                            result.push(origin[pointerA]) //添加数据到数组尾
                            pointerA++;
                        }else {
                            result.push({
                                time: origin[pointerA].time,
                                text: [origin[pointerA].text[0], translation[pointerB].text[0]],
                            })
                            pointerA++;
                            pointerB++;
                        }
                    }
                }
                tmpSong.lrcs['mixed'] = {
                    items: result,
                    enableAutoScroll: true
                }
            }
            resolve();
        }).catch((e) => {
            console.log(e, tmpSong.lrcs);
            reject(new Error('歌词获取失败'))
        })
    }))
}

export const LyricHandlers = {
    LyricHandlerKugou,
    LyricHandlerNetease,
}