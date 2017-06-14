import {randRange, randRangeFloat, maybe, sample, rand} from './util';
import tracks from './tracks';
import {createPattern, createLeadPattern, createTheme} from './pattern';
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

const createPart = (track, theme) => {
  if (track === tracks.LD) {
    return createLead(theme);
  }
  const style = randomizeStyle(track);
  const sample = randomizeSample(track);
  // console.log('part', sample, style, theme);
  return {
    style,
    sample: urlify(sample),
    pattern: track === tracks.CR ? null : createPattern(track, style, theme),
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
  const newScene = {
    tempo: randRange(132, 140),
    shufflePercentage: maybe(50, 0, randRange(1, 10)),
    parts: {},
    synths: {
      [tracks.LD]: {type: maybe(70, 'sawtooth', 'square')}
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

  if (rand(70)) {
    // newScene.parts[tracks.RD] = createPart(tracks.RD);
  }
  if (rand(50)) {
    // newScene.parts[tracks.SN] = createPart(tracks.SN);
  }
  return newScene;
};
