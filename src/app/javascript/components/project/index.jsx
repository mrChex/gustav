import React from 'react';
import {socket} from '../../socket';
import Project from './project';


export default React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState() {
    let { project, branch, task } = this.context.router.getCurrentParams();

    if(!task) { task = null }

    return {project_name: project,
            branch_name: branch,
            project: null,
            selected_task: task}
  },

  componentDidMount() {
    socket.emit('project', this.state.project_name, (project) => {
      let task = this.state.selected_task;
      if(!task) {task = project['containers'][0].name}

      this.setState({"project": project,
                     "selected_task": task})
    });
  },

  componentWillReceiveProps() {
    this.replaceState(this.getInitialState(), () => {
      this.componentDidMount();
    });
  },

  render() {

    if(!this.state.project) {return(
      <h2>Loading...</h2>
    )}

    return (<div>
      <Project project={this.state.project} branch={this.state.branch_name} selected_task={this.state.selected_task} />
    </div>);


  }

});
