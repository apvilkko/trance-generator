import {connect} from '../util';

export default ({
  context, destination, delay,
}) => {
  const node = {};
  node.splitter = context.createChannelSplitter(2);
  node.merger = context.createChannelMerger(2);
  node.delay = context.createDelay();
  node.delay.delayTime.value = delay || 0.010;
  node.passthrough = context.createGain();
  node.passthrough.gain.value = 1;
  node.input = node.splitter;
  connect(node.splitter, node.delay);
  connect(node.splitter, node.passthrough,
    node.splitter.numberOfInputs > 1 ? 1 : 0);
  connect(node.delay, node.merger, 0, 0);
  connect(node.passthrough, node.merger, 0, 1);
  node.output = node.merger;
  if (destination) {
    connect(node.output, destination);
  }
  return node;
};
