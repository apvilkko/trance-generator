import {debugMessage} from './debug';

const setText = (id, text) => {
  document.getElementById(id).innerHTML = text;
};

const handler = (id, message, fn) => {
  document.getElementById(id).addEventListener('click', () => debugMessage(message)(fn));
};

export const init = (document, actions) => {
  /* handler('new', 'new scene', actions.newScene);
  handler('toggle', 'toggle', () => {
    const isPlaying = actions.toggle();
    setText('toggle', isPlaying ? '▮▮' : '▶');
  }); */
};
