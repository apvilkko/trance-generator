import { ensurePositive } from "../util";

export const triggerEnvelope = ({
  context,
  param,
  attack = 0.01,
  release = 2.0,
  sustain = 1,
  delta
}) => {
  const now = ensurePositive(context.currentTime + delta);
  // param.cancelAndHoldAtTime(now);
  param.cancelScheduledValues(now);
  const att = now + attack;
  param.setValueAtTime(0, now);
  param.linearRampToValueAtTime(sustain, att);
  param.linearRampToValueAtTime(0, now + release);
};
