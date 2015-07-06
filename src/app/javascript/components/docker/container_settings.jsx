import React from 'react'
import {socket} from '../../socket'


export default React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState() {
    return {remove: null, modal: null, Links: {}}
  },

  cancelModal() {
    this.setState({modal: null});
  },

  LinkChanged(e) {
    this.state.Links[e.target.name] = e.target.value
    this.setState({"Links": this.state.Links})
    console.log('link changed', this.state.Links, e.target.value, e.target.name);
  },

  rebuildBranch() {

    let project_has_links = false;
    let links = {}
    this.props.project.containers.map((container) => {
      if(!container['Links']) {return null}
      else {project_has_links = true;}
      container['Links'].map((Link) => { this.state.Links[Link] = 'master'; });
    });

    if(!project_has_links) { return this.rebuildBranchWork(); }
    console.log('LINKS settings', this.state);
    this.setState({modal: (<div>
          <div className="modal-backdrop fade in"></div>
          <div className="modal show">
            <div className="modal-dialog">

              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Rebuild branch</h4>
                </div>
                <div className="modal-body">

                  {this.props.project.containers.map((container) => {
                    if(!container['Links']) {return null}

                    return <div>
                      <h3>Links for {container.name}</h3>
                      {container['Links'].map((Link) => {
                        let link = Link.split(":")[0].split("@");
                        return <div className="input-group" key={Link}>
                          <span className="input-group-addon">{link[0]}.</span>
                          <input type="text"
                                 className="form-control"
                                 // value={this.state.Links[Link]}
                                 name={Link}
                                 onChange={this.LinkChanged} />
                          <span className="input-group-addon">.{link[1]}</span>
                        </div>
                      })}
                    </div>
                  })}

                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-danger" onClick={this.cancelModal}>Cancel</button>
                  <button type="button" className="btn btn-success" onClick={this.rebuildBranchWork}><span className="glyphicon glyphicon-fire"></span> Rebuild branch</button>
                </div>

              </div>

            </div>
          </div>
        </div>)});
    return;

  },

  rebuildBranchWork() {
    this.context.router.transitionTo('docker-out',
                    {project: this.props.project.name,
                     branch: this.props.branch,
                     task: '_build'});

    socket.emit('rebuild branch', this.props.project.name, this.props.branch, this.state.Links);
  },

  removeBranch(e) {
    if(confirm('Are you shure? This wipe all data')) {
      this.setState({"remove": "progress"})
      socket.emit('delete branch', this.props.project.name, this.props.branch, (report) => {
        console.log('delete branch report',report);
        this.setState({remove: "done", report: report});
      });
    }
  },

  render() {

    if(this.state.remove == "progress") { return(<h1>Working...</h1>) }

    if(this.state.remove == "done") {return(<ul>
      {this.state.report.map((r) => {
        if(r[0] == "report") {return(<li><b>{r[1]}.{r[2]}.*</b></li>)}
        if(r[0] == "container") {
          if(r[2] == "ignored") {return(<li>Ignored container <b>{r[1]}</b>. {r[3].reason}</li>)}
          return(<li>{r[2]} container <b>{r[1]}</b></li>)
        }
        if(r[0] == "image") {return(<li>Image {r[1].slice(0,10)} - {r[2]}</li>)}
        if(r[0] == "files") {return(<li>Files {r[1]}</li>)}
        if(r[0] == "error") {return(<li>Error: {r[1]}</li>)}
        return(<li>Unknown action: {r}</li>)
      })}
    </ul>)}

    return (<div>
      {this.state.modal}
      <br />
      <div className="row">
        <div className="col-md-8">
          <h3 className="nullpaddings">Rebuild only docker staff. Files stay safe</h3>
        </div>
        <div className="col-md-4">
          <button type="button" className="btn btn-primary btn-block" onClick={this.rebuildBranch}>Rebuild branch</button>
        </div>
      </div>
      <hr />

      <div className="row">
        <div className="col-md-8">
          <h3 className="nullpaddings">Remove all containers, images and files.</h3>
        </div>
        <div className="col-md-4">
          <button type="button" className="btn btn-danger btn-block" onClick={this.removeBranch}>Remove branch</button>
        </div>
      </div>

    </div>)
  }

});
