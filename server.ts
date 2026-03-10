import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import { parse } from 'url';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const rooms = new Map<string, Set<string>>();
  
  interface UserInfo {
    socketId: string;
    username: string;
    roomId?: string;
    ip: string;
  }
  
  const users = new Map<string, UserInfo>();
  const ipGroups = new Map<string, Set<string>>();

  const broadcastLanPeers = (ip: string) => {
    const group = ipGroups.get(ip);
    if (!group) return;
    
    const peers = Array.from(group)
      .map(id => users.get(id))
      .filter((u): u is UserInfo => u !== undefined);
      
    for (const socketId of group) {
      const otherPeers = peers.filter(p => p.socketId !== socketId);
      io.to(socketId).emit('lan-peers', otherPeers);
    }
  };

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Get client IP address
    const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
    const ipStr = Array.isArray(clientIp) ? clientIp[0] : clientIp;
    
    users.set(socket.id, {
      socketId: socket.id,
      username: 'Anonymous',
      ip: ipStr,
    });
    
    if (!ipGroups.has(ipStr)) {
      ipGroups.set(ipStr, new Set());
    }
    ipGroups.get(ipStr)!.add(socket.id);
    
    broadcastLanPeers(ipStr);

    socket.on('update-presence', (data: { username: string; roomId?: string }) => {
      const user = users.get(socket.id);
      if (user) {
        user.username = data.username;
        user.roomId = data.roomId;
        broadcastLanPeers(user.ip);
      }
    });

    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      const room = rooms.get(roomId)!;
      room.add(socket.id);

      // Notify others in the room
      socket.to(roomId).emit('user-joined', socket.id);

      // Send the list of existing users to the new user
      const otherUsers = Array.from(room).filter(id => id !== socket.id);
      socket.emit('room-users', otherUsers);
    });

    socket.on('signal', (data: { to: string; signal: any }) => {
      io.to(data.to).emit('signal', {
        from: socket.id,
        signal: data.signal,
      });
    });

    socket.on('disconnecting', () => {
      for (const roomId of socket.rooms) {
        if (roomId !== socket.id) {
          socket.to(roomId).emit('user-left', socket.id);
          const room = rooms.get(roomId);
          if (room) {
            room.delete(socket.id);
            if (room.size === 0) {
              rooms.delete(roomId);
            }
          }
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      const user = users.get(socket.id);
      if (user) {
        const group = ipGroups.get(user.ip);
        if (group) {
          group.delete(socket.id);
          if (group.size === 0) {
            ipGroups.delete(user.ip);
          } else {
            broadcastLanPeers(user.ip);
          }
        }
        users.delete(socket.id);
      }
    });
  });

  expressApp.all(/.*/, (req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
