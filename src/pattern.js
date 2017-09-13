import {randRange, rand, maybe, takeRandom, shuffle, sample, without, sort} from './util';
import tracks from './tracks';
import {
  FOURBYFOUR, TWOANDFOUR, BROKEN, RANDBUSY, OFFBEATS,
  RANDSPARSE, OCCASIONAL, SUBBASS1, SUBBASS2, MIDBASS1, EIGHTS, ONESHOT,
} from './styles';

const createNote = (velocity = 0, pitch = null) => ({velocity, pitch});

const getCurrentRoot = (theme, index) =>
  theme.chordSequence[Math.floor(index / 16)] + theme.globalKey;

const iteratePattern = ({patternLength, pitch, theme}, iterator) =>
  Array.from({length: patternLength}).map((_, index) => {
    const adjustedPitch = theme ? getCurrentRoot(theme, index) : pitch;
    return iterator(index, adjustedPitch);
  });

const prefs = {
  [tracks.LP]: {
    patternLength: () => 16,
    pitch: () => 0,
  },
  [tracks.BD]: {
    patternLength: () => maybe(50, 16, 32),
    pitch: () => randRange(-2, 2),
  },
  [tracks.BS]: {
    patternLength: () => maybe({50: 8, rest: 16}),
    pitch: () => randRange(-2, 6),
  },
  [tracks.MB]: {
    patternLength: () => maybe({50: 8, rest: 16}),
    pitch: () => randRange(-2, 6),
  },
  [tracks.CL]: {
    patternLength: () => maybe(50, 8, 16),
    pitch: () => randRange(-2, 2),
  },
  [tracks.SN]: {
    patternLength: () => maybe(50, 8, 16),
    pitch: () => randRange(-2, 2),
  },
  [tracks.HC]: {
    patternLength: () => maybe(50, 8, 16),
    pitch: () => randRange(-2, 2),
  },
  [tracks.HO]: {
    patternLength: () => maybe(50, 8, 16),
    pitch: () => randRange(-2, 2),
  },
  [tracks.PR]: {
    patternLength: () => maybe(50, 8, 16),
    pitch: () => randRange(-2, 2),
  },
  [tracks.ST]: {
    patternLength: () => maybe({50: 32, 30: 64, rest: 16}),
    pitch: () => randRange(-6, 6),
  },
  [tracks.RD]: {
    patternLength: () => maybe(50, 8, 16),
    pitch: () => randRange(-2, 3),
  }
};

const styleIterator = {
  [FOURBYFOUR]: (i, pitch) => {
    if (i % 4 === 0) {
      return createNote(127, pitch);
    } else if (rand(5) && (i % 4 !== 1)) {
      return createNote(randRange(10, 110), pitch);
    }
    return createNote();
  },
  [OFFBEATS]: (i, pitch) => {
    if ((i + 2) % 4 === 0) {
      return createNote(127, pitch);
    } else if (rand(5) && (i % 4 !== 0)) {
      return createNote(randRange(10, 110), pitch);
    }
    return createNote();
  },
  [EIGHTS]: (i, pitch) => {
    if (i % 4 === 0 || (i + 2) % 4 === 0) {
      return createNote(randRange(110, 127), pitch);
    } else if (rand(5)) {
      return createNote(randRange(10, 110), pitch);
    }
    return createNote();
  },
  [RANDBUSY]: (i, pitch) => {
    if (rand(80)) {
      return createNote(randRange(90, 127), pitch);
    }
    return createNote();
  },
  [ONESHOT]: (i, pitch) => {
    if (i === 0) {
      return {...createNote(127, pitch), release: 1000};
    }
    return createNote();
  },
  [RANDSPARSE]: (i, pitch) => {
    if (rand(20)) {
      return createNote(randRange(90, 127), pitch);
    }
    return createNote();
  },
  [OCCASIONAL]: (i, pitch) => {
    if (rand(5)) {
      return createNote(randRange(64, 127), pitch);
    }
    return createNote();
  },
  [TWOANDFOUR]: (i, pitch) => {
    if ((i + 4) % 8 === 0) {
      return createNote(127, pitch);
    } else if (rand(5) && (i % 4 !== 0)) {
      return createNote(randRange(10, 90), pitch);
    }
    return createNote();
  },
  [BROKEN]: (i, pitch) => {
    if (i % 8 === 0) {
      return createNote(127, pitch);
    } else if (((i + 2) % 8 === 0) || ((i + 5) % 8 === 0)) {
      return createNote(randRange(110, 127), pitch);
    } else if (rand(5)) {
      return createNote(randRange(10, 90), pitch);
    }
    return createNote();
  },
  [SUBBASS1]: (i, pitch) => {
    if ((i + 2) % 4 === 0) {
      return createNote(127, pitch);
    } else if (rand(50) && (i % 4 !== 0)) {
      return createNote(randRange(10, 110), pitch);
    }
    return createNote();
  },
  [SUBBASS2]: (i, pitch) => {
    if (rand(95) && ((i + 3) % 8 === 0 || (i + 6) % 8 === 0)) {
      return createNote(127, pitch);
    } else if (rand(20)) {
      return createNote(randRange(10, 110), pitch);
    }
    return createNote();
  },
  [MIDBASS1]: (i, pitch) => {
    if (rand(80) && (i % 2 === 0)) {
      return createNote(randRange(110, 127), pitch);
    } else if (rand(80) && (i % 2 === 1)) {
      return createNote(randRange(100, 127), pitch + 12);
    }
    return createNote();
  },
};

const getPatternLength = (track, theme) => {
  let patternLength = track ? prefs[track].patternLength() : null;
  if (theme && theme.chordSequence) {
    patternLength = theme.chordSequence.length * 16;
  }
  return patternLength;
};

export const createPattern = (track, style, theme, info, tempo) => {
  // console.log('createPattern', track, style, theme, info, tempo);
  let pitch = theme ? theme.globalKey : prefs[track].pitch();
  if (info && info.tempo && tempo) {
    pitch = 12 * Math.log(tempo / info.tempo) / Math.log(2);
  }
  const patternLength = (info && info.bars) ? (info.bars * 16) : getPatternLength(track, theme);
  return iteratePattern({patternLength, pitch, theme}, styleIterator[style]);
};

const transposeMotif = (note, theme) => theme.globalKey + 12 + note;

const leadPattern1 = ({patternLength, theme}) => {
  let i = 0;
  return Array.from({length: patternLength}).map((_, index) => {
    const lastBar = 64 - (index % 64) <= 8;
    const useMotif = lastBar ? theme.motif2 : theme.motif;
    const rootPitch = getCurrentRoot(theme, index);
    if (theme.rhythm.indexOf(index % 8) > -1) {
      if (i >= useMotif.length) {
        i = 0;
      }
      return createNote(127, transposeMotif(useMotif[i++], theme));
    } else if (theme.rhythm2.indexOf(index % 8) > -1) {
      return createNote(127, rootPitch);
    }
    return createNote();
  });
};

const ARP_PRESETS = [
  [0, 0, 0, 1],
  [0, 0, 0, 2],
  [0, 1, 0, 2],
  [0, 2, 0, 1],
  [0, 0, 1, 2],
];

const leadPatternArp = ({patternLength, theme}) => {
  const motifs = [sort(theme.motif), sort(theme.motif2), sort(theme.motif3)];
  const arpPattern = sample(ARP_PRESETS).concat(sample(ARP_PRESETS));
  return Array.from({length: patternLength}).map((_, index) => {
    const rootPitch = getCurrentRoot(theme, index);
    const quarter = Math.floor(index * 0.25) % arpPattern.length;
    const motif = motifs[arpPattern[quarter]];
    const pitch = index % 4 === 0 ? rootPitch :
      transposeMotif(motif[index % 4 - 1], theme);
    return createNote(127, pitch);
  });
};

export const createLeadPattern = theme => {
  const patternLength = getPatternLength(null, theme);
  const opts = {theme, patternLength};
  if (theme.arp) {
    return leadPatternArp(opts);
  }
  return leadPattern1(opts);
};

const AEOLIAN = [0, 2, 3, 5, 7, 8, 10, 12];
const PRIMARY = [0, 3, 7, 12];
const SECONDARY = [2, 5, 10];

const MOTIF_PRESETS = [
  [0, 2, 3],
  [10, 2, 3],
  [2, 3, 5],
  [2, 3, 7],
  [0, 5, 7],
  [0, 8, 7],
  [0, 3, 5],
  [3, 5, 12],
  [5, 10, 7],
];
const choices = [].concat(PRIMARY).concat(SECONDARY);

const createMotif = seed => {
  if (seed) {
    return shuffle([seed[0], seed[1], sample(without(seed, choices))]);
  }
  if (rand(50)) {
    return shuffle(sample(MOTIF_PRESETS));
  } else if (rand(50)) {
    const motif1 = [sample(PRIMARY), sample(SECONDARY)];
    const motif = shuffle(motif1.concat(sample(without(motif1, AEOLIAN))));
    return motif;
  }
  return takeRandom(3, choices);
};

const CHORD_PRESETS = [
  [0, 0, -2, -4],
  [-4, -4, -2, 0],
  [0, -2, -4, 0],
  [-5, -4, -2, 0],
  [-4, -2, -4, 0],
  [0, -5, -2, -4],
  [0, -5, -4, -2],
  [0, -4, 3, 2],
  [-5, -4, -2, -5],
  [0, 3, -2, -4],
  [-4, 5, 0, 0],
];

const createChords = lengthBars => {
  if (rand(75)) {
    const preset = sample(CHORD_PRESETS);
    if (lengthBars === preset.length) {
      return preset;
    }
    const chordSequence = [];
    for (let i = 0; i < lengthBars; ++i) {
      chordSequence.push(preset[Math.floor(i / 2)]);
    }
    return chordSequence;
  }
  let chords = [0, -2, -4];
  if (rand(30)) {
    chords = takeRandom(4, [0, -2, -4, -5, 3, 5]);
  }
  const chordSequence = [];
  const shuffled = shuffle(chords);
  for (let i = 0; i < lengthBars; ++i) {
    chordSequence.push(sample(shuffled));
  }
  return chordSequence;
};

export const createTheme = () => {
  const globalKey = randRange(-4, 4);
  const lengthBars = maybe(50, 4, 8);
  const chordSequence = createChords(lengthBars);
  const motif = createMotif();
  const motif2 = createMotif(motif);
  const motif3 = createMotif(motif);
  const rhythm = takeRandom(3, [0, 1, 2, 3, 4, 5, 6, 7]);
  const rhythm2 = takeRandom(3, without(rhythm, [0, 1, 2, 3, 4, 5, 6, 7]));
  console.log(motif, motif2, motif3);
  console.log(rhythm);
  console.log(chordSequence);
  return {
    globalKey,
    chordSequence,
    motif,
    motif2,
    motif3,
    rhythm,
    rhythm2,
    arp: maybe(50, true, false),
  };
};
