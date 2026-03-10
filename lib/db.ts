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

const db = new Dexie('NexusP2P') as Dexie & {
  messages: EntityTable<Message, 'id'>;
  files: EntityTable<FileTransfer, 'id'>;
};

db.version(1).stores({
  messages: '++id, sender, roomId, timestamp',
  files: '++id, name, sender, roomId, status'
});

db.version(2).stores({
  messages: '++id, sender, roomId, channelId, timestamp',
  files: '++id, name, sender, roomId, status'
}).upgrade(tx => {
  return tx.table('messages').toCollection().modify(msg => {
    msg.channelId = msg.channelId || 'general';
    msg.type = msg.type || 'chat';
  });
});

db.version(4).stores({
  messages: '++id, sender, roomId, channelId, timestamp',
  files: '++id, name, sender, roomId, sessionId, status, [roomId+sessionId]'
}).upgrade(tx => {
  return tx.table('files').toCollection().modify(file => {
    file.sessionId = file.sessionId || 'legacy';
  });
});

export { db };
