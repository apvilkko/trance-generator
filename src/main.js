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
import {createScene} from './scene';
import tracks from './tracks';

const newScene = ctx => {
  const scene = createScene();
  setScene(ctx, scene);
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
createMixer(ctx, {
  [tracks.BD]: {gain: 0.7},
  [tracks.CL]: {gain: 0.5},
  [tracks.HC]: {gain: 0.1},
  [tracks.HO]: {gain: 0.25},
  [tracks.BS]: {gain: 0.4},
  [tracks.MB]: {gain: 0.2},
  /* [tracks.SN]: {gain: 0.4},
  [tracks.ST]: {gain: 0.3},
  [tracks.BS]: {gain: 0.4},
  [tracks.RD]: {gain: 0.2}, */
});
newScene(ctx);
start(ctx);

export const actions = {
  newScene: () => newScene(ctx),
  toggle: () => toggle(ctx),
  isPlaying: () => isPlaying(ctx),
};
// initEvents(document, actions);
