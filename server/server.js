import http from 'http';
import express from 'express';
import socketIo from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const server = http.createServer(app);
const io = socketIo(server);

const rooms = [];
const players = [];

const createPlayer = (data, isHost) => {
  const newPlayer = {room: data.room, uuid: data.uuid, name: data.name, isHost};
  console.log('new player record to be pushed: ' + newPlayer.name);
  console.log(newPlayer);
  players.push(newPlayer);

  return newPlayer;
};

const joinRoomAndNotify = (io, socket, room, player) => {
  console.log('join room and notify');
  console.log('player to be loaded:');
  console.log(player);
  //send player info to client
  socket.emit('load-player', player);
  //join room
  socket.join(room);
  //let everyone in the room know player has entered
  io.in(room).emit('entered',player);
};

//TODO: if room already exists, reject create and notify
const createRoom = (io,socket,room,playerData) => {
  console.log(`creating room: ${room}`)
  rooms.push(room);
  console.log(`player ${playerData.name} will be host`);
  joinRoomAndNotify(io,socket,room,playerData);
};

io.on('connection', (socket) => {
  console.log(socket.id);
  
  socket.on('initialize', (uuid,room)=>{
    console.log('initialize');
    //if uuid doesn't exist, add it to collection
    if( players.indexOf(uuid) < 0 ){
      console.log(`uuid added: ${uuid}`);
      players.push(uuid);
    }
    else {
      console.log(`uuid: ${uuid} already exists`);
      if(rooms.indexOf(room) > -1){
        console.log(`room "${room}" exists`)
        const player = players.find(p => p.room === room && p.uuid === uuid);
        //does the player already exist in the room? 
        if (player){   
          joinRoomAndNotify(io,socket,room,player);
        } 
      }
    }
  });

  socket.on('join-room', (data)=>{
    console.log(`client: ${data.uuid} attempting to join.`);
    console.log(data);

    const room = data.room;
    console.log(rooms);
    console.log(players);
    //does the room already exist?
    if(rooms.indexOf(room) > -1){
      console.log(players);
      const player = players.find(p => p.room === room && p.uuid === data.uuid);
      //does the player already exist in the room? 
      if (player){   
        joinRoomAndNotify(io,socket,room,player);
      } 
      //new player is joining
      else {
       joinRoomAndNotify(io,socket,room,createPlayer(data,false));
      }
    }
    //room doesn't exist, create one
    else {
      createRoom(io,socket,room,createPlayer(data,true));
    }
  });

  socket.on('create-room', (data) => {
    createRoom(io,socket,data.room,createPlayer(data,true));
  });

  socket.on('message', (data) => {
    const { room, player, msg } = data;
    console.log(`room: ${room}, player: ${player}, msg: ${msg}`);
    io.to(room).emit('chat',{player,msg});
  })

  // TODO: assign a different host on disconnect
  socket.on('disconnect', () => {
    console.log(socket.id + ' disconnected');
  });
});

server.on('error', () => {
  console.error(err);
});

const port = process.env.PORT;

server.listen(port, ()=> {
  console.log(process.env.NODE_ENV+' server is ready');
});