import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

if (typeof window !== 'undefined') {
  socketInstance = io({
    path: '/socket.io',
  });
}

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socketInstance?.connected || false);

  useEffect(() => {
    if (!socketInstance) return;

    const currentSocket = socketInstance;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    currentSocket.on('connect', onConnect);
    currentSocket.on('disconnect', onDisconnect);

    return () => {
      currentSocket.off('connect', onConnect);
      currentSocket.off('disconnect', onDisconnect);
    };
  }, []);

  return { socket: socketInstance, isConnected };
};
