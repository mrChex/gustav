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
    state['branch'] = '';
    state['gitbranches'] = [];
    state['branchCreatingWhile'] = false;
    state['last_branch_created_out'] = null;
    state['Links'] = {};
    return state;
  },

  componentDidMount() {
    console.log('project pane mount');
  },

  componentDidUpdate(prevProps, prevState) {
      $("#new-project-branch").focus();
  },

  createBranchOpenModal() {

    this.setState({createBranch: 'loading'});
    socket.emit('get git heads', this.state.name, (code, stdout, stderr) => {
      console.log('git branches', code, stdout, stderr);
      if(code != 0) {alert('Error loading. Check console.'); return this.setState({createBranch: false});}

      let gitbranches = []
      for(let n of stdout.split("\n")) {
        if(!n) {continue}
        let splited = n.split("\t");
        console.log('splitted', splited);
        gitbranches.push(splited[1].split("/")[2]);
      }

      let links = {}
      this.state.containers.map((container) => {
        if(!container['Links']) {return null}
        container['Links'].map((Link) => {
          links[Link] = 'master';
        });
      });

      this.setState({createBranch: true,
                     gitbranches: gitbranches,
                     branch: gitbranches[0],
                     Links: links,
                     branchCreatingWhile: false});
      console.log(this.state)
    });


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
                 "branch": this.state.branch,
                 "links": this.state.Links},
                (err, data) => {
                  if(err) {
                    console.log("Error while creating brunch", err);
                    this.setState({createBranch: false});

                    if(err['error'] == "project exist") {return alert("This project exist! You can delete or rebuild in branch settings.");}

                    return alert("Unknown error! See console.log for detail");
                  }

                  this.setState({createBranch: false,
                                 branchCreatingWhile: false});

                  this.context.router.transitionTo('docker-out',
                    {project: this.state.name,
                     branch: this.state.branch,
                     task: '_build'});

                });

    return false;
  },

  LinkChanged(e) {
    this.state.Links[e.target.name] = e.target.value
    console.log('link changed', this.state.Links, e.target.value, e.target.name);
  },

  render() {

        let modal = null;

        if(this.state.createBranch == "loading") { modal = (<div>
          <div className="modal-backdrop fade in"></div>
          <div className="modal show">
            <div className="modal-dialog">

              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Wait until cloning...</h4>
                </div>
                <div className="modal-body">
                  Wait, loading branches list from git...
                </div>
              </div>

            </div>
          </div>
        </div>)} else if(this.state.createBranch) {
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
                  <select id="new-project-branch" value={this.branch} className="form-control" onChange={this.branchChanged}>
                    {this.state.gitbranches.map((b) => {
                      return(<option key={b} value={b}>{b}</option>)
                    })}
                  </select>

                  {this.state.containers.map((container) => {
                    if(!container['Links']) {return null}

                    return <div>
                      <h3>Links for {container.name}</h3>
                      {container['Links'].map((Link) => {
                        let link = Link.split(":")[0].split("@");
                        return <div className="input-group" key={Link}>
                          <span className="input-group-addon">{link[0]}.</span>
                          <input type="text"
                                 className="form-control"
                                 value={this.state.Links[Link]}
                                 name={Link}
                                 onChange={this.LinkChanged} />
                          <span className="input-group-addon">.{link[1]}</span>
                        </div>
                      })}
                    </div>
                  })}

                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-danger" onClick={this.branchCancel}>Cancel</button>
                  <button type="submit" className="btn btn-success"><span className="glyphicon glyphicon-fire"></span> Create branch</button>
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
