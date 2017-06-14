import {connect} from '../util';

export const createVCA = ({context, gain = 0.5, destination}) => {
  const node = context.createGain();
  // console.log('createVCA gain = ', gain);
  node.gain.value = gain;
  if (destination) {
    connect(node, destination);
  }
  return node;
};
