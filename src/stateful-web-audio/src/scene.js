import {commit} from './state';
import {getContext, connect, disconnect} from './util';
import {loadSample} from './loader';
import {createInsertEffect, addInsert, setNodeGain} from './mixer';
import * as components from './components';

export const initialState = ({
  parts: {},
  master: {},
  shufflePercentage: 0,
  tempo: 120,
});

const addInsertEffect = (ctx, key, insert, index, insertSpec = {}) => {
  const context = getContext(ctx);
  const spec = {...insertSpec, context, ...insert.params};
  // console.log('addInsertEffect', spec);
  const insertEffect = createInsertEffect({
    context,
    effect: components[`create${insert.effect}`](spec)
  });
  addInsert(ctx, key, insertEffect, index);
  if (insert.params) {
    Object.keys(insert.params).forEach(param => {
      if (param === 'dry' || param === 'wet') {
        setNodeGain(insertEffect[param], insert.params[param]);
      }
    });
  }
};

const setupInsert = (ctx, key, insert, index) => {
  if (insert.sample) {
    loadSample(ctx, insert.sample).then(() => {
      const buffers = ctx.runtime.buffers;
      addInsertEffect(ctx, key, insert, index, {buffer: buffers[insert.sample]});
    });
  } else {
    addInsertEffect(ctx, key, insert, index);
  }
};

const setupScene = ctx => {
  const {runtime, state: {mixer, scene: {parts, synths}}} = ctx;
  runtime.synths = {};
  Object.keys(synths).forEach(synth => {
    runtime.synths[synth] = components.createSynth({
      context: getContext(ctx),
      options: synths[synth]
    });
  });
  Object.keys(parts).forEach(part => {
    if (parts[part].sample) {
      loadSample(ctx, parts[part].sample);
    }
    if (parts[part].synth) {
      connect(runtime.synths[parts[part].synth], mixer.tracks[part].gain);
    }
    if (parts[part].inserts) {
      parts[part].inserts.forEach((insert, i) => setupInsert(ctx, part, insert, i));
    }
  });
};

const cleanup = ctx => {
  const {runtime} = ctx;
  Object.keys(runtime.synths || {}).forEach(key => {
    disconnect(runtime.synths[key]);
  });
};

export const setScene = (ctx, scene) => {
  cleanup(ctx);
  commit(ctx, 'scene', scene);
  setupScene(ctx);
};
