import React from 'react';
import { useParams } from 'react-router-dom';

import Game from './Game';
import Chat from './Chat';

const Room = ({player}) => {
  const { roomName } = useParams();

  return (
    <div>
      <h3>Room: {roomName}</h3>
      <div className='room-container' >
        <Game />
        <Chat />
      </div>
    </div>
  );
}

export default Room;