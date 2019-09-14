import {
  init,
  start,
  setScene,
  createMixer,
  play,
  pause,
  isPlaying
} from "./stateful-web-audio";
// import {init as initEvents} from './events';
import { setParam } from "./stateful-web-audio/src/setParam";
import { createScene } from "./scene";
import tracks from "./tracks";
import mixerStore from "./store";

const store = mixerStore;

function getParameterByName(paramName) {
  const url = window.location.href;
  const name = paramName.replace(/[[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const newScene = (ctx, seed) => {
  const scene = createScene(store, seed);
  setScene(ctx, scene);
};

const breakdown = ctx => {
  ctx.runtime.sequencer.breakdownStart =
    ctx.runtime.instances.context.currentTime;
};

let ctx;
const actions = {};

const load = ctx => seed => {
  newScene(ctx, seed);
};

const toggleChannel = ctx => (key, solo) => {
  const newState = store.setChannel(key, solo ? "solo" : "mute");
  Object.keys(tracks).forEach(track => {
    const mixerTrack = ctx.state.mixer.tracks[track];
    if (mixerTrack) {
      mixerTrack.muted = newState[track].mute;
    }
  });
};

function toggle(ctx) {
  const playing = isPlaying(ctx);
  if (playing) {
    pause(ctx);
  } else {
    play(ctx);
  }
  return !playing;
}

function setupActions(ctx) {
  return {
    newScene: () => newScene(ctx),
    toggle: () => toggle(ctx),
    isPlaying: () => isPlaying(ctx),
    setParam: params => evt =>
      setParam({ ctx, value: evt.target.value, ...params }),
    breakdown: () => breakdown(ctx),
    toggleChannel: toggleChannel(ctx),
    load: load(ctx)
  };
}

function doInit() {
  ctx = init();
  window.ctx = ctx;
  createMixer(ctx, {
    [tracks.BD]: { gain: 0.55 },
    [tracks.CL]: { gain: 0.5 },
    [tracks.HC]: { gain: 0.5 },
    [tracks.HO]: { gain: 0.6 },
    [tracks.SN]: { gain: 0.6 },
    [tracks.BS]: { gain: 0.5 },
    [tracks.MB]: { gain: 0.5 },
    [tracks.LD]: { gain: 0.25 },
    [tracks.CR]: { gain: 0.45 },
    [tracks.RD]: { gain: 0.6 },
    [tracks.LP]: { gain: 0.5 }
  });
  newScene(ctx, getParameterByName("s") || null);
  actions.actions = setupActions(ctx);
  setTimeout(() => {
    start(ctx);
  }, 500);
}

export { actions, store, doInit };

// initEvents(document, actions);
