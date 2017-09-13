import {observable, action} from 'mobx';
import {fromPairs} from './util';
import tracks from './tracks';

const store = observable({
  mixerState: fromPairs(
    Object.keys(tracks).map(key => [key, {solo: false, mute: false}])
  ),
});

store.setChannel = action((key, action) => {
  if (!store.mixerState[key]) {
    store.mixerState[key] = {};
  }
  const current = store.mixerState[key][action];
  if (action === 'mute') {
    const newState = !current;
    store.mixerState[key][action] = newState;
    if (newState) {
      store.mixerState[key].solo = false;
    }
  } else {
    const newState = !store.mixerState[key][action];
    store.mixerState[key][action] = newState;
    if (newState) {
      store.mixerState[key].mute = false;
      Object.keys(tracks).forEach(other => {
        if (other !== key && !store.mixerState[other].solo) {
          store.mixerState[other].mute = true;
        }
      });
    } else {
      const onlySolo = Object.keys(tracks).every(other =>
        other === key || !store.mixerState[other].solo
      );
      if (onlySolo) {
        Object.keys(tracks).forEach(other => {
          store.mixerState[other].mute = false;
          store.mixerState[other].solo = false;
        });
      } else {
        store.mixerState[key].mute = true;
      }
    }
  }
  return store.mixerState;
});

export default store;
