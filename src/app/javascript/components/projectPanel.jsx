import React from 'react';
import {Link, RouteHandler} from 'react-router';
import classNames from 'classnames';
import {socket, observer} from '../socket';
import BranchesList from './branchesList'


export default React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState() {
    let state = this.props.project;
    console.log(state)
    state['createBranch'] = false;
    state['brunch'] = '';
    state['branchCreatingWhile'] = false;
    state['last_branch_created_out'] = null;
    return state;
  },

  componentDidMount() {
    console.log('project pane mount');
  },

  componentDidUpdate(prevProps, prevState) {
      $("#new-project-branch").focus();
  },

  createBranchOpenModal() {
    this.setState({createBranch: true});
  },

  branchCancel() {
    this.setState({createBranch: false});
  },

  branchChanged(event) {
    this.setState({branch: event.target.value});
  },

  branchCreate(e) {
    e.stopPropagation();
    console.log("Create branch!", this.state.branch);
    this.setState({branchCreatingWhile: true});

    socket.emit('create branch',
                {"project": this.state.name,
                 "branch": this.state.branch},
                (err, data) => {

                  this.setState({createBranch: false,
                                 branchCreatingWhile: false});

                  this.context.router.transitionTo('docker-out',
                    {project: this.state.name,
                     branch: this.state.branch,
                     task: '_build'});

                });
  },

  render() {

        let modal = null;
        if(this.state.createBranch) {
          let modal_body;
          if(this.state.branchCreatingWhile) {
            modal_body = (<div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Wait until cloning...</h4>
                </div>
                <div className="modal-body">
                  Cloning branch <b>{this.state.branch}</b>
                </div>
              </div>);

          } else {
            modal_body = (<div className="modal-content">

                <div className="modal-header">
                  <h4 className="modal-title">Create new branch image of project</h4>
                </div>
                <div className="modal-body">
                  Enter name of exists branch.
                  <br /><br />
                  <input id="new-project-branch" className="form-control" type="text" value={this.state.branch} onChange={this.branchChanged} placeholder="Branch name on github" />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-danger" onClick={this.branchCancel}>Cancel</button>
                  <button type="submit" className="btn btn-success"><span className="glyphicon glyphicon-fire"></span> Create brunch</button>
                </div>
              </div>)
          }


          modal = <form onSubmit={this.branchCreate}>
              <div className="modal-backdrop fade in"></div>
              <div className="modal show">
                <div className="modal-dialog">
                  {modal_body}
                </div>
              </div>
            </form>
        }

        return (

          <div className="panel panel-default" key={this.state.name}>
            <div className="panel-heading">
              <button type="button" className="btn btn-primary btn-xs" onClick={this.createBranchOpenModal}>
                <span className="glyphicon glyphicon-plus"></span>
              </button>
              &nbsp; <b>{this.state.name}</b>
              {modal}
            </div>
            <BranchesList branches={this.state.branches} project_name={this.state.name} />


          </div>

    )
  }
});
