import http from 'http';
import express from 'express';
import socketIo from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const server = http.createServer(app);
const io = socketIo(server);

let rooms = [];
let players = [];
const uuids = [];

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
  //send list of players in the room
  const playerList = players.filter(p => p.room === room);
  console.log('here\'s the players:');
  console.log(playerList);
  socket.emit('player-list-load',playerList);
  //join room
  socket.join(room);
  //let everyone in the room know player has entered
  console.log('emit to room player has entered');
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
  console.log(socket.id + ' has connected.');
  
  socket.on('initialize', (uuid,room)=>{
    console.log('initialize');
    
    const uuidIndex = uuids.findIndex(u => u.uuid === uuid);

    if(uuidIndex>-1) {
      console.log(`uuid: ${uuid} already exists`);
      //update the socketid for the uuid
      console.log('uuid before update:');
      console.log(uuids[uuidIndex]);
      uuids[uuidIndex].socketId = socket.id;
      console.log('uuid after update:');
      console.log(uuids[uuidIndex]);

      if(rooms.indexOf(room) > -1){
        console.log(`room "${room}" exists`)
        const player = players.find(p => p.room === room && p.uuid === uuid);
        //does the player already exist in the room? 
        if (player){   
          joinRoomAndNotify(io,socket,room,player);
        } 
      }
    }
    //if uuid doesn't exist, add it to collection
    else {
      console.log(`uuid added: ${uuid}`);
      console.log('socket.id: ' +socket.id);      
      uuids.push({uuid: uuid, socketId: socket.id});
      console.log('uuids:');
      console.log(uuids);
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
    console.log(`room: ${room}, player: ${player.name}, msg: ${msg}`);
    io.to(room).emit('chat',{player,msg});
  });

  socket.on('request-players-list', (room) => {
    console.log('players list requested');
    const playerList = players.filter(p => p.room === room);
    console.log('here\'s the players:');
    console.log(playerList);
    socket.emit('player-list-load',playerList);
  });

  // TODO: notify on disconnect
  // TODO: assign a different host on disconnect
  socket.on('disconnect', () => {
    console.log(socket.id + ' disconnected');
    const uuid = uuids.find(u => u.socketId === socket.id)?.uuid;
    console.log('uuid: '+uuid);
    const player = players?.find(p => p.uuid === uuid);
    if(player){      
      console.log(`emitting player: ${player.name} disconnecting from: ${player.room}`);
      io.to(player.room).emit('disconnected',player);
      players = players.filter(p => p.name !== player.name && p.uuid !== player.uuid);
      const remainingPlayers = players.filter(p => p.room === player.room);
      console.log('players in room post-filter:');
      console.log(remainingPlayers);
      if(remainingPlayers.length<1){
        console.log(`no players remaining in room: ${player.room}`);
        if(rooms.length>0){
          console.log('removing room');
          rooms = rooms.filter(r => r !== player.room);
          console.log('rooms remaining:');
          console.log(rooms);
        }
      }      
    }
  });
});

server.on('error', () => {
  console.error(err);
});

const port = process.env.PORT;

server.listen(port, ()=> {
  console.log(process.env.NODE_ENV+' server is ready');
});