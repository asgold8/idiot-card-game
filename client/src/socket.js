import io from 'socket.io-client';

export const socket = io(process.env.REACT_APP_SERVER_URL);

export const disconnectSocket = () => {
  console.log('Disconnecting socket...');
  if(socket) socket.disconnect();
}

export const onPlayerDisconnected = (callBack) => {
  if(!socket) return (true);

  socket.on('disconnected', data => {
    return callBack(null,data);
  })
}

export const subscribeToChat = (callBack) => {
  //return error if no socket
  if(!socket) return (true);

  socket.on('chat', data => {
    //console.log('message received');
    return callBack(null,data);
  });
}

export const subscribeToPlayers = (callBack) => {
  if(!socket) return (true);

  socket.on('player-list-load', data => {
    return callBack(null,data);
  });
}

export const onPlayerEntered = (callBack) => {
  if(!socket) return (true);

  socket.on('entered', data => {
    return callBack(null,data);
  })
}

export const sendMsg = (room, player, msg) => {  
  if(socket){
    socket.emit('message', { room, player, msg });
    //console.log(`message sent: ${room}, ${player}, ${msg}`);
  }    
}

export const requestPlayersList = (room) => {
  if(socket){
    socket.emit('request-players-list', room);
  }
}