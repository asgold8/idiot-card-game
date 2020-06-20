import http from 'http';
import express from 'express';
import socketIo from 'socket.io';

const app = express();

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {

});

server.on('error', () => {
  console.error(err);
});

const port = process.env.PORT || 4001;

server.listen(port, ()=> {
  console.log('server is ready');
});