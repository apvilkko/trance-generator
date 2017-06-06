import {connect} from '../util';
import {createVCA} from './vca';
import {createVCO} from './vco';

const BASE_FREQ = 261.6; // middle C

export const playSynth = ({context, destination, buffer, pitch = 0, instance}) => {
  const freq = BASE_FREQ * Math.pow(2, pitch / 12.0);
  instance.vco1.frequency.setValueAtTime(freq, context.currentTime);
};

export const createSynth = ({context, destination}) => {
  const node = createVCA({context, gain: 1});
  const vco1 = createVCO({context});
  connect(vco1, node);
  if (destination) {
    connect(node, destination);
  }
  return {
    attack: 0.05,
    release: 0.1,
    vco1,
    output: node,
  };
};
