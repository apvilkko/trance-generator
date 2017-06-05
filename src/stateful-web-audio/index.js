import {startTick} from './src/worker';
import * as seq from './src/sequencer';
import * as scene from './src/scene';
import * as mixer from './src/mixer';

export {setScene} from './src/scene';
export {
  createInsertEffect,
  createMixer,
  addInsert,
  getInsert,
  setNodeGain,
  setTrackGain,
} from './src/mixer';
export {play, pause, isPlaying} from './src/sequencer';
export * from './src/components';
export {getContext} from './src/util';

export const start = ctx => {
  startTick(ctx, seq.tick);
  seq.play(ctx);
};

const initialState = {
  instances: {},
  sequencer: seq.initialState,
  scene: scene.initialState,
  mixer: mixer.initialState,
};

const initialRuntime = {
  instances: {},
  buffers: {},
};

// TODO
const reinitInstances = state => state;

const addInstance = (state, id, name) => ({
  ...state,
  instances: {
    ...state.instances,
    [id]: {id, name}
  }
});

const initAudioContext = runtime => {
  runtime.instances.context = new (window.AudioContext || window.webkitAudioContext)();
};

const reinit = oldState => {
  const state = oldState || initialState;
  const id = 'context';
  return reinitInstances(addInstance(state, id, 'AudioContext'));
};

export const init = (oldState = null) => {
  const runtime = initialRuntime;
  initAudioContext(runtime);
  const seqRuntime = seq.initialRuntime(runtime);
  runtime.sequencer = seqRuntime;
  const state = reinit(oldState);
  return {state, runtime};
};
