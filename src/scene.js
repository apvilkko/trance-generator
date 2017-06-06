import {randRange, randRangeFloat, maybe, sample, rand} from './util';
import tracks from './tracks';
import {createPattern, createLeadPattern} from './pattern';
import styles, {
  FOURBYFOUR, BROKEN, OFFBEATS, RANDBUSY, TWOANDFOUR,
  RANDSPARSE, OCCASIONAL, SUBBASS1, SUBBASS2, MIDBASS1
} from './styles';
import catalog from './catalog';

const randomizeStyle = track => {
  switch (track) {
    case tracks.BD:
      return FOURBYFOUR;
    case tracks.CL:
      return TWOANDFOUR;
    case tracks.HO:
      return OFFBEATS;
    case tracks.RD:
      return maybe({50: OFFBEATS, 32: FOURBYFOUR, rest: sample(styles)});
    case tracks.HC:
      return maybe(75, RANDBUSY,
               sample([BROKEN, RANDSPARSE, FOURBYFOUR, OFFBEATS]));
    case tracks.ST:
      return sample([BROKEN, TWOANDFOUR, RANDSPARSE, RANDBUSY, OCCASIONAL]);
    case tracks.BS:
      return sample([OFFBEATS, SUBBASS1, SUBBASS2]);
    case tracks.MB:
      return sample([RANDSPARSE, OCCASIONAL, MIDBASS1]);
    default:
      return sample(styles);
  }
};

const createLead = globalKey => {
  return {
    style: null,
    sample: null,
    synth: tracks.LD,
    pattern: createLeadPattern(globalKey)
  };
};

const randomizeSample = track => {
  const key = track.toLowerCase();
  const numChoices = catalog[key];
  return `${key}${randRange(1, numChoices)}`;
};

const urlify = sample => `samples/${sample}.ogg`;

const createPart = (track, globalKey) => {
  if (track === tracks.LD) {
    return createLead(globalKey);
  }
  const style = randomizeStyle(track);
  const sample = randomizeSample(track);
  console.log('part', sample, style, globalKey);
  return {
    style,
    sample: urlify(sample),
    pattern: createPattern(track, style, globalKey),
  };
};

const reverbSpec = (dry, wet) => ({
  effect: 'Reverb',
  params: {dry, wet},
  sample: urlify(randomizeSample('impulse'))
});

const randomizeEffects = key => track => {
  const inserts = [];
  switch (key) {
    case tracks.CL:
      inserts.push(reverbSpec(1, randRangeFloat(0.1, 0.5)));
      break;
    case tracks.ST:
      // inserts.push(reverbSpec(1, randRangeFloat(0.1, 0.8)));
      break;
    default:
      break;
  }
  return {...track, inserts};
};

export const createScene = () => {
  const globalKey = randRange(-4, 4);
  const newScene = {
    tempo: randRange(132, 140),
    shufflePercentage: maybe(50, 0, randRange(1, 20)),
    parts: {},
    synths: {
      [tracks.LD]: {}
    },
  };
  [
    tracks.BD,
    tracks.CL,
    /* tracks.ST,
    tracks.PR,
    tracks.BS */
  ].forEach(key => {
    newScene.parts[key] = randomizeEffects(key)(createPart(key));
  });

  newScene.parts[tracks.HO] = createPart(tracks.HO);
  newScene.parts[tracks.HC] = createPart(tracks.HC);

  newScene.parts[tracks.BS] = createPart(tracks.BS, globalKey);
  newScene.parts[tracks.MB] = createPart(tracks.MB, globalKey);

  newScene.parts[tracks.LD] = createPart(tracks.LD, globalKey);

  if (rand(70)) {
    // newScene.parts[tracks.RD] = createPart(tracks.RD);
  }
  if (rand(50)) {
    // newScene.parts[tracks.SN] = createPart(tracks.SN);
  }
  return newScene;
};
