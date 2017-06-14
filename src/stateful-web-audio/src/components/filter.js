import {connect} from '../util';

export default ({context, frequency, destination}) => {
  const node = context.createBiquadFilter();
  node.type = 'lowpass';
  node.frequency.value = frequency;
  node.Q.value = 0.5;
  if (destination) {
    connect(node, destination);
  }
  return node;
};
