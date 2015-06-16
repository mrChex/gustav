import React from 'react';
import classNames from 'classnames';
import {Link, RouteHandler} from 'react-router';
import { socket } from '../../socket';
import Container from './container';


export default React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState() {
    let { all } = this.context.router.getCurrentParams();
    all = all === "all"

    return {"containers": null,
            "show_all": all}
  },

  componentWillReceiveProps() {
    this.replaceState(this.getInitialState(), function() {
      this.fetchContainers();
    });
  },

  componentDidMount() {
    this.fetchContainers();
  },

  fetchContainers() {
    socket.emit('containers', {all: this.state.show_all}, (err, containers) => {
      console.log(containers);
      this.setState({"containers": containers});
    });
  },

  setLoading() {
    this.setState({"containers": null});
  },

  render() {
    if(!this.state.containers) {return <h3>Loading containers...</h3>}

    let imagesCls = classNames({
      "active": this.context.router.isActive("docker-page-containers-list")
    });

    let allCls = classNames({
      "active": this.context.router.isActive("docker-page-containers-list-all")
    });

    return (<div>


      <ul className="nav nav-pills">
        <li role="presentation" className={imagesCls}><Link to='docker-page-containers-list'>Running</Link></li>
        <li role="presentation" className={allCls}><Link to='docker-page-containers-list-all' params={{all:'all'}}>All</Link></li>
      </ul>

      <table className="table table-bordered table-striped" style={{marginTop:10}}>
        <tr>
          <th>Actions</th>
          <th>ID</th>
          <th>Image</th>
          <th>Name</th>
          <th>Status</th>
          <th>Command</th>
          <th>Ports</th>
        </tr>

        {this.state.containers.map((container) => {return(
          <Container key={container.Id}
                     container={container}
                     setLoading={this.setLoading}
                     reload={this.fetchContainers}/>
        )})}


      </table>
    </div>)

  }
});
