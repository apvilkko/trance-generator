import {connect} from '../util';

const makeDistortionCurve = amount => {
  const k = amount;
  const nSamples = 44100;
  const curve = new Float32Array(nSamples);
  const deg = Math.PI / 180;
  let x;
  for (let i = 0; i < nSamples; ++i) {
    x = i * 2 / nSamples - 1;
    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
  }
  return curve;
};

export const setCurveAmount = (node, amount) => {
  node.curve = makeDistortionCurve(amount); // eslint-disable-line
};

export const createWaveshaper = ({context, destination, amount = 40}) => {
  const node = context.createWaveShaper();
  setCurveAmount(node, amount);
  node.oversample = '4x';
  if (destination) {
    connect(node, destination);
  }
  return node;
};
