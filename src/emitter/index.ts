import { type playSongParams, type refreshPlaylistsParams} from '@/types';
import mitt from 'mitt'
const emitter = mitt<Record<string, any>>();
export default emitter;