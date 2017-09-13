import {getContext} from './util';
import {playSample, playSynth, triggerEnvelope} from './components';

const normalizeVelocity = velocity => velocity / 127.0;

const gateOn = (context, destination, buffer, note, synth, instance, trackGain) => {
  if (buffer) {
    playSample({
      context,
      destination,
      buffer,
      pitch: note.pitch
    });
    triggerEnvelope({
      context,
      param: destination.gain,
      release: note.release || 2.0,
      sustain: normalizeVelocity(note.velocity) * trackGain,
    });
  }
  if (synth) {
    playSynth({
      context,
      pitch: note.pitch,
      instance,
    });
    triggerEnvelope({
      context,
      release: instance.release || 2.0,
      param: destination.gain,
      sustain: normalizeVelocity(note.velocity) * trackGain,
    });
  }
};


const getDestination = track => (track ? track.gain : null);

export const playNote = (ctx, key, note) => {
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
      gateOn(getContext(ctx), destination, buffer, note, null, null, trackGain);
    }
  } else {
    const instance = ctx.runtime.synths[synth];
    gateOn(getContext(ctx), destination, null, note, synth, instance, trackGain);
  }
};
