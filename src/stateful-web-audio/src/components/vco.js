import {connect} from '../util';

export const createVCO = ({context, type = 'sawtooth', destination}) => {
  const node = context.createOscillator();
  node.type = type;
  node.frequency.value = 20;
  node.start();
  if (destination) {
    connect(node, destination);
  }
  return node;
};
