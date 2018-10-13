import {getContext} from './util';
import {playSample, playSynth, triggerEnvelope} from './components';

const normalizeVelocity = velocity => velocity / 127.0;

const gateOn = (context, destination, buffer, note, synth, instance, trackGain, delta) => {
  if (buffer) {
    playSample({
      context,
      destination,
      buffer,
      pitch: note.pitch,
      delta,
    });
    triggerEnvelope({
      context,
      param: destination.gain,
      release: note.release || 2.0,
      sustain: normalizeVelocity(note.velocity) * trackGain,
      delta,
    });
  }
  if (synth) {
    playSynth({
      context,
      pitch: note.pitch,
      instance,
      delta,
    });
    triggerEnvelope({
      context,
      param: destination.gain,
      release: instance.release || 2.0,
      sustain: normalizeVelocity(note.velocity) * trackGain,
      delta,
    });
  }
};


const getDestination = track => (track ? track.gain : null);

export const playNote = (ctx, key, note, delta = 0) => {
  const {state: {mixer: {tracks}, scene: {parts}}} = ctx;
  if (tracks[key].muted) {
    return;
  }
  const destination = getDestination(tracks[key]);
  const trackGain = tracks[key].trackGain;
  const synth = parts[key].synth;
  const isSample = !synth;
  if (isSample) {
    const buffer = ctx.runtime.buffers[parts[key].sample];
    if (buffer && destination) {
      gateOn(getContext(ctx), destination, buffer, note, null, null, trackGain, delta);
    }
  } else {
    const instance = ctx.runtime.synths[synth];
    gateOn(getContext(ctx), destination, null, note, synth, instance, trackGain, delta);
  }
};
