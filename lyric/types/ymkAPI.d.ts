export {};
declare global {
  interface Window {
    ymkAPI: ymkInterface;
  }
}

interface ymkInterface {
    onLyric: (callback: (event: any, lyric: string) => void) => void;
    setIgnoreMouseEvents: (ignore: boolean) => void;
    closeLyricWindow: () => void;
    unlock: (callback: (event: any) => void) => void;
}   
