import React,{ useState,useEffect } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import './App.css';
import socket from './socket';
import LandingForm from './components/LandingForm';
import Room from './components/Room';
import useUuid from './hooks/useUuid';

const App = () => {

  const [player,setPlayer] = useState(null);
  const [loaded,setLoaded] = useState(false);
  //generate unique user id and store in local storage
  const uuid = useUuid();
  const { pathname } = useLocation();

  //only run this once
  useEffect(() => {      
    console.log(player);
    setLoaded(false);
    if(!player){

      const room = pathname.slice(1,pathname.length);
      socket.emit('initialize',uuid,room);

      socket.on('load-player', (data)=>{
        console.log(data);
        console.log(`loading player ${data?.name}`);
        setPlayer(data);
      });

      socket.on('entered', (data)=>{
        console.log(`player ${data?.name} has entered`);
      });
    }
    setLoaded(true);
  },[]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderApp = () => {
    if(loaded){
      return (
        player?.room ? <Room player={player}/> : <LandingForm />
      );
    }
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <h1>
        <code>Idiot/Durak/</code>Дурак
      </h1>
      <h6>It's not about who wins, but who loses.</h6>
      
      <Switch>
        <Route path="/:roomName?">          
          {renderApp()}
        </Route>
      </Switch>
      
      <a className="App-link" href="https://en.wikipedia.org/wiki/Durak">
        How to play
      </a>
    </div>
  );
}

export default App;
