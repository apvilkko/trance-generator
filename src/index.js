import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

import {actions, store} from './main';

ReactDOM.render(
  <App actions={actions} store={store} />,
  document.getElementById('root')
);
registerServiceWorker();
