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
          <div>v0.3{' '}<a href="https://github.com/apvilkko/trance-generator">github</a></div>
        </div>
      </div>
    </div>
  </div>
);

export default App;
