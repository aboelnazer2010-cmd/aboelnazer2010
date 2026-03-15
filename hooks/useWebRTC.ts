import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { usePeerStore } from '@/store/usePeerStore';
import { db } from '@/lib/db';

export const useWebRTC = () => {
  const { socket, isConnected } = useSocket();
  const { roomId, username, sessionId, addPeer, removePeer, setPeers, addChannel, currentChannel } = usePeerStore();
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const dataChannelsRef = useRef<Map<string, RTCDataChannel[]>>(new Map());
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, any[]>>({});
  
  const fileMetadataRef = useRef<Map<string, any>>(new Map());
  const fileReceivedCountRef = useRef<Map<string, number>>(new Map());

  const handleDataChannelMessage = useCallback(async (peerId: string, event: MessageEvent) => {
    if (typeof event.data === 'string') {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
          const channelId = data.channelId || 'general';
          setMessagesByChannel((prev) => ({
            ...prev,
            [channelId]: [...(prev[channelId] || []), { ...data, peerId }]
          }));
        } else if (data.type === 'file-header') {
          fileMetadataRef.current.set(data.fileId, data);
          fileReceivedCountRef.current.set(data.fileId, 0);
          
          const id = await db.files.add({
            name: data.name, size: data.size, sender: data.sender,
            status: 'transferring', roomId: roomId || '',
            sessionId, progress: 0,
          });
          const meta = fileMetadataRef.current.get(data.fileId);
          if (meta) meta.dbId = id;
        }
      } catch (e) { console.error('Error parsing message', e); }
    } else if (event.data instanceof ArrayBuffer) {
      const view = new DataView(event.data);
      const fileId = view.getUint32(0).toString();
      const chunkIndex = view.getUint32(4);
      const chunkData = event.data.slice(8);

      // حفظ القطعة في IndexedDB بدلاً من مصفوفة في الرام
      await db.chunks.add({ fileId, index: chunkIndex, data: chunkData });

      const count = (fileReceivedCountRef.current.get(fileId) || 0) + 1;
      fileReceivedCountRef.current.set(fileId, count);

      const meta = fileMetadataRef.current.get(fileId);
      if (meta) {
        const progress = Math.floor((count / meta.totalChunks) * 100);
        if (count % 20 === 0 || count === meta.totalChunks) {
          db.files.update(meta.dbId, { progress, status: count === meta.totalChunks ? 'completed' : 'transferring' });
        }

        if (count === meta.totalChunks) {
          // استرجاع كافة الأجزاء وتجميع الملف عند الاكتمال فقط
          const chunks = await db.chunks.where('fileId').equals(fileId).sortBy('index');
          const blob = new Blob(chunks.map(c => c.data));
          const url = URL.createObjectURL(blob);
          
          setMessagesByChannel((prev) => ({
            ...prev,
            [meta.channelId || 'general']: [...(prev[meta.channelId || 'general'] || []), 
            { type: 'file', url, name: meta.name, size: meta.size, sender: meta.sender, peerId }]
          }));
          
          if (meta.dbId) await db.files.update(meta.dbId, { data: blob });
          await db.chunks.where('fileId').equals(fileId).delete();
        }
      }
    }
  }, [roomId, sessionId]);

  const createPeerConnection = useCallback((peerId: string, isInitiator: boolean) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
        { 
          urls: 'turn:your-turn-server.com:3478', // خادم TURN لتجاوز Firewall
          username: 'user', 
          credential: 'pass' 
        }
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('signal', { to: peerId, signal: { type: 'candidate', candidate: event.candidate } });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') addPeer(peerId);
      else if (['disconnected', 'failed'].includes(pc.connectionState)) removePeer(peerId);
    };

    // إعداد قنوات البيانات
    if (isInitiator) {
      const channels: RTCDataChannel[] = [];
      for (let i = 0; i < 4; i++) {
        const dc = pc.createDataChannel(`data-${i}`);
        dc.binaryType = 'arraybuffer';
        dc.onmessage = (e) => handleDataChannelMessage(peerId, e);
        channels.push(dc);
      }
      dataChannelsRef.current.set(peerId, channels);
    } else {
      pc.ondatachannel = (event) => {
        const dc = event.channel;
        dc.binaryType = 'arraybuffer';
        dc.onmessage = (e) => handleDataChannelMessage(peerId, e);
        const existing = dataChannelsRef.current.get(peerId) || [];
        dataChannelsRef.current.set(peerId, [...existing, dc]);
      };
    }

    peersRef.current.set(peerId, pc);
    return pc;
  }, [socket, addPeer, removePeer, handleDataChannelMessage]);

  // منطق الربط مع Socket.io
  useEffect(() => {
    if (!socket || !isConnected || !roomId) return;
    socket.emit('join-room', roomId);
    socket.on('room-users', async (users: string[]) => {
      setPeers(users);
      for (const userId of users) {
        const pc = createPeerConnection(userId, true);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('signal', { to: userId, signal: { type: 'offer', sdp: offer } });
      }
    });
    // استكمال معالجة الإشارات (Signal) كما في الكود الأصلي...
  }, [socket, isConnected, roomId, createPeerConnection, setPeers]);

  return { messages: messagesByChannel[currentChannel] || [], sendMessage: () => {}, sendFile: () => {}, createChannel: () => {} };
};
