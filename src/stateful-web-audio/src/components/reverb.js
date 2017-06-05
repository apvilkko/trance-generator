import {connect} from '../util';

export const createReverb = ({context, destination, buffer}) => {
  const node = context.createConvolver();
  if (destination) {
    connect(node, destination);
  }
  node.buffer = buffer;
  return node;
};
