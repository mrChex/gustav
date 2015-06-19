import React from 'react';
import {Link, RouteHandler} from 'react-router';
import ClassNames from 'classnames';
import ContainerDetail from '../docker/container_detail';
import ContainerSettings from '../docker/container_settings';


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

    let body = null
    if(this.state.selected_task != "_settings") {
      body = <ContainerDetail name={selected_container_name} />
    } else {
      body = <ContainerSettings project={this.state.project} branch={this.state.branch} />
    }

    let settignsCls = ClassNames({
      active: this.state.selected_task == "_settings"
    })
    let {project, branch} = this.context.router.getCurrentParams();

    return(<div>

      <ul className="nav nav-tabs">

        <li role="presentation" key="_settings" className={settignsCls}>
          <Link to="project-task" params={{project: project, branch: branch, task: '_settings'}}>
            <span className="glyphicon glyphicon-cog"></span>
          </Link>
        </li>

        {this.state.project.containers.map((container) => {

          let is_active = false;
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

      {body}

    </div>)
  }

});
