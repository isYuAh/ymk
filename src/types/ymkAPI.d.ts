declare global {
  interface Window {
    ymkAPI: ymkInterface;
  }
}

export interface ymkInterface {
  onTrayControl_PlayPause: (callback: (event: any, ...args: any) => void) => void;
  onTrayControl_PlaySong: (callback: (event: any, ...args: any) => void) => void;
  playPauseStatusUpdate: (playing: boolean) => void;
  getLocalPlaylists: () => Promise<any>;
  showAskDialog: (options: any) => Promise<any>;
  showChoosePlaylistDialog: (options: any) => Promise<any>;
  deletePlaylistFile: (fn: string) => Promise<any>;
  writePlaylistFile: (fn: string, t: string) => Promise<any>;
  readClipboard: () => Promise<any>;
  writeConfig: (t: string) => Promise<any>;
  minimize: () => void;
  exit: (arg?: any) => void;
  getConfig: () => Promise<any>;
  isMinimized: () => Promise<boolean>;
  onRestore: (callback: (value: any) => void) => void;
  onRefreshPlaylists: (callback: () => void) => void;
  onShowMessage: (callback: (m: any) => void) => void;
  offRestore: (callback: (value: any) => void) => void;
  offRefreshPlaylists: (callback: () => void) => void;
  offShowMessage: (callback: (m: any) => void) => void;
  onUrlScheme: (callback: (event: any, ...args: any) => void) => void;
  offUrlScheme: (callback: (event: any) => void) => void;
  showImportPlaylistDialog: () => Promise<any>;
  getCursorPos: () => Promise<{left: number; top: number}>;
  getSpecificConfig: (fn: string) => Promise<any>;
  writeSpecificConfig: (fn: string, t: string) => Promise<any>;
  openUrl: (url: string) => Promise<any>;
  createLyricWindow: () => Promise<any>;
  closeLyricWindow: () => Promise<any>;
  toggleLyricWindow: () => Promise<any>;
  sendLyric: (lyric: any) => Promise<any>;
}