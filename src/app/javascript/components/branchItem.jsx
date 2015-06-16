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
        {this.props.branch.name} - {this.props.branch.docker_image_id}
      </li>
    )

  }
});
