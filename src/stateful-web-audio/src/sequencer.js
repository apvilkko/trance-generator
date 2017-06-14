import {commit} from './state';
import {playNote} from './player';
import {getContext} from './util';
import {setParam} from './setParam';

export const initialState = ({
  playing: false,
  noteLength: 0.25,
});

export const initialRuntime = runtime => ({
  scheduleAheadTime: 0.1,
  currentNote: 0,
  nextNoteTime: runtime.instances.context.currentTime,
});

const beatLen = tempo => 60.0 / tempo;

const scheduleNote = ctx => {
  const {state, runtime} = ctx;
  const currentNote = runtime.sequencer.currentNote;
  const scene = state.scene;
  const tempo = scene.tempo;
  const alignBeat = 32;
  const breakdownLen = alignBeat * beatLen(tempo);
  const bdReqStart = runtime.sequencer.breakdownStart || -1000;
  let bdStart = runtime.sequencer.breakdownAdjustedStart;
  const currentBeat = currentNote / 4;
  const modulo = currentBeat % alignBeat;
  const isFirst = modulo === 0;
  const distanceBeats = isFirst ? 0 : (alignBeat - modulo);
  if (!bdStart && bdReqStart !== -1000) {
    bdStart = bdReqStart + (distanceBeats * beatLen(tempo));
    runtime.sequencer.breakdownAdjustedStart = bdStart;
  }
  const bdPhase = (runtime.instances.context.currentTime - bdStart) / breakdownLen;
  const isBreakdown = bdPhase >= 0 && bdPhase <= 1.0;
  // console.log(bdReqStart, bdStart, currentBeat, distanceBeats, isBreakdown, bdPhase);
  const keys = Object.keys(scene.parts);
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    if (isFirst && key === 'CR') {
      playNote(ctx, key, {velocity: 127});
    }
    if (isBreakdown && key !== 'LD') {
      continue;
    }
    if (isBreakdown) {
      setParam({ctx, name: 'LD.synth.vcf.frequency', value: 20 + 8000 * bdPhase});
      setParam({ctx, name: 'LD.synth.vcf.Q', value: 60 + ((1.0 - bdPhase) * 30)});
      runtime.sequencer.breakdown = true;
    } else if (runtime.sequencer.breakdown) {
      runtime.sequencer.breakdownStart = null;
      runtime.sequencer.breakdownAdjustedStart = null;
      setParam({ctx, name: 'LD.synth.vcf.frequency', value: 8000});
      setParam({ctx, name: 'LD.synth.vcf.Q', value: 50});
      runtime.sequencer.breakdown = false;
    }
    const track = scene.parts[key].pattern;
    if (track) {
      const note = track[currentNote % track.length];
      if (note.velocity) {
        playNote(ctx, key, note);
      }
    }
  }
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
