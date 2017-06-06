import {randRange, rand, maybe} from './util';
import tracks from './tracks';
import {
  FOURBYFOUR, TWOANDFOUR, BROKEN, RANDBUSY, OFFBEATS,
  RANDSPARSE, OCCASIONAL, SUBBASS1, SUBBASS2, MIDBASS1
} from './styles';

const createNote = (velocity = 0, pitch = null) => ({velocity, pitch});

const iteratePattern = ({patternLength, pitch}, iterator) =>
  Array.from({length: patternLength}).map((_, index) => iterator(index, pitch));

const prefs = {
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
    pitch: () => randRange(-2, 2),
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
  [RANDBUSY]: (i, pitch) => {
    if (rand(80)) {
      return createNote(randRange(90, 127), pitch);
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

export const createPattern = (track, style, globalKey) => {
  const pitch = typeof globalKey !== 'undefined' ? globalKey : prefs[track].pitch();
  const patternLength = prefs[track].patternLength();
  return iteratePattern({patternLength, pitch}, styleIterator[style]);
};

export const createLeadPattern = globalKey => {
  return [
    createNote(127, globalKey),
    createNote(127, globalKey + 12),
    createNote(),
    createNote(127, globalKey),
    createNote(127, globalKey + 14),
    createNote(),
    createNote(127, globalKey + 15),
    createNote(),
  ];
};
