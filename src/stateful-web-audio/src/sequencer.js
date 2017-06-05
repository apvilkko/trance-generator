import {commit} from './state';
import {playNote} from './player';
import {getContext} from './util';

export const initialState = ({
  playing: false,
  noteLength: 0.25,
});

export const initialRuntime = runtime => ({
  scheduleAheadTime: 0.1,
  currentNote: 0,
  nextNoteTime: runtime.instances.context.currentTime,
});

const scheduleNote = ctx => {
  const {state, runtime} = ctx;
  const currentNote = runtime.sequencer.currentNote;
  const scene = state.scene;
  Object.keys(scene.parts).forEach(key => {
    const track = scene.parts[key].pattern;
    const note = track[currentNote % track.length];
    if (note.velocity) {
      playNote(ctx, key, note);
    }
  });
};

const nextNote = ctx => {
  const {
    runtime: {
      sequencer: {
        currentNote,
        nextNoteTime,
      }
    },
    state: {
      sequencer: {
        noteLength,
      },
      scene: {
        shufflePercentage,
        tempo,
      }
    }
  } = ctx;
  const shuffleAmount = 1.0 - (shufflePercentage / 150.0);
  const noteLen = ((currentNote % 2) ? shuffleAmount : (2.0 - shuffleAmount)) * noteLength;
  const seqLength = 256;
  const nextNote = currentNote === (seqLength - 1) ? -1 : currentNote;
  ctx.runtime.sequencer.nextNoteTime = nextNoteTime + (noteLen * (60.0 / tempo));
  ctx.runtime.sequencer.currentNote = nextNote + 1;
};

export const tick = ctx => {
  const {state, runtime} = ctx;
  const rtSeq = runtime.sequencer;
  const stSeq = state.sequencer;
  if (stSeq.playing) {
    if (rtSeq.nextNoteTime < getContext(ctx).currentTime + rtSeq.scheduleAheadTime) {
      scheduleNote(ctx);
      nextNote(ctx);
    }
  }
};

export const play = ctx => {
  commit(ctx, 'sequencer.playing', true);
  ctx.runtime.sequencer.nextNoteTime = getContext(ctx).currentTime;
};

export const pause = ctx => {
  commit(ctx, 'sequencer.playing', false);
};

export const isPlaying = ctx => ctx.state.sequencer.playing;
