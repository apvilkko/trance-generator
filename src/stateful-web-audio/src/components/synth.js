import {connect, getContext} from '../util';
import {createVCA} from './vca';
import createFilter from './filter';
import {createVCO} from './vco';

const offsetFreq = (baseFreq, semitones, detuneCents = 0) =>
  baseFreq * Math.pow(2, (semitones + (detuneCents / 100.0)) / 12.0);

const BASE_FREQ = offsetFreq(440, -21);

export const playSynth = ({context, pitch = 0, instance, delta}) => {
  instance.vcos.forEach(vco => {
    const freq = offsetFreq(BASE_FREQ, pitch, vco.params.detune);
    vco.instance.frequency.setValueAtTime(freq, context.currentTime + delta);
  });
};

export const setSynthParam = (ctx, instance, params, value, delta) => {
  const time = getContext(ctx).currentTime + delta;
  if (params.includes('vcf') && params.includes('frequency')) {
    instance.filter.frequency.setValueAtTime(value, time);
    instance.peakFilter.frequency.setValueAtTime(value, time);
  } else if (params.includes('vcf') && params.includes('Q')) {
    const val = value / 100.0;
    instance.filter.Q.setValueAtTime(val, time);
    instance.peakFilter.Q.setValueAtTime(val, time);
  }
};

export const createSynth = ({context, destination, options}) => {
  const opts = options || {type: 'sawtooth'};
  const node = createVCA({context, gain: 0.8});
  const numVcos = 5;
  const vcos = [];
  for (let i = 0; i < numVcos; ++i) {
    vcos.push(createVCO({context, type: opts.type}));
  }
  const highpass = createFilter({context, frequency: 150, destination: node});
  highpass.type = 'highpass';
  const peakFilter = createFilter({context, frequency: 8000, destination: highpass});
  peakFilter.type = 'peaking';
  peakFilter.gain.value = 6;
  const filter = createFilter({context, frequency: 8000, destination: peakFilter});
  const merger = context.createChannelMerger(2);
  connect(merger, filter);
  for (let i = 0; i < numVcos; ++i) {
    if (i === 0) {
      connect(vcos[i], merger, 0, 0);
      connect(vcos[i], merger, 0, 1);
    } else {
      connect(vcos[i], merger, 0, i % 2 === 0 ? 0 : 1);
    }
  }
  if (destination) {
    connect(node, destination);
  }
  return {
    attack: 0.05,
    release: 0.1,
    filter,
    peakFilter,
    merger,
    highpass,
    vcos: vcos.map((x, i) => ({
      instance: x,
      params: opts.vcos[i]
    })),
    output: node,
  };
};
