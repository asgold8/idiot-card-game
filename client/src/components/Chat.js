import React, {useState,useEffect} from 'react';
import {disconnectSocket, requestPlayersList, sendMsg, subscribeToChat, onPlayerEntered, onPlayerDisconnected, subscribeToPlayers} from '../socket';

const sanitizeHTML = (str) => {
  let temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
};

const scrollToBottom = (element) => {
  const e = document.getElementById(element);
  e.scrollTop = e.scrollHeight;
}

const Chat = ({player,room}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [players, setPlayers] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    subscribeToChat((err, data) => {
      if(err) return;

      setChatHistory(oldChat => [...oldChat, data]);
      scrollToBottom('messages');
    });
    return () => {
      //disconnectSocket();
      setIsLoading(false);
    }
  },[]);

  useEffect(() => {
    if(!players){
      setIsLoading(true);
      console.log('players requested');
      requestPlayersList(room);
      subscribeToPlayers((err, data) => {
        if(err) return;

        console.log('subscribe has been called');
        console.log('data received: ');
        console.log(data);
        setPlayers(data);
        setIsLoading(false);
      });
      
    }
    return () => {
      console.log('players post request');
      console.log(players);
      disconnectSocket();
      setIsLoading(false);
    }
  },[]);

  const updatePlayerList = (newPlayer) => {
    if(players.find(p => p.name === newPlayer.name)){
      console.log(`player: ${newPlayer.name} is already in the game`);
      return;
    }

    setPlayers(oldPlayers => [...oldPlayers, newPlayer]);
    const message = `${newPlayer.name} joined.`;
    setChatHistory(oldChat => [...oldChat, {newPlayer:null,msg:message}]);
    scrollToBottom('messages');
    console.log('players post set:');
    console.log(players);
  };

  useEffect(() => {
    if(players){
      //console.log('this sucker only runs once.');
    onPlayerEntered((err, data) => {
      if(err) return;
      const player = data;
      console.log('inside of player entered');
      console.log('players:');
      console.log(players);
      console.log('player:');
      console.log(player);      
      updatePlayerList(player);
    });
    }
    return () => {
      //disconnectSocket();
      setIsLoading(false);
    }
    
  },[players]);

  useEffect(() => {
    onPlayerDisconnected((err, data) => {
      if(err) return;
      console.log('player has disconnected:');
      const player = data;
      console.log(player);
      setPlayers(oldPlayers => oldPlayers.filter(p => p.name !== player.name));

      const message = `${player.name} left.`;
      setChatHistory(oldChat => [...oldChat, {player:null,msg:message}]);
      scrollToBottom('messages');
    })
  },[]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(message.length<1){
      setMessage('');
      return;
    }

    sendMsg(room,player,message);    
    //console.log(`room: ${room}\nplayer: ${player.name}\n message: ${message}`);
    setMessage('');
  };

  const renderChatHistory = () => {
    return (
      chatHistory.map((chat, index) => (
        <li key={index}>
          {chat.player && <span>{chat.player.name}: </span>}
          <span>{chat.msg}</span>
        </li>
      ))
    );
  }

  if(isLoading){
    return (<div>loading...</div>);
  }else{
  return (    
    <div className="chat-container">
      <ul id="players">
        <li>{`${players.length} in the room`}</li>
        {players.map((player,index) => (
          <li key={index}>
            <span>{player.name}</span>
            {player.isHost && <span> (host)</span>}
          </li>
        ))}
      </ul>
      <ul id="messages">
        {renderChatHistory()}
      </ul>
      <form id="chat-form" onSubmit={handleSubmit}>
        <input
          className="form-input"
          id="chat"
          autoComplete="off"
          minLength="1"
          maxLength="140"
          onChange={(e) => {
            setMessage(sanitizeHTML(e.target.value));
          }}
          value={message}
        />
        <button id="send" className="form-button">
          Send
        </button>
      </form>
    </div>
  );
        }
}

export default Chat;