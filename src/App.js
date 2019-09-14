import React, { useState } from "react";
import Params from "./Params";
import Mixer from "./Mixer";
import Seed from "./Seed";
import "./App.css";

const App = ({ actions, store, doInit }) => {
  const [inited, setInited] = useState(false);
  const a = actions.actions;

  return (
    <div className="App">
      <div className="App-header">
        <h2>Invertic's Trance Generator</h2>
      </div>
      <div className="container">
        <div className="content">
          {inited ? (
            <div>
              <button onClick={a.newScene}>reroll</button>
              <button onClick={a.toggle}>play/pause</button>
              <button onClick={a.breakdown}>request breakdown</button>
              <Params actions={a} />
              <Mixer toggle={a.toggleChannel} store={store} />
              <Seed load={a.load} store={store} />
            </div>
          ) : (
            <button
              onClick={() => {
                doInit();
                setInited(true);
              }}
            >
              start
            </button>
          )}

          <div className="history">
            <div>
              v0.8{" "}
              <a href="https://github.com/apvilkko/trance-generator">github</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
