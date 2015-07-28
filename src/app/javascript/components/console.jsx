import React from 'react';
import {addons} from 'react/addons'
import Scroll from './scroll';


let hashCode = function(s) {
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
}

let Time = React.createClass({
  render() {
    let date = new Date(this.props.stamp);

    return <span>{date.getHours()}:{date.getMinutes()}&nbsp;</span>
  }
});

let Line = React.createClass({

  mixins: [addons.PureRenderMixin],

  i: 0,

  render() {
    let line = this.props.line;
    console.log('line', line);
    if(line['stream-end'] == true) { return (<b key="END">process ended!</b>) }

    let _line = null;
    if(line['stream']) {
      _line = line['stream']
    } else if(line['error']) {
      _line = <span style={{color:'red'}}>{line['error']}</span>
    } else {
      _line = <span style={{color:'yellow'}}>{line}</span>
    }

    return <div>{_line}</div>
  }

});

export default React.createClass({

  mixins: [addons.PureRenderMixin],

  getInitialState() {

    return {
      enable_scroll: !(!this.props.enable_scroll)
    }
  },

  scrollToggle() {
    this.setState({enable_scroll: !this.state.enable_scroll});
  },

  update() {
    this.forceUpdate();
  },

  render() {

    return (<div>
      <label>
        <input type="checkbox" checked={this.state.enable_scroll} onChange={this.scrollToggle} />
        &nbsp; auto scroll down
        <button onClick={this.update}>forceReload</button>
      </label><br /><br />

      <Scroll enable={this.state.enable_scroll}>
        <div className="consoleComponent">
          {this.props.stdout.map( (line) => {
            return <Line line={line} />
          })}

        </div>
      </Scroll>
    </div>)

  }
});
