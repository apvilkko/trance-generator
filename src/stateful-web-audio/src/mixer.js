import {commit} from './state';
import {getContext, connect, disconnect} from './util';
import {
  createCompressor,
  createVCA,
} from './components';

export const initialState = ({
  tracks: {}
});

export const createInsertEffect = ({context, effect}) => {
  const dry = createVCA({context, gain: 1});
  const wet = createVCA({context, gain: 0.5});
  const input = createVCA({context, gain: 1});
  const output = createVCA({context, gain: 1});
  connect(input, dry);
  connect(input, effect);
  connect(effect, wet);
  connect(wet, output);
  connect(dry, output);
  return {dry, wet, effect, input, output};
};

const createTrack = spec => ({...spec, inserts: []});

export const setNodeGain = (node, value) => {
  node.gain.value = value; // eslint-disable-line
};

export const setTrackGain = (mixer, track, value) => {
  setNodeGain(mixer[track].gain, value);
};

export const getInsert = (ctx, key, index) =>
  ctx.state.mixer.tracks[key].inserts[index].effect;

const mixBus = tracks => tracks.master.mixBus;

export const addInsert = (ctx, key, insertEffect, index = -1) => {
  const {state: {mixer: {tracks}}} = ctx;
  const inserts = tracks[key].inserts;
  const dest = mixBus(tracks);
  const pos = index < 0 ? inserts.length : index;
  const addingToEnd = pos === inserts.length;
  if (pos > 0) {
    const next = addingToEnd ? dest : inserts[pos];
    disconnect(inserts[pos - 1], next);
  }
  if (inserts.length === 0) {
    try {
      disconnect(tracks[key].gain, dest);
    } catch (err) {
      console.log(err); // eslint-disable-line no-console
    }
    connect(tracks[key].gain, insertEffect);
  }
  const next = pos >= (inserts.length - 1) ? dest : inserts[pos + 1];
  connect(insertEffect, next);
  commit(ctx, ['mixer', 'tracks', key, 'inserts'],
    [...inserts.slice(0, pos - 1), insertEffect, ...inserts.slice(pos + 1)]);
};

export const createMixer = (ctx, trackSpec) => {
  const context = getContext(ctx);
  const masterGain = createVCA({
    context, gain: 1, destination: context.destination
  });
  const masterLimiter = createCompressor({
    context, destination: masterGain
  });
  const mixBus = createVCA({
    context, gain: 0.4, destination: masterLimiter
  });
  const tracks = {
    master: createTrack({
      gain: masterGain,
      limiter: masterLimiter,
      mixBus,
    }),
  };
  Object.keys(trackSpec).forEach(track => {
    const trackGain = trackSpec[track].gain || 0.6;
    tracks[track] = createTrack({
      gain: createVCA({
        context,
        gain: trackGain,
        destination: mixBus
      }),
      trackGain,
    });
  });

  commit(ctx, 'mixer.tracks', tracks);
};
