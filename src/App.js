import React from 'react';
import './App.css';

const App = ({actions}) => (
  <div className="App">
    <div className="App-header">
      <h2>Invertic's Trance Generator</h2>
    </div>
    <div className="App-intro">
      <button onClick={actions.newScene}>reroll</button>
      <button onClick={actions.toggle}>play/pause</button>
    </div>
  </div>
);

export default App;
