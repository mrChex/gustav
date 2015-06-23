import React from 'react';
import {socket} from '../../socket';

import MonitorContainer from './monitor'


export default React.createClass({

  getInitialState() {
    return {loading: true,
            watch: null}
  },

  componentDidMount() {
    socket.emit('stats is_started', (containers) => {
      console.log('containers', containers);

      this.setState({loading: false,
                     watch: containers})

    });


  },

  start() {
    this.setState({loading: true});

    socket.emit('stats start', (containers) => {
      console.log('enabled', containers)
      this.setState({loading: false,
                     watch: containers});

      socket.emit('stats subscribe');

    })
  },

  stop() {
    socket.emit('stats unsubscribe');
    socket.emit('stats stop');
    this.setState({watch: null});
  },

  render() {
    if(this.state.loading) { return(<h1>Loading...</h1>); }
    if(!this.state.watch) { return(<div>
      <h1>Monitoring <small>not started</small></h1>
      <br />
      <button className="btn btn-success" onClick={this.start}>Start monitoring</button>
    </div>); }


    return(<div>
      <h1>
        Monitoring
        <small style={{color:"green"}}>
          <b>{this.state.watch.streams}</b> container(-s)
        </small>
        <button className="btn btn-danger" onClick={this.stop}>stop</button>
      </h1>

      {this.state.watch.for.map((container) => {return(
        <MonitorContainer container={container} />
      )})}

    </div>)

  }

});
