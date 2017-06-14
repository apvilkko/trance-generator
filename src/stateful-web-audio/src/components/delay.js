import {connect} from '../util';
import {createVCA} from './vca';
import createFilter from './filter';
import createWidener from './widener';

export const createDelay = ({context, destination, delayTime}) => {
  const node = context.createDelay(2);
  node.delayTime.value = delayTime;
  if (destination) {
    connect(node, destination);
  }
  return node;
};

export const createFeedbackDelay = ({
  context, destination, delayTime, filterFrequency = 2000, feedback = 0.6,
}) => {
  const node = {};
  node.mixBus = createVCA({context, gain: 1});
  node.delay = createDelay({context, delayTime});
  node.filter = createFilter({context, frequency: filterFrequency});
  node.feedback = createVCA({context, gain: feedback});
  node.widener = createWidener({context});
  node.input = node.delay;
  connect(node.delay, node.filter);
  connect(node.filter, node.feedback);
  connect(node.feedback, node.delay);
  connect(node.filter, node.widener);
  connect(node.widener, node.mixBus);
  node.output = node.mixBus;
  if (destination) {
    connect(node.output, destination);
  }
  return node;
};

export const createStereoDelay = ({
  context, destination, delayTimeL, delayTimeR, filterFrequency = 2000, feedback = 0.6,
}) => {
  const node = {};
  node.mixBus = createVCA({context, gain: 1});
  node.inputBus = createVCA({context, gain: 1});
  node.delayL = createDelay({context, delayTime: delayTimeL});
  node.delayR = createDelay({context, delayTime: delayTimeR});
  node.filter = createFilter({context, frequency: filterFrequency});
  node.feedbackL = createVCA({context, gain: feedback});
  node.feedbackR = createVCA({context, gain: feedback});
  node.merger = context.createChannelMerger(2);

  node.input = node.inputBus;
  connect(node.inputBus, node.filter);
  connect(node.filter, node.delayL);
  connect(node.filter, node.delayR);

  connect(node.delayL, node.feedbackL);
  connect(node.delayR, node.feedbackR);
  connect(node.feedbackL, node.delayL);
  connect(node.feedbackR, node.delayR);

  connect(node.delayL, node.merger, 0, 0);
  connect(node.delayR, node.merger, 0, 1);

  connect(node.merger, node.mixBus);
  node.output = node.mixBus;
  if (destination) {
    connect(node.output, destination);
  }
  return node;
};
