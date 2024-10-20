import * as fs from "node:fs";
import path from "path";
import * as os from "node:os";
const tmpPath = os.tmpdir()

export function checkFolders(dnArray) {
    for (let i of dnArray) {
        if (!fs.existsSync(i)) fs.mkdirSync(i);
    }
}
export async function startNcmServer() {
    // 检测是否存在 anonymous_token 文件,没有则生成
    if (!fs.existsSync(path.resolve(tmpPath, 'anonymous_token'))) {
        fs.writeFileSync(path.resolve(tmpPath, 'anonymous_token'), '', 'utf-8')
    }
    const server = await import("./NeteaseCloudMusicApi/server.js");
    const generateConfig = await import("./NeteaseCloudMusicApi/generateConfig.js");
    // 启动时更新anonymous_token
    await generateConfig.default();
    server.serveNcmApi({
        checkVersion: true,
        port: 35651
    })
}
export async function startKugouServer() {

    const port = 35653;
    const host = process.env.HOST || '';
    const {consturctServer} = await import("./KuGouMusicApi/server.js")
    const app = await consturctServer();
    const appExt = app;
    appExt.service = app.listen(port, host, () => {
        console.log(`server running @ http://${host || 'localhost'}:${port}`);
    });
    return appExt;
}
export function checkResources() {

}