const fs = require('fs');
const path = require('path');
const config = require('./locals');
const exec = require('child_process').exec;

const files = fs.readdirSync(config.kitsPath);

const TICK = 60.0 / 138.0 / 4.0;

// start pos, duration as 16ths
const times = {
  bd: [4, 6],
  rd: [16 + 2, 8],
  ho: [2 * 16 + 6, 4],
  hc: [3 * 16 + 4, 4],
  cl: [4 * 16 + 4, 8],
  bs: [5 * 16 + 6, 3],
  mb: [7 * 16 + 1, 3],
};

files.forEach(filename => {
  if (filename.startsWith('kit')) {
    const fullname = path.join(config.kitsPath, filename);
    const kitNumber = filename[3];
    const ffmpeg = path.join(config.ffmpegPath, 'ffmpeg.exe');
    Object.keys(times).forEach(key => {
      const outname = path.join(config.samplePath, `${key}${kitNumber}.wav`);
      const start = times[key][0] * TICK;
      const duration = times[key][1] * TICK;
      const cmd = `${ffmpeg} -ss ${start} -i ${fullname} -t ${duration} ${outname}`;
      exec(cmd, error => {
        if (error) {
          console.error(error);
        }
        console.log(outname);
      });
    });
  }
});
