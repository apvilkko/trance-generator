import {getContext} from './util';

export const init = () => ({
  buffers: {}
});

const doRequest = url => fetch(url).then(response => response.arrayBuffer());

export const loadSample = (ctx, name) => {
  console.log('loadSample', name);
  const {runtime: {buffers}} = ctx;
  return new Promise(resolve => {
    if (buffers[name]) {
      resolve();
      return;
    }
    doRequest(name).then(rawBuffer => {
      getContext(ctx).decodeAudioData(rawBuffer, buffer => {
        ctx.runtime.buffers[name] = buffer;
        resolve();
      }, () => {});
    });
  });
};
