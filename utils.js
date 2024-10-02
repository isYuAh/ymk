import * as fs from "node:fs";

export function checkFolders(dnArray) {
    for (let i of dnArray) {
        if (!fs.existsSync(i)) fs.mkdirSync(i);
    }
}