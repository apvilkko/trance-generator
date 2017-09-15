import uuidv4 from 'uuid/v4';
import 'seedrandom';
import {randRange, randRangeFloat, maybe, sample, rand} from './util';
import tracks from './tracks';
import {createPattern, createLeadPattern, createTheme} from './pattern';
import styles, {
  FOURBYFOUR, BROKEN, OFFBEATS, RANDBUSY, TWOANDFOUR,
  RANDSPARSE, OCCASIONAL, SUBBASS1, SUBBASS2, MIDBASS1, EIGHTS, ONESHOT,
} from './styles';
import catalog from './catalog';

const randomizeStyle = track => {
  switch (track) {
    case tracks.LP:
      return ONESHOT;
    case tracks.BD:
      return FOURBYFOUR;
    case tracks.CL:
      return TWOANDFOUR;
    case tracks.HO:
      return OFFBEATS;
    case tracks.SN:
      return RANDBUSY;
    case tracks.RD:
      return maybe(50, OFFBEATS, EIGHTS);
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

const createLead = globalKey => ({
  style: null,
  sample: null,
  synth: tracks.LD,
  pattern: createLeadPattern(globalKey)
});

const randomizeSample = track => {
  const key = track.toLowerCase();
  const numChoices = catalog[key];
  const chosen = randRange(1, numChoices);
  return {
    sampleKey: `${key}${chosen}`,
    info: (catalog[`${key}Info`] || {})[chosen],
  };
};

const urlify = sample => `samples/${sample}.ogg`;

const createPart = (track, theme, tempo) => {
  if (track === tracks.LD) {
    return createLead(theme);
  }
  const style = randomizeStyle(track);
  const {sampleKey, info} = randomizeSample(track);
  // console.log('part', sampleKey, info, style, theme);
  return {
    style,
    sample: urlify(sampleKey),
    info,
    pattern: track === tracks.CR ? null : createPattern(track, style, theme, info, tempo),
  };
};

const reverbSpec = (dry, wet) => ({
  effect: 'Reverb',
  params: {dry, wet},
  sample: urlify(randomizeSample('impulse').sampleKey)
});

const randomizeEffects = key => track => {
  const inserts = [];
  switch (key) {
    case tracks.CL:
      inserts.push(reverbSpec(1, randRangeFloat(0.05, 0.1)));
      break;
    case tracks.ST:
      // inserts.push(reverbSpec(1, randRangeFloat(0.1, 0.8)));
      break;
    default:
      break;
  }
  return {...track, inserts};
};

export const createScene = (store, loadSeed) => {
  const seed = loadSeed || uuidv4().substr(0, 8);
  window.history.pushState('', '', `?s=${encodeURIComponent(seed)}`);
  store.setSeed(seed);
  Math.seedrandom(seed);
  const tempo = randRange(132, 142);
  const newScene = {
    seed,
    tempo,
    shufflePercentage: maybe(50, 0, randRange(1, 10)),
    parts: {},
    synths: {
      [tracks.LD]: {
        type: maybe(70, 'sawtooth', 'square'),
        vcos: [
          {detune: 0},
          {detune: randRange(-10, -3)},
          {detune: randRange(3, 10)},
          {detune: randRange(-20, -11)},
          {detune: randRange(11, 20)},
        ],
      }
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
  newScene.parts[tracks.CR] = createPart(tracks.CR);
  newScene.parts[tracks.SN] = createPart(tracks.SN);
  newScene.parts[tracks.LP] = createPart(tracks.LP, null, tempo);

  const beatMs = 60.0 / newScene.tempo;
  const theme = createTheme();

  newScene.parts[tracks.BS] = createPart(tracks.BS, theme);
  newScene.parts[tracks.MB] = createPart(tracks.MB, theme);
  newScene.parts[tracks.MB].inserts = [
    {
      effect: 'FeedbackDelay',
      params: {
        dry: 1,
        wet: 0.4,
        feedback: 0.4,
        delayTime: beatMs * 0.751,
        filterFrequency: 5000,
      },
    }
  ];

  newScene.parts[tracks.LD] = createPart(tracks.LD, theme);
  newScene.parts[tracks.LD].inserts = [
    {
      effect: 'StereoDelay',
      params: {
        dry: 0.9,
        wet: 0.5,
        feedback: 0.7,
        delayTimeL: beatMs * 0.505,
        delayTimeR: beatMs * 0.748,
        filterFrequency: 8000
      },
    }
  ];

  if (rand(75)) {
    newScene.parts[tracks.RD] = createPart(tracks.RD);
  }
  return newScene;
};
