import React from 'react';
import {Link, RouteHandler} from 'react-router';
import {socket, observer} from '../socket';
import { console as config_console } from '../config';
import Console from './console';
import {List, Map} from 'immutable';


export default React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },


  getInitialState() {

    let { project, branch, task } = this.context.router.getCurrentParams();

    let history = observer.get_history(project, branch, task);
    let stdout = List();
    if(history !== false) {
      for(let history_item of history) {
        stdout = stdout.push(history_item);
      }
    }

    return {"project": project,
            "branch": branch,
            "task": task,
            "stdout": stdout}
  },

  componentWillReceiveProps() {
    console.log('docker-out receive new props!');
    let { project, branch, task } = this.context.router.getCurrentParams();

    if(project != this.state.project ||
       branch != this.state.branch ||
       task != this.state.task) {

      observer.unlisten(this.state.project, this.state.branch, this.state.task, this.observerSay);
      observer.listen(project, branch, task, this.observerSay);


      this.setState(this.getInitialState());

    }
  },

  componentDidMount() {
    observer.listen(this.state.project, this.state.branch, this.state.task, this.observerSay)
  },

  componentWillUnmount() {
    observer.unlisten(this.state.project, this.state.branch, this.state.task, this.observerSay)
  },

  observerSay(data_stacked) {
    console.log('observerSay', data_stacked);
    let stdout = this.state.stdout;
    for(let data in data_stacked) {
      if(stdout.size > config_console.max_lines) {
        stdout = stdout.shift();
      }
      stdout = stdout.push(data);
    }

    this.setState({"stdout": stdout});
  },

  render() {

    return <div>

      <h2>{this.state.project}/{this.state.branch}. Task: {this.state.task}</h2>
      <Console stdout={this.state.stdout} enable_scroll={true} />

    </div>
  }
});
