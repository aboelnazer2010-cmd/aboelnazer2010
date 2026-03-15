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
      origin: process.env.NODE_ENV === 'production' ? process.env.APP_URL : '*',
      methods: ['GET', 'POST'],
    },
  });
  // ... بقية منطق الغرف والـ IP كما في الكود السابق ...
  server.listen(port, () => {
    console.log(`> Server ready on http://${hostname}:${port}`);
  });
});
