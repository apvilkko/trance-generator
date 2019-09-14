import React from "react";
import { observer } from "mobx-react";
import tracks from "./tracks";

const channels = Object.keys(tracks);

const Toggler = observer(({ channel, mute, solo, channelState }) => (
  <div className="channel-toggler">
    <span>{channel}</span>
    <button onClick={mute} className={channelState.mute ? "active" : ""}>
      M
    </button>
    <button onClick={solo} className={channelState.solo ? "active" : ""}>
      S
    </button>
  </div>
));

const Mixer = observer(
  class Mixer extends React.Component {
    mute = key => () => {
      this.props.toggle(key, false);
    };

    solo = key => () => {
      this.props.toggle(key, true);
    };

    render() {
      return (
        <div className="mixer">
          {channels.map(channel => (
            <Toggler
              key={channel}
              channel={channel}
              mute={this.mute(channel)}
              solo={this.solo(channel)}
              channelState={this.props.store.mixerState[channel]}
            />
          ))}
        </div>
      );
    }
  }
);

export default Mixer;
