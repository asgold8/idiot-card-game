import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {socket} from '../socket';
import useUuid from '../hooks/useUuid';

const LandingForm = () => {
  const { roomName } = useParams();
  const history = useHistory();
  const [name, setName] = useState('');
  const [room, setRoom] = useState(roomName ?? '');
  
  const uuid = useUuid();

  const handleSubmit = (e) => {
    e.preventDefault();
    // if url param already has the roomName; try to join the room
    if ( roomName ){
      console.log('attempting join-room');
      socket.emit('join-room', { uuid, name, room });
    }
    //else create room
    //TODO: if clicked create and room exists, display error
    else{
      console.log('attempting create-room');
      socket.emit('create-room', { uuid, name, room });            
      history.push(room);
    }

  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          autoComplete="off"
          name="name"
          required
          minLength="1"
          maxLength="12"
          onChange={(e)=>{setName(e.target.value)}}
          className="form-input"
        />
        <label>Room:</label>
        <input
          type="text"
          value={room}
          required
          minLength="1"
          maxLength="12"
          readOnly={roomName ?? false}
          onChange={(e)=>{setRoom(e.target.value)}}
          className="form-input"
        />
        <button className="form-button">{roomName ? "Join" : "Create"}</button>
      </form>
    </div>
  );
}

export default LandingForm;