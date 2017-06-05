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
