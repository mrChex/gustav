import React from 'react';
import {socket} from '../../socket';


export default React.createClass({

  getInitialState(){
    return {stats: null}
  },

  componentDidMount() {
    socket.on('stats received '+this.props.container.Names[0], this.received)
  },

  received(err, j) {
    console.log("WE HAVE", err, j);
    this.setState({"stats": j});
  },

  render() {
    let {stats} = this.state;
    return(<div className="panel panel-default">

      <div className="panel-heading">{this.props.container.Names[0]}</div>
      <div className="panel-body">
        {stats ? <div>
          Read: {stats.read}<br />
          Mem: {stats.memory_stats.usage} / {stats.memory_stats.limit}<br />
          Mem max: {stats.memory_stats.max_usage}<br />
          Cpu: {stats.cpu_stats.system_cpu_usage}
        </div> : <b>Wait data</b>}
      </div>

    </div>)
  }

});
