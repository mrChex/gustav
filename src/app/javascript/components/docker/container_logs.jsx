import React from 'react';
import {socket, observer} from '../../socket';
import Console from '../console';


export default React.createClass({

  getInitialState() {
    return {"stdout": []}
  },

  componentDidMount() {
    console.log(this.props);
    console.log(socket.removeListener)
    socket.emit('container logs', this.props.container_name, (err) => {

    });

    let [project, branch, task] = this.props.container_name.split('.');
    observer.listen(project, branch, task, this.new_line)
  },

  componentWillUnmount() {
    let [project, branch, task] = this.props.container_name.split('.');
    observer.unlisten(project, branch, task, this.new_line)
  },

  new_line(line) {

    if(line['stream-end']) {this.state.stdout.push(line)}
    else {
      this.state.stdout.push({"stream": line});
    }

    if(this.state.stdout.length >= 99 || line['stream-end']) {
      this.forceUpdate();
    }
  },

  render() {
    return <Console stdout={this.state.stdout} enable_scroll={true} />
  }

});
