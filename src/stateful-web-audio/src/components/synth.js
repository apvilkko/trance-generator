import {connect, getContext} from '../util';
import {createVCA} from './vca';
import createFilter from './filter';
import {createVCO} from './vco';

const offsetFreq = (baseFreq, semitones, detuneCents = 0) =>
  baseFreq * Math.pow(2, (semitones + (detuneCents / 100.0)) / 12.0);

const BASE_FREQ = offsetFreq(440, -21);

export const playSynth = ({context, pitch = 0, instance}) => {
  instance.vcos.forEach(vco => {
    const freq = offsetFreq(BASE_FREQ, pitch, vco.params.detune);
    vco.instance.frequency.setValueAtTime(freq, context.currentTime);
  });
};

export const setSynthParam = (ctx, instance, params, value) => {
  const time = getContext(ctx).currentTime;
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
  const node = createVCA({context, gain: 1});
  const vco1 = createVCO({context, type: opts.type});
  const vco2 = createVCO({context, type: opts.type});
  const highpass = createFilter({context, frequency: 150, destination: node});
  highpass.type = 'highpass';
  const peakFilter = createFilter({context, frequency: 8000, destination: highpass});
  peakFilter.type = 'peaking';
  peakFilter.gain.value = 6;
  const filter = createFilter({context, frequency: 8000, destination: peakFilter});
  connect(vco1, filter);
  connect(vco2, filter);
  if (destination) {
    connect(node, destination);
  }
  return {
    attack: 0.05,
    release: 0.1,
    filter,
    peakFilter,
    vcos: [
      {
        instance: vco1,
        params: {
          detune: -9,
        },
      },
      {
        instance: vco2,
        params: {
          detune: 5
        },
      }
    ],
    output: node,
  };
};
