import React from 'react';
import { BrowserRouter as Router, Route} from 'react-router-dom';
import './App.css';
import LandingForm from './LandingForm';

const App = () => {
  return (
    <div className="App">
      <h1>
        <code>Idiot/Durak/</code>Дурак
      </h1>
      <h6>It's not about who wins, but who loses.</h6>
      
      <Router>
        <Route path="/:roomName?">
          <LandingForm />
        </Route>
      </Router>
      <a className="App-link" href="https://en.wikipedia.org/wiki/Durak">
        How to play
      </a>
    </div>
  );
}

export default App;
