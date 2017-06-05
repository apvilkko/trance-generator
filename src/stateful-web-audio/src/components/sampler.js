//import {connect} from '../util';

const getRateFromPitch = pitch => Math.pow(2, (pitch * 100) / 1200);

export const playSample = ({context, destination, buffer, pitch = 0}) => {
  const node = context.createBufferSource();
  node.buffer = buffer;
  //connect(node, destination || context.destination);
  node.connect(destination || context.destination);
  if (pitch !== 0) {
    node.playbackRate.value = getRateFromPitch(pitch);
  }
  node.start(0);
};
