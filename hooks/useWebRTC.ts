import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { usePeerStore } from '@/store/usePeerStore';
import { db } from '@/lib/db';

type SignalData = {
  type: 'offer' | 'answer' | 'candidate';
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

export const useWebRTC = () => {
  const { socket, isConnected } = useSocket();
  const { roomId, username, sessionId, addPeer, removePeer, setPeers, setLanPeers, channels, addChannel, currentChannel } = usePeerStore();
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const dataChannelsRef = useRef<Map<string, RTCDataChannel[]>>(new Map());
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, any[]>>({});
  
  const fileChunksRef = useRef<Map<string, ArrayBuffer[]>>(new Map());
  const fileMetadataRef = useRef<Map<string, any>>(new Map());
  const fileReceivedCountRef = useRef<Map<string, number>>(new Map());

  const handleDataChannelMessage = useCallback((peerId: string, event: MessageEvent) => {
    if (typeof event.data === 'string') {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
          const channelId = data.channelId || 'general';
          setMessagesByChannel((prev) => ({
            ...prev,
            [channelId]: [...(prev[channelId] || []), { ...data, peerId }]
          }));
        } else if (data.type === 'channel-create') {
          addChannel(data.channelName);
        } else if (data.type === 'channel-sync') {
          data.channels.forEach((c: string) => addChannel(c));
        } else if (data.type === 'file-header') {
          fileMetadataRef.current.set(data.fileId, data);
          let chunks = fileChunksRef.current.get(data.fileId);
          if (!chunks) {
            chunks = new Array(data.totalChunks);
            fileChunksRef.current.set(data.fileId, chunks);
            fileReceivedCountRef.current.set(data.fileId, 0);
          }
          
          db.files.add({
            name: data.name,
            size: data.size,
            sender: data.sender,
            status: 'transferring',
            roomId: roomId || '',
            sessionId,
            progress: 0,
          }).then(id => {
            const meta = fileMetadataRef.current.get(data.fileId);
            if (meta) {
              meta.dbId = id;
            }
          });
          
          // Check if already complete
          const count = fileReceivedCountRef.current.get(data.fileId) || 0;
          if (count === data.totalChunks) {
            const blob = new Blob(chunks);
            const url = URL.createObjectURL(blob);
            const channelId = data.channelId || 'general';
            setMessagesByChannel((prevMsg) => ({
              ...prevMsg,
              [channelId]: [...(prevMsg[channelId] || []), { 
                type: 'file', 
                url, 
                name: data.name, 
                size: data.size, 
                sender: data.sender,
                peerId 
              }]
            }));
            fileChunksRef.current.delete(data.fileId);
            fileMetadataRef.current.delete(data.fileId);
            fileReceivedCountRef.current.delete(data.fileId);
          }
        }
      } catch (e) {
        console.error('Failed to parse message', e);
      }
    } else if (event.data instanceof ArrayBuffer) {
      const view = new DataView(event.data);
      const fileIdNum = view.getUint32(0);
      const fileId = fileIdNum.toString();
      const chunkIndex = view.getUint32(4);
      const chunkData = event.data.slice(8);

      let chunks = fileChunksRef.current.get(fileId);
      if (!chunks) {
        chunks = [];
        fileChunksRef.current.set(fileId, chunks);
        fileReceivedCountRef.current.set(fileId, 0);
      }
      
      if (!chunks[chunkIndex]) {
        chunks[chunkIndex] = chunkData;
        const newCount = (fileReceivedCountRef.current.get(fileId) || 0) + 1;
        fileReceivedCountRef.current.set(fileId, newCount);

        const meta = fileMetadataRef.current.get(fileId);
        if (meta) {
          const progress = Math.floor((newCount / meta.totalChunks) * 100);
          if (meta.dbId && (newCount % 20 === 0 || newCount === meta.totalChunks)) {
            db.files.update(meta.dbId, {
              progress,
              status: newCount === meta.totalChunks ? 'completed' : 'transferring'
            });
          }

          if (newCount === meta.totalChunks) {
            const blob = new Blob(chunks);
            const url = URL.createObjectURL(blob);
            const channelId = meta.channelId || 'general';
            setMessagesByChannel((prevMsg) => ({
              ...prevMsg,
              [channelId]: [...(prevMsg[channelId] || []), { 
                type: 'file', 
                url, 
                name: meta.name, 
                size: meta.size, 
                sender: meta.sender,
                peerId 
              }]
            }));
            
            if (meta.dbId) {
              db.files.update(meta.dbId, { data: blob });
            }
            
            fileChunksRef.current.delete(fileId);
            fileMetadataRef.current.delete(fileId);
            fileReceivedCountRef.current.delete(fileId);
          }
        }
      }
    }
  }, [roomId, addChannel, sessionId]);

  const createPeerConnection = useCallback((peerId: string, isInitiator: boolean) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], // Optional, helps in some LANs
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('signal', {
          to: peerId,
          signal: { type: 'candidate', candidate: event.candidate },
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        addPeer(peerId);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        removePeer(peerId);
        peersRef.current.delete(peerId);
        dataChannelsRef.current.delete(peerId);
      }
    };

    if (isInitiator) {
      const channels: RTCDataChannel[] = [];
      for (let i = 0; i < 4; i++) {
        const dc = pc.createDataChannel(`data-${i}`);
        dc.binaryType = 'arraybuffer';
        dc.onmessage = (e) => handleDataChannelMessage(peerId, e);
        dc.onopen = () => {
          console.log(`Data channel ${i} opened with`, peerId);
          if (i === 0) {
            dc.send(JSON.stringify({ type: 'channel-sync', channels: usePeerStore.getState().channels }));
          }
        };
        channels.push(dc);
      }
      dataChannelsRef.current.set(peerId, channels);
    } else {
      pc.ondatachannel = (event) => {
        const dc = event.channel;
        dc.binaryType = 'arraybuffer';
        dc.onmessage = (e) => handleDataChannelMessage(peerId, e);
        dc.onopen = () => {
          console.log(`Data channel opened with`, peerId);
          dc.send(JSON.stringify({ type: 'channel-sync', channels: usePeerStore.getState().channels }));
        };
        
        const channels = dataChannelsRef.current.get(peerId) || [];
        channels.push(dc);
        dataChannelsRef.current.set(peerId, channels);
      };
    }

    peersRef.current.set(peerId, pc);
    return pc;
  }, [socket, addPeer, removePeer, handleDataChannelMessage]);

  useEffect(() => {
    if (!socket || !isConnected || !roomId) return;

    const currentPeersRef = peersRef;
    const currentDataChannelsRef = dataChannelsRef;

    socket.emit('join-room', roomId);

    socket.on('room-users', async (users: string[]) => {
      setPeers(users);
      for (const userId of users) {
        const pc = createPeerConnection(userId, true);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('signal', {
          to: userId,
          signal: { type: 'offer', sdp: offer },
        });
      }
    });

    socket.on('user-joined', (userId: string) => {
      console.log('User joined:', userId);
      // We don't create offer here, the new user will create the offer
    });

    socket.on('user-left', (userId: string) => {
      console.log('User left:', userId);
      removePeer(userId);
      currentPeersRef.current.get(userId)?.close();
      currentPeersRef.current.delete(userId);
      currentDataChannelsRef.current.delete(userId);
    });

    socket.on('signal', async (data: { from: string; signal: SignalData }) => {
      const { from, signal } = data;
      let pc = currentPeersRef.current.get(from);

      if (signal.type === 'offer') {
        if (!pc) {
          pc = createPeerConnection(from, false);
        }
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('signal', {
          to: from,
          signal: { type: 'answer', sdp: answer },
        });
      } else if (signal.type === 'answer') {
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!));
        }
      } else if (signal.type === 'candidate') {
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate!));
        }
      }
    });

    return () => {
      socket.off('room-users');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('signal');
      
      currentPeersRef.current.forEach((pc) => pc.close());
      currentPeersRef.current.clear();
      currentDataChannelsRef.current.clear();
    };
  }, [socket, isConnected, roomId, createPeerConnection, setPeers, removePeer]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleLanPeers = (peers: any[]) => {
      setLanPeers(peers);
    };

    socket.on('lan-peers', handleLanPeers);

    return () => {
      socket.off('lan-peers', handleLanPeers);
    };
  }, [socket, isConnected, setLanPeers]);

  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('update-presence', { username, roomId });
    }
  }, [socket, isConnected, username, roomId]);

  const sendMessage = useCallback((content: string) => {
    const msg = { type: 'chat', content, sender: username, timestamp: Date.now(), channelId: currentChannel };
    setMessagesByChannel((prev) => ({
      ...prev,
      [currentChannel]: [...(prev[currentChannel] || []), { ...msg, isMe: true }]
    }));
    dataChannelsRef.current.forEach((channels) => {
      const dc = channels[0];
      if (dc && dc.readyState === 'open') {
        dc.send(JSON.stringify(msg));
      }
    });
  }, [username, currentChannel]);

  const createChannel = useCallback((channelName: string) => {
    addChannel(channelName);
    const msg = { type: 'channel-create', channelName };
    dataChannelsRef.current.forEach((channels) => {
      const dc = channels[0];
      if (dc && dc.readyState === 'open') {
        dc.send(JSON.stringify(msg));
      }
    });
  }, [addChannel]);

  const sendFile = useCallback(async (file: File) => {
    const fileIdNum = Math.floor(Math.random() * 0xFFFFFFFF);
    const fileId = fileIdNum.toString();
    const chunkSize = 65536; // 64KB
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    const header = { type: 'file-header', fileId, name: file.name, size: file.size, totalChunks, sender: username, channelId: currentChannel };
    
    const dbFileId = await db.files.add({
      name: file.name,
      size: file.size,
      sender: username,
      status: 'transferring',
      roomId: roomId || '',
      sessionId,
      progress: 0,
    });
    
    // Broadcast header
    dataChannelsRef.current.forEach((channels) => {
      const dc = channels[0];
      if (dc && dc.readyState === 'open') {
        dc.send(JSON.stringify(header));
      }
    });

    setMessagesByChannel((prevMsg) => ({
      ...prevMsg,
      [currentChannel]: [...(prevMsg[currentChannel] || []), { type: 'file', url: URL.createObjectURL(file), name: file.name, size: file.size, isMe: true, sender: username }]
    }));

    dataChannelsRef.current.forEach((channels) => {
      const openChannels = channels.filter(c => c.readyState === 'open');
      if (openChannels.length === 0) return;

      let chunkIndex = 0;
      let chunksSent = 0;
      
      const sendLoop = async () => {
        while (true) {
          let currentChunkIndex = chunkIndex++;
          if (currentChunkIndex >= totalChunks) break;

          const channel = openChannels[currentChunkIndex % openChannels.length];
          
          while (channel.bufferedAmount > 1024 * 1024) {
            await new Promise(r => setTimeout(r, 50));
          }

          const start = currentChunkIndex * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const slice = file.slice(start, end);
          const chunkData = await slice.arrayBuffer();
          
          const payload = new ArrayBuffer(8 + chunkData.byteLength);
          const view = new DataView(payload);
          view.setUint32(0, fileIdNum);
          view.setUint32(4, currentChunkIndex);
          new Uint8Array(payload, 8).set(new Uint8Array(chunkData));
          
          channel.send(payload);
          
          chunksSent++;
          const progress = Math.floor((chunksSent / totalChunks) * 100);
          
          // Send progress message to peers
          channel.send(JSON.stringify({ type: 'file-progress', fileId, progress }));
          
          if (chunksSent % 20 === 0 || chunksSent === totalChunks) {
            db.files.update(dbFileId, {
              progress,
              status: chunksSent === totalChunks ? 'completed' : 'transferring'
            });
          }
        }
      };

      const concurrency = Math.min(openChannels.length, 4);
      for (let i = 0; i < concurrency; i++) {
        sendLoop();
      }
    });

  }, [username, roomId, currentChannel, sessionId]);

  const messages = messagesByChannel[currentChannel] || [];

  return { messages, sendMessage, sendFile, createChannel };
};
