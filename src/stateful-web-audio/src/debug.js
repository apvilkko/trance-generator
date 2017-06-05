export const DEBUG = true;
const debugEl = typeof document === 'undefined' ? null :
  document.getElementById('debug');

export const withDebug = fn => state => {
  fn(state);
  if (DEBUG && debugEl) {
    debugEl.innerHTML = JSON.stringify(state, null, 2);
  }
};

export const debugMessage = message => fn => {
  if (DEBUG) {
    console.log(message); // eslint-disable-line
  }
  return fn();
};
