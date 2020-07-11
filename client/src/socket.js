import io from 'socket.io-client';

export const socket = io(process.env.REACT_APP_SERVER_URL);

export const subscribeToChat = (callBack) => {
  //return error if no socket
  if(!socket) return (true);

  socket.on('chat', data => {
    console.log('message received');
    return callBack(null,data);
  });
}

export const sendMsg = (room, player, msg) => {  
  if(socket){
    socket.emit('message', { room, player, msg });
    console.log(`message sent: ${room}, ${player}, ${msg}`);
  }    
}