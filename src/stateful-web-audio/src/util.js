import {DEBUG} from './debug';

export const getContext = ctx => ctx.runtime.instances.context;

const log = (from, to, disconnect) => {
  if (!DEBUG) return;
  console.log( // eslint-disable-line
    disconnect ? 'disconnect' : 'connect',
    Object.prototype.toString.call(from),
    '=>',
    Object.prototype.toString.call(to)
  );
};

const output = from => (from.output ? from.output : from);
const input = to => (to.input ? to.input : to);

export const connect = (from, to, outputIndex = 0, inputIndex = 0) => {
  log(from, to);
  output(from).connect(input(to), outputIndex, inputIndex);
};

export const disconnect = (node, from) => {
  const src = output(node);
  if (from) {
    const dest = input(from);
    log(node, from, true);
    src.disconnect(dest);
    return;
  }
  log(node, null, true);
  src.disconnect();
};
