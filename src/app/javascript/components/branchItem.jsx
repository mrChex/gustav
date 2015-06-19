import React from 'react';
import {Link, RouteHandler} from 'react-router';
import classNames from 'classnames';


export default React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  selectBranch() {
    this.context.router.transitionTo('project-index',
                    {project: this.props.project_name,
                     branch: this.props.branch.name});
  },

  render() {
    let { project, branch } = this.context.router.getCurrentParams();

    let is_active = false;
    if(project == this.props.project_name && branch == this.props.branch.name) {
      is_active = true;
    }

    let li_classNames = classNames({
       "list-group-item": true,
       active: is_active
    });

    return (
      <li className={li_classNames} onClick={this.selectBranch}>
        <b>{this.props.branch.name}</b>
        {this.props.branch.containers ? this.props.branch.containers.map((container)=> {
          let style = null;

          if(container['error']) { style="danger" }
          else if(container['inspect']['State']['Running']) { style="success" }
          else if(container['inspect']['State']['error']) { style="warning" }
          else {style = "default" }

          let spanCls = classNames({
            "label": true,
            "label-danger": style == "danger",
            "label-success": style == "success",
            "label-warning": style == "warning",
            "label-default": style == "default",
          });

          return <span className={spanCls} style={{"margin-left":5}} key={container.task}>{container.task.split('.')[2]}</span>
        }) : <span className="label label-danger" style={{"margin-left":5}}>BROKEN BRANCH</span>}
      </li>
    )

  }
});
