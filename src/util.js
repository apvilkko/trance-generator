export const randRange = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
export const randRangeFloat = (min, max) => min + (Math.random() * (max - min));

export const rand = value => Math.random() < (value / 100.0);

export const maybe = (prob, opt1, opt2) => {
  if (typeof prob === 'number') {
    return rand(prob) ? opt1 : opt2;
  }
  let sum = 0;
  let chosen = null;
  const sorted = Object.keys(prob).sort((a, b) => {
    if (a === 'rest') {
      return 1;
    } else if (b === 'rest') {
      return -1;
    }
    return a - b;
  });
  sorted.forEach(key => {
    sum += (key === 'rest' ? (100 - sum) : Number(key));
    if (!chosen && rand(sum)) {
      chosen = prob[key];
    }
  });
  return chosen;
};

export const sample = arr =>
  (arr.length > 0 ? arr[randRange(0, arr.length - 1)] : undefined);

function swap(arr, i, j) {
  // swaps two elements of an array in place
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

const randInt = max => Math.floor(Math.random() * max);

export const shuffle = list => {
  const arr = [...list];
  for (let slot = arr.length - 1; slot > 0; slot--) { // eslint-disable-line
    const element = randInt(slot + 1);
    swap(arr, element, slot);
  }
  return arr;
};

export const takeRandom = (num, arr) => shuffle(arr).slice(0, num);

export const without = (these, arr) => arr.filter(x => !these.includes(x));
