import React from 'react';
import {Link, RouteHandler} from 'react-router';
import ClassNames from 'classnames';
import ContainerDetail from '../docker/container_detail';


export default React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState() {
    return {
      project: this.props.project,
      selected_task: this.props.selected_task,
      branch: this.props.branch
    }
  },

  render() {
    console.log('this project', this.state.project)

    let selected_container_name = `${this.state.project.name}.${this.state.branch}.${this.state.selected_task}`;
    console.log("YO", selected_container_name)

    return(<div>

      <ul className="nav nav-tabs">
        {this.state.project.containers.map((container) => {
          let {project, branch} = this.context.router.getCurrentParams();

          let is_active = false;
          console.log('thi!!@#!@#@!s', this.state.selected_task == container.name, this.state.selected_task, container.name)
          if(this.state.selected_task == container.name) { is_active = true; }
          let containerCls = ClassNames({ active: is_active });

          return(
            <li role="presentation" key={container.name} className={containerCls}>
              <Link to="project-task" params={{project: project, branch: branch, task: container.name}}>
                {container.name}
              </Link>
            </li>
          );
        })}

      </ul>

      <ContainerDetail name={selected_container_name} />

    </div>)
  }

});
