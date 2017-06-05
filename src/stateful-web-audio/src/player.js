import {getContext} from './util';
import {playSample, triggerEnvelope} from './components';

const normalizeVelocity = velocity => velocity / 127.0;

const gateOn = (context, destination, buffer, note) => {
  playSample({
    context,
    destination,
    buffer,
    pitch: note.pitch
  });
  triggerEnvelope({
    context,
    param: destination.gain,
    sustain: normalizeVelocity(note.velocity)
  });
};


const getDestination = track => (track ? track.gain : null);

export const playNote = (ctx, key, note) => {
  const {state: {mixer: {tracks}, scene: {parts}}} = ctx;
  const buffer = ctx.runtime.buffers[parts[key].sample];
  const destination = getDestination(tracks[key]);
  if (buffer && destination) {
    gateOn(getContext(ctx), destination, buffer, note);
  }
};
