import Dexie, { type EntityTable } from 'dexie';

export interface Message {
  id?: number;
  sender: string;
  content?: string;
  timestamp: number;
  roomId: string;
  channelId: string;
  type: 'chat' | 'file';
  url?: string;
  name?: string;
  size?: number;
}

export interface FileTransfer {
  id?: number;
  name: string;
  size: number;
  sender: string;
  status: 'pending' | 'transferring' | 'completed' | 'failed';
  roomId: string;
  sessionId: string;
  progress: number;
  data?: Blob;
}

export interface FileChunk {
  id?: number;
  fileId: string;
  index: number;
  data: ArrayBuffer;
}

const db = new Dexie('NexusP2P') as Dexie & {
  messages: EntityTable<Message, 'id'>;
  files: EntityTable<FileTransfer, 'id'>;
  chunks: EntityTable<FileChunk, 'id'>;
};

// تحديث الإصدار لدعم نظام الأجزاء (Chunks)
db.version(5).stores({
  messages: '++id, sender, roomId, channelId, timestamp',
  files: '++id, name, sender, roomId, sessionId, status, [roomId+sessionId]',
  chunks: '++id, fileId, [fileId+index]'
});

export { db };
