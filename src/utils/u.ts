import {type messageController, type song_lrc_item, type song_lrcConfig} from "@/types";
import axios, {type AxiosResponse} from "axios";

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
    let lines = lrcText.split(/\r?\n/);
    let result: song_lrc_item[] = [];
    lines.forEach((line: string) => {
        const match = /\[(\d{2}):(\d{2}\.\d{2,4})](.*)/.exec(line);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseFloat(match[2]);
            const timeInSeconds = minutes * 60 + seconds;
            const text = match[3].trim();
            result.push({
                time: timeInSeconds,
                text: text,
            })
        }
    })
    return result;
}