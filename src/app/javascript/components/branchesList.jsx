import React from 'react';
import BranchItem from './branchItem';


export default React.createClass({

  render() {
    return (
      <ul className="list-group branchesList">
        {this.props.branches.map( (branch) => { return (
          <BranchItem key={branch.docker_image_id}
                      branch={branch}
                      project_name={this.props.project_name} />
        )})}

      </ul>
    )
  }
});
