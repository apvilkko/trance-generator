import {commit} from './state';
import {playNote} from './player';
import {getContext} from './util';
import {setParam} from './setParam';

const WORKER_TICK_LEN = 0.2;

export const initialState = ({
  playing: false,
  noteLength: 0.25,
});

export const initialRuntime = runtime => ({
  scheduleAheadTime: 0.1,
  currentNote: 0,
  lastTickTime: runtime.instances.context.currentTime,
});

const beatLen = tempo => 60.0 / tempo;

const randRange = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

const scheduleNote = (ctx, delta) => {
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
    runtime.sequencer.breakdownSnPattern = Math.random() > 0.5;
    runtime.sequencer.breakdownKick = Math.random() > 0.5;
    runtime.sequencer.breakdownKickEnd = Math.random() > 0.7 ? 1.0 :
      1.0 - (1.0 / Math.pow(2, randRange(3, 5)));
  }
  const bdPhase = (runtime.instances.context.currentTime - bdStart) / breakdownLen;
  const isBreakdown = bdPhase >= 0 && bdPhase <= 1.0;
  // console.log(bdReqStart, bdStart, currentBeat, distanceBeats, isBreakdown, bdPhase);
  const keys = Object.keys(scene.parts);
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    if (isFirst && key === 'CR') {
      playNote(ctx, key, {velocity: 127}, delta);
    }
    if (!isBreakdown && key === 'SN') {
      continue;
    }
    let snNote;
    if (isBreakdown) {
      snNote = {velocity: (bdPhase * 2 - 1) * 127};
      setParam({ctx, name: 'LD.synth.vcf.frequency', value: 20 + 8000 * bdPhase, delta});
      setParam({ctx, name: 'LD.synth.vcf.Q', value: 60 + ((1.0 - bdPhase) * 30), delta});
      runtime.sequencer.breakdown = true;
    } else if (runtime.sequencer.breakdown) {
      runtime.sequencer.breakdownStart = null;
      runtime.sequencer.breakdownAdjustedStart = null;
      setParam({ctx, name: 'LD.synth.vcf.frequency', value: 8000, delta});
      setParam({ctx, name: 'LD.synth.vcf.Q', value: 50, delta});
      runtime.sequencer.breakdown = false;
    }
    const track = scene.parts[key].pattern;
    if (track) {
      const shouldPlaySn = key === 'SN' && bdPhase >= 0.5;
      const shouldPlayKick = isBreakdown && key === 'BD' &&
        bdPhase >= 0.5 && bdPhase <= runtime.sequencer.breakdownKickEnd;
      const note = track[currentNote % track.length];
      if ((shouldPlaySn && !runtime.sequencer.breakdownSnPattern) ||
        (shouldPlayKick && runtime.sequencer.breakdownKick)) {
        playNote(ctx, key, {...note, ...snNote}, delta);
        continue;
      }
      if (note.velocity) {
        if (shouldPlaySn && runtime.sequencer.breakdownSnPattern) {
          playNote(ctx, key, snNote, delta);
        } else if (!isBreakdown || (key === 'LD')) {
          playNote(ctx, key, note, delta);
        }
      }
    }
  }
};

const seqLength = 256;

const nextNote = ctx => {
  const currentNote = ctx.runtime.sequencer.currentNote;
  const nextNote = currentNote === (seqLength - 1) ? -1 : currentNote;
  ctx.runtime.sequencer.currentNote = nextNote + 1;
};

/*


Beat 1           Beat 2
8th 1    8th 2   8th 3    8th 4
|-   -   -   -   |-   -   -   -   |
                        |

time = 0.875
shufflePercentage = 50
tempo = 100
beatLen = 0.6
currentEighth = 2
currentEighthStartTime = 0.6
shuffleAmount = 0.6667
second16thStartTime = currentEighthStartTime + (2.0 - shuffleAmount) * noteLength * beatLen = 0.8

*/
const getNextNoteTime = (ctx, time) => {
  const {
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
  const beatLen = 60.0 / tempo;
  const currentEighth = Math.floor(time / (0.5 * beatLen));
  const currentEighthStartTime = currentEighth * (0.5 * beatLen);
  const shuffleAmount = 1.0 + (shufflePercentage / 150.0);
  const second16thStartTime = currentEighthStartTime + shuffleAmount * noteLength * beatLen;
  const next8thTime = (currentEighth + 1) * (0.5 * beatLen);
  return time > second16thStartTime ? next8thTime : second16thStartTime;
};

const SAFETY_OFFSET = 0.010;

export const tick = ctx => {
  const {state, runtime} = ctx;
  const rtSeq = runtime.sequencer;
  const stSeq = state.sequencer;
  const currentTime = getContext(ctx).currentTime;
  if (stSeq.playing) {
    let time = rtSeq.lastTickTime;
    const nextNotes = [];
    let nextNoteTime;
    do {
      nextNoteTime = getNextNoteTime(ctx, time);
      if (nextNoteTime < currentTime) {
        nextNotes.push(nextNoteTime);
      }
      time += (nextNoteTime - time + 0.005);
    } while (nextNoteTime < currentTime);
    // console.log(nextNotes);

    for (let i = 0; i < nextNotes.length; ++i) {
      const delta = Math.max(nextNotes[i] - (currentTime - WORKER_TICK_LEN) + SAFETY_OFFSET, 0);
      // console.log(i, currentTime, nextNotes[i], delta);
      scheduleNote(ctx, delta);
      nextNote(ctx);
    }
  }
  ctx.runtime.sequencer.lastTickTime = currentTime;
};

export const play = ctx => {
  commit(ctx, 'sequencer.playing', true);
  ctx.runtime.sequencer.lastTickTime = getContext(ctx).currentTime;
};

export const pause = ctx => {
  commit(ctx, 'sequencer.playing', false);
};

export const isPlaying = ctx => ctx.state.sequencer.playing;
