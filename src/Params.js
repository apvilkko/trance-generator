import React from 'react';

const Slider = ({label, min, max, actions, name}) => (
  <label htmlFor={name}>
    {name}
    <input
      type="range"
      id="freq"
      min={min}
      max={max}
      onChange={actions.setParam({name})}
    />
  </label>
);

const Params = ({actions}) => (
  <div className="params">
    <Slider
      label="synth freq"
      min="50"
      max="10000"
      name="LD.synth.vcf.frequency"
      actions={actions}
    />
    <Slider
      label="synth Q"
      min="0"
      max="100"
      name="LD.synth.vcf.Q"
      actions={actions}
    />
  </div>
);

export default Params;
