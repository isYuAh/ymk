import {type song_lrc_item} from "@/types";
import {Base64} from "js-base64";

export function secondsToMmss(seconds: number) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);
    var mm = minutes < 10 ? '0' + minutes : minutes;
    var ss = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
    return mm + ':' + ss;
}
export function minmax(value: number, min: number, max: number) {
    return Math.min(max, Math.max(value, min))
}

export function getFormattedDateWithPadding() {
    // 获取当前日期
    const currentDate = new Date();

    // 获取年份
    const year = currentDate.getFullYear();

    // 获取月份，并补零
    let month: string | number = currentDate.getMonth() + 1; // 月份是从0开始的，所以要加1
    month = month < 10 ? '0' + month : month;

    // 获取日期，并补零
    let date: string | number = currentDate.getDate();
    date = date < 10 ? '0' + date : date;

    // 拼接成所需格式的字符串
    return `${year}${month}${date}`;
}

export function proceedLrcText(lrcText: string) {
    let result: song_lrc_item[] = [];
    const checkRegex = /\[(\d{2}):(\d{2})\.(\d{1,4})]/g
    const checkResult = lrcText.match(checkRegex);
    if ((!checkResult || checkResult.length === 0) && lrcText.length !== 0) {
        for (let line of lrcText.split('\n')) {
            result.push({
                time: 0,
                text: [line],
            })
        }
        return {result, enableAutoScroll: false};
    }else {
        lrcText = lrcText.replaceAll('\r\n', '').replaceAll('\n', '')
        const regex = /\[(\d{2}):(\d{2})\.(\d{1,4})](.*?)(?=\[(\d{2}):(\d{2})\.(\d{1,4})]|$)/g;
        const matches = [...lrcText.matchAll(regex)];
        for (let match of matches) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseFloat(match[2]);
            const milliseconds = parseInt(match[3], 10) / 1000;
            const timeInSeconds = minutes * 60 + seconds + milliseconds;
            const text = match[4].trim();
            result.push({
                time: timeInSeconds,
                text: [text],
            })
        }
        return {result, enableAutoScroll: true};
    }
}

export function proceedKrcText(krcText: string) {

    let originResult: song_lrc_item[] = [];
    let translationResult: song_lrc_item[] = [];
    const lines = krcText.split('\r\n');
    const languageMatch = krcText.match(/\[language:(.*?)]/);
    let languageSign = false
    let translations = []
    let mixedLrc = []
    if (languageMatch) {
        let translation = JSON.parse(Base64.decode(languageMatch[1]))
        console.log(translation, translation.content.length)
        if (translation.content.length) {
            languageSign = true;
            translations = translation.content[0].lyricContent
        }
    }
    let index = 0;
    for (let line of lines) {
        const replacedLine = line.replace(/<\d+,\d+,\d+>/g, "")
        const lineMatch = replacedLine.match(/\[(\d+),(\d+)](.*)/)
        if (lineMatch) {
            const time = parseFloat(lineMatch[1]) / 1000
            originResult.push({
                time,
                text: [lineMatch[3]],
            })
            if (languageSign) {
                translationResult.push({
                    time,
                    text: [translations[index][0]]
                })
                mixedLrc.push({
                    time,
                    text: [lineMatch[3], translations[index][0]]
                })
                index++;
            }
        }
    }
    return {originResult, translationResult, languageSign, mixedLrc}
}