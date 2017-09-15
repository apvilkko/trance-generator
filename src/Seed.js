import React from 'react';
import {observer} from 'mobx-react';

const Seed = observer(class Seed extends React.Component {
  constructor(props) {
    super(props);
    const initial = props.store.currentSeed;
    this.state = {
      value: initial
    };
  }

  change = evt => {
    this.setState({
      value: evt.target.value
    });
  }

  load = () => {
    this.props.load(this.state.value);
  }

  onKeyPress = e => {
    if (e.key === 'Enter') {
      this.load();
    }
  }

  render() {
    return (
      <div className="seed-input">
        <p>Currently playing {this.props.store.currentSeed}</p>
        <label htmlFor="seed">Seed</label>
        <input
          id="seed"
          value={this.state.value}
          onChange={this.change}
          onKeyPress={this.onKeyPress}
        />
        <button onClick={this.load}>Load</button>
      </div>
    );
  }
});

export default Seed;
