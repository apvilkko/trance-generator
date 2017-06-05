import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

import {actions} from './main';

ReactDOM.render(<App actions={actions} />, document.getElementById('root'));
registerServiceWorker();
