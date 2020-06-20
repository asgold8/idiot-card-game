import React from 'react';
import { useParams } from 'react-router-dom';

const LandingForm = () => {
  const { roomName } = useParams();
  return (
    <div className="form-container">
      <form>
        <label>
          Name:
          </label>
          <input
            type="text"
            autocomplete="off"
            name="name"
            required
            className="form-input"
          />
        <label>
          Room:
        </label>
          <input type="text" value={roomName} required className="form-input"/>
        <button className="form-button">{roomName ? "Join" : "Create"}</button>
      </form>
    </div>
  );
}

export default LandingForm;