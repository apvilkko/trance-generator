import {
  init,
  start,
  setScene,
  createMixer,
  play,
  pause,
  isPlaying,
} from './stateful-web-audio';
// import {init as initEvents} from './events';
import {setParam} from './stateful-web-audio/src/setParam';
import {createScene} from './scene';
import tracks from './tracks';

const newScene = ctx => {
  const scene = createScene();
  setScene(ctx, scene);
};

const breakdown = ctx => {
  ctx.runtime.sequencer.breakdownStart = ctx.runtime.instances.context.currentTime;
};

const toggle = ctx => {
  const playing = isPlaying(ctx);
  if (playing) {
    pause(ctx);
  } else {
    play(ctx);
  }
  return !playing;
};

const ctx = init();
window.ctx = ctx;
createMixer(ctx, {
  [tracks.BD]: {gain: 0.6},
  [tracks.CL]: {gain: 0.6},
  [tracks.HC]: {gain: 0.6},
  [tracks.HO]: {gain: 0.6},
  [tracks.SN]: {gain: 0.55},
  [tracks.BS]: {gain: 0.5},
  [tracks.MB]: {gain: 0.5},
  [tracks.LD]: {gain: 0.4},
  [tracks.CR]: {gain: 0.5},
  [tracks.RD]: {gain: 0.25},
  [tracks.LP]: {gain: 0.3},
});
newScene(ctx);
setTimeout(() => {
  start(ctx);
}, 1000);

export const actions = {
  newScene: () => newScene(ctx),
  toggle: () => toggle(ctx),
  isPlaying: () => isPlaying(ctx),
  setParam: params => evt => setParam({ctx, value: evt.target.value, ...params}),
  breakdown: () => breakdown(ctx),
};
// initEvents(document, actions);
