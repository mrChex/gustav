import React from 'react';
import {Link, RouteHandler} from 'react-router';
import classNames from 'classnames';
import {socket} from '../socket';

import ProjectPane from './projectPanel'


export default React.createClass({



  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState() {
    return { loaded: false,
             projects: [],
             branch: "" };
  },

  componentDidMount() {
    this.load_projects();
  },

  load_projects() {
    console.log('load_projects');

    socket.emit('projects', (err, projects) => {
      if(!err) {
        this.projectsLoaded(projects);
      } else {
        this.projectsNotLoaded(err);
      }
    });
  },

  refresh_projects_handler() {
    this.setState(this.getInitialState());
    this.load_projects();
  },

  projectsLoaded(projects) {
    this.setState({loaded: true, projects: projects});
  },

  projectsNotLoaded(err) {
    console.err(err);
    alert("Error in loading projects")
  },

  render() {

    let loaderCls = classNames({
      hidden: this.state.loaded
    });

    let contentCls = classNames({
      hidden: !this.state.loaded
    });

    let projects = this.state.projects;



    return (
      <div>
        <div className={loaderCls}>Loading projects...</div>

        <div className={contentCls}>

          <button onClick={this.refresh_projects_handler}
            className="btn btn-default btn-xs"
            ><span className="glyphicon glyphicon-refresh"></span> Refresh</button><br/><br/>

          {projects.map( (project) => {
            if(project.hidden) { return; }
            return (
              <ProjectPane project={project} key={project.name} />
            )
          })}

        </div>

      </div>
    )
  }
});
