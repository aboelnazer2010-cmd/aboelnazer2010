import { create } from 'zustand';

export interface LanPeer {
  socketId: string;
  username: string;
  roomId?: string;
  ip: string;
}

interface PeerState {
  roomId: string | null;
  username: string;
  sessionId: string;
  language: 'en' | 'ar';
  peers: string[]; // List of peer IDs
  lanPeers: LanPeer[];
  channels: string[];
  currentChannel: string;
  setRoomId: (id: string | null) => void;
  setUsername: (name: string) => void;
  setLanguage: (lang: 'en' | 'ar') => void;
  addPeer: (id: string) => void;
  removePeer: (id: string) => void;
  setPeers: (peers: string[]) => void;
  setLanPeers: (peers: LanPeer[]) => void;
  addChannel: (channel: string) => void;
  setChannels: (channels: string[]) => void;
  setCurrentChannel: (channel: string) => void;
}

export const usePeerStore = create<PeerState>((set) => ({
  roomId: null,
  username: `User-${Math.floor(Math.random() * 10000)}`,
  sessionId: Math.random().toString(36).substring(2, 15),
  language: 'en',
  peers: [],
  lanPeers: [],
  channels: ['general'],
  currentChannel: 'general',
  setRoomId: (id) => set({ roomId: id }),
  setUsername: (name) => set({ username: name }),
  setLanguage: (lang) => set({ language: lang }),
  addPeer: (id) => set((state) => ({ peers: [...new Set([...state.peers, id])] })),
  removePeer: (id) => set((state) => ({ peers: state.peers.filter((p) => p !== id) })),
  setPeers: (peers) => set({ peers }),
  setLanPeers: (peers) => set({ lanPeers: peers }),
  addChannel: (channel) => set((state) => ({ channels: [...new Set([...state.channels, channel])] })),
  setChannels: (channels) => set({ channels }),
  setCurrentChannel: (channel) => set({ currentChannel: channel }),
}));
