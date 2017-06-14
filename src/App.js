import React from 'react';
import Params from './Params';
import './App.css';

const App = ({actions}) => (
  <div className="App">
    <div className="App-header">
      <h2>Invertic's Trance Generator</h2>
    </div>
    <div className="container">
      <div className="content">
        <button onClick={actions.newScene}>reroll</button>
        <button onClick={actions.toggle}>play/pause</button>
        <button onClick={actions.breakdown}>request breakdown</button>
        <Params actions={actions} />
        {/* <pre style={{textAlign: 'left', fontSize: '80%'}}>{JSON.stringify(window.ctx, null, 2)}</pre> */}
        <div className="history">
          <div>v0.2
            <ul>
              <li>feature: breakdown</li>
              <li>improved motif, chord & pattern generation</li>
              <li>feature: synth filter adjustment</li>
              <li>fixed: mixer track gains</li>
            </ul>
          </div>
          <div>v0.1
            <ul>
              <li>initial version</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default App;
