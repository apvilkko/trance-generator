import {setSynthParam} from './components/synth';

export const setParam = ({ctx, ...params}) => {
  const {state: {scene: {parts}}} = ctx;
  const keyParts = params.name.split('.');
  const key = keyParts[0];
  const synth = parts[key].synth;
  const isSample = !synth;
  if (isSample) {
    // not implemented
  } else {
    const instance = ctx.runtime.synths[synth];
    setSynthParam(ctx, instance, keyParts.slice(1), params.value);
  }
};
