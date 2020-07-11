import React, {useState,useEffect} from 'react';
import {sendMsg, subscribeToChat} from '../socket';

const sanitizeHTML = (str) => {
  let temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
};

const Chat = ({player,room}) => {
  const [message, setMessage] = useState('');
  const [players, setPlayers] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    subscribeToChat((err, data) => {
      if(err) return;

      setChatHistory(oldChat => [...oldChat, data]);
    })
  },[]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(message.length<1){
      setMessage('');
      return;
    }

    sendMsg(room,player,message);
    
    console.log(`room: ${room}\nplayer: ${player.name}\n message: ${message}`);
    
    setMessage('');
  };

  return (
    <div className='chat-container'>
      <h6>{room} chat</h6>
      <ul id='messages'>{chatHistory.map((chat,index) => <li key={index}>{chat.player.name}: {chat.msg}</li>)}</ul>
      <form id='chat-form' onSubmit={handleSubmit}>
        <input 
          className='form-input'
          id='chat' 
          autoComplete='off' 
          minLength='1'
          maxLength='140'
          onChange={(e)=>{setMessage(sanitizeHTML(e.target.value))}}
          value={message}
          />
        <button id='send' className='form-button'>Send</button>
      </form>
    </div>

  );
}

export default Chat;